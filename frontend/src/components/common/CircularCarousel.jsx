import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';

/**
 * CircularCarousel:
 * A 3D circular/cylindrical rotating carousel component with interactive dragging,
 * momentum physics, click-to-focus/link support, and intro animations.
 *
 * @param {Array} items - Array of { src, alt, title, subtitle, link }
 * @param {string} preset - 'cylinder' | 'orbit' | 'wheel' | 'panorama' (default: 'cylinder')
 * @param {string} intro - 'rise' | 'assemble' | 'spin' | 'none' (default: 'rise')
 * @param {number} cardWidth - Width of each card in pixels (default: 220)
 * @param {number} aspectRatio - Width / Height ratio (default: 1)
 * @param {number} speed - Rotation speed in degrees per second (default: 14)
 * @param {boolean} captions - Whether to display title & subtitle overlays (default: true)
 */
export default function CircularCarousel({
  items = [],
  preset = 'cylinder',
  intro = 'rise',
  cardWidth = 340,
  aspectRatio = 0.9,
  speed = 14,
  captions = true,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Drag tracking refs
  const dragStartRef = useRef({ x: 0, rotation: 0, time: 0 });
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafIdRef = useRef(null);
  const hasMovedRef = useRef(false);

  // Check reduced motion updates
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  // Trigger intro animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  const totalItems = items.length;
  const cardHeight = useMemo(() => Math.round(cardWidth / (aspectRatio || 0.9)), [cardWidth, aspectRatio]);

  // Cylinder radius calculation:
  // r = (cardWidth / 2) / tan(PI / totalItems) with proportional clearance
  const radius = useMemo(() => {
    if (totalItems <= 1) return cardWidth;
    const minRadius = Math.round(cardWidth * 1.22);
    const calculated = Math.round((cardWidth / 2) / Math.tan(Math.PI / Math.max(totalItems, 3)));
    return Math.max(minRadius, calculated);
  }, [totalItems, cardWidth]);

  // Continuous rotational drift (speed in deg/sec)
  useEffect(() => {
    if (prefersReducedMotion || speed === 0) return;

    let lastTimestamp = performance.now();

    const loop = (timestamp) => {
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (!isDragging && !isHovered) {
        // Inertia damping after drag release
        if (Math.abs(velocityRef.current) > 0.1) {
          setRotation((prev) => prev + velocityRef.current * dt * 60);
          velocityRef.current *= 0.94; // Exponential decay
        } else {
          // Standard constant drift
          setRotation((prev) => (prev + speed * dt) % 360);
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [speed, isDragging, isHovered, prefersReducedMotion]);

  // Drag interaction handlers
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return; // Primary button only
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      rotation: rotation,
      time: performance.now(),
    };
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;

    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const currentTime = performance.now();
    const deltaX = currentX - dragStartRef.current.x;

    if (Math.abs(deltaX) > 4) {
      hasMovedRef.current = true;
    }

    // Convert pixel delta to rotational angle
    const sensitivity = 360 / (radius * 2 * Math.PI || 1000);
    const newRot = dragStartRef.current.rotation - deltaX * sensitivity;
    setRotation(newRot);

    // Calculate instantaneous velocity for release momentum
    const dt = (currentTime - lastTimeRef.current) / 1000;
    if (dt > 0.008) {
      const dx = currentX - lastXRef.current;
      velocityRef.current = -(dx * sensitivity) / (dt * 60);
      lastXRef.current = currentX;
      lastTimeRef.current = currentTime;
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setRotation((prev) => prev - (360 / Math.max(totalItems, 1)));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setRotation((prev) => prev + (360 / Math.max(totalItems, 1)));
    }
  };

  // Click on card: if user dragged, prevent navigation
  const handleCardClick = (e, targetAngle) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      return;
    }
    // Rotate clicked card to the front
    const normalizedRot = (rotation % 360 + 360) % 360;
    const diff = (targetAngle - normalizedRot + 540) % 360 - 180;
    setRotation((prev) => prev + diff);
  };

  return (
    <div
      ref={containerRef}
      data-preset={preset}
      data-intro={intro}
      className={`circular-carousel-wrapper ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        userSelect: 'none',
        overflow: 'hidden',
        touchAction: 'pan-y',
        cursor: isDragging ? 'grabbing' : 'grab',
        ...style,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="3D Circular Projects Carousel. Use left and right arrow keys to rotate."
    >
      {/* 3D Scene Stage */}
      <div className="circular-stage">
        <div
          className="circular-cylinder-track"
          style={{
            transform: `translateZ(-${radius}px) rotateY(${-rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {items.map((item, index) => {
            const angle = (360 / totalItems) * index;
            const introDelay = intro === 'rise' && !prefersReducedMotion ? index * 85 : 0;

            // Card content structure
            const cardContent = (
              <div
                className={`circular-card-inner ${isLoaded ? 'is-visible' : ''}`}
                style={{
                  transitionDelay: `${introDelay}ms`,
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt || item.title}
                  className="circular-card-img"
                  draggable={false}
                  loading="lazy"
                />

                {/* Ambient Depth Gradient */}
                <div className="circular-card-scrim" aria-hidden="true" />

                {/* Captions Overlay (Requirement: captions enabled) */}
                {captions && (item.title || item.subtitle) && (
                  <div className="circular-card-caption">
                    {item.subtitle && (
                      <span className="circular-card-subtitle">{item.subtitle}</span>
                    )}
                    {item.title && (
                      <h4 className="circular-card-title">{item.title}</h4>
                    )}
                  </div>
                )}
              </div>
            );

            return (
              <div
                key={item.id || item.title || index}
                className="circular-card-slot"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                }}
                onClick={(e) => handleCardClick(e, angle)}
              >
                {item.link ? (
                  <Link
                    to={item.link}
                    className="circular-card-anchor"
                    tabIndex={0}
                    aria-label={`${item.title} — ${item.subtitle}`}
                    onClick={(e) => {
                      if (hasMovedRef.current) e.preventDefault();
                    }}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .circular-carousel-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }

        .circular-carousel-wrapper:focus-visible {
          box-shadow: inset 0 0 0 2px var(--primary-saffron, #F97316);
        }

        .circular-stage {
          width: 100%;
          height: 100%;
          perspective: 1250px;
          perspective-origin: 50% 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .circular-cylinder-track {
          position: absolute;
          width: 0;
          height: 0;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .circular-card-slot {
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -${cardHeight / 2}px;
          margin-left: -${cardWidth / 2}px;
          transform-style: preserve-3d;
          backface-visibility: visible;
        }

        .circular-card-anchor {
          display: block;
          width: 100%;
          height: 100%;
          text-decoration: none;
          color: inherit;
          outline: none;
        }

        .circular-card-anchor:focus-visible .circular-card-inner {
          box-shadow: 0 0 0 3px var(--primary-saffron, #F59E0B), 0 16px 36px rgba(0, 0, 0, 0.4);
        }

        .circular-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          overflow: hidden;
          background: #0F172A;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.28), 0 3px 10px rgba(15, 23, 42, 0.16);
          transform: translateY(140px);
          opacity: 0;
          transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
        }

        /* Intro: 'rise' animation triggers entrance when component mounts */
        .circular-card-inner.is-visible {
          transform: translateY(0);
          opacity: 1;
        }

        .circular-card-inner:hover {
          box-shadow: 0 24px 52px rgba(245, 158, 11, 0.35), 0 6px 18px rgba(15, 23, 42, 0.22);
          border-color: rgba(245, 158, 11, 0.7);
        }

        .circular-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
          pointer-events: none;
        }

        .circular-card-inner:hover .circular-card-img {
          transform: scale(1.06);
        }

        .circular-card-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0) 25%,
            rgba(15, 23, 42, 0.45) 55%,
            rgba(15, 23, 42, 0.85) 80%,
            rgba(15, 23, 42, 0.98) 100%
          );
          pointer-events: none;
        }

        .circular-card-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.35rem 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          z-index: 2;
          pointer-events: none;
        }

        .circular-card-subtitle {
          font-size: 0.775rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--primary-saffron, #F59E0B);
          text-transform: uppercase;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
          line-height: 1.25;
        }

        .circular-card-title {
          font-family: var(--font-heading);
          font-size: 1.18rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.35;
          margin: 0;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.95);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .circular-card-title {
            font-size: 1.05rem;
          }
          .circular-card-subtitle {
            font-size: 0.72rem;
          }
          .circular-card-caption {
            padding: 1.1rem 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .circular-card-title {
            font-size: 0.92rem;
          }
          .circular-card-subtitle {
            font-size: 0.68rem;
          }
          .circular-card-caption {
            padding: 0.85rem 0.9rem;
          }
        }

        /* Reduced Motion Fallback */
        @media (prefers-reduced-motion: reduce) {
          .circular-card-inner {
            transform: none !important;
            opacity: 1 !important;
            transition: none !important;
          }
          .circular-cylinder-track {
            transition: none !important;
          }
          .circular-card-img {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
