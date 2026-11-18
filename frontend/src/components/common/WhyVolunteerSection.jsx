import React, { useState, useRef } from 'react';
import { 
  Target, Wrench, Users, 
  ArrowRight, ChevronLeft, ChevronRight,
  Sprout, BarChart2, ShieldCheck, BookOpen,
  Cpu, Heart, Compass, Calendar, Award
} from 'lucide-react';

/**
 * WhyVolunteerSection Component
 * Exact Visual Match to Approved Reference Design
 * 
 * Features:
 * - Header: Warm ivory background, outlined saffron pill "WHY IT MATTERS",
 *   large centered serif heading with "Volunteer" highlighted in saffron, two-line supporting description.
 * - Left Navigation: Vertical line connecting small circular nodes (active saffron with amber glow, inactive neutral),
 *   oversized serif numerals (01–04) in Playfair Display, generous vertical spacing,
 *   active item with restrained warm cream background and subtle golden border, muted inactive typography.
 * - Center Content: Category pill badge with icon, large bold serif title with saffron underline,
 *   descriptive text, three vertical supporting rows with circular pale saffron icon bubbles, bold title & subtext,
 *   rounded orange "Explore Opportunities →" button.
 * - Right Photo Stack: Wider landscape-oriented 3-layer fanned photo stack with slight counterclockwise tilt on front image
 *   and progressive clockwise rotations & opacity on background layers. White circular Prev/Next control with saffron chevrons.
 *   Handwritten script caption ("Individuals creating brighter communities") in Caveat font with curved decorative saffron swoop.
 * - Dynamic interactive switching on hover & click (desktop), tap (mobile), keyboard navigation, and prefers-reduced-motion.
 */

const BENEFIT_PILLARS = [
  {
    number: '01',
    id: 'create-impact',
    navTitle: 'Create\nReal Impact',
    heading: 'Create Real\nImpact',
    badge: 'TANGIBLE ACTION',
    badgeTheme: 'green',
    description: 'Help turn urgent community and environmental needs into verified field results through structured toolkits, clear metrics, and scientific guidance.',
    points: [
      {
        icon: Sprout,
        title: 'Contribute to real field projects',
        desc: 'Join environment restoration and community initiatives.',
      },
      {
        icon: BarChart2,
        title: 'See measurable outcomes',
        desc: 'Work with structured toolkits and clear metrics.',
      },
      {
        icon: Users,
        title: 'Be part of meaningful change',
        desc: 'Your work directly supports communities and the environment.',
      },
    ],
    photos: [
      {
        src: '/images/stories/varthur-volunteers-desilting.jpg',
        alt: 'Volunteers planting saplings and restoring field terrain',
      },
      {
        src: '/images/environment_image.jpeg',
        alt: 'Community sapling drive in peri-urban tract',
      },
      {
        src: '/images/stories/citizen-water-monitoring.jpg',
        alt: 'Citizen water quality testing field initiative',
      },
    ],
  },
  {
    number: '02',
    id: 'use-skills',
    navTitle: 'Use\nYour Skills',
    heading: 'Use Your\nSkills',
    badge: 'TALENT LEVERAGE',
    badgeTheme: 'blue',
    description: 'Contribute technical, educational, design, scientific, or logistical abilities directly where grassroots communities benefit from them most.',
    points: [
      {
        icon: Cpu,
        title: 'Apply specialized talent',
        desc: 'Software, telemetry, spatial mapping, and engineering.',
      },
      {
        icon: BookOpen,
        title: 'Teach & mentor students',
        desc: 'Digital literacy and STEM learning toolkits in rural schools.',
      },
      {
        icon: Wrench,
        title: 'Communications & logistics',
        desc: 'Visual design, field operations planning, and storytelling.',
      },
    ],
    photos: [
      {
        src: '/images/volunteer/use-your-skills.jpg',
        alt: 'Volunteers painting a creative wall mural with paintbrushes',
        objectPosition: 'center 60%',
      },
      {
        src: '/images/students_art.jpeg',
        alt: 'Student creative expression and arts circle',
      },
      {
        src: '/images/whatwedo1.avif',
        alt: 'Field volunteer action initiative',
      },
    ],
  },
  {
    number: '03',
    id: 'learn-grow',
    navTitle: 'Learn\n& Grow',
    heading: 'Learn\n& Grow',
    badge: 'PERSONAL GROWTH',
    badgeTheme: 'amber',
    description: 'Develop hands-on leadership, deepen community empathy, and earn verifiable service certificates and hours recognized across institutions.',
    points: [
      {
        icon: Award,
        title: 'Earn recognized service credits',
        desc: 'Verified certificates and logged hours for academic recognition.',
      },
      {
        icon: Compass,
        title: 'Develop squad leadership',
        desc: 'Lead small teams, facilitate field safety, and solve real issues.',
      },
      {
        icon: Heart,
        title: 'Deepen civic empathy',
        desc: 'Gain firsthand perspective on grassroots community realities.',
      },
    ],
    photos: [
      {
        src: '/images/volunteer/learn-and-grow.jpeg',
        alt: 'Volunteer mentoring a student while painting a wall',
        objectPosition: 'center 40%',
      },
      {
        src: '/images/Bharath.jpeg',
        alt: 'Field operations team coordinator',
      },
      {
        src: '/images/stories/varthur-blooming-wetland.jpg',
        alt: 'Restored community wetland ecosystem',
      },
    ],
  },
  {
    number: '04',
    id: 'build-community',
    navTitle: 'Build\nCommunity',
    heading: 'Build\nCommunity',
    badge: 'LIFELONG NETWORK',
    badgeTheme: 'violet',
    description: 'Connect with a passionate community of students, educators, professionals, and neighbors working together for community stewardship.',
    points: [
      {
        icon: Users,
        title: 'Diverse peer collective',
        desc: 'Collaborate with students, researchers, engineers, and mentors.',
      },
      {
        icon: Calendar,
        title: 'Regular meetups & roundtables',
        desc: 'Participate in civic forums, weekend drives, and ideation sessions.',
      },
      {
        icon: ShieldCheck,
        title: 'Lifelong civic friendships',
        desc: 'Build lasting bonds rooted in shared purpose and local impact.',
      },
    ],
    photos: [
      {
        src: '/images/volunteer/build-community.jpg',
        alt: 'Volunteers attending a community session with speaker and banner',
        objectPosition: 'center 40%',
      },
      {
        src: '/images/whatwedo2.avif',
        alt: 'Community coordination meetup',
      },
      {
        src: '/images/whatwedo3.jpg',
        alt: 'Volunteers collaborating on neighborhood improvement',
      },
    ],
  },
];

export default function WhyVolunteerSection({ onExploreRoles }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navBtnRefs = useRef([]);

  const current = BENEFIT_PILLARS[activeIndex] || BENEFIT_PILLARS[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + BENEFIT_PILLARS.length) % BENEFIT_PILLARS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % BENEFIT_PILLARS.length);
  };

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % BENEFIT_PILLARS.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + BENEFIT_PILLARS.length) % BENEFIT_PILLARS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = BENEFIT_PILLARS.length - 1;
    }

    if (nextIndex !== null) {
      setActiveIndex(nextIndex);
      navBtnRefs.current[nextIndex]?.focus();
    }
  };

  const handleExploreClick = () => {
    if (typeof onExploreRoles === 'function') {
      onExploreRoles();
    } else {
      const el = document.getElementById('opportunities');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section 
      className="exact-match-why-section" 
      id="why-volunteer"
      aria-label="Why Volunteer With Us"
    >
      <div className="exact-match-container">
        
        {/* ========================================================
            1. SECTION HEADER (Centered badge, title & subtitle)
            ======================================================== */}
        <div className="exact-match-header">
          
          {/* Small rounded outlined saffron pill */}
          <div className="why-pill-badge">
            <svg 
              className="why-pill-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" />
            </svg>
            <span>WHY IT MATTERS</span>
          </div>

          {/* Large centered serif heading with "Volunteer" in saffron */}
          <h2 className="why-main-title">
            Why <span className="saffron-word">Volunteer</span> With Us?
          </h2>

          {/* Centered two-line supporting description */}
          <p className="why-main-subtitle">
            Your time, skills, and ideas can become meaningful change for communities, students,<br className="desktop-break" />
            and the environment. Here is how your contribution creates reciprocal value.
          </p>
        </div>

        {/* ========================================================
            2. THREE-PART MAIN COMPOSITION
            ======================================================== */}
        <div className="exact-match-grid">
          
          {/* --------------------------------------------------------
              LEFT NAVIGATION (Vertical rail, markers, serif numbers)
              -------------------------------------------------------- */}
          <div 
            className="left-nav-track"
            role="tablist"
            aria-label="Pillars of Volunteering"
            aria-orientation="vertical"
          >
            {/* Very thin continuous vertical neutral line */}
            <div className="nav-vertical-rail" aria-hidden="true" />

            {BENEFIT_PILLARS.map((pillar, idx) => {
              const isActive = activeIndex === idx;

              return (
                <div 
                  key={pillar.id}
                  className={`nav-item-row ${isActive ? 'is-active' : ''}`}
                >
                  {/* Small circular marker on the line (active = saffron with glow, inactive = pale neutral) */}
                  <div 
                    className={`nav-marker-node ${isActive ? 'active-node' : ''}`}
                    aria-hidden="true"
                  />

                  {/* Clickable / hoverable option card */}
                  <button
                    ref={(el) => { navBtnRefs.current[idx] = el; }}
                    type="button"
                    role="tab"
                    id={`why-tab-${pillar.id}`}
                    aria-selected={isActive}
                    aria-controls={`why-panel-${pillar.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`nav-option-btn ${isActive ? 'active-btn' : ''}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => setActiveIndex(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                  >
                    <span className="nav-serif-num">{pillar.number}</span>
                    <span className="nav-label-multiline">
                      {pillar.navTitle.split('\n').map((line, lIdx) => (
                        <span key={lIdx} className="label-line">{line}</span>
                      ))}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* --------------------------------------------------------
              CENTER CONTENT (Category pill, bold serif title, underline, points, button)
              -------------------------------------------------------- */}
          <div 
            className="center-content-panel"
            id={`why-panel-${current.id}`}
            role="tabpanel"
            aria-labelledby={`why-tab-${current.id}`}
            key={current.id}
          >
            {/* Category label with icon */}
            <div className={`center-cat-badge badge-${current.badgeTheme}`}>
              <Target size={13} className="cat-badge-icon" />
              <span>{current.badge}</span>
            </div>

            {/* Large bold serif heading */}
            <h3 className="center-serif-title">
              {current.heading.split('\n').map((line, lIdx) => (
                <span key={lIdx} className="title-block-line">{line}</span>
              ))}
            </h3>

            {/* Thin saffron underline beneath the heading */}
            <div className="saffron-underline-bar" aria-hidden="true" />

            {/* Short description */}
            <p className="center-description-text">
              {current.description}
            </p>

            {/* Three vertically arranged supporting points */}
            <div className="supporting-points-list">
              {current.points.map((pt, pIdx) => {
                const PtIcon = pt.icon;
                return (
                  <div key={pIdx} className="point-row-item">
                    <div className="point-icon-bubble" aria-hidden="true">
                      <PtIcon size={17} />
                    </div>
                    <div className="point-text-block">
                      <h4 className="point-bold-title">{pt.title}</h4>
                      <p className="point-sub-text">{pt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Orange rounded "Explore Opportunities →" button */}
            <div className="center-action-row">
              <button
                type="button"
                className="exact-explore-btn"
                onClick={handleExploreClick}
                aria-label="Explore active volunteer opportunities"
              >
                <span>Explore Opportunities</span>
                <ArrowRight size={16} className="btn-arrow" />
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------
              RIGHT IMAGE COMPOSITION (Layered landscape photo stack & handwritten script)
              -------------------------------------------------------- */}
          <div className="right-composition-wrap">
            
            {/* The 3-layer fanned landscape photo stack */}
            <div className="photo-stack-stage">
              
              {/* Back Photo Layer 3 (deepest layer, tilted right) */}
              <div className="photo-card-layer layer-back" aria-hidden="true">
                <img 
                  src={current.photos[2]?.src || current.photos[0].src} 
                  alt="" 
                  className="card-stack-img" 
                  loading="lazy"
                  style={current.photos[2]?.objectPosition ? { objectPosition: current.photos[2].objectPosition } : undefined}
                />
              </div>

              {/* Middle Photo Layer 2 (middle layer, tilted slightly) */}
              <div className="photo-card-layer layer-middle" aria-hidden="true">
                <img 
                  src={current.photos[1]?.src || current.photos[0].src} 
                  alt="" 
                  className="card-stack-img" 
                  loading="lazy"
                  style={current.photos[1]?.objectPosition ? { objectPosition: current.photos[1].objectPosition } : undefined}
                />
              </div>

              {/* Front Photo Layer 1 (main sharp photograph with counterclockwise tilt) */}
              <div className="photo-card-layer layer-front">
                <img 
                  src={current.photos[0].src} 
                  alt={current.photos[0].alt} 
                  className="card-stack-img front-img" 
                  style={current.photos[0]?.objectPosition ? { objectPosition: current.photos[0].objectPosition } : undefined}
                />

                {/* Subtle dark gradient near bottom */}
                <div className="front-gradient-vignette" />

                {/* White circular Prev/Next control near bottom-right with saffron chevrons */}
                <div className="photo-carousel-controls" aria-label="Photo carousel controls">
                  <button
                    type="button"
                    className="chevron-control-btn"
                    onClick={handlePrev}
                    aria-label="Previous volunteer pillar"
                  >
                    <ChevronLeft size={16} color="#D97706" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    className="chevron-control-btn"
                    onClick={handleNext}
                    aria-label="Next volunteer pillar"
                  >
                    <ChevronRight size={16} color="#D97706" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

            </div>

            {/* Handwritten script caption and decorative saffron curved swoop */}
            <div className="script-caption-container" aria-hidden="true">
              <span className="script-caption-text">
                Individuals creating<br />brighter communities
              </span>
              <svg 
                className="script-saffron-swoosh" 
                viewBox="0 0 210 26" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M6 10C68 24 154 24 204 6" 
                  stroke="#E5A642" 
                  strokeWidth="2.4" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>

          </div>

        </div>

      </div>

      {/* Scoped CSS with exact visual matching tokens */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400&display=swap');

        .exact-match-why-section {
          padding: 5.5rem 0 6.5rem 0;
          background: #FAF8F2; /* Warm ivory/cream background */
          position: relative;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          color: #18181B;
        }

        .exact-match-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 1.5rem;
          position: relative;
          z-index: 2;
        }

        /* -------------------------------------------------------------
           1. SECTION HEADER
           ------------------------------------------------------------- */
        .exact-match-header {
          text-align: center;
          margin-bottom: 4.25rem;
          opacity: 1;
        }

        /* Pill Badge: "WHY IT MATTERS" */
        .why-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #FFF9EE;
          border: 1.5px solid #F59E0B;
          border-radius: 9999px;
          padding: 0.32rem 1.05rem;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #B45309;
          margin-bottom: 1.15rem;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
        }

        .why-pill-icon {
          width: 13px;
          height: 13px;
          color: #D97706;
        }

        /* Main Serif Title with saffron highlight */
        .why-main-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.85rem;
          font-weight: 800;
          color: #171717;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 0.9rem;
        }

        @media (min-width: 768px) {
          .why-main-title {
            font-size: 3.4rem;
          }
        }

        .why-main-title .saffron-word {
          color: #D97706;
          font-style: normal;
        }

        /* Subtitle */
        .why-main-subtitle {
          font-size: 1rem;
          color: #52525B;
          line-height: 1.65;
          max-width: 680px;
          margin: 0 auto;
        }

        .desktop-break {
          display: none;
        }
        @media (min-width: 768px) {
          .desktop-break {
            display: inline;
          }
        }

        /* -------------------------------------------------------------
           2. THREE-PART MAIN LAYOUT GRID
           ------------------------------------------------------------- */
        .exact-match-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
        }

        @media (min-width: 992px) {
          .exact-match-grid {
            grid-template-columns: 240px 1fr 490px;
            gap: 2.75rem;
          }
        }

        @media (min-width: 1200px) {
          .exact-match-grid {
            grid-template-columns: 250px 1fr 510px;
            gap: 3.5rem;
          }
        }

        /* -------------------------------------------------------------
           LEFT NAVIGATION (Vertical rail, markers, large serif numbers)
           ------------------------------------------------------------- */
        .left-nav-track {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
          padding-left: 1.5rem;
        }

        @media (max-width: 991px) {
          .left-nav-track {
            padding-left: 0;
            flex-direction: row;
            overflow-x: auto;
            gap: 1rem;
            padding-bottom: 0.5rem;
          }
        }

        /* Thin continuous vertical rail */
        .nav-vertical-rail {
          position: absolute;
          left: 5px;
          top: 26px;
          bottom: 26px;
          width: 1.5px;
          background: #E5E7EB;
          z-index: 1;
        }

        @media (max-width: 991px) {
          .nav-vertical-rail {
            display: none;
          }
        }

        .nav-item-row {
          position: relative;
          display: flex;
          align-items: center;
          z-index: 2;
        }

        /* Small circular marker node */
        .nav-marker-node {
          position: absolute;
          left: -1.5rem;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #E5E7EB;
          border: 1.5px solid #D1D5DB;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 991px) {
          .nav-marker-node {
            display: none;
          }
        }

        .nav-marker-node.active-node {
          width: 11px;
          height: 11px;
          background: #D97706;
          border-color: #F59E0B;
          box-shadow: 0 0 10px rgba(217, 119, 6, 0.6);
        }

        /* Option Button */
        .nav-option-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: transparent;
          border: 1.5px solid transparent;
          border-radius: 16px;
          padding: 0.85rem 1.2rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          color: #71717A;
        }

        @media (max-width: 991px) {
          .nav-option-btn {
            white-space: nowrap;
            min-width: 165px;
            background: #FFFFFF;
            border-color: #E8E1D5;
          }
        }

        .nav-option-btn:focus-visible {
          outline: 2px solid #D97706;
          outline-offset: 3px;
        }

        /* Active Option Button Card (Cream tint, gold border, spacious) */
        .nav-option-btn.active-btn {
          background: #FFFDF7;
          border-color: #FDE68A;
          box-shadow: 0 6px 20px rgba(217, 119, 6, 0.08);
          padding: 1.1rem 1.45rem;
        }

        /* Large Serif Numeral (Oversized serif typography) */
        .nav-serif-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 3.25rem;
          font-weight: 700;
          line-height: 0.95;
          color: #A1A1AA;
          transition: color 0.25s ease;
          letter-spacing: -0.03em;
        }

        .nav-option-btn.active-btn .nav-serif-num {
          color: #D97706;
        }

        /* Two-line benefit title */
        .nav-label-multiline {
          display: flex;
          flex-direction: column;
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.25;
          color: #71717A;
          transition: color 0.25s ease;
        }

        .label-line {
          display: block;
        }

        .nav-option-btn.active-btn .nav-label-multiline {
          color: #18181B;
        }

        @media (hover: hover) and (pointer: fine) {
          .nav-option-btn:hover:not(.active-btn) .nav-serif-num {
            color: #D97706;
          }
          .nav-option-btn:hover:not(.active-btn) .nav-label-multiline {
            color: #27272A;
          }
        }

        /* -------------------------------------------------------------
           CENTER CONTENT
           ------------------------------------------------------------- */
        .center-content-panel {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          animation: contentSlideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes contentSlideFade {
          from {
            opacity: 0.6;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Category Label */
        .center-cat-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.28rem 0.8rem;
          border-radius: 9999px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.95rem;
        }

        .cat-badge-icon {
          flex-shrink: 0;
        }

        .center-cat-badge.badge-green {
          background: #DCFCE7;
          border: 1px solid #86EFAC;
          color: #166534;
        }

        .center-cat-badge.badge-blue {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #1E40AF;
        }

        .center-cat-badge.badge-amber {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          color: #92400E;
        }

        .center-cat-badge.badge-violet {
          background: #F5F3FF;
          border: 1px solid #DDD6FE;
          color: #5B21B6;
        }

        /* Large Bold Serif Heading */
        .center-serif-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.85rem;
          font-weight: 800;
          color: #18181B;
          line-height: 1.12;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .title-block-line {
          display: block;
        }

        /* Thin Saffron Underline Bar */
        .saffron-underline-bar {
          width: 52px;
          height: 3.5px;
          background: #D97706;
          border-radius: 2px;
          margin-top: 0.75rem;
          margin-bottom: 1.25rem;
        }

        /* Paragraph Description */
        .center-description-text {
          font-size: 0.95rem;
          color: #52525B;
          line-height: 1.65;
          max-width: 440px;
          margin-bottom: 1.75rem;
        }

        /* Supporting Points */
        .supporting-points-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
          width: 100%;
        }

        .point-row-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        /* Circular Saffron-Tinted Icon Bubble */
        .point-icon-bubble {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #FEF3C7;
          color: #D97706;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .point-text-block {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .point-bold-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #18181B;
          margin: 0;
          line-height: 1.35;
        }

        .point-sub-text {
          font-size: 0.825rem;
          color: #71717A;
          margin: 0;
          line-height: 1.45;
        }

        /* Orange Rounded "Explore Opportunities →" button */
        .center-action-row {
          display: flex;
        }

        .exact-explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: #D97706;
          color: #FFFFFF;
          font-size: 0.92rem;
          font-weight: 700;
          padding: 0.78rem 1.75rem;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);
          transition: transform 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease;
        }

        .exact-explore-btn:hover {
          background: #B45309;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(217, 119, 6, 0.45);
        }

        .exact-explore-btn:focus-visible {
          outline: 2px solid #D97706;
          outline-offset: 3px;
        }

        .btn-arrow {
          transition: transform 0.25s ease;
        }

        .exact-explore-btn:hover .btn-arrow {
          transform: translateX(3px);
        }

        /* -------------------------------------------------------------
           RIGHT IMAGE COMPOSITION (Landscape Layered Photo Stack & Script Caption)
           ------------------------------------------------------------- */
        .right-composition-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        /* Wider landscape-oriented image frame */
        .photo-stack-stage {
          position: relative;
          width: 440px;
          height: 360px;
          margin-right: 55px; /* Offset for fanned cards to the right */
        }

        @media (min-width: 1200px) {
          .photo-stack-stage {
            width: 460px;
            height: 380px;
            margin-right: 60px;
          }
        }

        @media (max-width: 991px) {
          .photo-stack-stage {
            width: 100%;
            max-width: 380px;
            height: 310px;
            margin: 0 auto;
          }
        }

        .photo-card-layer {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
          background: #171717;
        }

        .card-stack-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Layer 3: Backmost card, tilted further clockwise */
        .photo-card-layer.layer-back {
          transform: rotate(7.8deg) translateX(48px) translateY(18px);
          opacity: 0.62;
          filter: brightness(0.92);
          z-index: 1;
        }

        /* Layer 2: Middle card, tilted clockwise */
        .photo-card-layer.layer-middle {
          transform: rotate(3.8deg) translateX(24px) translateY(9px);
          opacity: 0.82;
          filter: brightness(0.96);
          z-index: 2;
        }

        /* Layer 1: Front card, slight counterclockwise tilt matching reference */
        .photo-card-layer.layer-front {
          transform: rotate(-1.8deg);
          opacity: 1;
          z-index: 3;
          box-shadow: 0 20px 42px rgba(0, 0, 0, 0.18);
        }

        .front-gradient-vignette {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 65%, rgba(0, 0, 0, 0.4) 100%);
          pointer-events: none;
        }

        /* White circular Prev/Next control with saffron chevrons */
        .photo-carousel-controls {
          position: absolute;
          bottom: 1.25rem;
          right: 1.25rem;
          background: #FFFFFF;
          border-radius: 9999px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.22);
          padding: 0.35rem 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          z-index: 5;
        }

        .chevron-control-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem;
          border-radius: 50%;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .chevron-control-btn:hover {
          background: #FFF7ED;
          transform: scale(1.1);
        }

        .chevron-control-btn:focus-visible {
          outline: 2px solid #D97706;
        }

        /* Handwritten script caption and decorative swoosh */
        .script-caption-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 1.5rem;
          text-align: center;
        }

        .script-caption-text {
          font-family: 'Caveat', cursive;
          font-size: 1.4rem;
          font-weight: 700;
          color: #78716C;
          line-height: 1.25;
        }

        .script-saffron-swoosh {
          width: 190px;
          height: 22px;
          margin-top: -0.15rem;
          display: block;
        }

        /* -------------------------------------------------------------
           RESPONSIVE ADAPTATIONS
           ------------------------------------------------------------- */
        @media (max-width: 991px) {
          .exact-match-why-section {
            padding: 4rem 0 5rem 0;
          }

          .why-main-title {
            font-size: 2.4rem;
          }

          .center-serif-title {
            font-size: 2.2rem;
          }

          .photo-stack-stage {
            margin: 0 auto;
          }

          .script-caption-container {
            margin-top: 1.5rem;
          }
        }

        /* -------------------------------------------------------------
           ACCESSIBILITY: prefers-reduced-motion
           ------------------------------------------------------------- */
        @media (prefers-reduced-motion: reduce) {
          .center-content-panel,
          .photo-card-layer,
          .exact-explore-btn,
          .nav-option-btn {
            transition: none !important;
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }

          .photo-card-layer.layer-back,
          .photo-card-layer.layer-middle {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
