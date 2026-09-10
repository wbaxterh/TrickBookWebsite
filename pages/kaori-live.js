import { Loader2, Mic, MicOff, Send, Square } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import {
  getBotCompanions,
  getCompanionGreeting,
  getMessages,
  sendMessage,
  startBotConversation,
} from '../lib/apiMessages';
import {
  createTrickDemoState,
  driveDemo,
  isDemoActive,
  startAction,
  TRICKS,
} from '../lib/kaori/trickAnimations';
import { actionForSentence, detectTrickId, startDemoIfCued } from '../lib/kaori/trickCues';
import { connectMessagesSocket } from '../lib/socket';
import styles from '../styles/kaori-live.module.css';

const KAORI_VRM_PATH = '/kaori/Kaori_V3.vrm';
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
  const kaoriBotIdRef = useRef('');
  const greetedRef = useRef(false);

  // Kith voice WebSocket
  const kithWsRef = useRef(null);
  const kithSessionRef = useRef('');
  const audioCtxRef = useRef(null);
  const audioQueueRef = useRef([]);
  const audioPlayingRef = useRef(false);

  // Trick-demo choreography (ported from the mobile companion stage): the
  // demo state machine owns Kaori's body while she rides the board; her
  // reply's sentences (one Kith turn per sentence) cue the moves.
  const demoStateRef = useRef(null);
  if (!demoStateRef.current) demoStateRef.current = createTrickDemoState();
  const replySentencesRef = useRef(null);
  const sentenceIndexRef = useRef(0);
  const lastUserTextRef = useRef('');

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
        kaoriBotIdRef.current = kaori._id;

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

      // Demo choreography: Kaori's reply just arrived — if the exchange cues a
      // trick demo (user asked to see one, or her reply announces one), she
      // steps onto the board for the whole reply and her spoken sentences cue
      // the moves (see the Kith turn_start handler). Voiceless (no Kith
      // session): run the full trick once instead.
      const isOwn = message.senderId?.toString() === userId?.toString();
      if (!isOwn && message.content) {
        startDemoIfCued(
          lastUserTextRef.current,
          message.content,
          kithSessionRef.current || null,
          demoStateRef.current,
          replySentencesRef,
        );
      }

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
            // Auto-greet after a short delay so avatar loads first
            if (!greetedRef.current && kaoriBotIdRef.current && token) {
              greetedRef.current = true;
              setTimeout(() => {
                getCompanionGreeting(kaoriBotIdRef.current, token)
                  .then(({ greeting }) => {
                    if (greeting && event.sessionId === kithSessionRef.current) {
                      // Add greeting as a Kaori message in the chat
                      setMessages((prev) => [
                        ...prev,
                        {
                          _id: `greeting-${Date.now()}`,
                          senderId: kaoriBotIdRef.current,
                          content: greeting,
                          createdAt: new Date().toISOString(),
                        },
                      ]);
                      // Speak the greeting through Kith voice
                      if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'speak', text: greeting }));
                      }
                      setCharState('speaking');
                    }
                  })
                  .catch(() => {});
              }, 2000); // 2s delay for avatar to load
            }
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
            if (event.role === 'assistant') {
              setCharState('speaking');
              // Kith speaks a reply SENTENCE BY SENTENCE (one turn cycle per
              // sentence) — each assistant turn_start is the cue that sentence
              // n is about to play. Mirror the mobile onAssistantSentence
              // callback: map what she's saying to what her body does.
              const sentences = replySentencesRef.current;
              if (sentences) {
                const action = actionForSentence(sentences[sentenceIndexRef.current] ?? '');
                if (action) startAction(demoStateRef.current, action);
              }
              sentenceIndexRef.current += 1;
            }
            break;

          case 'turn_end':
            if (event.role === 'assistant') {
              // Delay idle until audio queue drains
              const checkIdle = () => {
                if (audioQueueRef.current.length === 0 && !audioPlayingRef.current) {
                  // Drain grace (mirrors the mobile Kith hook): turn_end fires
                  // per SENTENCE, so wait a beat and re-check before calling
                  // the reply over — a slow next sentence must not cut the
                  // reply (or the trick-demo session) off early.
                  setTimeout(() => {
                    if (audioQueueRef.current.length === 0 && !audioPlayingRef.current) {
                      setCharState('idle');
                      demoStateRef.current.session = false;
                      replySentencesRef.current = null;
                    }
                  }, 500);
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
      camera.position.set(0, 1.25, 2.15);

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

      // Captured for the trick-demo rig: the pose engine works in the VRM's
      // natural units, so demo lengths (CoM pivot, jump height, board size)
      // scale by whatever the auto-fit applied.
      let appliedFitScale = 1;

      if (!box.isEmpty()) {
        const size = box.getSize(new THREE.Vector3());
        const safeHeight = Math.max(size.y || 0, 0.001);
        const targetHeight = 1.8;
        const rawScale = targetHeight / safeHeight;
        const fitScale = Math.min(4, Math.max(0.2, rawScale));

        modelRoot.scale.multiplyScalar(fitScale);
        appliedFitScale = fitScale;
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

      // --- Trick-demo rider rig (ported from the mobile KaoriStage) ---------
      // The demo's whole-body transform (yaw*pitch quaternion pivoted at the
      // CoM) is authored in the VRM's natural frame: feet at y=0, hips at
      // COM_LOCAL_Y. The web stage auto-fits the model (scale + offset), so
      // wrap it in a rig that re-anchors that frame: modelRoot keeps its fitted
      // transform INSIDE riderRig with the feet at rig-local y=0, and the demo
      // drives the RIG — idle keeps working untouched (rig stays identity).
      const fitScale = appliedFitScale;
      modelRoot.updateWorldMatrix(true, true);
      const feetBox = new THREE.Box3().setFromObject(modelRoot);
      // Feet baseline after the auto-fit (lowest vertex — the boot soles).
      const feetY = feetBox.isEmpty() ? modelRoot.position.y : feetBox.min.y;
      const riderRig = new THREE.Group();
      modelRoot.position.y -= feetY;
      riderRig.position.set(0, feetY, 0);
      riderRig.add(modelRoot);

      scene.add(riderRig);
      fallbackMesh.visible = false;
      setStageDebug(vrm ? 'vrm_loaded' : 'gltf_loaded_no_vrm');

      // Stylized snowboard that appears under Kaori's feet during trick demos.
      // Deck shape ported from the mobile TrickBoard: a segmented box
      // vertex-warped so the nose and tail round off (circular outline taper)
      // and kick upward (rocker).
      const makeBoardGeometry = (length, thickness, width, kick) => {
        const geometry = new THREE.BoxGeometry(length, thickness, width, 48, 1, 8);
        const positions = geometry.attributes.position;
        const half = length / 2;
        const tipStart = 0.74; // outline starts rounding here (fraction of half-length)
        const kickStart = 0.62; // tips start curving up here
        for (let i = 0; i < positions.count; i++) {
          const u = Math.abs(positions.getX(i)) / half;
          if (u > tipStart) {
            const v = (u - tipStart) / (1 - tipStart);
            positions.setZ(i, positions.getZ(i) * Math.sqrt(Math.max(0, 1 - v * v)));
          }
          if (u > kickStart) {
            const k = (u - kickStart) / (1 - kickStart);
            positions.setY(i, positions.getY(i) + kick * k * k);
          }
        }
        geometry.computeVertexNormals();
        return geometry;
      };

      const board = new THREE.Group();
      const deckGeometry = makeBoardGeometry(1.15, 0.03, 0.27, 0.09);
      const baseGeometry = makeBoardGeometry(1.19, 0.014, 0.3, 0.09);
      const bindingGeometry = new THREE.BoxGeometry(0.16, 0.04, 0.2);
      // Deck — sakura-pink topsheet (matches Kaori's jacket, pops against the
      // dark floor), long axis through the rider's feet.
      const deckMat = new THREE.MeshStandardMaterial({
        color: '#f48fb8',
        roughness: 0.35,
        transparent: true,
        fog: false,
      });
      // White rails/base peeking out around the deck.
      const baseMat = new THREE.MeshStandardMaterial({
        color: '#f4f6fb',
        roughness: 0.3,
        transparent: true,
        fog: false,
      });
      const bindingMat = new THREE.MeshStandardMaterial({ color: '#101319', roughness: 0.7 });
      board.add(new THREE.Mesh(deckGeometry, deckMat));
      const baseMesh = new THREE.Mesh(baseGeometry, baseMat);
      baseMesh.position.y = -0.004;
      board.add(baseMesh);
      // Binding hints (bindings live at ±0.24 along the board's +X long axis).
      for (const bx of [-0.24, 0.24]) {
        const binding = new THREE.Mesh(bindingGeometry, bindingMat);
        binding.position.set(bx, 0.035, 0);
        board.add(binding);
      }
      board.scale.setScalar(fitScale); // board authored in VRM units like the poses
      board.visible = false;
      scene.add(board);

      // --- Whole-body flip transform (yaw*pitch quaternion pivoted at the CoM)
      // Hip/CoM height in the VRM's natural frame (feet ~y=0; THIGH_LEN +
      // SHIN_LEN ≈ 0.84 straight-leg foot→hip). The fixed pivot height for a
      // flip — NOT rootY.
      const COM_LOCAL_Y = 0.85;
      const _flipQ = new THREE.Quaternion();
      const _flipQYaw = new THREE.Quaternion();
      const _flipQPitch = new THREE.Quaternion();
      const _flipYAxis = new THREE.Vector3(0, 1, 0);
      // Flip axis = toe-heel line in her LOCAL frame (+Z), horizontal and
      // PERPENDICULAR to the board. A wildcat/tamedog tumbles END OVER END —
      // the nose sweeps up and over while the tail dives (board pitches
      // nose-over-tail with her). The old axis (1,0,0) was the foot-to-foot
      // line, which produced a gymnast-style backflip over the heel edge with
      // the board staying crossways — wrong trick. If flips now tumble over the
      // WRONG edge (toe vs heel plane), flip this to (0,0,-1); tail-vs-nose
      // direction is the totalFlip sign in TRICKS.
      const _flipPitchAxis = new THREE.Vector3(0, 0, 1);
      const _flipComOffset = new THREE.Vector3();
      /** Foot bone ≈ ankle; drop the deck this far below the midpoint so the
       *  soles sit on top of the board rather than through it (VRM units). */
      const BOARD_SOLE_DROP = 0.07;

      // Scratch objects reused every frame so locking the board allocates nothing.
      const _footL = new THREE.Vector3();
      const _footR = new THREE.Vector3();
      const _boardX = new THREE.Vector3();
      const _boardY = new THREE.Vector3();
      const _boardZ = new THREE.Vector3();
      const _worldFwd = new THREE.Vector3(0, 0, 1);
      const _boardBasis = new THREE.Matrix4();
      const _boardQuat = new THREE.Quaternion();
      // Board "up" derived from her body (for flips) — see lockBoardToFeet.
      const _bodyUp = new THREE.Vector3();
      const _rootQ = new THREE.Quaternion();

      /**
       * Lock the trick board to the rider's actual feet. The board's long axis
       * (+X, where the bindings live at ±0.24) is aimed straight down the line
       * between the two foot bones and the deck kept facing up, so the bindings
       * stay under the soles and the board ANGLE follows the legs — lift the
       * back leg and the tail rises because that foot rose. Writes the world
       * transform into demo state for the board mesh to copy. Must run after
       * vrm.update() so the foot bones are posed.
       */
      const lockBoardToFeet = (state) => {
        const humanoid = vrm?.humanoid;
        const lf = humanoid?.getRawBoneNode('leftFoot');
        const rf = humanoid?.getRawBoneNode('rightFoot');
        if (!lf || !rf) {
          state.boardLocked = false;
          return;
        }
        lf.getWorldPosition(_footL);
        rf.getWorldPosition(_footR);

        // Board long axis (+X) runs foot-to-foot; build an orthonormal,
        // up-facing basis around it. Feet coincident (never really happens)
        // keeps the last transform; a near-VERTICAL axis (big stylish leg-lift)
        // rebuilds off world-forward so the board STAYS locked instead of
        // unlocking and getting flung to the origin.
        _boardX.subVectors(_footR, _footL);
        if (_boardX.lengthSq() < 1e-6) {
          state.boardLocked = false;
          return;
        }
        _boardX.normalize();
        // Board "up" comes from HER body, not the world — so through a flip
        // inversion the deck ROLLS with her and stays soles-down instead of
        // lying world-flat under an upside-down rider. rootPitch=0 (spins) →
        // body-up == world-up → unchanged. (The flip axis IS the foot line, so
        // foot-to-foot never goes vertical; the world-fwd fallback is only for
        // the near-degenerate stylish lift.)
        _bodyUp.set(0, 1, 0);
        if (state.rootPitch) {
          _rootQ.set(state.rootQuat[0], state.rootQuat[1], state.rootQuat[2], state.rootQuat[3]);
          _bodyUp.applyQuaternion(_rootQ);
        }
        _boardZ.crossVectors(_boardX, _bodyUp);
        if (_boardZ.lengthSq() < 1e-4) {
          _boardZ.crossVectors(_boardX, _worldFwd);
        }
        _boardZ.normalize();
        _boardY.crossVectors(_boardZ, _boardX).normalize();
        _boardBasis.makeBasis(_boardX, _boardY, _boardZ);
        _boardQuat.setFromRotationMatrix(_boardBasis);

        const soleDrop = BOARD_SOLE_DROP * fitScale;
        state.boardPos[0] = (_footL.x + _footR.x) / 2 - _boardY.x * soleDrop;
        state.boardPos[1] = (_footL.y + _footR.y) / 2 - _boardY.y * soleDrop;
        state.boardPos[2] = (_footL.z + _footR.z) / 2 - _boardY.z * soleDrop;
        state.boardQuat[0] = _boardQuat.x;
        state.boardQuat[1] = _boardQuat.y;
        state.boardQuat[2] = _boardQuat.z;
        state.boardQuat[3] = _boardQuat.w;
        state.boardLocked = true;
      };

      // Console/automation hook (mirrors the tricklab): drive a trick demo
      // without the chat, e.g. window.__kaoriDemo.run('wildcat').
      window.__kaoriDemo = {
        state: demoStateRef.current,
        tricks: Object.keys(TRICKS),
        detectTrickId,
        camera,
        ready: () => Boolean(vrm),
        run: (trickId) => {
          if (!TRICKS[trickId]) return false;
          demoStateRef.current.trick = trickId;
          startAction(demoStateRef.current, 'full');
          return true;
        },
      };

      const lookTarget = new THREE.Object3D();
      lookTarget.position.set(0, 1.35, 2.8);
      scene.add(lookTarget);
      if (vrm.lookAt) {
        vrm.lookAt.target = lookTarget;
      }

      const clock = new THREE.Clock();

      // Procedural animation — no mixer or FBX clips needed

      // VRoid VRM 1.0 expression name mapping
      const exprMap = {
        blink: ['blink', 'Blink', 'blinkLeft'],
        aa: ['aa', 'Aa', 'a', 'A', 'vowelA'],
        oh: ['oh', 'Oh', 'o', 'O', 'vowelO'],
        ee: ['ee', 'Ee', 'e', 'E', 'vowelE'],
        ih: ['ih', 'Ih', 'i', 'I', 'vowelI'],
        happy: ['happy', 'Happy', 'joy', 'Joy', 'relaxed', 'Relaxed'],
        angry: ['angry', 'Angry'],
        sad: ['sad', 'Sad', 'sorrow', 'Sorrow'],
        surprised: ['surprised', 'Surprised'],
      };
      const expr = (name, value) => {
        const em = vrm?.expressionManager;
        if (!em) return;
        const candidates = exprMap[name] || [name];
        for (const n of candidates) {
          try {
            em.setValue(n, value);
            return;
          } catch (_err) {
            // try next name
          }
        }
      };

      // Fully procedural animation — no FBX clips.
      // FBX Mixamo animations override bone rotations and cause T-pose issues
      // with VRM models. Procedural animation gives us full control.

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

        // --- Trick demo (ported from the mobile KaoriStage frame loop) ---
        // While a demo session is live the state machine owns the BODY; the
        // face keeps talking (blink/mouth/expressions below) so she narrates
        // while riding and performing. The existing idle/gesture system below
        // is skipped for the frame and resumes untouched once the demo's
        // stance blend has fully released (driveDemo returns false).
        const demoSt = demoStateRef.current;
        const demoActive = Boolean(vrm?.humanoid) && isDemoActive(demoSt);
        if (demoActive) {
          const demoLive = driveDemo(vrm, demoSt, dt);
          // Compose the whole-body orientation: YAW (stance + spin, about Y)
          // THEN PITCH (flip, about her local toe-heel axis — end over end).
          // q = qYaw * qPitch so the flip axis rotates WITH her facing. Pure
          // 360 → rootPitch=0 → qPitch=identity → q is pure Y yaw.
          _flipQYaw.setFromAxisAngle(_flipYAxis, demoSt.rootYaw);
          _flipQPitch.setFromAxisAngle(_flipPitchAxis, demoSt.rootPitch);
          _flipQ.copy(_flipQYaw).multiply(_flipQPitch);
          riderRig.quaternion.copy(_flipQ);
          // Publish the root quaternion so lockBoardToFeet can roll the deck
          // with her through a flip inversion (else it stays world-flat while
          // she inverts).
          demoSt.rootQuat[0] = _flipQ.x;
          demoSt.rootQuat[1] = _flipQ.y;
          demoSt.rootQuat[2] = _flipQ.z;
          demoSt.rootQuat[3] = _flipQ.w;
          // Pivot around the CoM/hip, not the feet: place the rig origin at
          // arcCoM − q·comLocal so the hip sits at (0, rootY + COM, 0) for
          // every pitch angle (the body orbits the hip). pitch=0 → y=rootY.
          const comY = COM_LOCAL_Y * fitScale;
          _flipComOffset.set(0, comY, 0).applyQuaternion(_flipQ);
          riderRig.position.set(
            -_flipComOffset.x,
            feetY + demoSt.rootY * fitScale + comY - _flipComOffset.y,
            -_flipComOffset.z,
          );
          if (!demoLive) {
            riderRig.quaternion.identity();
            riderRig.position.set(0, feetY, 0);
          }
        }

        if (vrm) {
          vrm.update(dt);
        }

        // With the skeleton fully updated, lock the trick board under the
        // actual feet so the bindings stay attached and the board angle
        // follows the legs (lift the back leg → the tail rises).
        if (demoActive && demoSt.boardOpacity > 0.05) {
          lockBoardToFeet(demoSt);
        } else {
          demoSt.boardLocked = false;
        }
        // Cut off a bit higher than 0 so the board doesn't linger as a faint
        // ghost after she's already stood back up.
        board.visible = demoActive && demoSt.boardOpacity > 0.05;
        if (board.visible) {
          // If a frame fails to lock (first frame / missing bone / degenerate
          // basis) these hold the LAST good transform, so the deck never
          // flings to the world origin under an airborne, spinning Kaori.
          board.position.set(demoSt.boardPos[0], demoSt.boardPos[1], demoSt.boardPos[2]);
          board.quaternion.set(
            demoSt.boardQuat[0],
            demoSt.boardQuat[1],
            demoSt.boardQuat[2],
            demoSt.boardQuat[3],
          );
          deckMat.opacity = demoSt.boardOpacity;
          baseMat.opacity = demoSt.boardOpacity;
        }

        // No mixer — fully procedural animation for reliable bone control

        if (vrm?.humanoid && !demoActive) {
          const neck = vrm.humanoid.getNormalizedBoneNode('neck');
          const spine = vrm.humanoid.getNormalizedBoneNode('spine');
          const chest = vrm.humanoid.getNormalizedBoneNode('chest');
          const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
          const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');

          const hips = vrm.humanoid.getNormalizedBoneNode('hips');
          const leftForeArm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
          const rightForeArm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');
          const leftHand = vrm.humanoid.getNormalizedBoneNode('leftHand');
          const rightHand = vrm.humanoid.getNormalizedBoneNode('rightHand');

          // Get finger bones for natural curl
          const fingerBones = [];
          for (const side of ['left', 'right']) {
            for (const finger of ['Thumb', 'Index', 'Middle', 'Ring', 'Little']) {
              for (const joint of ['Proximal', 'Intermediate', 'Distal']) {
                const bone = vrm.humanoid.getNormalizedBoneNode(`${side}${finger}${joint}`);
                if (bone) fingerBones.push({ bone, side, finger, joint });
              }
            }
          }

          // Curl all fingers slightly for relaxed hand pose
          // Left fingers curl positive Z, right fingers curl negative Z
          for (const { bone, side, joint } of fingerBones) {
            const amount = joint === 'Proximal' ? 0.3 : joint === 'Intermediate' ? 0.35 : 0.25;
            const curl = side === 'left' ? -amount : amount;
            bone.rotation.z = THREE.MathUtils.damp(bone.rotation.z, curl, 2, dt);
          }

          // Breathing and idle motion — slow, gentle, alive
          const breathe = Math.sin(t * 1.2) * 0.015;
          const idleSway = Math.sin(t * 0.4) * 0.02;
          const headDrift = Math.sin(t * 0.55) * 0.04;

          // Hips: very subtle weight shift side to side
          if (hips) {
            hips.rotation.z = Math.sin(t * 0.3) * 0.015;
            hips.rotation.y = Math.sin(t * 0.2) * 0.01;
          }

          // Neck: slow gentle look around + breathing nod
          if (neck) {
            neck.rotation.y = headDrift;
            neck.rotation.x = breathe * 0.8;
            neck.rotation.z = Math.sin(t * 0.35) * 0.02; // slight tilt
          }

          // Spine: subtle breathing rise + sway
          if (spine) {
            spine.rotation.z = idleSway;
            spine.rotation.x = breathe * 0.4;
          }

          // Chest: breathing expansion
          if (chest) chest.rotation.x = breathe * 0.6;

          if (state === 'listening') {
            if (neck) neck.rotation.x += 0.08;
            if (spine) spine.rotation.x = 0.04;
          }

          if (state === 'thinking') {
            if (neck) neck.rotation.y += Math.sin(t * 2.2) * 0.05;
            if (spine) spine.rotation.x = 0.06;
          }

          // === GESTURE POSE SYSTEM ===
          // Natural talking uses discrete poses held 1.5-2.5s with smooth blending.
          // Each pose defines target rotations for arms, forearms, hands, head, spine.
          const isSpeaking = state === 'speaking';
          const breathSway = Math.sin(t * 0.5) * 0.015;

          // Predefined conversational gesture poses (held, not continuous sine)
          // lUZ/rUZ = upper arm Z, lUX/rUX = upper arm X (forward)
          // lFZ/rFZ = forearm Z, lHX/rHX = hand X (wrist tilt)
          // nX/nY = neck nod/turn, sX = spine lean
          const gesturePoses = [
            // Resting — both arms at sides, neutral
            {
              lUZ: -1.15,
              rUZ: 1.2,
              lUX: 0.08,
              rUX: 0.05,
              lFZ: -0.15,
              rFZ: 0.15,
              lHX: 0.1,
              rHX: 0.1,
              nX: 0,
              nY: 0,
              sX: 0,
            },
            // Right hand out — explaining, palm up
            {
              lUZ: -1.1,
              rUZ: 0.7,
              lUX: 0.1,
              rUX: 0.4,
              lFZ: -0.15,
              rFZ: -0.3,
              lHX: 0.1,
              rHX: -0.3,
              nX: 0.03,
              nY: -0.04,
              sX: 0.02,
            },
            // Left hand out — presenting, palm open
            {
              lUZ: -0.7,
              rUZ: 1.15,
              lUX: 0.4,
              rUX: 0.08,
              lFZ: 0.3,
              rFZ: 0.15,
              lHX: -0.3,
              rHX: 0.1,
              nX: 0.02,
              nY: 0.05,
              sX: 0.01,
            },
            // Both hands forward — emphasis, open palms
            {
              lUZ: -0.85,
              rUZ: 0.85,
              lUX: 0.35,
              rUX: 0.35,
              lFZ: 0.1,
              rFZ: -0.1,
              lHX: -0.2,
              rHX: -0.2,
              nX: 0.04,
              nY: 0,
              sX: 0.02,
            },
            // Right hand gesture — counting/listing
            {
              lUZ: -1.1,
              rUZ: 0.6,
              lUX: 0.1,
              rUX: 0.5,
              lFZ: -0.15,
              rFZ: -0.45,
              lHX: 0.1,
              rHX: -0.15,
              nX: 0.02,
              nY: -0.06,
              sX: 0.015,
            },
            // Nodding emphasis — both arms subtly forward
            {
              lUZ: -1.0,
              rUZ: 1.0,
              lUX: 0.2,
              rUX: 0.2,
              lFZ: -0.1,
              rFZ: 0.1,
              lHX: 0,
              rHX: 0,
              nX: 0.05,
              nY: 0.02,
              sX: 0.015,
            },
          ];

          // Idle pose (arms at sides)
          const idlePose = gesturePoses[0];

          // Pick which gesture pose to use based on time (cycle every ~2s)
          const poseInterval = 2.0;
          const poseIdx = isSpeaking
            ? 1 + (Math.floor(t / poseInterval) % (gesturePoses.length - 1))
            : 0;
          const pose = isSpeaking ? gesturePoses[poseIdx] : idlePose;

          // Smooth damping — everything blends slowly (no snapping)
          const d = 2.5;
          if (leftUpperArm) {
            leftUpperArm.rotation.z = THREE.MathUtils.damp(
              leftUpperArm.rotation.z,
              pose.lUZ + breathSway,
              d,
              dt,
            );
            leftUpperArm.rotation.x = THREE.MathUtils.damp(
              leftUpperArm.rotation.x,
              pose.lUX,
              d,
              dt,
            );
          }
          if (rightUpperArm) {
            rightUpperArm.rotation.z = THREE.MathUtils.damp(
              rightUpperArm.rotation.z,
              pose.rUZ - breathSway,
              d,
              dt,
            );
            rightUpperArm.rotation.x = THREE.MathUtils.damp(
              rightUpperArm.rotation.x,
              pose.rUX,
              d,
              dt,
            );
          }
          if (leftForeArm) {
            leftForeArm.rotation.z = THREE.MathUtils.damp(leftForeArm.rotation.z, pose.lFZ, d, dt);
          }
          if (rightForeArm) {
            rightForeArm.rotation.z = THREE.MathUtils.damp(
              rightForeArm.rotation.z,
              pose.rFZ,
              d,
              dt,
            );
          }
          if (leftHand) {
            leftHand.rotation.x = THREE.MathUtils.damp(leftHand.rotation.x, pose.lHX, d, dt);
          }
          if (rightHand) {
            rightHand.rotation.x = THREE.MathUtils.damp(rightHand.rotation.x, pose.rHX, d, dt);
          }

          // HEAD: target from pose + subtle continuous drift
          if (neck) {
            neck.rotation.x += pose.nX;
            neck.rotation.y += pose.nY;
          }

          // SPINE: subtle lean from pose
          if (isSpeaking) {
            if (spine) spine.rotation.x += pose.sX;
            if (chest) chest.rotation.x += pose.sX * 0.5;
          }
        } else if (!vrm?.humanoid) {
          // No humanoid (plain glTF fallback) — sway the rig the model sits in.
          riderRig.rotation.y = Math.sin(t * 0.35) * 0.06;
          riderRig.position.y = feetY + Math.sin(t * 1.3) * 0.03;
        }

        // Natural blinking — every ~3.5 seconds, quick 150ms close/open
        const blinkInterval = 3.5;
        const blinkDuration = 0.15;
        const blinkT = t % blinkInterval;
        const blinkValue =
          blinkT < blinkDuration ? Math.sin((blinkT / blinkDuration) * Math.PI) : 0;
        expr('blink', blinkValue);

        // Mouth shapes — simulated when speaking (no audio analyser in WS mode)
        if (state === 'speaking') {
          // Multiple frequencies simulate natural mouth shapes cycling
          const mouthAa = Math.max(0, Math.sin(t * 5.5)) * 0.5;
          const mouthOh = Math.max(0, Math.sin(t * 4.2 + 1.2)) * 0.35;
          const mouthEe = Math.max(0, Math.sin(t * 6.8 + 2.5)) * 0.3;
          expr('aa', mouthAa);
          expr('oh', mouthOh);
          expr('ee', mouthEe);
        } else {
          expr('aa', 0);
          expr('oh', 0);
          expr('ee', 0);
        }
        expr('ih', state === 'thinking' ? 0.1 : 0);

        // Subtle resting expression — slight smile that increases with relationship
        const restSmile = state === 'listening' ? 0.18 : state === 'speaking' ? 0.25 : 0.12;
        expr('happy', restSmile);

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

        // Dolly back while she's strapped in so airborne tricks stay in frame
        // (the conversational framing is a tight 3/4 close-up). Eased by the
        // demo's smoothed stance weight so it glides, never cuts.
        const stanceW = demoSt.stance;
        camera.position.z = 2.15 + 1.35 * stanceW;
        camera.position.y = 1.25 + 0.05 * stanceW;
        camera.lookAt(0, 1.2 - 0.15 * stanceW, 0);
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
          if (window.__kaoriDemo?.state === demoStateRef.current) delete window.__kaoriDemo;
          scene.remove(riderRig);
          scene.remove(board);
          // no mixer to clean up — fully procedural
          deckGeometry.dispose();
          baseGeometry.dispose();
          bindingGeometry.dispose();
          deckMat.dispose();
          baseMat.dispose();
          bindingMat.dispose();
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
    // Demo choreography: remember what the user asked (the reply arrives async
    // via socket.io) and reset the Kith sentence counter for the new reply.
    lastUserTextRef.current = content;
    sentenceIndexRef.current = 0;

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
      // User clicked stop — submit what we have
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true; // Keep listening — don't stop on first pause
    recognition.maxAlternatives = 1;

    let finalText = '';
    let silenceTimer = null;
    let manualStop = false;
    const SILENCE_TIMEOUT = 2000; // 2 seconds of silence before submitting

    const resetSilenceTimer = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        // User has been silent for 2s — they're done talking
        manualStop = true;
        recognition.stop();
      }, SILENCE_TIMEOUT);
    };

    recognition.onstart = () => {
      setListening(true);
      setCharState('listening');
      // If Kaori is currently speaking, barge-in — stop her so user can talk
      if (kithWsRef.current?.readyState === WebSocket.OPEN) {
        kithWsRef.current.send(JSON.stringify({ type: 'barge-in' }));
      }
      audioQueueRef.current.length = 0;
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
      // User is still talking — reset the silence timer
      resetSilenceTimer();
    };

    recognition.onerror = (e) => {
      // 'no-speech' is normal — user hasn't said anything yet, keep listening
      if (e.error === 'no-speech') return;
      if (silenceTimer) clearTimeout(silenceTimer);
      setListening(false);
      setCharState('idle');
    };

    recognition.onend = async () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      setListening(false);

      const text = (finalText || input).trim();
      if (text) {
        await submitText(text);
        setInput('');
      } else {
        setCharState('idle');
      }
    };

    recognition.start();
    // Start the initial silence timer — if user doesn't speak in 5s, stop
    silenceTimer = setTimeout(() => {
      if (!finalText.trim()) {
        manualStop = true;
        recognition.stop();
      }
    }, 5000);
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
