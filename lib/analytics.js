import { posthog } from './posthog';

// ============================================
// USER IDENTIFICATION
// ============================================

/** Identify a logged-in user so all events tie to their profile */
export function identifyUser({ userId, email, name, role }) {
  if (!posthog.__loaded) return;
  posthog.identify(userId, {
    email,
    name,
    role: role || 'user',
  });
}

/** Reset identity on logout */
export function resetUser() {
  if (!posthog.__loaded) return;
  posthog.reset();
}

// ============================================
// LANDING PAGE EVENTS
// ============================================

/** Track when a landing page section scrolls into view */
export function trackSectionViewed(sectionName) {
  if (!posthog.__loaded) return;
  posthog.capture('landing_section_viewed', {
    section: sectionName,
  });
}

/** Track scroll depth milestones (25, 50, 75, 100) */
export function trackScrollDepth(percent) {
  if (!posthog.__loaded) return;
  posthog.capture('landing_scroll_depth', {
    depth_percent: percent,
  });
}

/** Track CTA button clicks */
export function trackCtaClick(ctaName, location) {
  if (!posthog.__loaded) return;
  posthog.capture('cta_clicked', {
    cta_name: ctaName,
    cta_location: location,
  });
}

/** Track app store badge clicks */
export function trackAppStoreClick(store, location) {
  if (!posthog.__loaded) return;
  posthog.capture('app_store_clicked', {
    store, // 'ios' or 'android'
    cta_location: location,
  });
}

/** Track A/B test hero variant exposure */
export function trackHeroVariant(variant) {
  if (!posthog.__loaded) return;
  posthog.capture('hero_variant_viewed', {
    variant,
  });
}

// ============================================
// CONVERSION FUNNEL EVENTS
// ============================================

/** User started the signup flow */
export function trackSignupStarted(source) {
  if (!posthog.__loaded) return;
  posthog.capture('signup_started', {
    source, // 'hero_cta', 'nav', 'final_cta', etc.
  });
}

/** User completed signup */
export function trackSignupCompleted(method) {
  if (!posthog.__loaded) return;
  posthog.capture('signup_completed', {
    method, // 'email', 'google', 'apple'
  });
}

/** User logged in */
export function trackLoginCompleted(method) {
  if (!posthog.__loaded) return;
  posthog.capture('login_completed', {
    method,
  });
}

// ============================================
// FEATURE ENGAGEMENT EVENTS
// ============================================

/** Track spots map interaction */
export function trackSpotMapInteraction(action, details) {
  if (!posthog.__loaded) return;
  posthog.capture('spot_map_interaction', {
    action, // 'pin_clicked', 'zoomed', 'view_toggled'
    ...details,
  });
}

/** Track trickipedia browsing */
export function trackTrickViewed(trickName, category) {
  if (!posthog.__loaded) return;
  posthog.capture('trick_viewed', {
    trick_name: trickName,
    category,
  });
}

/** Track outbound link clicks */
export function trackOutboundClick(url, label) {
  if (!posthog.__loaded) return;
  posthog.capture('outbound_click', {
    url,
    label,
  });
}
