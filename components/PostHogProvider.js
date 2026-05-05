import { useRouter } from 'next/router';
import { posthog } from 'posthog-js';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { identifyUser, resetUser } from '../lib/analytics';
import { initPostHog } from '../lib/posthog';

export default function PostHogProvider({ children }) {
  const router = useRouter();
  const { loggedIn, userId, email, name, role } = useContext(AuthContext);

  // Initialize PostHog and track page views
  useEffect(() => {
    initPostHog();

    // Capture initial pageview
    if (posthog.__loaded) {
      posthog.capture('$pageview');
    }

    const handleRouteChange = () => {
      posthog.capture('$pageview');
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Identify/reset user when auth state changes
  useEffect(() => {
    if (loggedIn === null) return; // still loading

    if (loggedIn && userId) {
      identifyUser({ userId, email, name, role });
    } else if (loggedIn === false) {
      resetUser();
    }
  }, [loggedIn, userId, email, name, role]);

  return children;
}
