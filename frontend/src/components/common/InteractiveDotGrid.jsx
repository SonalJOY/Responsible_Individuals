import React, { useEffect, useRef } from 'react';

/**
 * Utility: Parse hex, rgb, or rgba strings into [r, g, b] array.
 * @param {string} colorStr
 * @returns {[number, number, number]}
 */
function parseColorToRgb(colorStr) {
  if (!colorStr || typeof colorStr !== 'string') {
    return [52, 211, 153]; // Default emerald fallback
  }

  const str = colorStr.trim();

  // Hex format #RGB or #RRGGBB
  if (str.startsWith('#')) {
    const clean = str.replace('#', '');
    if (clean.length === 3) {
      return [
        parseInt(clean[0] + clean[0], 16),
        parseInt(clean[1] + clean[1], 16),
        parseInt(clean[2] + clean[2], 16),
      ];
    }
    if (clean.length >= 6) {
      return [
        parseInt(clean.substring(0, 2), 16),
        parseInt(clean.substring(2, 4), 16),
        parseInt(clean.substring(4, 6), 16),
      ];
    }
  }

  // RGB/RGBA format: rgb(52, 211, 153) or rgba(52, 211, 153, 0.5)
  if (str.startsWith('rgb')) {
    const match = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) {
      return [
        parseInt(match[1], 10),
        parseInt(match[2], 10),
        parseInt(match[3], 10),
      ];
    }
  }

  return [52, 211, 153];
}

/**
 * InteractiveDotGrid
 * 
 * Reusable HTML5 Canvas background component providing an elegant, warm, and subtle dot grid
 * with slow organic idle breathing, smooth cursor repulsion, and delicate connection lines.
 * 
 * Specifically crafted for NGO & community platforms: refined, non-intrusive, and accessible.
 * 
 * @param {Object} props
 * @param {number} [props.spacing=32] - Grid spacing in pixels
 * @param {number} [props.interactionRadius=135] - Cursor influence radius in pixels
 * @param {number} [props.repelForce=16] - Maximum displacement when repelled by cursor
 * @param {number} [props.dotRadius=1.4] - Base radius of individual dots
 * @param {number} [props.dotOpacity=0.26] - Idle opacity of dots (0 to 1)
 * @param {number} [props.connectionOpacity=0.20] - Maximum opacity of connection lines (0 to 1)
 * @param {string} [props.dotColor='#34D399'] - Base dot color (hex or rgb)
 * @param {string} [props.accentColor='#A78BFA'] - Highlight color near cursor (subtle brand purple/violet)
 * @param {string} [props.connectionColor='#A78BFA'] - Color of connection lines near cursor
 * @param {boolean} [props.enabled=true] - Whether animation and canvas are active
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.CSSProperties} [props.style={}] - Inline CSS overrides
 * @param {React.RefObject<HTMLElement>|null} [props.targetRef=null] - Optional element ref to bind pointer events to
 */
export function InteractiveDotGrid({
  spacing = 32,
  interactionRadius = 135,
  repelForce = 16,
  dotRadius = 1.4,
  dotOpacity = 0.26,
  connectionOpacity = 0.20,
  dotColor = '#34D399',
  accentColor = '#A78BFA',
  connectionColor = '#A78BFA',
  enabled = true,
  className = '',
  style = {},
  targetRef = null,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const hostElement = targetRef?.current || container.parentElement || container;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let animationFrameId = null;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check prefers-reduced-motion
    let prefersReducedMotion = false;
    let motionMediaQuery = null;

    if (window.matchMedia) {
      motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion = motionMediaQuery.matches;
    }

    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        drawStaticGrid();
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (motionMediaQuery) {
      if (typeof motionMediaQuery.addEventListener === 'function') {
        motionMediaQuery.addEventListener('change', handleMotionChange);
      } else if (typeof motionMediaQuery.addListener === 'function') {
        motionMediaQuery.addListener(handleMotionChange);
      }
    }

    // Mouse tracking state (no React re-renders for 60fps smoothness)
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
    };

    // Dot grid state
    let cols = 0;
    let rows = 0;
    let dots = [];

    const dotRgb = parseColorToRgb(dotColor);
    const accentRgb = parseColorToRgb(accentColor);
    const connRgb = parseColorToRgb(connectionColor);

    // Initialize or recalculate dot grid
    function buildGrid() {
      if (width <= 0 || height <= 0) return;

      cols = Math.floor(width / spacing) + 1;
      rows = Math.floor(height / spacing) + 1;

      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;

      dots = new Array(cols * rows);

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const index = c * rows + r;
          const originX = offsetX + c * spacing;
          const originY = offsetY + r * spacing;
          // Organic phase offset for subtle non-uniform breathing
          const phase = c * 0.35 + r * 0.45;

          dots[index] = {
            col: c,
            row: r,
            originX,
            originY,
            x: originX,
            y: originY,
            phase,
            intensity: 0,
          };
        }
      }
    }

    // Resize canvas with clamped DPI scaling
    function resize() {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      if (width <= 0 || height <= 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      buildGrid();

      if (prefersReducedMotion) {
        drawStaticGrid();
      }
    }

    // Static drawing mode for reduced motion accessibility
    function drawStaticGrid() {
      if (!ctx || width <= 0 || height <= 0) return;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = `rgba(${dotRgb[0]}, ${dotRgb[1]}, ${dotRgb[2]}, ${dotOpacity * 0.85})`;
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (!dot) continue;
        ctx.beginPath();
        ctx.arc(dot.originX, dot.originY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Main animation loop
    function animate(time) {
      if (!isVisible || prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse tracking interpolation
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      } else {
        mouse.x += (-9999 - mouse.x) * 0.1;
        mouse.y += (-9999 - mouse.y) * 0.1;
      }

      const radiusSq = interactionRadius * interactionRadius;

      // 1. Update dot positions & interaction intensities
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (!dot) continue;

        // Subtle idle organic drift (gentle breathing)
        const idleX = Math.sin(time * 0.0006 + dot.phase) * 1.8;
        const idleY = Math.cos(time * 0.0008 + dot.phase) * 1.8;

        let repelX = 0;
        let repelY = 0;
        let targetIntensity = 0;

        if (mouse.active) {
          const dx = (dot.originX + idleX) - mouse.x;
          const dy = (dot.originY + idleY) - mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            // Smooth quadratic falloff
            const norm = 1 - dist / interactionRadius;
            targetIntensity = norm * norm;

            const force = norm * repelForce;
            repelX = (dx / dist) * force;
            repelY = (dy / dist) * force;
          }
        }

        // Smooth easing towards target displacement and intensity
        const targetX = dot.originX + idleX + repelX;
        const targetY = dot.originY + idleY + repelY;

        dot.x += (targetX - dot.x) * 0.12;
        dot.y += (targetY - dot.y) * 0.12;
        dot.intensity += (targetIntensity - dot.intensity) * 0.12;
      }

      // 2. Draw subtle connection lines between adjacent dots around the cursor
      ctx.lineWidth = 0.85;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const idx = c * rows + r;
          const dotA = dots[idx];
          if (!dotA || dotA.intensity < 0.04) continue;

          // Connect to right neighbor
          if (c + 1 < cols) {
            const dotB = dots[(c + 1) * rows + r];
            if (dotB && dotB.intensity > 0.04) {
              const lineAlpha = Math.min(dotA.intensity, dotB.intensity) * connectionOpacity;
              if (lineAlpha > 0.005) {
                ctx.strokeStyle = `rgba(${connRgb[0]}, ${connRgb[1]}, ${connRgb[2]}, ${lineAlpha})`;
                ctx.beginPath();
                ctx.moveTo(dotA.x, dotA.y);
                ctx.lineTo(dotB.x, dotB.y);
                ctx.stroke();
              }
            }
          }

          // Connect to bottom neighbor
          if (r + 1 < rows) {
            const dotC = dots[c * rows + (r + 1)];
            if (dotC && dotC.intensity > 0.04) {
              const lineAlpha = Math.min(dotA.intensity, dotC.intensity) * connectionOpacity;
              if (lineAlpha > 0.005) {
                ctx.strokeStyle = `rgba(${connRgb[0]}, ${connRgb[1]}, ${connRgb[2]}, ${lineAlpha})`;
                ctx.beginPath();
                ctx.moveTo(dotA.x, dotA.y);
                ctx.lineTo(dotC.x, dotC.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // 3. Render dots with dynamic size & color blending
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (!dot) continue;

        const factor = dot.intensity;
        // Radius subtly expands near cursor
        const currentRadius = dotRadius + factor * 1.0;
        // Opacity smoothly shifts upwards near cursor
        const currentOpacity = dotOpacity + factor * (0.80 - dotOpacity);

        // Warm color interpolation: brand green -> subtle violet accent
        const r = Math.round(dotRgb[0] + (accentRgb[0] - dotRgb[0]) * factor);
        const g = Math.round(dotRgb[1] + (accentRgb[1] - dotRgb[1]) * factor);
        const b = Math.round(dotRgb[2] + (accentRgb[2] - dotRgb[2]) * factor);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(animate);
    }

    // Pointer event handlers attached to host element
    const handlePointerMove = (e) => {
      const rect = hostElement.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
    };

    hostElement.addEventListener('pointermove', handlePointerMove, { passive: true });
    hostElement.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    // ResizeObserver for dynamic layout / responsive changes
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        resize();
      });
      resizeObserver.observe(hostElement);
    } else {
      window.addEventListener('resize', resize);
    }

    // IntersectionObserver to pause rendering when scrolled out of view
    let intersectionObserver = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(hostElement);
    }

    // Page visibility change handler
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial setup and start animation
    resize();
    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(animate);
    }

    // Resource and listener cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      hostElement.removeEventListener('pointermove', handlePointerMove);
      hostElement.removeEventListener('pointerleave', handlePointerLeave);

      if (motionMediaQuery) {
        if (typeof motionMediaQuery.removeEventListener === 'function') {
          motionMediaQuery.removeEventListener('change', handleMotionChange);
        } else if (typeof motionMediaQuery.removeListener === 'function') {
          motionMediaQuery.removeListener(handleMotionChange);
        }
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', resize);
      }

      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
    };
  }, [
    enabled,
    spacing,
    interactionRadius,
    repelForce,
    dotRadius,
    dotOpacity,
    connectionOpacity,
    dotColor,
    accentColor,
    connectionColor,
    targetRef,
  ]);

  return (
    <div
      ref={containerRef}
      className={`interactive-dot-grid-container ${className}`.trim()}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        ...style,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default InteractiveDotGrid;
