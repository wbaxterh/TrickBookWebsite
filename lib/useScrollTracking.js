import { useEffect, useRef } from 'react';
import { trackScrollDepth, trackSectionViewed } from './analytics';

/**
 * Track scroll depth milestones on the current page.
 * Fires once per milestone per page load: 25%, 50%, 75%, 100%.
 */
export function useScrollDepthTracking() {
  const firedRef = useRef(new Set());

  useEffect(() => {
    const milestones = [25, 50, 75, 100];

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const percent = Math.round((window.scrollY / scrollHeight) * 100);

      for (const milestone of milestones) {
        if (percent >= milestone && !firedRef.current.has(milestone)) {
          firedRef.current.add(milestone);
          trackScrollDepth(milestone);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

/**
 * Track when a named section enters the viewport.
 * Returns a ref to attach to the section element.
 * Fires once per section per page load.
 *
 * Usage:
 *   const ref = useSectionViewTracking('hero');
 *   <section ref={ref}>...</section>
 */
export function useSectionViewTracking(sectionName) {
  const ref = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          trackSectionViewed(sectionName);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionName]);

  return ref;
}
