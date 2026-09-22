import React, { useEffect, useState } from 'react';
import { impactService } from '../../services/api';
import { 
  Award, Home, Users, HeartHandshake, Droplet, Building2, 
  RotateCw, Repeat, CheckCircle2, Sparkles, MoveHorizontal, MoveVertical
} from 'lucide-react';
import impactBg from '../../assets/impact-bg.jpg';

const iconMap = {
  Award: Award,
  Home: Home,
  Users: Users,
  HeartHandshake: HeartHandshake,
  Droplet: Droplet,
  Building2: Building2,
};

// Secondary details content for the back side of each metric card
const secondaryDetailsMap = {
  projects_completed: {
    badge: 'Audited Delivery',
    subtitle: 'Verifiable Ground Milestones',
    highlights: [
      { val: '34', label: 'Eco-Restoration & Lakes' },
      { val: '12', label: 'Rural Clean Water & Solar' },
      { val: '4', label: 'Zero-Waste Community Hubs' },
    ],
    verifiedNote: '100% on-time milestone delivery across urban & rural hubs.',
  },
  communities_reached: {
    badge: 'Grassroots Footprint',
    subtitle: 'Frontline Intervention Zones',
    highlights: [
      { val: '85', label: 'Village Gram Panchayats' },
      { val: '35', label: 'Urban Informal Settlements' },
      { val: '12', label: 'High Climate-Risk Districts' },
    ],
    verifiedNote: 'Direct partnership with community elders and local self-help groups.',
  },
  lives_impacted: {
    badge: 'Human Well-being',
    subtitle: 'Direct Positive Beneficiaries',
    highlights: [
      { val: '62%', label: 'Women & Youth Beneficiaries' },
      { val: '15K+', label: 'Students in Eco-Action Clubs' },
      { val: '3.8K', label: 'Clean Drinking Water Households' },
    ],
    verifiedNote: 'Household resilience and health standard uplift verified annually.',
  },
  active_volunteers: {
    badge: 'Citizen-Led Power',
    subtitle: 'Civic Mobilization Network',
    highlights: [
      { val: '120K+', label: 'Verified Field Service Hours' },
      { val: '42', label: 'University & CSR Chapters' },
      { val: '94%', label: 'Annual Volunteer Retention' },
    ],
    verifiedNote: 'Active civic leadership chapters across 18 regional hubs.',
  },
};

// Fallback index-based details if custom keys differ
const fallbackSecondaryList = [
  secondaryDetailsMap.projects_completed,
  secondaryDetailsMap.communities_reached,
  secondaryDetailsMap.lives_impacted,
  secondaryDetailsMap.active_volunteers,
];

export default function ImpactCounter({ 
  transparentBg = false,
  showControls = true,
  showVerifiedBadge = true,
  showFlipBack = true,
}) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState({});
  const [flipAxis, setFlipAxis] = useState('horizontal'); // 'horizontal' | 'vertical'
  const [allFlipped, setAllFlipped] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await impactService.getStatistics();
        setStats(data || []);
      } catch (err) {
        console.error('Failed to load stats:', err);
        // Fallback realistic defaults
        setStats([
          { key: 'projects_completed', title: 'Projects Completed', counter_value: '50+', icon_name: 'Award' },
          { key: 'communities_reached', title: 'Communities Reached', counter_value: '120+', icon_name: 'Home' },
          { key: 'lives_impacted', title: 'Lives Transformed', counter_value: '50,000+', icon_name: 'Users' },
          { key: 'active_volunteers', title: 'Active Volunteers', counter_value: '2,500+', icon_name: 'HeartHandshake' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const toggleCard = (cardKey) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  const handleToggleAll = () => {
    const nextState = !allFlipped;
    setAllFlipped(nextState);
    const newFlipped = {};
    stats.slice(0, 4).forEach((item, idx) => {
      const key = item.key || item.id || `stat-${idx}`;
      newFlipped[key] = nextState;
    });
    setFlippedCards(newFlipped);
  };

  const toggleAxis = () => {
    setFlipAxis((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  };

  return (
    <div className={`impact-counter-wrapper ${transparentBg ? 'is-transparent' : ''}`}>
      {/* High-Resolution Video Background (when standalone) */}
      {!transparentBg && (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="impact-bg-video"
            poster={impactBg}
            aria-hidden="true"
          >
            <source src="/videos/hero-impact.webm" type="video/webm" />
            <source src="https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a5/Slovenia-_Lake_Bled._Drone_footage.webm/Slovenia-_Lake_Bled._Drone_footage.webm.1080p.vp9.webm" type="video/webm" />
          </video>
          {/* Ambient Emerald Gradient Color Grade & Vignette */}
          <div className="impact-bg-overlay" aria-hidden="true" />
        </>
      )}

      <div className="container impact-counter-container">
        {/* Sub-header Controls Bar */}
        {showControls && (
          <div className="impact-controls-bar">
            <div className="impact-tag-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>Interactive Impact Matrix • Live Data</span>
            </div>

            <div className="flip-action-controls">
              <button 
                type="button"
                className="flip-ctrl-btn"
                onClick={toggleAxis}
                title={`Switch flip axis to ${flipAxis === 'horizontal' ? 'Vertical' : 'Horizontal'}`}
              >
                {flipAxis === 'horizontal' ? (
                  <>
                    <MoveHorizontal size={14} />
                    <span>Axis: Horizontal (↔)</span>
                  </>
                ) : (
                  <>
                    <MoveVertical size={14} />
                    <span>Axis: Vertical (↕)</span>
                  </>
                )}
              </button>

              <button 
                type="button" 
                className="flip-ctrl-btn flip-toggle-all"
                onClick={handleToggleAll}
              >
                <Repeat size={14} />
                <span>{allFlipped ? 'Show Front' : 'Flip All Cards'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3D Flip Card Grid */}
        <div className="counter-grid">
          {stats.slice(0, 4).map((item, idx) => {
            const IconComponent = iconMap[item.icon_name] || Award;
            const cardKey = item.key || item.id || `stat-${idx}`;
            const isFlipped = Boolean(flippedCards[cardKey]);
            const details = secondaryDetailsMap[item.key] || fallbackSecondaryList[idx] || fallbackSecondaryList[0];

            return (
              <div
                key={cardKey}
                className={`flip-box ${flipAxis} ${isFlipped ? 'is-flipped' : ''}`}
                onClick={() => toggleCard(cardKey)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCard(cardKey);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isFlipped}
                aria-label={`${item.title}: ${item.counter_value}. Press Enter or click to view detailed breakdown.`}
              >
                <div className="flip-box-inner">
                  {/* FRONT SIDE */}
                  <div className="flip-box-side flip-box-front">
                    <div className="front-top-row">
                      <div className="counter-icon-box">
                        <IconComponent size={26} />
                      </div>
                      {showVerifiedBadge && (
                        <span className="front-metric-badge">Verified KPI</span>
                      )}
                    </div>

                    <div className="counter-content">
                      <div className="counter-number">{item.counter_value}</div>
                      <div className="counter-label">{item.title}</div>
                    </div>

                    <div className="flip-prompt-pill">
                      <RotateCw size={13} className="flip-icon-spin" />
                      <span>Hover or click to flip</span>
                    </div>
                  </div>

                  {/* BACK SIDE (SECONDARY DETAILS) */}
                  <div className="flip-box-side flip-box-back">
                    <div className="back-header">
                      <span className="back-badge">
                        <CheckCircle2 size={12} />
                        {details.badge}
                      </span>
                      {showFlipBack && (
                        <span className="back-return-cue">
                          <RotateCw size={12} />
                          Flip back
                        </span>
                      )}
                    </div>

                    <div className="back-body">
                      <h4 className="back-title">{item.title}</h4>
                      <div className="back-subtitle">{details.subtitle}</div>

                      <div className="back-highlights">
                        {details.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="back-highlight-row">
                            <span className="highlight-val">{h.val}</span>
                            <span className="highlight-label">{h.label}</span>
                          </div>
                        ))}
                      </div>

                      <p className="back-note">{details.verifiedNote}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .impact-counter-wrapper {
          position: relative;
          overflow: hidden;
          padding: 4.5rem 0 5rem 0;
          color: white;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          background-color: #061912;
        }

        .impact-counter-wrapper.is-transparent {
          background: transparent !important;
          border-top: none !important;
          border-bottom: none !important;
          padding: 0 0 2rem 0 !important;
        }

        /* High-resolution Video Background */
        .impact-bg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          pointer-events: none;
          z-index: 0;
          filter: brightness(0.62) saturate(1.2);
        }

        /* Slightly blurred fallback background image */
        .impact-bg-layer {
          position: absolute;
          inset: -25px;
          background-size: cover;
          background-position: center 30%;
          filter: blur(6px) brightness(0.42) saturate(1.25);
          transform: scale(1.06);
          pointer-events: none;
          z-index: 0;
        }

        /* Emerald overlay gradient for lush mood & high readability */
        .impact-bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 35%,
            rgba(16, 76, 58, 0.72) 0%,
            rgba(8, 36, 26, 0.88) 55%,
            rgba(4, 20, 14, 0.95) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .impact-counter-container {
          position: relative;
          z-index: 2;
        }

        /* Controls bar */
        .impact-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .impact-tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #6EE7B7;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(52, 211, 153, 0.3);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-pill);
          letter-spacing: 0.02em;
        }

        .badge-sparkle {
          color: #34D399;
          animation: pulseGlow 2.5s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .flip-action-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .flip-ctrl-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.825rem;
          font-weight: 600;
          color: #E2E8F0;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: var(--radius-pill);
          padding: 0.4rem 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .flip-ctrl-btn:hover {
          background: rgba(16, 185, 129, 0.22);
          border-color: rgba(52, 211, 153, 0.45);
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        .flip-toggle-all {
          background: rgba(16, 185, 129, 0.18);
          border-color: rgba(52, 211, 153, 0.35);
          color: #A7F3D0;
        }

        /* 3D FLIP CARD GRID */
        .counter-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }

        @media (min-width: 640px) {
          .counter-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .counter-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
          }
        }

        /* Flip Box Container (Perspective) */
        .flip-box {
          background-color: transparent;
          height: 275px;
          perspective: 1200px;
          cursor: pointer;
          border-radius: var(--radius-xl);
          outline: none;
        }

        .flip-box:focus-visible {
          box-shadow: 0 0 0 3px #34D399;
        }

        /* 3D Inner Wrapper */
        .flip-box-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: left;
          transition: transform 0.65s cubic-bezier(0.34, 1.25, 0.64, 1);
          transform-style: preserve-3d;
          border-radius: var(--radius-xl);
        }

        /* Horizontal Flip */
        .flip-box.horizontal:hover .flip-box-inner,
        .flip-box.horizontal.is-flipped .flip-box-inner {
          transform: rotateY(180deg);
        }

        /* Vertical Flip */
        .flip-box.vertical:hover .flip-box-inner,
        .flip-box.vertical.is-flipped .flip-box-inner {
          transform: rotateX(180deg);
        }

        /* Both Sides Common */
        .flip-box-side {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.65rem 1.65rem 1.4rem 1.65rem;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* FRONT SIDE STYLING */
        .flip-box-front {
          background: rgba(8, 30, 22, 0.62);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
          transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
        }

        .flip-box:hover .flip-box-front {
          border-color: rgba(52, 211, 153, 0.4);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 25px rgba(16, 185, 129, 0.15);
        }

        .front-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .counter-icon-box {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.12) 100%);
          border: 1px solid rgba(52, 211, 153, 0.35);
          color: #34D399;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
        }

        .front-metric-badge {
          font-size: 0.725rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #A7F3D0;
          background: rgba(16, 185, 129, 0.15);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
          border: 1px solid rgba(52, 211, 153, 0.25);
        }

        .counter-content {
          margin: 1rem 0;
        }

        .counter-number {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.05;
          color: #FFFFFF;
          margin-bottom: 0.45rem;
          letter-spacing: -0.025em;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .counter-label {
          font-size: 1.05rem;
          color: #E2E8F0;
          font-weight: 600;
          line-height: 1.35;
        }

        .flip-prompt-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #94A3B8;
          padding-top: 0.65rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          transition: color var(--transition-fast);
        }

        .flip-box:hover .flip-prompt-pill {
          color: #34D399;
        }

        .flip-icon-spin {
          transition: transform 0.4s ease;
        }

        .flip-box:hover .flip-icon-spin {
          transform: rotate(180deg);
        }

        /* BACK SIDE STYLING */
        .flip-box-back {
          background: rgba(5, 28, 20, 0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(52, 211, 153, 0.45);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(16, 185, 129, 0.08);
        }

        .flip-box.horizontal .flip-box-back {
          transform: rotateY(180deg);
        }

        .flip-box.vertical .flip-box-back {
          transform: rotateX(180deg);
        }

        .back-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #34D399;
          background: rgba(16, 185, 129, 0.18);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-pill);
        }

        .back-return-cue {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.725rem;
          color: #94A3B8;
          font-weight: 500;
        }

        .back-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-top: 0.5rem;
        }

        .back-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 0.15rem;
          line-height: 1.25;
        }

        .back-subtitle {
          font-size: 0.75rem;
          color: #6EE7B7;
          font-weight: 600;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .back-highlights {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-bottom: 0.75rem;
        }

        .back-highlight-row {
          display: flex;
          align-items: baseline;
          gap: 0.55rem;
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .highlight-val {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 0.95rem;
          color: #34D399;
          min-width: 34px;
        }

        .highlight-label {
          color: #CBD5E1;
        }

        .back-note {
          font-size: 0.725rem;
          color: #94A3B8;
          line-height: 1.35;
          margin: 0;
          border-top: 1px dashed rgba(255, 255, 255, 0.12);
          padding-top: 0.45rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
