import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { AlertCircle, PlayCircle, RefreshCw, Award, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import InteractiveDotGrid from './InteractiveDotGrid';

const JOURNEY_STEPS = [
  {
    id: 1,
    stage: '01',
    name: 'Challenge',
    title: 'Diagnosing Ground Distress',
    description: 'Uncovering systemic water depletion, school learning gaps, or waste dumping through participatory surveys with local ward residents.',
    metric: 'Participatory Ward Surveys',
    icon: AlertCircle,
    color: '#EF4444',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 2,
    stage: '02',
    name: 'Action',
    title: 'Mobilizing Citizen Stewards',
    description: 'Deploying scientific engineering designs, raising CSR co-funding, and organizing weekend community desilting and planting drives.',
    metric: 'Community Co-funding & Drives',
    icon: PlayCircle,
    color: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 3,
    stage: '03',
    name: 'Change',
    title: 'Constructed Transformation',
    description: 'Physical wetland bio-swales completed, solar-powered STEM labs commissioned, and native micro-forest saplings taking root.',
    metric: 'Wetland Bio-swales & STEM Labs',
    icon: RefreshCw,
    color: '#3B82F6',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 4,
    stage: '04',
    name: 'Impact',
    title: 'Verifiable Long-term Outcomes',
    description: 'Borewell groundwater recharged by 45ft, student STEM pass rates surging to 78%, and self-sustaining citizen committees managing the site.',
    metric: '+45ft Borewell Recharge • 78% Pass Rate',
    icon: Award,
    color: '#10B981',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
  },
];

const DRAG_BUFFER = 40;
const VELOCITY_THRESHOLD = 450;
const GAP = 24;

// Smooth, natural spring physics (takes ~0.65-0.75s to settle gracefully)
const SPRING_OPTIONS = {
  type: 'spring',
  stiffness: 220,
  damping: 28,
  mass: 0.8,
};

function JourneyCarouselCard({
  item,
  index,
  itemWidth,
  trackItemOffset,
  centerOffset,
  x,
  transition
}) {
  const range = [
    centerOffset - (index + 1) * trackItemOffset,
    centerOffset - index * trackItemOffset,
    centerOffset - (index - 1) * trackItemOffset
  ];
  
  // Subtle 3D perspective during transition: active center card settles at 0deg
  const outputRange = [28, 0, -28];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });
  const scale = useTransform(x, range, [0.93, 1, 0.93], { clamp: true });
  const opacity = useTransform(x, range, [0.75, 1, 0.75], { clamp: true });

  const IconComp = item.icon;

  return (
    <motion.div
      key={`${item?.id ?? index}-${index}`}
      className="journey-carousel-card"
      style={{
        width: `${itemWidth}px`,
        rotateY,
        scale,
        opacity,
      }}
      transition={transition}
    >
      {/* 45-50% Height Image Header */}
      <div className="card-media-wrap">
        <img
          src={item.image}
          alt={item.title}
          className="card-cover-image"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="card-image-gradient-overlay" />
        
        {/* Stage Badge Floating Over Image */}
        <div className="card-stage-pill" style={{ borderColor: `${item.color}50` }}>
          <span className="stage-pill-dot" style={{ backgroundColor: item.color }} />
          <span>STAGE {item.stage} OF 04 • {item.name.toUpperCase()}</span>
        </div>

        {/* Floating Icon Badge */}
        <div className="card-floating-icon" style={{ backgroundColor: item.color }}>
          <IconComp size={20} color="#FFFFFF" />
        </div>
      </div>

      {/* Content Area */}
      <div className="card-content-wrap">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-description">{item.description}</p>

        {/* Verifiable Metric Footer */}
        <div className="card-metric-bar">
          <span className="metric-chip-dot" style={{ backgroundColor: item.color }} />
          <span className="metric-chip-text">{item.metric}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function StoryJourney() {
  const containerRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(1200);

  // Measure container width responsively
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Card dimensions: ~470px on desktop, ~88vw on mobile
  const itemWidth = Math.min(480, Math.max(300, viewportWidth - 48));
  const trackItemOffset = itemWidth + GAP;
  const centerOffset = (viewportWidth - itemWidth) / 2;

  const items = JOURNEY_STEPS;
  const loop = true;
  const autoplay = true;
  const autoplayDelay = 2800; // ~2.8s waiting interval between cards

  // Clone array: [last, ...items, first]
  const itemsForRender = useMemo(() => {
    if (!loop) return items;
    if (items.length === 0) return [];
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);

  const [position, setPosition] = useState(loop ? 1 : 0);
  const x = useMotionValue(centerOffset - (loop ? 1 : 0) * trackItemOffset);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync initial position and resize (without snapping during active position changes)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      x.set(centerOffset - position * trackItemOffset);
    } else if (!isAnimating && !isDragging) {
      // Smoothly update on viewport resize
      x.set(centerOffset - position * trackItemOffset);
    }
  }, [centerOffset, trackItemOffset, x]);

  // Pause autoplay when hovering over the carousel
  useEffect(() => {
    if (!containerRef.current) return undefined;
    const container = containerRef.current;
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Autoplay: waits ~2.8s between cards; pauses when user hovers, drags, or animates
  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return undefined;
    if (isHovered || isDragging) return undefined;

    const timer = setInterval(() => {
      setPosition((prev) => {
        const next = prev + 1;
        return Math.min(next, itemsForRender.length - 1);
      });
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, isDragging, position, itemsForRender.length]);

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationStart = () => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }
    const lastCloneIndex = itemsForRender.length - 1;

    // Wrapped past the end clone -> jump invisibly to slide 1
    if (position === lastCloneIndex) {
      setIsJumping(true);
      const target = 1;
      setPosition(target);
      x.set(centerOffset - target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    // Wrapped before the start clone -> jump invisibly to last real slide
    if (position === 0) {
      setIsJumping(true);
      const target = items.length;
      setPosition(target);
      x.set(centerOffset - target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    setIsAnimating(false);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_, info) => {
    setIsDragging(false);
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;

    if (direction === 0) {
      // Weak drag: spring back to current position
      return;
    }

    setPosition((prev) => {
      const next = prev + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };

  const activeIndex =
    items.length === 0
      ? 0
      : loop
        ? (position - 1 + items.length) % items.length
        : Math.min(position, items.length - 1);

  const goToPrev = useCallback(() => {
    setPosition((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setPosition((prev) => Math.min(itemsForRender.length - 1, prev + 1));
  }, [itemsForRender.length]);

  return (
    <section className="journey-section-root impact-section">
      {/* 1. InteractiveDotGrid: STRICTLY z-index: 0 background canvas */}
      <InteractiveDotGrid />

      {/* 2. Content Wrapper: STRICTLY z-index: 10, above the particle canvas */}
      <div className="impact-content">
        <div className="container journey-content-container">
          {/* Section Header */}
          <div className="journey-header-center">
            <div className="journey-badge">
              <Sparkles size={14} className="text-emerald" />
              <span>The Transformation Journey</span>
            </div>

            <h2 className="journey-title">
              How Responsibility Becomes Measurable Impact
            </h2>

            <p className="journey-subtitle">
              Every grassroots intervention is governed by ONE continuous accountability arc: from identifying the crisis to delivering lasting community resilience.
            </p>
          </div>

          {/* Large 3D Carousel Viewport (z-index: 20) */}
          <div
            ref={containerRef}
            className="journey-carousel-viewport"
          >
            <motion.div
              className="journey-carousel-track"
              drag={isJumping ? false : 'x'}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              style={{
                gap: `${GAP}px`,
                perspective: 1200,
                perspectiveOrigin: `${centerOffset + position * trackItemOffset + itemWidth / 2}px 50%`,
                x,
              }}
              animate={{ x: centerOffset - position * trackItemOffset }}
              transition={effectiveTransition}
              onAnimationStart={handleAnimationStart}
              onAnimationComplete={handleAnimationComplete}
            >
              {itemsForRender.map((item, index) => (
                <JourneyCarouselCard
                  key={`${item?.id ?? index}-${index}`}
                  item={item}
                  index={index}
                  itemWidth={itemWidth}
                  trackItemOffset={trackItemOffset}
                  centerOffset={centerOffset}
                  x={x}
                  transition={effectiveTransition}
                />
              ))}
            </motion.div>
          </div>

          {/* Carousel Navigation Controls & Dots (z-index: 25) */}
          <div className="journey-controls-cluster">
            <button
              type="button"
              className="carousel-nav-arrow prev"
              aria-label="Previous stage"
              onClick={goToPrev}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="carousel-dots-wrap">
              {items.map((_, index) => (
                <motion.button
                  type="button"
                  key={index}
                  aria-label={`Go to stage ${index + 1}`}
                  aria-current={activeIndex === index}
                  className={`carousel-dot ${activeIndex === index ? 'active' : ''}`}
                  animate={{
                    scale: activeIndex === index ? 1.15 : 1,
                  }}
                  onClick={() => setPosition(loop ? index + 1 : index)}
                  transition={{ duration: 0.15 }}
                />
              ))}
            </div>

            <button
              type="button"
              className="carousel-nav-arrow next"
              aria-label="Next stage"
              onClick={goToNext}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* Stacking Context Isolation */
        .impact-section {
          position: relative;
          isolation: isolate;
          background-color: var(--cream-50, #F7F3EB);
          padding: 95px 0 115px 0;
          overflow: hidden;
        }

        /* All content strictly above background canvas */
        .impact-content {
          position: relative;
          z-index: 10;
        }

        .journey-content-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .journey-header-center {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 4rem auto;
        }

        .journey-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E8E2D6);
          color: var(--charcoal-800, #1A2E26);
          padding: 0.45rem 1.15rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.825rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.35rem;
          box-shadow: 0 2px 8px rgba(8, 41, 31, 0.04);
        }

        .text-emerald {
          color: #10B981;
        }

        .journey-title {
          font-family: var(--font-heading, "Cabinet Grotesk", sans-serif);
          font-size: clamp(2.3rem, 3.8vw, 3.4rem);
          font-weight: 800;
          color: var(--charcoal-900, #08291F);
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 1.15rem;
        }

        .journey-subtitle {
          font-size: clamp(1.05rem, 1.25vw, 1.2rem);
          color: var(--text-muted, #5C6E67);
          line-height: 1.68;
          max-width: 680px;
          margin: 0 auto;
        }

        /* Carousel Viewport (z-index: 20) */
        .journey-carousel-viewport {
          position: relative;
          z-index: 20;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          overflow: visible;
          padding: 24px 0;
          cursor: grab;
          user-select: none;
        }

        .journey-carousel-viewport:active {
          cursor: grabbing;
        }

        .journey-carousel-track {
          display: flex;
          transform-style: preserve-3d;
          will-change: transform;
        }

        /* Large Card: z-index: 21 with solid white background */
        .journey-carousel-card {
          position: relative;
          z-index: 21;
          flex-shrink: 0;
          height: 480px;
          background: #FFFFFF;
          background-color: #FFFFFF;
          border: 1px solid rgba(15, 76, 58, 0.12);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(8, 41, 31, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transform-style: preserve-3d;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .journey-carousel-card:hover {
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 25px 55px rgba(8, 41, 31, 0.14);
        }

        /* 45-50% Height Image Header (z-index: 22) */
        .card-media-wrap {
          position: relative;
          z-index: 22;
          width: 100%;
          height: 230px;
          background: #08291F;
          overflow: hidden;
        }

        .card-cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .journey-carousel-card:hover .card-cover-image {
          transform: scale(1.05);
        }

        .card-image-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(8, 41, 31, 0.25) 0%, rgba(8, 41, 31, 0.7) 100%);
          pointer-events: none;
        }

        .card-stage-pill {
          position: absolute;
          top: 18px;
          left: 18px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(8, 41, 31, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid;
          color: #FFFFFF;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.725rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          z-index: 2;
        }

        .stage-pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
        }

        .card-floating-icon {
          position: absolute;
          bottom: 18px;
          right: 18px;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
          z-index: 2;
        }

        /* Content Lower Section (z-index: 22) */
        .card-content-wrap {
          position: relative;
          z-index: 22;
          padding: 1.75rem 2rem 2rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
        }

        .card-title {
          font-family: var(--font-heading, "Cabinet Grotesk", sans-serif);
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--charcoal-900, #08291F);
          line-height: 1.28;
          margin-bottom: 0.75rem;
        }

        .card-description {
          font-size: 0.95rem;
          color: var(--text-muted, #5C6E67);
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .card-metric-bar {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(15, 76, 58, 0.05);
          border: 1px solid rgba(15, 76, 58, 0.1);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--charcoal-800, #08291F);
        }

        .metric-chip-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        /* Navigation Controls (z-index: 25) */
        .journey-controls-cluster {
          position: relative;
          z-index: 25;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2.75rem;
        }

        .carousel-nav-arrow {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-pill, 9999px);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E8E2D6);
          color: var(--charcoal-900, #08291F);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(8, 41, 31, 0.06);
          transition: all 0.2s ease;
        }

        .carousel-nav-arrow:hover {
          background: #10B981;
          color: #FFFFFF;
          border-color: #10B981;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(16, 185, 129, 0.35);
        }

        .carousel-dots-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: rgba(15, 76, 58, 0.2);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .carousel-dot.active {
          width: 32px;
          background: #10B981;
          border-radius: 9999px;
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
        }

        @media (max-width: 640px) {
          .impact-section {
            padding: 70px 0 85px 0;
          }
          .journey-carousel-card {
            height: 460px;
          }
          .card-content-wrap {
            padding: 1.25rem 1.4rem 1.5rem 1.4rem;
          }
          .card-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
}
