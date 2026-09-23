import React, { useMemo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Link } from 'react-router-dom';
import { TreePine, GraduationCap, Users, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import riLogo from '../../assets/ri-logo.png';

export const pillars = [
  {
    id: 1,
    name: 'Environment & Water Restoration',
    shortName: 'Environment & Water',
    tag: 'ECOLOGICAL RESTORATION',
    icon: TreePine,
    color: '#10B981',
    description: 'Protecting lakes, desilting stormwater inflow feeder channels, and creating urban Miyawaki micro-forests for climate-resilient cities.',
    sdg: 'SDG 6: Clean Water • SDG 13: Climate Action',
    slug: 'environment',
  },
  {
    id: 2,
    name: 'Education & Digital Literacy',
    shortName: 'Education & STEM',
    tag: 'FUTURE READINESS',
    icon: GraduationCap,
    color: '#3B82F6',
    description: 'Equipping underserved government schools with solar-powered smart STEM labs, tablet libraries, and weekly volunteer coding mentors.',
    sdg: 'SDG 4: Quality Education • SDG 10: Reduced Inequalities',
    slug: 'education',
  },
  {
    id: 3,
    name: 'Community Waste & Ecology',
    shortName: 'Waste & Sanitation',
    tag: 'CIRCULAR COMMUNITIES',
    icon: Users,
    color: '#F59E0B',
    description: 'Fostering decentralized neighborhood waste segregation, community aerobic composting hubs, and dignified safety gear for sanitation stewards.',
    sdg: 'SDG 11: Sustainable Cities • SDG 12: Responsible Consumption',
    slug: 'community',
  },
  {
    id: 4,
    name: 'Civic Responsibility & Leadership',
    shortName: 'Civic Leadership',
    tag: 'GRASSROOTS GOVERNANCE',
    icon: ShieldCheck,
    color: '#0D9488',
    description: 'Empowering citizen collectives and youth ambassadors to bridge the gap between neighborhoods, ward committees, and local governance.',
    sdg: 'SDG 16: Peace & Justice • SDG 17: Partnerships',
    slug: 'civic',
  },
];

function generateEllipsePath(cx, cy, rx, ry) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function OrbitCardItem({ pillar, index, totalItems, path, rotation, progress, isPaused, setPaused }) {
  const itemOffset = (index / totalItems) * 100;

  const offsetDistance = useTransform(progress, (p) => {
    const offset = (((p + itemOffset) % 100) + 100) % 100;
    return `${offset}%`;
  });

  const IconComp = pillar.icon;

  return (
    <motion.div
      className="orbit-card-motion-wrapper"
      style={{
        width: 310,
        minHeight: 220,
        position: 'absolute',
        willChange: 'transform',
        userSelect: 'none',
        offsetPath: `path("${path}")`,
        offsetRotate: '0deg',
        offsetAnchor: 'center center',
        offsetDistance,
        zIndex: 20,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div 
        style={{ transform: `rotate(${-rotation}deg)` }}
        className="orbit-pillar-card"
      >
        <div className="orbit-card-top">
          <span 
            className="orbit-card-tag"
            style={{ backgroundColor: `${pillar.color}18`, color: pillar.color }}
          >
            {pillar.tag}
          </span>
          <div 
            className="orbit-icon-circle"
            style={{ backgroundColor: `${pillar.color}15`, color: pillar.color, borderColor: `${pillar.color}35` }}
          >
            <IconComp size={18} />
          </div>
        </div>

        <h3 className="orbit-card-title">{pillar.name}</h3>
        <p className="orbit-card-desc">{pillar.description}</p>
        
        <div className="orbit-card-bottom">
          <span className="orbit-card-sdg">{pillar.sdg}</span>
          <Link 
            to={`/projects?focus_area=${pillar.slug}`}
            className="orbit-card-link"
            style={{ color: pillar.color }}
          >
            <span>Explore</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function OrbitCards({
  baseWidth = 1200,
  baseHeight = 680,
  radiusX = 420,
  radiusY = 190,
  rotation = 0,
  duration = 40,
  showPath = false,
  pathColor = 'rgba(16, 185, 129, 0.18)',
  pathWidth = 2,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(null);
  const [paused, setPaused] = useState(false);

  const designCenterX = baseWidth / 2;
  const designCenterY = baseHeight / 2;

  const path = useMemo(() => {
    return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY);
  }, [designCenterX, designCenterY, radiusX, radiusY]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const currentWidth = containerRef.current.clientWidth;
      setScale(Math.min(1, currentWidth / baseWidth));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [baseWidth]);

  const progress = useMotionValue(0);

  useEffect(() => {
    if (paused) return;
    const controls = animate(progress, 100, {
      duration,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    });
    return () => controls.stop();
  }, [progress, duration, paused]);

  return (
    <section className="wheel-section-root">
      <div className="container">
        {/* Section Heading — Preserved Exactly */}
        <div className="wheel-header-center">
          <div className="wheel-badge">
            <Sparkles size={14} className="text-emerald" />
            <span>Our Core Framework</span>
          </div>
          <h2 className="wheel-title">
            TURNING RESPONSIBILITY INTO ACTION
          </h2>
          <p className="wheel-subtitle">
            Hover over any strategic pillar to explore how citizen ownership and structured scientific methodology drive sustainable transformation.
          </p>
        </div>

        {/* Elliptical Orbit Container */}
        <div
          ref={containerRef}
          className="orbit-stage-container"
          style={{
            width: '100%',
            height: scale !== null ? baseHeight * scale : baseHeight,
            position: 'relative',
            margin: '0 auto',
            overflow: 'hidden',
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="orbit-scaled-wrapper"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: baseWidth,
              height: baseHeight,
              transform: scale !== null ? `translate(-50%, -50%) scale(${scale})` : 'translate(-50%, -50%)',
              transformOrigin: 'center center',
              visibility: scale === null ? 'hidden' : 'visible',
            }}
          >
            <div
              className="orbit-track-rotation"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {/* Optional Subtle Path */}
              {showPath && (
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                  className="absolute inset-0 pointer-events-none"
                >
                  <path 
                    d={path} 
                    fill="none" 
                    stroke={pathColor} 
                    strokeWidth={pathWidth / (scale ?? 1)} 
                    strokeDasharray="6 8"
                  />
                </svg>
              )}

              {/* 4 Cards Distributed Along Ellipse (0%, 25%, 50%, 75%) */}
              {pillars.map((pillar, index) => (
                <OrbitCardItem
                  key={pillar.id}
                  pillar={pillar}
                  index={index}
                  totalItems={pillars.length}
                  path={path}
                  rotation={rotation}
                  progress={progress}
                  isPaused={paused}
                  setPaused={setPaused}
                />
              ))}
            </div>

            {/* Preserved Center Content */}
            <div className="orbit-center-hub">
              <div className="center-hub-card">
                <div className="center-logo-img-wrapper">
                  <img src={riLogo} alt="Responsible Individuals Logo" className="wheel-center-ri-logo" />
                </div>
                <span className="center-logo-title">RESPONSIBLE</span>
                <span className="center-logo-sub">INDIVIDUALS</span>
                <span className="center-logo-caption">CITIZEN STEWARDSHIP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .wheel-section-root {
          background-color: var(--cream-100);
          padding: 6rem 0;
          position: relative;
          z-index: 10;
        }
        .wheel-header-center {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 3rem auto;
          position: relative;
          z-index: 20;
        }
        .wheel-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--charcoal-800);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .wheel-title {
          font-family: var(--font-heading);
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--charcoal-900);
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
        }
        .wheel-subtitle {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-muted);
        }
        .orbit-stage-container {
          user-select: none;
        }
        .orbit-pillar-card {
          background: #FFFFFF;
          border: 1px solid rgba(232, 226, 214, 0.95);
          border-radius: 22px;
          padding: 1.4rem 1.5rem;
          box-shadow: 0 14px 36px rgba(8, 41, 31, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          pointer-events: auto;
          cursor: pointer;
        }
        .orbit-pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(8, 41, 31, 0.14);
          border-color: #10B981;
        }
        .orbit-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .orbit-card-tag {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-pill);
          text-transform: uppercase;
        }
        .orbit-icon-circle {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
        }
        .orbit-card-title {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--charcoal-900);
          line-height: 1.25;
        }
        .orbit-card-desc {
          font-size: 0.82rem;
          line-height: 1.45;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .orbit-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.4rem;
          padding-top: 0.6rem;
          border-top: 1px solid var(--border-subtle);
        }
        .orbit-card-sdg {
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .orbit-card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          transition: gap 0.2s ease;
        }
        .orbit-card-link:hover {
          gap: 0.55rem;
        }
        .orbit-center-hub {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 15;
          pointer-events: none;
        }
        .center-hub-card {
          background: #FFFFFF;
          border: 2px solid var(--border-subtle);
          border-radius: var(--radius-pill);
          width: 150px;
          height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 16px 36px rgba(8, 41, 31, 0.12);
        }
        .center-logo-img-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
        }
        .wheel-center-ri-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .center-logo-title {
          font-family: var(--font-heading);
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--charcoal-900);
          letter-spacing: 0.04em;
        }
        .center-logo-sub {
          font-size: 0.6rem;
          font-weight: 700;
          color: #10B981;
          letter-spacing: 0.1em;
        }
        .center-logo-caption {
          font-size: 0.52rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          margin-top: 0.15rem;
        }
        @media (max-width: 768px) {
          .wheel-title {
            font-size: 1.85rem;
          }
          .wheel-section-root {
            padding: 4rem 0;
          }
        }
      `}</style>
    </section>
  );
}
