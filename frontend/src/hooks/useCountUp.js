import { useState, useEffect } from 'react';

/**
 * Custom hook to animate numbers when visible
 * @param {number|string} target - Target number or string containing number
 * @param {boolean} isVisible - Trigger flag
 * @param {Object} options
 * @param {number} options.duration - Duration in ms (default: 1200)
 * @param {string} options.locale - Locale for formatting (default: 'en-IN')
 * @returns {string} Formatted animated number string
 */
export function useCountUp(target, isVisible = true, { duration = 1200, locale = 'en-IN' } = {}) {
  const targetStr = String(target || '0');
  const numericMatch = targetStr.replace(/,/g, '').match(/[-+]?[0-9]*\.?[0-9]+/);
  const rawTargetNum = numericMatch ? parseFloat(numericMatch[0]) : 0;
  const suffix = targetStr.replace(/^[^\d]*[\d,.]*/, '');
  const prefix = targetStr.match(/^[^\d]+/)?.[0] || '';

  const [count, setCount] = useState(() => (isVisible ? rawTargetNum : 0));

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (rawTargetNum === 0) {
      return;
    }

    let startTimestamp = null;
    let animationFrameId = null;

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentVal = Math.round(easedProgress * rawTargetNum);

      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(rawTargetNum);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVisible, rawTargetNum, duration]);

  const displayCount = !isVisible ? 0 : count;
  const formattedNumber = displayCount.toLocaleString(locale);
  return `${prefix}${formattedNumber}${suffix}`;
}

export default useCountUp;
