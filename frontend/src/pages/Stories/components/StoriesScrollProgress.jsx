import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

/**
 * Stories-specific scroll progress bar
 * Renders a subtle emerald-to-teal gradient bar at the top of the viewport
 */
export default function StoriesScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="stories-scroll-progress-bar"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
