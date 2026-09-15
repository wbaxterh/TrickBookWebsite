import { posthog } from './posthog';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';

// ============================================
// BACKEND EVENT PIPELINE
// ============================================

let sessionId = null;
let currentUserId = null;
const eventQueue = [];
let flushTimer = null;
const FIRST_TOUCH_KEY = 'tb_first_touch';

function getFirstTouch() {
  if (typeof window === 'undefined') return {};

  try {
    const stored = window.localStorage.getItem(FIRST_TOUCH_KEY);
    if (stored) return JSON.parse(stored);

    const url = new URL(window.location.href);
    const eventMatch = url.pathname.match(/^\/events\/([^/]+)/);
    const firstTouch = {
      landing_url: `${url.origin}${url.pathname}${url.search}`,
      landing_path: `${url.pathname}${url.search}`,
      initial_referrer: document.referrer || null,
      utm_source: url.searchParams.get('utm_source'),
      utm_medium: url.searchParams.get('utm_medium'),
      utm_campaign: url.searchParams.get('utm_campaign'),
      utm_content: url.searchParams.get('utm_content'),
      utm_term: url.searchParams.get('utm_term'),
      first_event_slug: eventMatch ? decodeURIComponent(eventMatch[1]) : null,
      first_touched_at: new Date().toISOString(),
    };
    window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(firstTouch));
    return firstTouch;
  } catch (_error) {
    return {};
  }
}

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
    properties: { ...getFirstTouch(), ...properties },
    sessionId: getSessionId(),
    userId: currentUserId,
    url: `${window.location.pathname}${window.location.search}`,
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
  const enrichedProperties = { ...getFirstTouch(), ...properties };
  // PostHog
  if (posthog.__loaded) {
    posthog.capture(event, enrichedProperties);
  }
  // Our backend
  sendToBackend(event, enrichedProperties);
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

export function trackEventShare(eventId, method) {
  track('event_shared', { event_id: eventId, method });
}

export function trackEventViewed(event) {
  track('event_viewed', {
    event_id: event._id,
    event_slug: event.slug,
    event_sports: event.sports,
    event_status: event.status,
  });
}

export function trackEventAction(event, action) {
  const eventName = {
    details: 'official_details_clicked',
    register: 'registration_clicked',
    tickets: 'ticket_clicked',
    watch: 'stream_clicked',
  }[action.kind];
  track(eventName || 'event_action_clicked', {
    event_id: event._id,
    event_slug: event.slug,
    destination_url: action.url,
  });
}

export function trackEventSaved(event, saved, storage) {
  track(saved ? 'event_saved' : 'event_unsaved', {
    event_id: event._id,
    event_slug: event.slug,
    storage,
  });
}

export function trackCalendarAdded(event, calendar) {
  track('calendar_added', {
    event_id: event._id,
    event_slug: event.slug,
    calendar,
  });
}

export function trackEventConversion(event, action) {
  track('event_conversion_clicked', {
    event_id: event._id,
    event_slug: event.slug,
    event_sports: event.sports,
    action,
  });
}

export function trackRelatedEventClick(sourceEvent, destinationEvent) {
  track('related_event_clicked', {
    source_event_id: sourceEvent._id,
    source_event_slug: sourceEvent.slug,
    destination_event_id: destinationEvent._id,
    destination_event_slug: destinationEvent.slug,
  });
}
