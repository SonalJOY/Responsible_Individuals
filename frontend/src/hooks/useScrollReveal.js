import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered viewport reveals
 * @param {Object} options
 * @param {number} options.threshold - Visibility threshold (0 to 1)
 * @param {string} options.rootMargin - Margin around the root bounding box
 * @param {boolean} options.triggerOnce - Whether to trigger only once
 * @param {number} options.delay - Delay in ms before triggering visible state
 * @returns {[React.RefObject, boolean]}
 */
export function useScrollReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true,
  delay = 0,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        return;
      }
    }

    if (!('IntersectionObserver' in window)) {
      return;
    }

    let timeoutId = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            timeoutId = setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            setIsVisible(true);
          }

          if (triggerOnce) {
            observer.unobserve(el);
          }
        } else if (!triggerOnce) {
          if (timeoutId) clearTimeout(timeoutId);
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay]);

  return [ref, isVisible];
}

export default useScrollReveal;
