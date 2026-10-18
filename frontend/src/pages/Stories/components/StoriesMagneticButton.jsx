import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'motion/react';

/**
 * Stories-specific Magnetic Button Wrapper
 * Adds an ultra-subtle magnetic attraction (max 4-6px) on desktop hover
 * Gracefully disabled on touch devices and for prefers-reduced-motion users
 */
export default function StoriesMagneticButton({ children, className = '', strength = 0.25, ...props }) {
  const ref = useRef(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    // Only enable magnetic effect if device has precise pointer (mouse) and no reduced motion preference
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const checkState = () => {
      setCanHover(mediaQuery.matches && !motionQuery.matches);
    };

    checkState();
    mediaQuery.addEventListener('change', checkState);
    motionQuery.addEventListener('change', checkState);

    return () => {
      mediaQuery.removeEventListener('change', checkState);
      motionQuery.removeEventListener('change', checkState);
    };
  }, []);

  const x = useSpring(0, { stiffness: 220, damping: 18 });
  const y = useSpring(0, { stiffness: 220, damping: 18 });

  const handleMouseMove = (e) => {
    if (!canHover || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    // Constrain max movement to 6px
    const clampedX = Math.max(-6, Math.min(6, distanceX));
    const clampedY = Math.max(-6, Math.min(6, distanceY));

    x.set(clampedX);
    y.set(clampedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`stories-magnetic-wrap ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
