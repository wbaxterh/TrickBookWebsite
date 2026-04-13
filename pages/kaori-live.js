import { Mic, MicOff, Loader2, Send, Sparkles } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  getBotCompanions,
  getMessages,
  sendMessage,
  startBotConversation,
} from '../lib/apiMessages';
import { connectMessagesSocket } from '../lib/socket';
import styles from '../styles/kaori-live.module.css';

const KAORI_VRM_PATH = '/kaori/kaori_sample.vrm';
const KAORI_STAGE_BUILD_TAG = 'build-187-force';

export default function KaoriLivePage() {
  const { loggedIn, token, userId } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [charState, setCharState] = useState('idle'); // idle | listening | thinking | speaking
  const [stageDebug, setStageDebug] = useState('init');

  const mountRef = useRef(null);
  const threeRef = useRef({});
  const recognitionRef = useRef(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const audioRafRef = useRef(null);
  const lastPlayedVoiceRef = useRef('');

  const SpeechRecognition = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!token || loggedIn !== true) return;

    (async () => {
      try {
        setLoading(true);
        const bots = await getBotCompanions(token);
        const kaori = bots.find((b) => (b.botCharacter || '').toLowerCase() === 'kaori');
        if (!kaori?._id) {
          throw new Error('Kaori bot not found');
        }

        const convo = kaori.existingConversationId
          ? { _id: kaori.existingConversationId }
          : await startBotConversation(kaori._id, token);

        const convoId = convo._id?.toString() || convo.existingConversationId;
        if (!convoId) throw new Error('Could not start Kaori conversation');

        setConversationId(convoId);

        const messageData = await getMessages(convoId, { page: 1, limit: 30 }, token);
        setMessages(messageData?.messages || []);
      } catch (error) {
        setBootError(error?.message || 'Failed to load Kaori Live');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, loggedIn]);

  useEffect(() => {
    if (!token || !conversationId || !userId) return;

    const socket = connectMessagesSocket(token);
    socketRef.current = socket;

    socket.emit('join:conversation', conversationId);

    const onNewMessage = ({ message }) => {
      if (!message || message.conversationId !== conversationId) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      if (message.senderId?.toString() !== userId?.toString()) {
        const voiceUrl = extractVoiceUrl(message.content || '');
        if (voiceUrl) {
          playElevenLabsVoice(voiceUrl);
        }
      }
    };

    socket.on('message:new', onNewMessage);

    return () => {
      socket.emit('leave:conversation', conversationId);
      socket.off('message:new', onNewMessage);
    };
  }, [token, conversationId, userId]);

  useEffect(() => {
    if (loading) return;
    if (!mountRef.current) return;

    let mounted = true;

    const loadThree = async () => {
      if (typeof window === 'undefined') return;

      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { VRMLoaderPlugin, VRMUtils } = await import('@pixiv/three-vrm');

      if (!mounted || !mountRef.current) return;

      const mount = mountRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0b1020');

      const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 1000);
      camera.position.set(0, 1.35, 2.6);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.innerHTML = '';
      mount.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight('#d8e6ff', 1.1);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight('#9fd5ff', 1.45);
      keyLight.position.set(2.6, 3.2, 3.4);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight('#ff9ad5', 0.9);
      rimLight.position.set(-2.5, 1.2, -1.8);
      scene.add(rimLight);

      const ringGeo = new THREE.TorusGeometry(1.45, 0.05, 24, 120);
      const ringMat = new THREE.MeshBasicMaterial({ color: '#ffe16f' });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.8;
      ring.position.y = -1.35;
      scene.add(ring);

      const fallbackGeo = new THREE.SphereGeometry(0.55, 32, 32);
      const fallbackMat = new THREE.MeshStandardMaterial({ color: '#8bb6ff', emissive: '#2a3d77', emissiveIntensity: 0.7 });
      const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
      fallbackMesh.position.set(0, 0.2, 0);
      scene.add(fallbackMesh);

      const pulseGeo = new THREE.RingGeometry(1.6, 1.65, 120);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: '#7ce5ff',
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.rotation.x = -Math.PI / 2;
      pulse.position.y = -1.45;
      scene.add(pulse);

      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      setStageDebug('loading_vrm');
      let vrm = null;
      let gltf = null;
      try {
        gltf = await loader.loadAsync(KAORI_VRM_PATH);
        vrm = gltf.userData?.vrm || null;
      } catch (_err) {
        setStageDebug('vrm_failed_fallback');
      }

      if (!mounted) return;
      if (!gltf?.scene) {
        setStageDebug('vrm_missing_scene_fallback');
      }

      if (!gltf?.scene) {
        const clock = new THREE.Clock();
        const animateFallback = () => {
          if (!mounted) return;
          const t = clock.getElapsedTime();
          fallbackMesh.rotation.y += 0.01;
          fallbackMesh.position.y = 0.2 + Math.sin(t * 1.6) * 0.08;
          ring.rotation.z += 0.003;
          pulse.scale.setScalar(1 + Math.sin(t * 2.4) * 0.04);
          renderer.render(scene, camera);
          threeRef.current.raf = requestAnimationFrame(animateFallback);
        };
        animateFallback();

        const onResize = () => {
          if (!mountRef.current) return;
          camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', onResize);

        threeRef.current = {
          ...threeRef.current,
          scene,
          camera,
          renderer,
          charState: 'idle',
          cleanup: () => {
            window.removeEventListener('resize', onResize);
            if (threeRef.current.raf) cancelAnimationFrame(threeRef.current.raf);
            fallbackGeo.dispose();
            fallbackMat.dispose();
            ringGeo.dispose();
            ringMat.dispose();
            pulseGeo.dispose();
            pulseMat.dispose();
            renderer.dispose();
          },
        };
        return;
      }

      const modelRoot = vrm?.scene || gltf.scene;

      if (vrm?.scene) {
        VRMUtils.removeUnnecessaryVertices(vrm.scene);
        VRMUtils.removeUnnecessaryJoints(vrm.scene);
      }

      // Auto-fit model into frame (prevents blank screen due to bad scale/offset)
      modelRoot.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(modelRoot);

      if (!box.isEmpty()) {
        const size = box.getSize(new THREE.Vector3());
        const safeHeight = Math.max(size.y || 0, 0.001);
        const targetHeight = 2.2;
        const rawScale = targetHeight / safeHeight;
        const fitScale = Math.min(4, Math.max(0.2, rawScale));

        modelRoot.scale.multiplyScalar(fitScale);
        modelRoot.updateWorldMatrix(true, true);

        const box2 = new THREE.Box3().setFromObject(modelRoot);
        const center2 = box2.getCenter(new THREE.Vector3());
        const min2 = box2.min.clone();

        modelRoot.position.x -= center2.x;
        modelRoot.position.z -= center2.z;
        modelRoot.position.y -= min2.y + 1.15;
      } else {
        // Fallback transform if bounds are invalid on first load
        modelRoot.position.set(0, -1.05, 0);
        modelRoot.scale.setScalar(1.0);
      }

      modelRoot.rotation.y = Math.PI;

      scene.add(modelRoot);
      fallbackMesh.visible = false;
      setStageDebug(vrm ? 'vrm_loaded' : 'gltf_loaded_no_vrm');

      const lookTarget = new THREE.Object3D();
      lookTarget.position.set(0, 1.35, 2.8);
      scene.add(lookTarget);
      if (vrm.lookAt) {
        vrm.lookAt.target = lookTarget;
      }

      const clock = new THREE.Clock();

      const expr = (name, value) => {
        const em = vrm?.expressionManager;
        if (!em) return;
        try {
          em.setValue(name, value);
        } catch (_err) {
          // no-op for unsupported expressions
        }
      };

      const animate = () => {
        if (!mounted) return;
        const dt = clock.getDelta();
        const t = clock.elapsedTime;

        const state = threeRef.current.charState || 'idle';
        const voiceLevel = threeRef.current.voiceLevel || 0;

        if (vrm) {
          vrm.update(dt);
        }

        if (vrm?.humanoid) {
          const neck = vrm.humanoid.getNormalizedBoneNode('neck');
          const spine = vrm.humanoid.getNormalizedBoneNode('spine');
          if (neck) neck.rotation.y = Math.sin(t * 0.8) * 0.08;
          if (spine) spine.rotation.z = Math.sin(t * 0.5) * 0.025;
        } else {
          modelRoot.rotation.y = Math.PI + Math.sin(t * 0.35) * 0.06;
        }

        expr('blink', Math.abs(Math.sin(t * 0.75)) > 0.985 ? 1 : 0);
        expr('aa', state === 'speaking' ? Math.min(1, 0.25 + voiceLevel * 0.95) : 0);
        expr('ih', state === 'thinking' ? 0.15 : 0);
        expr('happy', state === 'listening' ? 0.2 : state === 'speaking' ? 0.35 : 0.08);

        if (state === 'listening') {
          pulseMat.opacity = 0.55;
        } else if (state === 'thinking') {
          pulseMat.opacity = 0.4;
        } else if (state === 'speaking') {
          pulseMat.opacity = 0.5 + voiceLevel * 0.5;
        } else {
          pulseMat.opacity = 0.25;
        }

        ring.rotation.z += 0.003;
        pulse.scale.setScalar(1 + Math.sin(t * 2.4) * 0.04 + voiceLevel * 0.05);

        renderer.render(scene, camera);
        threeRef.current.raf = requestAnimationFrame(animate);
      };

      animate();

      const onResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      };

      window.addEventListener('resize', onResize);

      threeRef.current = {
        ...threeRef.current,
        scene,
        camera,
        renderer,
        vrm,
        charState: 'idle',
        cleanup: () => {
          window.removeEventListener('resize', onResize);
          if (threeRef.current.raf) cancelAnimationFrame(threeRef.current.raf);
          scene.remove(modelRoot);
          fallbackGeo.dispose();
          fallbackMat.dispose();
          ringGeo.dispose();
          ringMat.dispose();
          pulseGeo.dispose();
          pulseMat.dispose();
          renderer.dispose();
        },
      };
    };

    loadThree().catch((err) => {
      setBootError(err?.message || '3D renderer failed to load in this browser.');
    });

    return () => {
      mounted = false;
      threeRef.current.cleanup?.();
    };
  }, [loading]);

  useEffect(() => {
    threeRef.current.charState = charState;
  }, [charState]);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const extractVoiceUrl = (text = '') => {
    if (!text) return '';
    const match = text.match(/Kaori voice:\s*(https?:\/\/\S+)/i);
    return match?.[1]?.trim() || '';
  };

  const stopCurrentAudio = () => {
    if (audioRafRef.current) cancelAnimationFrame(audioRafRef.current);
    audioRafRef.current = null;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (_err) {
        // no-op
      }
      audioRef.current = null;
    }

    threeRef.current.voiceLevel = 0;
  };

  const playElevenLabsVoice = (url) => {
    if (typeof window === 'undefined' || !url) return;
    if (lastPlayedVoiceRef.current === url) return;
    lastPlayedVoiceRef.current = url;

    stopCurrentAudio();

    try {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.crossOrigin = 'anonymous';

      audio.onplay = () => setCharState('speaking');
      audio.onended = () => {
        threeRef.current.voiceLevel = 0;
        setCharState('idle');
      };
      audio.onerror = () => {
        threeRef.current.voiceLevel = 0;
        setCharState('idle');
      };

      if (window.AudioContext || window.webkitAudioContext) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioAnalyserRef.current = analyser;
        audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (!audioAnalyserRef.current || !audioDataRef.current) return;
          audioAnalyserRef.current.getByteFrequencyData(audioDataRef.current);
          const total = audioDataRef.current.reduce((sum, n) => sum + n, 0);
          const avg = total / audioDataRef.current.length;
          threeRef.current.voiceLevel = Math.min(1, avg / 120);
          audioRafRef.current = requestAnimationFrame(tick);
        };

        tick();
      }

      audio.play().catch(() => {
        setCharState('idle');
      });
    } catch (_err) {
      setCharState('idle');
    }
  };

  const speakBrowserTTS = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text.slice(0, 220));
      utter.rate = 1.06;
      utter.pitch = 1.15;
      utter.onstart = () => setCharState('speaking');
      utter.onend = () => setCharState('idle');
      utter.onerror = () => setCharState('idle');
      window.speechSynthesis.speak(utter);
    } catch (_err) {
      setCharState('idle');
    }
  };

  const submitText = async (text) => {
    if (!text?.trim() || !conversationId || sending) return;

    const content = text.trim();
    setSending(true);
    setCharState('thinking');

    const optimistic = {
      _id: `temp-${Date.now()}`,
      senderId: userId || 'me',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const sendStartedAt = Date.now();
      await sendMessage(conversationId, content, token);

      // Poll briefly for the *new* Kaori reply (text + optional voice url)
      let latestMessages = [];
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const latest = await getMessages(conversationId, { page: 1, limit: 40 }, token);
        latestMessages = latest?.messages || [];

        const hasNewKaori = latestMessages.some((m) => {
          const ts = new Date(m.createdAt || 0).getTime();
          return m.senderId?.toString() !== userId?.toString() && ts >= sendStartedAt - 1000;
        });

        if (hasNewKaori) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setMessages(latestMessages);

      const freshKaori = latestMessages
        .filter((m) => {
          const ts = new Date(m.createdAt || 0).getTime();
          return m.senderId?.toString() !== userId?.toString() && ts >= sendStartedAt - 1000;
        })
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      const freshVoice = freshKaori.find((m) => extractVoiceUrl(m.content));
      const freshVoiceUrl = extractVoiceUrl(freshVoice?.content || '');

      if (freshVoiceUrl) {
        playElevenLabsVoice(freshVoiceUrl);
      } else {
        const freshText = freshKaori.find((m) => m.content && !extractVoiceUrl(m.content));
        if (freshText?.content) {
          speakBrowserTTS(freshText.content);
        } else {
          setCharState('idle');
        }
      }
    } catch (_error) {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setCharState('idle');
      alert('Failed to send message to Kaori.');
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const payload = input;
    setInput('');
    await submitText(payload);
  };

  const toggleVoiceInput = () => {
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser yet.');
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = '';

    recognition.onstart = () => {
      setListening(true);
      setCharState('listening');
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }
      setInput((finalText + interim).trim());
    };

    recognition.onerror = () => {
      setListening(false);
      setCharState('idle');
    };

    recognition.onend = async () => {
      setListening(false);
      if ((finalText || input).trim()) {
        await submitText((finalText || input).trim());
        setInput('');
      } else {
        setCharState('idle');
      }
    };

    recognition.start();
  };

  if (loggedIn === false) {
    return (
      <div className={styles.centerWrap}>
        <p className={styles.dim}>Please log in to use Kaori Live.</p>
        <Link href="/login" className={styles.loginLink}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Kaori Live | The Trick Book</title>
      </Head>

      <div className={styles.page}>
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.title}>Kaori Live</h1>
            <p className={styles.subtitle}>3D + direct voice conversation MVP</p>
          </div>
          <div className={styles.stateBadge}>
            <Sparkles size={14} />
            {charState}
          </div>
        </div>

        {loading ? (
          <div className={styles.centerWrap}>
            <Loader2 className={styles.spin} />
            <p className={styles.dim}>Booting Kaori Live...</p>
          </div>
        ) : bootError ? (
          <div className={styles.centerWrap}>
            <p className={styles.error}>{bootError}</p>
          </div>
        ) : (
          <div className={styles.layout}>
            <section className={styles.stagePanel}>
              <div ref={mountRef} className={styles.stage} />
              <p className={styles.caption}>Kaori stage status: {stageDebug} · {KAORI_STAGE_BUILD_TAG} · Three.js + VRM emotes (idle/listening/thinking/speaking).</p>
            </section>

            <section className={styles.chatPanel}>
              <div className={styles.messages}>
                {messages.map((msg) => {
                  const mine =
                    msg.senderId === 'me' ||
                    (userId && msg.senderId?.toString() === userId?.toString()) ||
                    `${msg._id || ''}`.startsWith('temp-');
                  const isVoiceLink = Boolean(extractVoiceUrl(msg.content || ''));
                  if (isVoiceLink) return null;
                  return (
                    <div key={msg._id || `${msg.createdAt}-${msg.content}`} className={`${styles.messageRow} ${mine ? styles.mine : styles.theirs}`}>
                      <div className={styles.messageBubble}>{msg.content}</div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              <form className={styles.inputRow} onSubmit={handleSend}>
                <Button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={listening ? styles.micLive : styles.micIdle}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={listening ? 'Listening… release mic when done' : 'Talk to Kaori…'}
                />
                <Button type="submit" disabled={!input.trim() || sending} className={styles.sendBtn}>
                  {sending ? <Loader2 className={styles.spinSmall} /> : <Send size={16} />}
                </Button>
              </form>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
