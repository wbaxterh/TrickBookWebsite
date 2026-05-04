import { useRouter } from 'next/router';
import { posthog } from 'posthog-js';
import { useEffect } from 'react';
import { initPostHog } from '../lib/posthog';

export default function PostHogProvider({ children }) {
  const router = useRouter();

  useEffect(() => {
    initPostHog();

    const handleRouteChange = () => {
      posthog.capture('$pageview');
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return children;
}
