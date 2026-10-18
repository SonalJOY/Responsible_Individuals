import React, { useRef } from 'react';
import { 
  Target, Wrench, TrendingUp, Users, 
  ArrowRight, Sparkles, CheckCircle2 
} from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

/**
 * WhyVolunteerSection Component (Phase 3B-UI)
 * Interactive, accessible "Why Volunteer With Us?" section.
 * Features:
 * - 4 distinctively styled benefit cards with independent continuous floating animations
 * - Continuous infinite micro-animations for all 4 card theme icons
 * - Card 1 (5.4s), Card 2 (6.2s), Card 3 (5.8s), Card 4 (6.6s) with desynchronized phases
 * - Hover elevation and scale that works smoothly alongside continuous floating
 * - Tactile 2-4px cursor parallax inside cards without React re-renders
 * - Responsive 2x2 / single-column responsive composition
 * - Full prefers-reduced-motion and high-contrast support
 */
export default function WhyVolunteerSection({ onExploreRoles }) {
  const [sectionRef, isVisible] = useScrollReveal({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
    triggerOnce: true,
  });

  // Benefit Cards Configuration
  const benefitCards = [
    {
      id: 'create-impact',
      theme: 'emerald',
      badge: 'Tangible Action',
      title: 'Create Real Impact',
      description: 'Help turn urgent community and environmental needs into verified field results through structured toolkits, clear metrics, and scientific guidance.',
      hoverDetail: 'Structured field drives & measurable outcomes',
      icon: Target,
      accentColor: '#10B981',
      bgLight: '#ECFDF5',
      borderAccent: '#A7F3D0',
      illustrationType: 'ripple',
      iconClass: 'icon-anim-pulse',
    },
    {
      id: 'use-skills',
      theme: 'blue',
      badge: 'Talent Leverage',
      title: 'Use Your Skills',
      description: 'Contribute technical, educational, design, scientific, or logistical abilities directly where grassroots communities benefit from them most.',
      hoverDetail: 'STEM, healthcare, software, communications & logistics',
      icon: Wrench,
      accentColor: '#2563EB',
      bgLight: '#EFF6FF',
      borderAccent: '#BFDBFE',
      illustrationType: 'tools',
      iconClass: 'icon-anim-rotate',
    },
    {
      id: 'learn-grow',
      theme: 'amber',
      badge: 'Personal Growth',
      title: 'Learn & Grow',
      description: 'Develop hands-on leadership, deepen community empathy, and earn verifiable service certificates and hours recognized across institutions.',
      hoverDetail: 'Verified service hours & recognized leadership experience',
      icon: TrendingUp,
      accentColor: '#D97706',
      bgLight: '#FFFBEB',
      borderAccent: '#FDE68A',
      illustrationType: 'growth',
      iconClass: 'icon-anim-growth',
    },
    {
      id: 'build-community',
      theme: 'violet',
      badge: 'Lifelong Network',
      title: 'Build Community',
      description: 'Connect with a passionate network of students, researchers, educators, and working professionals who believe in proactive civic responsibility.',
      hoverDetail: 'Collaborate with 2,500+ active change-makers',
      icon: Users,
      accentColor: '#7C3AED',
      bgLight: '#F5F3FF',
      borderAccent: '#DDD6FE',
      illustrationType: 'network',
      iconClass: 'icon-anim-network',
    },
  ];

  return (
    <section 
      className="why-volunteer-section" 
      ref={sectionRef} 
      id="why-volunteer"
      aria-label="Why Volunteer With Us"
    >
      <div className="container">
        {/* Section Header */}
        <div className={`why-header ${isVisible ? 'revealed' : ''}`}>
          <div className="section-badge why-badge">
            <Sparkles size={14} className="badge-sparkle" />
            <span>Why It Matters</span>
          </div>
          <h2 className="section-title why-title">Why Volunteer With Us?</h2>
          <p className="section-subtitle why-subtitle">
            Your time, skills, and ideas can become meaningful change for communities, students, 
            and the environment. Here is how your contribution creates reciprocal value.
          </p>
        </div>

        {/* 4 Interactive Benefit Cards Grid with Continuous Desynchronized Floating */}
        <div className="why-cards-grid">
          {benefitCards.map((card, index) => (
            <BenefitCard
              key={card.id}
              card={card}
              index={index}
              isSectionVisible={isVisible}
              onExploreRoles={onExploreRoles}
            />
          ))}
        </div>
      </div>

      {/* Scoped CSS Styles */}
      <style>{`
        .why-volunteer-section {
          padding: 6rem 0 5.5rem 0;
          background: #FAFCFB;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--border-subtle);
        }

        /* Ambient Background Blobs */
        .why-volunteer-section::before {
          content: '';
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 380px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(250, 252, 251, 0) 70%);
          pointer-events: none;
          z-index: 0;
        }

        .why-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 3.75rem auto;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .why-header.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .why-badge {
          background: var(--primary-50);
          color: var(--primary-800);
          border: 1px solid var(--primary-100);
          margin-bottom: 0.85rem;
        }

        .why-title {
          font-size: 2.35rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.85rem;
          letter-spacing: -0.02em;
        }

        @media (min-width: 768px) {
          .why-title {
            font-size: 2.85rem;
          }
        }

        .why-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin: 0 auto;
        }

        /* Cards Grid */
        .why-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 768px) {
          .why-cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }

        /* ----------------------------------------------------
           Continuous Floating Wrappers (Desynchronized Phases)
        ----------------------------------------------------- */
        .why-card-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          will-change: transform;
        }

        /* Card 1: 5.4s (Up -> Down -> Up) */
        .why-card-wrapper.float-card-0 {
          animation: whyCardFloat0 5.4s ease-in-out infinite 0s;
        }

        /* Card 2: 6.2s (Down -> Up -> Down, phase offset -2.5s) */
        .why-card-wrapper.float-card-1 {
          animation: whyCardFloat1 6.2s ease-in-out infinite -2.5s;
        }

        /* Card 3: 5.8s (Slightly Up -> Down, phase offset -1.2s) */
        .why-card-wrapper.float-card-2 {
          animation: whyCardFloat2 5.8s ease-in-out infinite -1.2s;
        }

        /* Card 4: 6.6s (Down -> Up, phase offset -3.8s) */
        .why-card-wrapper.float-card-3 {
          animation: whyCardFloat3 6.6s ease-in-out infinite -3.8s;
        }

        @keyframes whyCardFloat0 {
          0%, 100% {
            transform: translate3d(0, 0px, 0);
          }
          50% {
            transform: translate3d(0, -6px, 0);
          }
        }

        @keyframes whyCardFloat1 {
          0%, 100% {
            transform: translate3d(0, 0px, 0);
          }
          50% {
            transform: translate3d(0, 5px, 0);
          }
        }

        @keyframes whyCardFloat2 {
          0%, 100% {
            transform: translate3d(0, -2px, 0);
          }
          50% {
            transform: translate3d(0, -7px, 0);
          }
        }

        @keyframes whyCardFloat3 {
          0%, 100% {
            transform: translate3d(0, 4px, 0);
          }
          50% {
            transform: translate3d(0, -3px, 0);
          }
        }

        /* ----------------------------------------------------
           Individual Benefit Card Inner Box
        ----------------------------------------------------- */
        .why-card {
          width: 100%;
          background: #FFFFFF;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-subtle);
          padding: 2.25rem;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: 
            opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.3s ease;
          opacity: 0;
          transform: translateY(24px) scale(0.98);
          will-change: opacity, transform, box-shadow;
          cursor: default;
        }

        .why-card.card-revealed {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .why-card:hover {
          box-shadow: 0 18px 40px rgba(15, 76, 58, 0.10), 0 2px 8px rgba(0, 0, 0, 0.04);
          transform: translateY(-5px) scale(1.015);
          border-color: var(--card-border-accent, var(--primary-200));
        }

        /* Card Top Row */
        .why-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .why-card-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-pill);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Visual Graphic Container with Cursor Parallax */
        .why-card-visual-wrap {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.2s ease-out;
          transform: translate3d(var(--mouse-x, 0px), var(--mouse-y, 0px), 0);
          flex-shrink: 0;
        }

        .why-card-icon {
          position: relative;
          z-index: 2;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .why-card:hover .why-card-icon {
          transform: scale(1.15);
        }

        /* ----------------------------------------------------
           Continuous Micro-Animation Visuals for Each Theme
        ----------------------------------------------------- */
        /* 1. Ripple Graphic (Impact) */
        .ripple-layer {
          position: absolute;
          inset: -4px;
          border-radius: 20px;
          border: 1.5px solid var(--card-accent, #10B981);
          opacity: 0.25;
          animation: ripplePulse 3.2s ease-out infinite;
          pointer-events: none;
        }

        .ripple-layer.delayed {
          inset: -10px;
          border-radius: 24px;
          animation-delay: 1.6s;
          opacity: 0.15;
        }

        @keyframes ripplePulse {
          0% {
            transform: scale(0.92);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.10);
            opacity: 0.12;
          }
          100% {
            transform: scale(0.92);
            opacity: 0.45;
          }
        }

        /* Continuous subtle pulse on Impact Target Icon */
        .icon-anim-pulse {
          animation: targetPulse 3.2s ease-in-out infinite;
        }

        @keyframes targetPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        /* 2. Gear/Skill Rotation (Skills) */
        .tools-orbit {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          border: 1px dashed var(--card-accent, #2563EB);
          opacity: 0.35;
          animation: toolsSpin 18s linear infinite;
        }

        @keyframes toolsSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Continuous subtle wobble on Skills Wrench Icon */
        .icon-anim-rotate {
          animation: wrenchGentle 4.8s ease-in-out infinite;
        }

        @keyframes wrenchGentle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-6deg);
          }
          75% {
            transform: rotate(6deg);
          }
        }

        /* 3. Growth Pulse (Learn) */
        .growth-spark {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F59E0B;
          box-shadow: 0 0 10px #F59E0B;
          animation: growthSpark 2.6s ease-in-out infinite;
        }

        @keyframes growthSpark {
          0%, 100% {
            transform: scale(0.8) translateY(0);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.3) translateY(-4px);
            opacity: 1;
          }
        }

        /* Continuous subtle upward float on Growth Trending Icon */
        .icon-anim-growth {
          animation: trendFloat 3.4s ease-in-out infinite;
        }

        @keyframes trendFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        /* 4. Network Pulse (Community) */
        .network-node-ring {
          position: absolute;
          inset: -6px;
          border-radius: 22px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(124, 58, 237, 0) 70%);
          animation: networkPulse 3.2s ease-in-out infinite alternate;
        }

        @keyframes networkPulse {
          0% {
            transform: scale(0.92);
            opacity: 0.25;
          }
          100% {
            transform: scale(1.18);
            opacity: 0.70;
          }
        }

        /* Continuous subtle scale on Users Icon */
        .icon-anim-network {
          animation: usersGentleScale 3.6s ease-in-out infinite;
        }

        @keyframes usersGentleScale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }

        /* Card Content */
        .why-card-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.65rem;
          line-height: 1.3;
        }

        .why-card-desc {
          font-size: 0.95rem;
          color: var(--slate-600);
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        /* Card Bottom Hover Detail Strip */
        .why-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.15rem;
          border-top: 1px solid var(--slate-100);
          margin-top: auto;
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--slate-500);
          transition: color 0.25s ease;
        }

        .why-card:hover .why-card-footer {
          color: var(--card-accent, var(--primary-700));
        }

        .footer-detail-text {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          line-height: 1.4;
        }

        .footer-check {
          color: var(--card-accent, #10B981);
          flex-shrink: 0;
        }

        .footer-arrow {
          color: var(--card-accent, var(--primary-600));
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          margin-left: 0.5rem;
        }

        .why-card:hover .footer-arrow {
          transform: translateX(4px);
        }

        /* ----------------------------------------------------
           Accessibility & Prefers Reduced Motion
        ----------------------------------------------------- */
        @media (prefers-reduced-motion: reduce) {
          .why-header,
          .why-card,
          .why-card-wrapper {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
            animation: none !important;
          }

          .why-card:hover {
            transform: none !important;
          }

          .why-card-visual-wrap {
            transform: none !important;
          }

          .why-card-icon,
          .ripple-layer,
          .tools-orbit,
          .growth-spark,
          .network-node-ring {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

/**
 * Individual Benefit Card with Tactile Pointer-Move Parallax and Continuous Floating Wrapper
 */
function BenefitCard({ card, index, isSectionVisible, onExploreRoles }) {
  const cardRef = useRef(null);
  const visualRef = useRef(null);
  const IconComponent = card.icon;

  // Staggered reveal delay: 0ms, 120ms, 240ms, 360ms
  const staggerDelay = `${index * 120}ms`;

  // Tactile Cursor Parallax (without triggering React re-renders)
  const handlePointerMove = (e) => {
    if (!visualRef.current || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const normX = (x / (rect.width / 2)) * 4; // Max 4px shift
    const normY = (y / (rect.height / 2)) * 4;

    visualRef.current.style.setProperty('--mouse-x', `${normX.toFixed(2)}px`);
    visualRef.current.style.setProperty('--mouse-y', `${normY.toFixed(2)}px`);
  };

  const handlePointerLeave = () => {
    if (!visualRef.current) return;
    visualRef.current.style.setProperty('--mouse-x', '0px');
    visualRef.current.style.setProperty('--mouse-y', '0px');
  };

  return (
    <div className={`why-card-wrapper float-card-${index}`}>
      <div
        ref={cardRef}
        className={`why-card ${isSectionVisible ? 'card-revealed' : ''}`}
        style={{
          transitionDelay: staggerDelay,
          '--card-accent': card.accentColor,
          '--card-border-accent': card.borderAccent,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Card Header Top */}
        <div className="why-card-top">
          <span 
            className="why-card-badge"
            style={{ 
              backgroundColor: card.bgLight, 
              color: card.accentColor,
              border: `1px solid ${card.borderAccent}`,
            }}
          >
            {card.badge}
          </span>

          {/* Micro-Animated Visual Graphic */}
          <div 
            ref={visualRef}
            className="why-card-visual-wrap"
            style={{ 
              backgroundColor: card.bgLight,
              border: `1px solid ${card.borderAccent}`,
            }}
            aria-hidden="true"
          >
            {card.illustrationType === 'ripple' && (
              <>
                <div className="ripple-layer" />
                <div className="ripple-layer delayed" />
              </>
            )}

            {card.illustrationType === 'tools' && (
              <div className="tools-orbit" />
            )}

            {card.illustrationType === 'growth' && (
              <div className="growth-spark" />
            )}

            {card.illustrationType === 'network' && (
              <div className="network-node-ring" />
            )}

            <IconComponent 
              size={24} 
              color={card.accentColor} 
              className={`why-card-icon ${card.iconClass || ''}`} 
            />
          </div>
        </div>

        {/* Card Body */}
        <h3 className="why-card-title">{card.title}</h3>
        <p className="why-card-desc">{card.description}</p>

        {/* Card Footer Detail */}
        <div className="why-card-footer">
          <div className="footer-detail-text">
            <CheckCircle2 size={14} className="footer-check" />
            <span>{card.hoverDetail}</span>
          </div>
          <ArrowRight size={15} className="footer-arrow" />
        </div>
      </div>
    </div>
  );
}
