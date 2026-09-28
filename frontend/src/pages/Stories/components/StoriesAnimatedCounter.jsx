import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

/**
 * Stories-specific Animated Counter
 * Smoothly animates numbers from 0 to target when scrolled into view
 */
export default function StoriesAnimatedCounter({ target, suffix = '', prefix = '', decimals = 0, duration = 1600 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    let animationFrameId;

    const numericTarget = typeof target === 'number' ? target : parseFloat(target);

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Smooth cubic-out easing: 1 - Math.pow(1 - progress, 3)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easedProgress * numericTarget;

      setDisplayValue(decimals > 0 ? parseFloat(currentVal.toFixed(decimals)) : Math.floor(currentVal));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, target, decimals, duration]);

  return (
    <span ref={ref} className="stories-counter-number">
      {prefix}{decimals > 0 ? displayValue.toFixed(decimals) : displayValue}{suffix}
    </span>
  );
}
