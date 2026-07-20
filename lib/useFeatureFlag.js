import { posthog } from 'posthog-js';
import { useEffect, useState } from 'react';

/**
 * Hook to get a PostHog feature flag value.
 * Returns the variant string (e.g. 'control', 'variant-a') or the fallback.
 */
export function useFeatureFlag(flagName, fallback = null) {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    if (typeof window === 'undefined' || !posthog.__loaded) {
      return;
    }

    // Get the value immediately if flags are already loaded
    const current = posthog.getFeatureFlag(flagName);
    if (current !== undefined) {
      setValue(current);
    }

    // Listen for flag changes (e.g. after identify or flag reload)
    const unsubscribe = posthog.onFeatureFlags(() => {
      const updated = posthog.getFeatureFlag(flagName);
      if (updated !== undefined) {
        setValue(updated);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [flagName]);

  return value;
}
