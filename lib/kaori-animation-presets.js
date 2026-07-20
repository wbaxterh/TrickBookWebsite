/**
 * Kaori VRM Animation Presets
 *
 * Each preset defines body, expression, and gesture behavior for a character state.
 * Presets are referenced by name in kaori-live.js and blended via damping.
 *
 * To add a new state:
 * 1. Add a new key to PRESETS below
 * 2. Reference it in kaori-live.js where charState is evaluated
 *
 * Pose values:
 *   lUZ/rUZ  = upper arm Z rotation (negative = left out, positive = right out)
 *   lUX/rUX  = upper arm X rotation (forward)
 *   lFZ/rFZ  = forearm Z rotation (bend)
 *   lHX/rHX  = hand X rotation (wrist tilt)
 *   nX/nY    = neck nod/turn offset
 *   sX       = spine lean forward
 */

// Gesture pose library — shared across presets
const GESTURE_POSES = {
  rest: {
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
  rightHandOut: {
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
  leftHandOut: {
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
  bothHandsForward: {
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
  rightHandGesture: {
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
  noddingEmphasis: {
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
};

const PRESETS = {
  /**
   * default-talking: Natural conversational gestures.
   * Cycles through gesture poses every ~2s while speaking.
   * Idle falls back to rest pose with gentle breathing.
   */
  'default-talking': {
    idlePose: 'rest',
    gesturePoses: [
      'rightHandOut',
      'leftHandOut',
      'bothHandsForward',
      'rightHandGesture',
      'noddingEmphasis',
    ],
    poseInterval: 2.0,
    dampSpeed: 2.5,
    body: {
      breatheSpeed: 1.2,
      breatheAmount: 0.015,
      idleSwaySpeed: 0.4,
      idleSwayAmount: 0.02,
      headDriftSpeed: 0.55,
      headDriftAmount: 0.04,
      hipSwaySpeed: 0.3,
      hipSwayAmount: 0.015,
    },
    expressions: {
      blinkInterval: 3.5,
      blinkDuration: 0.15,
      mouthSpeedMultiplier: 1.0,
      idleHappy: 0.08,
      speakingHappy: 0.22,
      listeningHappy: 0.16,
    },
    listening: {
      neckNod: 0.08,
      spineForward: 0.04,
    },
    thinking: {
      neckWaggle: 0.05,
      neckWaggleSpeed: 2.2,
      spineForward: 0.06,
    },
  },

  // TODO: Add more presets here
  // 'excited': { ... },
  // 'thinking-deep': { ... },
  // 'sad': { ... },
  // 'laughing': { ... },
};

export { GESTURE_POSES, PRESETS };
