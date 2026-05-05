import { posthog } from './posthog';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';

// ============================================
// BACKEND EVENT PIPELINE
// ============================================

let sessionId = null;
let currentUserId = null;
const eventQueue = [];
let flushTimer = null;

function getSessionId() {
  if (typeof window === 'undefined') return null;
  if (!sessionId) {
    sessionId = sessionStorage.getItem('tb_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('tb_session_id', sessionId);
    }
  }
  return sessionId;
}

/** Queue an event to be sent to our backend in batches */
function sendToBackend(event, properties) {
  if (typeof window === 'undefined') return;

  eventQueue.push({
    event,
    properties,
    sessionId: getSessionId(),
    userId: currentUserId,
    url: window.location.pathname,
    referrer: document.referrer || null,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  });

  // Flush every 3 seconds or when queue hits 10 events
  if (eventQueue.length >= 10) {
    flushEvents();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flushEvents, 3000);
  }
}

function flushEvents() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0);
  fetch(`${API_BASE}/analytics/events/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: batch }),
    keepalive: true,
  }).catch(() => {
    // Silently fail — analytics should never break the app
  });
}

// Flush remaining events before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushEvents();
  });
}

/** Send to both PostHog and our backend */
function track(event, properties) {
  // PostHog
  if (posthog.__loaded) {
    posthog.capture(event, properties);
  }
  // Our backend
  sendToBackend(event, properties);
}

// ============================================
// USER IDENTIFICATION
// ============================================

export function identifyUser({ userId, email, name, role }) {
  currentUserId = userId;
  if (posthog.__loaded) {
    posthog.identify(userId, { email, name, role: role || 'user' });
  }
}

export function resetUser() {
  currentUserId = null;
  if (posthog.__loaded) {
    posthog.reset();
  }
}

// ============================================
// PAGEVIEW TRACKING
// ============================================

export function trackPageview() {
  track('$pageview', {});
}

// ============================================
// LANDING PAGE EVENTS
// ============================================

export function trackSectionViewed(sectionName) {
  track('landing_section_viewed', { section: sectionName });
}

export function trackScrollDepth(percent) {
  track('landing_scroll_depth', { depth_percent: percent });
}

export function trackCtaClick(ctaName, location) {
  track('cta_clicked', { cta_name: ctaName, cta_location: location });
}

export function trackAppStoreClick(store, location) {
  track('app_store_clicked', { store, cta_location: location });
}

export function trackHeroVariant(variant) {
  track('hero_variant_viewed', { variant });
}

// ============================================
// CONVERSION FUNNEL EVENTS
// ============================================

export function trackSignupStarted(source) {
  track('signup_started', { source });
}

export function trackSignupCompleted(method) {
  track('signup_completed', { method });
}

export function trackLoginCompleted(method) {
  track('login_completed', { method });
}

// ============================================
// FEATURE ENGAGEMENT EVENTS
// ============================================

export function trackSpotMapInteraction(action, details) {
  track('spot_map_interaction', { action, ...details });
}

export function trackTrickViewed(trickName, category) {
  track('trick_viewed', { trick_name: trickName, category });
}

export function trackOutboundClick(url, label) {
  track('outbound_click', { url, label });
}
