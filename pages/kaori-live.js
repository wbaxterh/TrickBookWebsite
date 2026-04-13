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
import styles from '../styles/kaori-live.module.css';

const THREE_CDN = 'https://unpkg.com/three@0.160.0/build/three.min.js';

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

  const mountRef = useRef(null);
  const threeRef = useRef({});
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const audioRafRef = useRef(null);

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
    if (!mountRef.current) return;

    let mounted = true;

    const loadThree = async () => {
      if (typeof window === 'undefined') return;

      if (!window.THREE) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = THREE_CDN;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      if (!mounted || !window.THREE) return;
      const THREE = window.THREE;

      const mount = mountRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0b1020');

      const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000);
      camera.position.z = 5.2;
      camera.position.y = 0.6;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.innerHTML = '';
      mount.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight('#c3d7ff', 0.9);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight('#7cc7ff', 1.4);
      keyLight.position.set(2.8, 3, 3);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight('#ff9ad5', 0.8);
      fillLight.position.set(-3, -1, 2);
      scene.add(fillLight);

      const headGeometry = new THREE.SphereGeometry(1.05, 64, 64);
      const headMaterial = new THREE.MeshStandardMaterial({
        color: '#e9f2ff',
        emissive: '#0e1d3a',
        emissiveIntensity: 0.45,
        metalness: 0.08,
        roughness: 0.28,
      });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      scene.add(head);

      const hairGeometry = new THREE.SphereGeometry(1.08, 64, 64, 0, Math.PI * 2, 0, Math.PI / 1.9);
      const hairMaterial = new THREE.MeshStandardMaterial({ color: '#1b295a', roughness: 0.4, metalness: 0.05 });
      const hair = new THREE.Mesh(hairGeometry, hairMaterial);
      hair.position.y = 0.18;
      scene.add(hair);

      const eyeGeo = new THREE.SphereGeometry(0.09, 24, 24);
      const eyeMat = new THREE.MeshBasicMaterial({ color: '#0e1222' });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.28, 0.11, 0.94);
      rightEye.position.set(0.28, 0.11, 0.94);
      scene.add(leftEye);
      scene.add(rightEye);

      const mouthGeo = new THREE.SphereGeometry(0.08, 20, 20);
      const mouthMat = new THREE.MeshBasicMaterial({ color: '#f06595' });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.position.set(0, -0.22, 0.95);
      scene.add(mouth);

      const ringGeo = new THREE.TorusGeometry(1.45, 0.05, 24, 120);
      const ringMat = new THREE.MeshBasicMaterial({ color: '#ffe16f' });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.8;
      ring.position.y = -1.35;
      scene.add(ring);

      const pulseGeo = new THREE.RingGeometry(1.6, 1.65, 120);
      const pulseMat = new THREE.MeshBasicMaterial({ color: '#7ce5ff', transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.rotation.x = -Math.PI / 2;
      pulse.position.y = -1.45;
      scene.add(pulse);

      const clock = new THREE.Clock();

      const animate = () => {
        if (!mounted) return;
        const t = clock.getElapsedTime();

        head.rotation.y = Math.sin(t * 0.55) * 0.25;
        head.rotation.x = Math.sin(t * 0.35) * 0.08;
        hair.rotation.y = head.rotation.y * 0.9;
        hair.rotation.x = head.rotation.x * 0.9;

        ring.rotation.z += 0.003;
        pulse.scale.setScalar(1 + Math.sin(t * 2.4) * 0.04);

        // tiny blink loop
        const blink = Math.max(0.12, Math.abs(Math.sin(t * 0.85)) > 0.985 ? 0.05 : 1);
        leftEye.scale.y = blink;
        rightEye.scale.y = blink;

        const state = threeRef.current.charState || 'idle';
        if (state === 'listening') {
          headMaterial.emissive.set('#176b8a');
          headMaterial.emissiveIntensity = 0.85;
          pulseMat.opacity = 0.55;
          mouth.scale.set(1.1, 0.75, 1);
        } else if (state === 'thinking') {
          headMaterial.emissive.set('#4d2d8f');
          headMaterial.emissiveIntensity = 0.9;
          pulseMat.opacity = 0.4;
          mouth.scale.set(0.9, 0.7, 1);
        } else if (state === 'speaking') {
          headMaterial.emissive.set('#8a2f66');
          headMaterial.emissiveIntensity = 1.0;
          const voiceLevel = threeRef.current.voiceLevel || 0;
          pulseMat.opacity = 0.5 + voiceLevel * 0.5;
          head.scale.setScalar(1 + Math.max(voiceLevel * 0.09, Math.abs(Math.sin(t * 8)) * 0.02));
          mouth.scale.set(1 + voiceLevel * 0.8, 0.5 + voiceLevel * 1.2, 1);
        } else {
          headMaterial.emissive.set('#0e1d3a');
          headMaterial.emissiveIntensity = 0.45;
          pulseMat.opacity = 0.25;
          head.scale.setScalar(1);
          mouth.scale.set(1, 0.6, 1);
        }

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
        head,
        hair,
        leftEye,
        rightEye,
        mouth,
        charState: 'idle',
        cleanup: () => {
          window.removeEventListener('resize', onResize);
          if (threeRef.current.raf) cancelAnimationFrame(threeRef.current.raf);
          renderer.dispose();
          headGeometry.dispose();
          headMaterial.dispose();
          hairGeometry.dispose();
          hairMaterial.dispose();
          eyeGeo.dispose();
          eyeMat.dispose();
          mouthGeo.dispose();
          mouthMat.dispose();
          ringGeo.dispose();
          ringMat.dispose();
          pulseGeo.dispose();
          pulseMat.dispose();
        },
      };
    };

    loadThree().catch(() => {
      setBootError('3D renderer failed to load in this browser.');
    });

    return () => {
      mounted = false;
      threeRef.current.cleanup?.();
    };
  }, []);

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
      senderId: 'me',
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
              <p className={styles.caption}>Phase A avatar placeholder (Three.js scene). Real Kaori model + emotes next.</p>
            </section>

            <section className={styles.chatPanel}>
              <div className={styles.messages}>
                {messages.map((msg) => {
                  const mine =
                    msg.senderId === 'me' ||
                    (userId && msg.senderId?.toString() === userId?.toString()) ||
                    `${msg._id || ''}`.startsWith('temp-');
                  const isVoiceLink = Boolean(extractVoiceUrl(msg.content || ''));
                  return (
                    <div key={msg._id || `${msg.createdAt}-${msg.content}`} className={`${styles.messageRow} ${mine ? styles.mine : styles.theirs}`}>
                      <div className={styles.messageBubble}>
                        {isVoiceLink ? (
                          <a href={extractVoiceUrl(msg.content)} target="_blank" rel="noreferrer">
                            {msg.content}
                          </a>
                        ) : (
                          msg.content
                        )}
                      </div>
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
