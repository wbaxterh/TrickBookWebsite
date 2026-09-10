/**
 * Chat → trick-demo choreography cues for the Kaori 3D stage.
 *
 * Ported 1:1 from the mobile companion-stage screen
 * (TrickList/app/(tabs)/homies/companion-stage/[botId].tsx): the TRICK_CUES
 * table covers every trick in the TRICKS registry, detectTrickDemo gates on
 * demo intent, and actionForSentence maps what Kaori is SAYING to what her
 * body does (full run / wind-up / pop / landing segments).
 */

import { startAction } from './trickAnimations';

/**
 * WHICH trick does this text name? Identification only — no demo-intent gate,
 * so it also works on Kaori's own reply ("...watch this backside 360...").
 * ORDERED most-specific-first: flips before spins ("backflip" contains "back"),
 * corks/rodeos before their spin degrees, named grabs before generic words.
 * Covers every Trickipedia snowboard trick in the TRICKS registry.
 */
const TRICK_CUES = [
  // Flips
  [/\b(wildcat|back[\s-]?flip)\b/i, 'wildcat'],
  [/\b(tamedog|tame[\s-]?dog|front[\s-]?flip)\b/i, 'tamedog'],
  // Off-axis (before plain spins — "backside cork 720" must not match 720)
  [/\brodeo\b/i, 'backside-rodeo'],
  [/\b(frontside|fs)\s*cork\w*/i, 'frontside-cork'],
  [/\bcork\w*/i, 'backside-cork'],
  // Grabs (named)
  [/\b(indy\s*nose[\s-]?bone|nose[\s-]?bone)\b/i, 'indy-nosebone'],
  [/\bindy\b/i, 'indy'],
  [/\b(weddle|mute)\b/i, 'weddle'],
  [/\bmelon\b/i, 'melon'],
  [/\bmethod\b/i, 'method'],
  [/\bnose\s*grab\b/i, 'nose-grab'],
  [/\btail\s*grab\b/i, 'tail-grab'],
  [/\bstale[\s-]?fish\b/i, 'stalefish'],
  [/\bjapan\b/i, 'japan'],
  [/\bcrail\b/i, 'crail'],
  [/\broast\s*beef\b/i, 'roast-beef'],
  [/\bchicken\s*salad\b/i, 'chicken-salad'],
  [/\bcanadian\s*bacon\b/i, 'canadian-bacon'],
  [/\bseat[\s-]?belt\b/i, 'seatbelt'],
  [/\b(taipan|tai[\s-]?pan)\b/i, 'taipan'],
  // Jibs (before spins — "frontside boardslide" must not read as a spin)
  [/\b(fifty[\s-]?fifty|50[\s-]?50)\b/i, 'fifty-fifty'],
  [/\b(frontside|fs|front)\s*board[\s-]?slide\b|\bfront\s*board\b/i, 'frontside-boardslide'],
  [/\bboard[\s-]?slide\b/i, 'boardslide'],
  // Ground / flatland
  [/\bnollie\b/i, 'nollie'],
  [/\bollie\b/i, 'ollie'],
  [/\bnose\s*press\b/i, 'nose-press'],
  [/\btail\s*press\b/i, 'tail-press'],
  [/\bbutter\w*\b/i, 'butter'],
  [/\bnose\s*roll\b/i, 'nose-roll-180'],
  [/\btail\s*roll\b/i, 'tail-roll-180'],
  [/\btripod\b/i, 'tripod'],
  [/\b(carve[ds]?|carved?\s*turn)\b/i, 'carved-turn'],
  [/\b(ride|riding)\s*switch\b|\bswitch\s*(riding|stance)\b/i, 'ride-switch'],
  // Cab spins (switch frontside) — before plain spins ("cab 360" contains 360)
  [/\b(half[\s-]?cab|cab\s*(180|1))\b/i, 'cab-180'],
  [/\bcab(\s*360)?\b/i, 'cab-360'],
  // Spins by degree (backside variant checked inside each)
  [/\b(1080|ten[\s-]?eighty)\b/i, 'frontside-1080'],
  [/\b(900|nine[\s-]?(hundred|oh[\s-]?oh))\b/i, 'frontside-900'],
  [/\b(720|seven[\s-]?twenty)\b/i, 'frontside-720'],
  [/\b(540|five[\s-]?forty)\b/i, 'frontside-540'],
  [/\b(180|one[\s-]?eighty)\b|\b(front|back)side\s*1\b|\bback\s*1\b/i, 'frontside-180'],
  [
    /\b(360|three[\s-]?sixty|(front|back)side\s*3|(fs|bs)\s*3|back\s*3)\b/i,
    'frontside-360-stylish',
  ],
  // Bare "grab" / straight air
  [/\bgrab\b/i, 'indy'],
  [/\bstraight\s*air\b|\bair\s*out\b/i, 'straight-air'],
];

/** Swap a frontside spin id for its backside sibling when the text says so. */
const BS_SIBLING = {
  'frontside-180': 'backside-180',
  'frontside-360-stylish': 'backside-360-stylish',
  'frontside-540': 'backside-540',
  'frontside-720': 'backside-720',
  'frontside-900': 'backside-900',
  'frontside-1080': 'backside-1080',
};

export function detectTrickId(text) {
  for (const [re, id] of TRICK_CUES) {
    if (!re.test(text)) continue;
    const bs = BS_SIBLING[id];
    if (bs && /\b(backside|bs|back)\b/i.test(text) && !/\bfront(side)?\b/i.test(text)) return bs;
    return id;
  }
  return null;
}

/**
 * Detect "show me a trick" intents so Kaori demonstrates with her body while
 * she explains. Intent verb + a named trick → that trick.
 */
export function detectTrickDemo(text) {
  const wantsDemo = /\b(show|demo|demonstrate|do|see|watch|hit|throw|bust|try|land)\b/i.test(text);
  return wantsDemo ? detectTrickId(text) : null;
}

/**
 * Enter the on-board demo session when the exchange cues one. The trick is
 * ALWAYS resolved — the user's explicit ask first, then any trick the user
 * named without a demo verb, then what her reply names, else the current one —
 * so a "back 3" never falls through to a stale/default frontside.
 */
export function startDemoIfCued(text, reply, sessionId, demo, sentencesRef) {
  const requestedTrick = detectTrickDemo(text);
  if (!reply) return;
  if (requestedTrick === null && !/watch this|let me show/i.test(reply)) return;
  demo.trick = requestedTrick ?? detectTrickId(text) ?? detectTrickId(reply) ?? demo.trick;
  demo.session = true;
  demo.idleT = 0;
  sentencesRef.current = splitSentences(reply);
  if (!sessionId) {
    // Voiceless fallback: no sentence cues will arrive — run the full trick
    // once, then step off the board.
    startAction(demo, 'full');
    setTimeout(() => {
      demo.session = false;
      sentencesRef.current = null;
    }, 7000);
  }
}

/** Split a reply the way Kith chunks speech — one sentence per turn. */
export function splitSentences(text) {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

/**
 * Choreography cues: map what Kaori is SAYING to what her body does.
 * "watch this / let me show you / spin" → the full trick; phase keywords
 * → segment demos; anything else → she keeps talking in stance.
 */
export function actionForSentence(sentence) {
  if (/watch|let me show|show you|check (this|it)|like this|here (we|it) go/i.test(sentence)) {
    return 'full';
  }
  // Any named trick in the sentence cues the full run (covers all 50 tricks).
  if (detectTrickId(sentence)) return 'full';
  if (/\b(flip|invert|somersault|spin|rotat\w*)\b/i.test(sentence)) return 'full';
  if (/\b(wind|coil|crouch|bend|set[\s-]?up|load)\b/i.test(sentence)) return 'setup';
  if (/\b(pop|jump|snap|spring)\b/i.test(sentence)) return 'pop';
  if (/\b(land\w*|absorb|stomp)\b/i.test(sentence)) return 'land';
  return null;
}
