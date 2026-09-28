import React, { useEffect, useRef } from 'react';

/**
 * InteractiveDotGrid
 *
 * Dedicated section-relative background canvas:
 * - Positioned absolute: inset: 0, width: 100%, height: 100%, z-index: 0
 * - Pointer-events: none (never interferes with drag/swipe/clicks)
 * - Dot grid with organic noise & subtle autonomous orbit
 * - Localized cursor repulsion with constellation connections
 * - Tuned opacity for an elegant, non-intrusive living background
 */
export default function InteractiveDotGrid({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window === 'undefined') return undefined;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    if (isTouch) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dots = [];

    const spacing = 36;
    const interactionRadius = 200;
    const repelForce = 26;

    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const init = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.offsetWidth : window.innerWidth;
      height = parent ? parent.offsetHeight : window.innerHeight;

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

          const noiseX = (Math.random() - 0.5) * 14;
          const noiseY = (Math.random() - 0.5) * 14;

          dots.push({
            x: x + noiseX,
            y: y + noiseY,
            baseX: x + noiseX,
            baseY: y + noiseY,
            size: 1.2,
            angle: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.012,
            orbitRadius: 1 + Math.random() * 2.5,
          });
        }
      }
    };

    let animationFrameId;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Responsible Individuals brand colors
      const baseR = 15;
      const baseG = 76;
      const baseB = 58;

      const targetR = 16;
      const targetG = 185;
      const targetB = 129;

      const activeDots = [];

      // 1. Update dot positions & cursor repulsion
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        dot.angle += dot.speed;

        const orbitX = dot.baseX + Math.cos(dot.angle) * dot.orbitRadius;
        const orbitY = dot.baseY + Math.sin(dot.angle) * dot.orbitRadius;

        const dx = mouse.x - orbitX;
        const dy = mouse.y - orbitY;
        const distance = Math.hypot(dx, dy);

        let targetX = orbitX;
        let targetY = orbitY;
        let targetSize = 1.2;

        if (mouse.active && distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          const pushX = (dx / distance) * force * repelForce * -1;
          const pushY = (dy / distance) * force * repelForce * -1;

          targetX = orbitX + pushX;
          targetY = orbitY + pushY;
          targetSize = 1.2 + force * 2.2;
        }

        dot.x += (targetX - dot.x) * 0.1;
        dot.y += (targetY - dot.y) * 0.1;
        dot.size += (targetSize - dot.size) * 0.2;

        if (mouse.active) {
          const distToMouse = Math.hypot(mouse.x - dot.x, mouse.y - dot.y);
          if (distToMouse < interactionRadius * 1.2) {
            activeDots.push({ dot, distToMouse });
          }
        }
      }

      // 2. Constellation connections only near the cursor
      if (mouse.active && activeDots.length > 1) {
        ctx.lineWidth = 1;
        const maxDist = spacing * 1.7;

        for (let i = 0; i < activeDots.length; i++) {
          for (let j = i + 1; j < activeDots.length; j++) {
            const dotA = activeDots[i].dot;
            const dotB = activeDots[j].dot;

            const distAB = Math.hypot(dotA.x - dotB.x, dotA.y - dotB.y);

            if (distAB < maxDist) {
              const mouseProximityA = 1 - activeDots[i].distToMouse / (interactionRadius * 1.2);
              const mouseProximityB = 1 - activeDots[j].distToMouse / (interactionRadius * 1.2);
              const mouseFactor = Math.min(mouseProximityA, mouseProximityB);

              const lineAlpha = (1 - distAB / maxDist) * mouseFactor * 0.45;

              if (lineAlpha > 0.02) {
                ctx.strokeStyle = `rgba(${targetR}, ${targetG}, ${targetB}, ${lineAlpha.toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(dotA.x, dotA.y);
                ctx.lineTo(dotB.x, dotB.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // 3. Render dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const distToMouse = mouse.active ? Math.hypot(mouse.x - dot.x, mouse.y - dot.y) : 9999;

        if (distToMouse < interactionRadius) {
          const force = (interactionRadius - distToMouse) / interactionRadius;
          const r = Math.round(baseR + (targetR - baseR) * force);
          const g = Math.round(baseG + (targetG - baseG) * force);
          const b = Math.round(baseB + (targetB - baseB) * force);
          const dotAlpha = 0.2 + 0.45 * force;

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dotAlpha.toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, 0.16)`;
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
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      } else {
        mouse.active = false;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
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
      className={`interactive-dot-grid-canvas ${className}`.trim()}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
