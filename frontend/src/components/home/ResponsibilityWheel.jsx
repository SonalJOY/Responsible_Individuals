import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, TreePine, GraduationCap, Users, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import riLogo from '../../assets/ri-logo.png';

const pillars = [
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
    angle: 0, // Top
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
    angle: 90, // Right
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
    angle: 180, // Bottom
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
    angle: 270, // Left
  },
];

export default function ResponsibilityWheel() {
  const [activePillar, setActivePillar] = useState(pillars[0]);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="wheel-section-root">
      <div className="container">
        {/* Section Heading */}
        <div className="wheel-header-center">
          <div className="wheel-badge">
            <Sparkles size={14} className="text-emerald" />
            <span>Our Core Framework</span>
          </div>
          <h2 className="wheel-title">
            TURNING RESPONSIBILITY INTO ACTION
          </h2>
          <p className="wheel-subtitle">
            Hover over any strategic area to explore how citizen ownership and structured scientific methodology drive sustainable transformation.
          </p>
        </div>

        {/* Wheel & Details Interactive Grid */}
        <div className="wheel-interactive-grid">
          {/* Circular Wheel Canvas */}
          <div 
            className="wheel-canvas-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Outer Rotating Ring */}
            <div className={`wheel-rotating-track ${isHovered ? 'paused' : ''}`}>
              {/* Decorative SVG track circles */}
              <svg viewBox="0 0 500 500" className="wheel-svg-track">
                <circle 
                  cx="250" cy="250" r="210" 
                  fill="none" 
                  stroke="#E8E2D6" 
                  strokeWidth="2" 
                  strokeDasharray="6 8" 
                />
                <circle 
                  cx="250" cy="250" r="160" 
                  fill="none" 
                  stroke="rgba(16, 185, 129, 0.15)" 
                  strokeWidth="1.5" 
                />
              </svg>

              {/* 4 Quadrant Nodes */}
              {pillars.map((pillar) => {
                const IconComp = pillar.icon;
                const isSelected = activePillar.id === pillar.id;

                // Coordinates for 4 quadrants on circle of radius 175px
                const rad = (pillar.angle - 90) * (Math.PI / 180);
                const x = 250 + 175 * Math.cos(rad);
                const y = 250 + 175 * Math.sin(rad);

                return (
                  <div
                    key={pillar.id}
                    className={`quadrant-node-wrapper ${isSelected ? 'selected' : ''}`}
                    style={{
                      left: `${(x / 500) * 100}%`,
                      top: `${(y / 500) * 100}%`,
                    }}
                    onMouseEnter={() => setActivePillar(pillar)}
                    onClick={() => setActivePillar(pillar)}
                    role="button"
                    tabIndex={0}
                    aria-label={pillar.name}
                  >
                    {/* Counter-rotating element ensures text is always upright */}
                    <div className={`counter-rotating-box ${isHovered ? 'paused' : ''}`}>
                      <div 
                        className="node-circle"
                        style={{ 
                          backgroundColor: isSelected ? pillar.color : '#FFFFFF',
                          borderColor: pillar.color,
                          color: isSelected ? '#FFFFFF' : pillar.color,
                        }}
                      >
                        <IconComp size={24} />
                      </div>
                      <div className="node-label-pill">
                        {pillar.shortName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stable, Stationary Center Logo */}
            <div className="wheel-center-hub">
              <div className="center-hub-card">
                <div className="center-logo-img-wrapper">
                  <img src={riLogo} alt="Responsible Individuals Logo" className="wheel-center-ri-logo" />
                </div>
                <span className="center-logo-title">RESPONSIBLE</span>
                <span className="center-logo-sub">INDIVIDUALS</span>
              </div>
            </div>
          </div>

          {/* Active Quadrant Details Card */}
          <div className="wheel-active-detail-panel animate-fade-in" key={activePillar.id}>
            <div className="active-card-top-bar">
              <span 
                className="active-area-tag"
                style={{ backgroundColor: `${activePillar.color}18`, color: activePillar.color }}
              >
                {activePillar.tag}
              </span>
              <span className="active-area-sdg">{activePillar.sdg}</span>
            </div>

            <h3 className="active-area-name">{activePillar.name}</h3>

            <p className="active-area-desc">{activePillar.description}</p>

            <div className="active-card-footer">
              <Link 
                to={`/projects?focus_area=${activePillar.slug}`} 
                className="active-explore-btn"
                style={{ backgroundColor: activePillar.color }}
              >
                <span>View Ground Projects</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .wheel-section-root {
          background-color: var(--cream-100);
          padding: 6rem 0;
          position: relative;
        }
        .wheel-header-center {
          text-align: center;
          max-width: 740px;
          margin: 0 auto 4rem auto;
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
          letter-spacing: -0.025em;
          color: var(--charcoal-900);
          line-height: 1.15;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .wheel-title {
            font-size: 3.4rem;
          }
        }
        .wheel-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          line-height: 1.65;
        }
        .wheel-interactive-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3.5rem;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .wheel-interactive-grid {
            grid-template-columns: 1.1fr 0.9fr;
            gap: 4rem;
          }
        }
        .wheel-canvas-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wheel-rotating-track {
          position: absolute;
          inset: 0;
          animation: slowSpin 40s linear infinite;
        }
        .wheel-rotating-track.paused {
          animation-play-state: paused;
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .wheel-svg-track {
          width: 100%;
          height: 100%;
        }
        .quadrant-node-wrapper {
          position: absolute;
          transform: translate(-50%, -50%);
          cursor: pointer;
          z-index: 10;
        }
        .counter-rotating-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: counterSpin 40s linear infinite;
        }
        .counter-rotating-box.paused {
          animation-play-state: paused;
        }
        @keyframes counterSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .node-circle {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-pill);
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          transition: all var(--transition-fast);
        }
        .quadrant-node-wrapper:hover .node-circle,
        .quadrant-node-wrapper.selected .node-circle {
          transform: scale(1.15);
          box-shadow: 0 12px 24px rgba(16, 185, 129, 0.3);
        }
        .node-label-pill {
          margin-top: 0.4rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          padding: 0.2rem 0.65rem;
          border-radius: var(--radius-pill);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--charcoal-900);
          white-space: nowrap;
          box-shadow: var(--shadow-sm);
        }
        .wheel-center-hub {
          position: absolute;
          z-index: 20;
          pointer-events: none;
        }
        .center-hub-card {
          background: #FFFFFF;
          border: 2px solid var(--border-subtle);
          border-radius: var(--radius-pill);
          width: 140px;
          height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 16px 36px rgba(8, 41, 31, 0.14);
        }
        .center-logo-img-wrapper {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.35rem;
        }
        .wheel-center-ri-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .center-logo-title {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--charcoal-900);
          letter-spacing: 0.04em;
        }
        .center-logo-sub {
          font-size: 0.62rem;
          font-weight: 700;
          color: #10B981;
          letter-spacing: 0.1em;
        }
        .wheel-active-detail-panel {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: 28px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(8, 41, 31, 0.08);
        }
        .active-card-top-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .active-area-tag {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-pill);
          letter-spacing: 0.05em;
        }
        .active-area-sdg {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .active-area-name {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .active-area-desc {
          font-size: 1.05rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin-bottom: 2rem;
        }
        .active-explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.8rem 1.6rem;
          border-radius: var(--radius-pill);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          transition: transform var(--transition-fast);
        }
        .active-explore-btn:hover {
          transform: translateX(3px);
          filter: brightness(1.08);
        }
      `}</style>
    </section>
  );
}
