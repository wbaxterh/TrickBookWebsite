import { Loader2, Mic, MicOff, Send, Square } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import {
  getBotCompanions,
  getMessages,
  sendMessage,
  startBotConversation,
} from '../lib/apiMessages';
import { connectMessagesSocket } from '../lib/socket';
import styles from '../styles/kaori-live.module.css';

const KAORI_VRM_PATH = '/kaori/kaori_sample.vrm';
const KAORI_STAGE_BUILD_TAG = 'build-188-kith';
const KITH_VOICE_WS_URL = process.env.NEXT_PUBLIC_KITH_VOICE_WS_URL || 'ws://localhost:3040/ws';

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
  const sendLockRef = useRef(false);
  const lastSubmitRef = useRef({ text: '', ts: 0 });

  // Kith voice WebSocket
  const kithWsRef = useRef(null);
  const kithSessionRef = useRef('');
  const audioCtxRef = useRef(null);
  const audioQueueRef = useRef([]);
  const audioPlayingRef = useRef(false);

  const SpeechRecognition = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  const scrollRef = useRef(null);

  // Intentionally disabled auto-scroll for Kaori Live chat.

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
        // Replace optimistic message with the real one from the server
        const isOwnMessage = message.senderId?.toString() === userId?.toString();
        if (isOwnMessage) {
          const hasOptimistic = prev.some(
            (m) => `${m._id}`.startsWith('temp-') && m.content === message.content,
          );
          if (hasOptimistic) {
            return prev.map((m) =>
              `${m._id}`.startsWith('temp-') && m.content === message.content ? message : m,
            );
          }
        }
        return [...prev, message];
      });

      // Voice playback is handled by Kith WebSocket, not from message content.
    };

    socket.on('message:new', onNewMessage);

    return () => {
      socket.emit('leave:conversation', conversationId);
      socket.off('message:new', onNewMessage);
    };
  }, [token, conversationId, userId]);

  // --- Kith Voice WebSocket ---
  // Connects to the Kith voice sidecar. Receives streaming TTS audio chunks,
  // emotion state updates, and turn lifecycle events. Audio chunks are decoded
  // and queued into Web Audio API for gapless playback.
  useEffect(() => {
    if (!conversationId) return;

    let ws;
    let closed = false;

    const getAudioCtx = () => {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    };

    const drainAudioQueue = async () => {
      if (audioPlayingRef.current) return;
      const ctx = getAudioCtx();
      if (!ctx) return;

      audioPlayingRef.current = true;
      while (audioQueueRef.current.length > 0) {
        const b64 = audioQueueRef.current.shift();
        try {
          const binary = atob(b64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
          await new Promise((resolve) => {
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = resolve;
            source.start();
          });
        } catch (err) {
          console.warn('[kith] audio chunk decode/play error:', err);
        }
      }
      audioPlayingRef.current = false;
    };

    const connect = () => {
      if (closed) return;
      ws = new WebSocket(KITH_VOICE_WS_URL);
      kithWsRef.current = ws;

      ws.onopen = () => {
        console.log('[kith] ws connected');
      };

      ws.onmessage = (e) => {
        let event;
        try {
          event = JSON.parse(e.data);
        } catch {
          return;
        }

        switch (event.type) {
          case '_ready':
            kithSessionRef.current = event.sessionId;
            console.log('[kith] session ready:', event.sessionId);
            break;

          case 'tts_audio_chunk':
            audioQueueRef.current.push(event.audioB64);
            drainAudioQueue();
            break;

          case 'tts_start':
            setCharState('speaking');
            break;

          case 'tts_end':
            // Wait for queue to drain before going idle
            if (audioQueueRef.current.length === 0 && !audioPlayingRef.current) {
              setCharState('idle');
            }
            break;

          case 'turn_start':
            if (event.role === 'assistant') setCharState('speaking');
            break;

          case 'turn_end':
            if (event.role === 'assistant') {
              // Delay idle until audio queue drains
              const checkIdle = () => {
                if (audioQueueRef.current.length === 0 && !audioPlayingRef.current) {
                  setCharState('idle');
                } else {
                  setTimeout(checkIdle, 100);
                }
              };
              checkIdle();
            }
            break;

          case 'emotion_state':
            // Apply emotion tint to VRM materials
            if (threeRef.current.vrm?.scene) {
              const tints = {
                excited: 0xffe5a0,
                calm: 0xa0d8ff,
                happy: 0xffc0e8,
                sad: 0x8090cc,
                neutral: 0xffffff,
              };
              const color = tints[event.state] ?? 0xffffff;
              threeRef.current.vrm.scene.traverse((child) => {
                if (child.isMesh && child.material?.emissive) {
                  child.material.emissive.setHex(color);
                  child.material.emissiveIntensity = event.intensity * 0.3;
                }
              });
            }
            break;

          case 'barge_in_detected':
            audioQueueRef.current.length = 0;
            setCharState('listening');
            break;

          case 'error':
            console.error('[kith] error:', event.message);
            break;

          default:
            break;
        }
      };

      ws.onclose = () => {
        kithSessionRef.current = '';
        kithWsRef.current = null;
        if (!closed) {
          console.log('[kith] ws closed, reconnecting in 3s...');
          setTimeout(connect, 3000);
        }
      };

      ws.onerror = (err) => {
        console.error('[kith] ws error:', err);
      };
    };

    connect();

    return () => {
      closed = true;
      kithSessionRef.current = '';
      if (ws) {
        ws.onclose = null; // prevent reconnect
        ws.close();
      }
      kithWsRef.current = null;
      audioQueueRef.current.length = 0;
      audioPlayingRef.current = false;
    };
  }, [conversationId]);

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
      scene.background = new THREE.Color('#07122a');
      scene.fog = new THREE.Fog('#0a1732', 4.5, 12);

      const camera = new THREE.PerspectiveCamera(
        42,
        mount.clientWidth / mount.clientHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 1.45, 2.15);

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

      // Snowy mountain backdrop (Phase A art direction)
      const groundGeo = new THREE.PlaneGeometry(16, 8);
      const groundMat = new THREE.MeshStandardMaterial({
        color: '#a8c5de',
        roughness: 0.95,
        metalness: 0.02,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, -1.45, -1.2);
      scene.add(ground);

      const mountainGroup = new THREE.Group();
      const makeMountain = (x, y, z, s, color = '#38557a') => {
        const geo = new THREE.ConeGeometry(1, 2, 4);
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.02 });
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.scale.setScalar(s);
        m.rotation.y = Math.PI * 0.25;

        const capGeo = new THREE.ConeGeometry(0.42, 0.45, 4);
        const capMat = new THREE.MeshStandardMaterial({ color: '#eef6ff', roughness: 0.95 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.95;
        m.add(cap);

        mountainGroup.add(m);
      };

      makeMountain(-2.9, -0.3, -5.5, 1.45);
      makeMountain(-0.8, -0.35, -5.2, 1.7, '#2e4968');
      makeMountain(1.5, -0.25, -5.4, 1.55);
      makeMountain(3.2, -0.4, -5.8, 1.25, '#2b4564');
      scene.add(mountainGroup);

      const ringGeo = new THREE.TorusGeometry(1.45, 0.05, 24, 120);
      const ringMat = new THREE.MeshBasicMaterial({ color: '#ffe16f' });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.8;
      ring.position.y = -1.35;
      scene.add(ring);

      const fallbackGeo = new THREE.SphereGeometry(0.55, 32, 32);
      const fallbackMat = new THREE.MeshStandardMaterial({
        color: '#8bb6ff',
        emissive: '#2a3d77',
        emissiveIntensity: 0.7,
      });
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
        modelRoot.position.y -= min2.y + 0.1;
      } else {
        // Fallback transform if bounds are invalid on first load
        modelRoot.position.set(0, -1.05, 0);
        modelRoot.scale.setScalar(1.0);
      }

      modelRoot.rotation.y = 0;

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

      let mixer = null;
      const clipActions = {};
      let activeClip = '';

      const fadeToClip = (name) => {
        if (!mixer || !clipActions[name] || activeClip === name) return;
        const next = clipActions[name];
        const prev = clipActions[activeClip];
        if (prev) prev.fadeOut(0.35);
        next.reset().fadeIn(0.35).play();
        activeClip = name;
      };

      const expr = (name, value) => {
        const em = vrm?.expressionManager;
        if (!em) return;
        try {
          em.setValue(name, value);
        } catch (_err) {
          // no-op for unsupported expressions
        }
      };

      // Optional Mixamo-style clip blending (if clips exist)
      (async () => {
        try {
          const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
          const loader = new FBXLoader();
          const clipMap = {
            idle: '/kaori/anims/idle.fbx',
            speaking: '/kaori/anims/talking.fbx',
            thinking: '/kaori/anims/excited.fbx',
          };

          mixer = new THREE.AnimationMixer(modelRoot);

          for (const [key, url] of Object.entries(clipMap)) {
            try {
              const fbx = await loader.loadAsync(url);
              const clip = fbx.animations?.[0];
              if (!clip) continue;
              const action = mixer.clipAction(clip);
              action.enabled = true;
              action.setEffectiveWeight(1);
              action.setLoop(THREE.LoopRepeat, Infinity);
              clipActions[key] = action;
            } catch (_err) {
              // Clip missing is acceptable in fallback mode.
            }
          }

          if (clipActions.idle) {
            clipActions.idle.play();
            activeClip = 'idle';
          }
        } catch (_err) {
          // If loader import fails, procedural animation still works.
        }
      })();

      let smoothedVoice = 0;
      let smoothedMouth = 0;
      let smoothedLow = 0;
      let smoothedMid = 0;
      let smoothedHigh = 0;
      const animate = () => {
        if (!mounted) return;
        const dt = clock.getDelta();
        const t = clock.elapsedTime;

        const state = threeRef.current.charState || 'idle';
        const voiceLevel = threeRef.current.voiceLevel || 0;
        const bands = threeRef.current.voiceBands || { low: 0, mid: 0, high: 0 };
        smoothedVoice += (voiceLevel - smoothedVoice) * 0.15;
        smoothedLow = THREE.MathUtils.damp(smoothedLow, bands.low, 12, dt);
        smoothedMid = THREE.MathUtils.damp(smoothedMid, bands.mid, 12, dt);
        smoothedHigh = THREE.MathUtils.damp(smoothedHigh, bands.high, 12, dt);

        const mouthTarget =
          state === 'speaking' ? Math.min(0.62, Math.max(0, smoothedVoice - 0.05) * 0.9) : 0;
        smoothedMouth = THREE.MathUtils.damp(
          smoothedMouth,
          mouthTarget,
          state === 'speaking' ? 16 : 11,
          dt,
        );

        if (vrm) {
          vrm.update(dt);
        }

        if (mixer) {
          mixer.update(dt);
          if (state === 'speaking') fadeToClip('speaking');
          else if (state === 'thinking') fadeToClip('thinking');
          else fadeToClip('idle');
        }

        if (vrm?.humanoid) {
          const neck = vrm.humanoid.getNormalizedBoneNode('neck');
          const spine = vrm.humanoid.getNormalizedBoneNode('spine');
          const chest = vrm.humanoid.getNormalizedBoneNode('chest');
          const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
          const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');

          const idleSway = Math.sin(t * 0.7) * 0.04;
          const breathe = Math.sin(t * 1.5) * 0.02;

          if (neck) {
            neck.rotation.y = Math.sin(t * 0.9) * 0.06;
            neck.rotation.x = breathe;
          }
          if (spine) spine.rotation.z = idleSway;
          if (chest) chest.rotation.x = breathe * 0.7;

          if (state === 'listening') {
            if (neck) neck.rotation.x += 0.08;
            if (spine) spine.rotation.x = 0.04;
          }

          if (state === 'thinking') {
            if (neck) neck.rotation.y += Math.sin(t * 2.2) * 0.05;
            if (spine) spine.rotation.x = 0.06;
          }

          const armTalk =
            state === 'speaking'
              ? Math.sin(t * (3.6 + smoothedVoice * 1.8)) * (0.01 + smoothedVoice * 0.016)
              : 0;
          const leftTargetZ = -1.2 + armTalk;
          const rightTargetZ = 1.2 - armTalk;
          const leftTargetY = 0.05;
          const rightTargetY = -0.05;

          if (leftUpperArm) {
            leftUpperArm.rotation.z = THREE.MathUtils.damp(
              leftUpperArm.rotation.z,
              leftTargetZ,
              7,
              dt,
            );
            leftUpperArm.rotation.y = THREE.MathUtils.damp(
              leftUpperArm.rotation.y,
              leftTargetY,
              7,
              dt,
            );
            leftUpperArm.rotation.x = THREE.MathUtils.damp(leftUpperArm.rotation.x, -0.02, 7, dt);
          }
          if (rightUpperArm) {
            rightUpperArm.rotation.z = THREE.MathUtils.damp(
              rightUpperArm.rotation.z,
              rightTargetZ,
              7,
              dt,
            );
            rightUpperArm.rotation.y = THREE.MathUtils.damp(
              rightUpperArm.rotation.y,
              rightTargetY,
              7,
              dt,
            );
            rightUpperArm.rotation.x = THREE.MathUtils.damp(rightUpperArm.rotation.x, -0.02, 7, dt);
          }

          if (state === 'speaking' && neck) neck.rotation.x += 0.02;
        } else {
          modelRoot.rotation.y = Math.sin(t * 0.35) * 0.06;
          modelRoot.position.y = -1.05 + Math.sin(t * 1.3) * 0.03;
        }

        expr('blink', Math.abs(Math.sin(t * 0.75)) > 0.985 ? 1 : 0);
        expr('aa', Math.min(0.55, smoothedMouth * (0.65 + smoothedLow * 0.35)));
        expr('oh', Math.min(0.35, smoothedMouth * (0.25 + smoothedMid * 0.75)));
        expr('ee', Math.min(0.32, smoothedMouth * (0.2 + smoothedHigh * 0.8)));
        expr('ih', state === 'thinking' ? 0.1 : 0);
        expr('happy', state === 'listening' ? 0.16 : state === 'speaking' ? 0.22 : 0.08);

        if (state === 'listening') {
          pulseMat.opacity = 0.55;
        } else if (state === 'thinking') {
          pulseMat.opacity = 0.4;
        } else if (state === 'speaking') {
          pulseMat.opacity = 0.45 + smoothedVoice * 0.45;
        } else {
          pulseMat.opacity = 0.25;
        }

        ring.rotation.z += 0.003;
        pulse.scale.setScalar(1 + Math.sin(t * 2.4) * 0.04 + smoothedVoice * 0.04);

        camera.lookAt(0, 1.35, 0);
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
          if (mixer) mixer.stopAllAction();
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

  const stopKithAudio = () => {
    audioQueueRef.current.length = 0;
    if (kithWsRef.current?.readyState === WebSocket.OPEN) {
      kithWsRef.current.send(JSON.stringify({ type: 'barge-in' }));
    }
    setCharState('idle');
  };

  const ensureAudioCtx = () => {
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  };

  const submitText = async (text) => {
    if (!text?.trim() || !conversationId || sending || sendLockRef.current) return;

    const content = text.trim();
    const now = Date.now();
    const last = lastSubmitRef.current;
    if (last.text === content && now - last.ts < 2500) return;

    sendLockRef.current = true;
    lastSubmitRef.current = { text: content, ts: now };
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
      // Pass x-kith-session header so the backend fires voice through Kith
      const kithSession = kithSessionRef.current;
      const extraHeaders = kithSession ? { 'x-kith-session': kithSession } : undefined;
      await sendMessage(conversationId, content, token, extraHeaders);

      // Voice arrives via Kith WebSocket (tts_audio_chunk events).
      // Text reply arrives via socket.io (message:new event).
      // No polling needed.
    } catch (_error) {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setCharState('idle');
      alert('Failed to send message to Kaori.');
    } finally {
      setSending(false);
      sendLockRef.current = false;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    ensureAudioCtx();
    const payload = input;
    setInput('');
    await submitText(payload);
  };

  const toggleVoiceInput = async () => {
    ensureAudioCtx();
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

  const stateStyle =
    charState === 'listening'
      ? styles.stateListening
      : charState === 'thinking'
        ? styles.stateThinking
        : charState === 'speaking'
          ? styles.stateSpeaking
          : styles.stateIdle;

  if (loggedIn === false) {
    return (
      <div className={styles.centerWrap}>
        <p className={styles.dim}>Log in to talk with Kaori</p>
        <Link href="/login" className={styles.loginLink}>
          Sign In
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
        {/* Avatar fills entire viewport */}
        <div ref={mountRef} className={styles.stage} />

        {/* Top HUD — brand + state indicator */}
        <div className={styles.hud}>
          <div className={styles.brandMark}>
            <div>
              <h1 className={styles.brandName}>Kaori</h1>
              <p className={styles.brandSub}>AI Companion</p>
            </div>
          </div>
          <div className={`${styles.statePill} ${stateStyle}`}>
            <span className={styles.stateDot} />
            {charState}
          </div>
        </div>

        {/* Loading / Error overlays */}
        {loading && (
          <div className={styles.centerWrap}>
            <Loader2 className={styles.spin} />
            <p className={styles.dim}>Connecting to Kaori...</p>
          </div>
        )}
        {bootError && !loading && (
          <div className={styles.centerWrap}>
            <p className={styles.error}>{bootError}</p>
          </div>
        )}

        {/* Chat overlay — transparent, overlays bottom of avatar */}
        {!loading && !bootError && (
          <div className={styles.chatOverlay}>
            <div className={styles.messages}>
              {messages.map((msg) => {
                const mine =
                  msg.senderId === 'me' ||
                  (userId && msg.senderId?.toString() === userId?.toString()) ||
                  `${msg._id || ''}`.startsWith('temp-');
                if (/Kaori voice:\s*https?:\/\//i.test(msg.content || '')) return null;
                if (/https?:\/\/[^\s)]+\.mp3/i.test(msg.content || '')) return null;
                return (
                  <div
                    key={msg._id || `${msg.createdAt}-${msg.content}`}
                    className={`${styles.messageRow} ${mine ? styles.mine : styles.theirs}`}
                  >
                    <div className={styles.messageBubble}>{msg.content}</div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <form className={styles.inputBar} onSubmit={handleSend}>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`${styles.iconBtn} ${listening ? styles.micLive : styles.micIdle}`}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <textarea
                className={styles.chatInput}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={listening ? 'Listening…' : 'Talk to Kaori…'}
                rows={1}
              />
              {charState === 'speaking' && (
                <button
                  type="button"
                  onClick={stopKithAudio}
                  className={`${styles.iconBtn} ${styles.stopBtn}`}
                >
                  <Square size={14} />
                </button>
              )}
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className={`${styles.iconBtn} ${styles.sendBtn}`}
              >
                {sending ? <Loader2 className={styles.spinSmall} /> : <Send size={18} />}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
