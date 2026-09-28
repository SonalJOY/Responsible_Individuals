import React, { useEffect, useRef } from 'react';

/**
 * InteractiveDotGrid (CursorNetworkField)
 * 
 * Recreated faithfully from the reference implementation:
 * - Full-page dot grid with spacing = 35px and position noise = ±7.5px.
 * - Subtle autonomous orbit for every dot (radius: 1-4px, speed: 0.01-0.025).
 * - Localized cursor interaction (interactionRadius = 220px, repelForce = 30px).
 * - Dots are repelled AWAY from the cursor (clean open center).
 * - Dots grow from 1.2px up to 3.7px near the cursor.
 * - Local constellation connections appear only near the cursor (distance < spacing * 1.8).
 * - Dual distance-based fade (distance between dots + distance to mouse).
 * - Adapted exclusively to the Responsible Individuals emerald/forest brand palette.
 */
export default function CursorNetworkField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Accessibility check: prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Mobile / touch screen detection
    const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    if (isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    let dots = [];

    const spacing = 35;
    const interactionRadius = 220;
    const repelForce = 30;

    const mouse = {
      x: -1000,
      y: -1000,
      isDarkSection: false,
    };

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;

      dots = [];

      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);

      const offsetX = (width - cols * spacing) / 2;
      const offsetY = (height - rows * spacing) / 2;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = offsetX + i * spacing;
          const y = offsetY + j * spacing;

          const noiseX = (Math.random() - 0.5) * 15;
          const noiseY = (Math.random() - 0.5) * 15;

          dots.push({
            x: x + noiseX,
            y: y + noiseY,
            baseX: x + noiseX,
            baseY: y + noiseY,
            size: 1.2,
            angle: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.015,
            orbitRadius: 1 + Math.random() * 3,
          });
        }
      }
    };

    let animationFrameId;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = mouse.isDarkSection;

      // Responsible Individuals brand colors:
      // Light canvas: neutral/forest (15, 76, 58) -> vibrant emerald (16, 185, 129)
      // Dark canvas: dark mint (52, 211, 153) -> seafoam (110, 231, 183)
      const baseR = isDark ? 52 : 15;
      const baseG = isDark ? 211 : 76;
      const baseB = isDark ? 153 : 58;

      const targetR = isDark ? 110 : 16;
      const targetG = isDark ? 231 : 185;
      const targetB = isDark ? 183 : 129;

      const lineR = isDark ? 110 : 16;
      const lineG = isDark ? 231 : 185;
      const lineB = isDark ? 183 : 129;

      // 1. Update Dot Positions, Autonomous Orbit, & Cursor Repulsion
      const activeDots = [];

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        dot.angle += dot.speed;

        const orbitX = dot.baseX + Math.cos(dot.angle) * dot.orbitRadius;
        const orbitY = dot.baseY + Math.sin(dot.angle) * dot.orbitRadius;

        const dx = mouse.x - orbitX;
        const dy = mouse.y - orbitY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let targetX = orbitX;
        let targetY = orbitY;
        let targetSize = 1.2;

        if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          const pushX = (dx / distance) * force * repelForce * -1;
          const pushY = (dy / distance) * force * repelForce * -1;

          targetX = orbitX + pushX;
          targetY = orbitY + pushY;
          targetSize = 1.2 + force * 2.5;
        }

        dot.x += (targetX - dot.x) * 0.1;
        dot.y += (targetY - dot.y) * 0.1;
        dot.size += (targetSize - dot.size) * 0.2;

        // Keep track of dots within connection range of the mouse
        const distToMouse = Math.hypot(mouse.x - dot.x, mouse.y - dot.y);
        if (distToMouse < interactionRadius * 1.2) {
          activeDots.push({ dot, distToMouse });
        }
      }

      // 2. Local Constellation Connections (Only near the cursor)
      ctx.lineWidth = 1;

      for (let i = 0; i < activeDots.length; i++) {
        const { dot: dotA, distToMouse: distToMouseA } = activeDots[i];

        for (let j = i + 1; j < activeDots.length; j++) {
          const { dot: dotB } = activeDots[j];

          const dx = dotA.x - dotB.x;
          const dy = dotA.y - dotB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < spacing * 1.8) {
            const alpha = 1 - dist / (spacing * 1.8);
            const mouseAlpha = 1 - distToMouseA / (interactionRadius * 1.2);
            const finalAlpha = Math.min(alpha, mouseAlpha) * 0.65;

            if (finalAlpha > 0.02) {
              ctx.strokeStyle = `rgba(${lineR}, ${lineG}, ${lineB}, ${finalAlpha.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(dotA.x, dotA.y);
              ctx.lineTo(dotB.x, dotB.y);
              ctx.stroke();
            }
          }
        }
      }

      // 3. Render Dots with Color Transition
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const distToMouse = Math.hypot(mouse.x - dot.x, mouse.y - dot.y);

        if (distToMouse < interactionRadius) {
          const force = (interactionRadius - distToMouse) / interactionRadius;

          const r = Math.round(baseR + (targetR - baseR) * force);
          const g = Math.round(baseG + (targetG - baseG) * force);
          const b = Math.round(baseB + (targetB - baseB) * force);
          const dotAlpha = 0.25 + 0.55 * force;

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dotAlpha.toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, 0.22)`;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Section Background Detection
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      if (elem) {
        const darkParent = elem.closest('.cta-editorial-root, .footer-editorial-root, .dark-section, [data-theme="dark"]');
        mouse.isDarkSection = Boolean(darkParent);
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-network-canvas"
      aria-hidden="true"
    />
  );
}
