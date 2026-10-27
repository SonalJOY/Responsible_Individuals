import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, Home, Users, HeartHandshake, Droplet, Building2, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { impactService } from '../../services/api';

const iconMap = {
  Award,
  Home,
  Users,
  HeartHandshake,
  Droplet,
  Building2,
};

// Stable Count-Up Animation Hook with layout-shift prevention & reduced-motion support
function useCountUp(targetVal, duration = 1600, start = false) {
  const [count, setCount] = useState(0);

  const num = useMemo(() => {
    if (typeof targetVal === 'number') return targetVal;
    return parseInt(String(targetVal || '0').replace(/[^0-9]/g, ''), 10) || 0;
  }, [targetVal]);

  useEffect(() => {
    if (!start) return;

    // Respect reduced-motion preferences immediately
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(num);
      return;
    }

    if (num <= 0) {
      setCount(0);
      return;
    }

    let startTime = null;
    let animationFrameId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Smooth exponential easing out curve: prevents sudden jumps
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * num));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(num);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [num, duration, start]);

  return count;
}

function StatItem({ item, inView }) {
  const rawNum = item.raw_number !== undefined
    ? item.raw_number
    : parseInt(String(item.counter_value || '0').replace(/[^0-9]/g, ''), 10) || 0;

  const count = useCountUp(rawNum, 1600, inView);
  const IconComp = iconMap[item.icon_name] || Award;

  const suffix = item.suffix || (typeof item.counter_value === 'string'
    ? item.counter_value.replace(/^[0-9,.\s]+/, '')
    : '+') || '+';

  // Format displayed number with commas for readability
  const displayFormatted = inView 
    ? (rawNum >= 1000 ? count.toLocaleString('en-IN') : count)
    : '0';

  return (
    <div 
      className="editorial-stat-card"
      aria-label={`${item.title}: ${item.counter_value || rawNum}`}
    >
      <div className="stat-icon-halo">
        <IconComp size={24} />
      </div>

      <div className="stat-huge-number">
        {displayFormatted}
        <span className="stat-suffix">{suffix}</span>
      </div>

      <div className="stat-label-text">{item.title}</div>
    </div>
  );
}

export default function ImpactStats() {
  const [stats, setStats] = useState([]);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await impactService.getStatistics();
        if (data && data.length > 0) {
          setStats(data);
        } else {
          throw new Error('Empty stats');
        }
      } catch {
        // Fallback to verified project statistics from database seed
        setStats([
          { key: 'lives_impacted', title: 'Lives Transformed', counter_value: '50,000+', raw_number: 50000, suffix: '+', icon_name: 'Users' },
          { key: 'communities_reached', title: 'Communities Reached', counter_value: '120+', raw_number: 120, suffix: '+', icon_name: 'Home' },
          { key: 'projects_completed', title: 'Projects Completed', counter_value: '50+', raw_number: 50, suffix: '+', icon_name: 'Award' },
          { key: 'active_volunteers', title: 'Active Volunteers', counter_value: '2,500+', raw_number: 2500, suffix: '+', icon_name: 'HeartHandshake' },
        ]);
      }
    }
    fetchStats();
  }, []);

  // IntersectionObserver to trigger animation ONCE without repeated glitchy restarts
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Check if element is already in viewport on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Fixed: disconnect immediately to prevent repeated triggers
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Volunteer stat item
  const volunteerStat = stats.find((s) => s.key === 'active_volunteers') || {
    counter_value: '2,500+',
    raw_number: 2500,
    title: 'Active Volunteers',
  };

  const volunteerCountAnimated = useCountUp(volunteerStat.raw_number || 2500, 1600, inView);

  return (
    <section ref={sectionRef} className="impact-editorial-section" aria-label="Real-Time Impact Metrics">
      <div className="container">
        {/* Centered Editorial Header */}
        <div className="impact-header-center">
          <div className="impact-eyebrow-pill">
            <TrendingUp size={14} className="text-accent" />
            <span>Our Impact</span>
          </div>

          <h2 className="impact-main-heading">
            Together, We're Making a Difference
          </h2>

          <p className="impact-sub-description">
            Verifiable, transparent grassroots data reflecting thousands of citizens and communities taking direct ownership of water, ecosystems, and rural classrooms.
          </p>
        </div>

        {/* Large Numbers Showcase Grid */}
        <div className="editorial-stats-grid">
          {stats.slice(0, 4).map((item, idx) => (
            <StatItem key={item.id || item.key || idx} item={item} inView={inView} />
          ))}
        </div>

        {/* Prominent Volunteer Count Display Ribbon (Requirement 4) */}
        <div className="volunteer-prominent-ribbon">
          <div className="volunteer-ribbon-left">
            <div className="volunteer-ribbon-badge">
              <Sparkles size={14} className="text-accent" />
              <span>CITIZEN MOBILIZATION NETWORK</span>
            </div>
            <div className="volunteer-count-hero">
              <span className="volunteer-count-number">
                {inView ? volunteerCountAnimated.toLocaleString('en-IN') : '0'}
                <span className="volunteer-count-plus">+</span>
              </span>
              <div className="volunteer-count-text">
                <span className="volunteer-count-heading">Verified Grassroots Volunteers</span>
                <span className="volunteer-count-subtext">
                  Contributing over <strong>120,000+ verified service hours</strong> across 42 college chapters and corporate CSR alliances.
                </span>
              </div>
            </div>
          </div>

          <div className="volunteer-ribbon-right">
            <Link to="/volunteer" className="volunteer-join-btn">
              <HeartHandshake size={18} />
              <span>Become a Volunteer</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .impact-editorial-section {
          background-color: transparent;
          padding: 6rem 0;
          position: relative;
        }
        .impact-header-center {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 4.5rem auto;
        }
        .impact-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--secondary-blue-light, #F0F9FF);
          border: 1px solid rgba(14, 165, 233, 0.25);
          color: var(--secondary-light-blue-hover, #0284C7);
          padding: 0.4rem 1.1rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .impact-eyebrow-pill .text-accent {
          color: var(--primary-saffron, #F97316);
        }
        .impact-main-heading {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary, #0F172A);
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .impact-main-heading {
            font-size: 3.5rem;
          }
        }
        .impact-sub-description {
          font-size: 1.1rem;
          color: var(--text-secondary, #475569);
          line-height: 1.65;
        }
        .editorial-stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 3.5rem;
        }
        @media (min-width: 640px) {
          .editorial-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.5rem 2rem;
          }
        }
        @media (min-width: 1024px) {
          .editorial-stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
          }
        }
        .editorial-stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2.5rem 1.75rem;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.84);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease, background-color 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .editorial-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: transparent;
          transition: background 0.28s ease;
        }
        .editorial-stat-card:hover {
          transform: translateY(-6px) scale(1.015);
          box-shadow: 0 20px 40px rgba(249, 115, 22, 0.12), 0 4px 12px rgba(15, 23, 42, 0.05);
          border-color: rgba(249, 115, 22, 0.4);
          background: rgba(255, 255, 255, 0.96);
        }
        .editorial-stat-card:hover::before {
          background: linear-gradient(90deg, var(--primary-saffron, #F97316), var(--secondary-light-blue, #0EA5E9));
        }
        .stat-icon-halo {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-pill);
          background: rgba(14, 165, 233, 0.12);
          color: var(--secondary-light-blue, #0EA5E9);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.35rem;
          transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
        }
        .editorial-stat-card:hover .stat-icon-halo {
          transform: scale(1.12) rotate(4deg);
          background: var(--primary-saffron, #F97316);
          color: #FFFFFF;
          box-shadow: 0 8px 18px rgba(249, 115, 22, 0.35);
        }

        /* Fixed: Tabular numbers prevent jitter/layout-shift during animation */
        .stat-huge-number {
          font-family: var(--font-heading);
          font-size: 3.25rem;
          font-weight: 800;
          line-height: 1.1;
          color: var(--primary-saffron, #F97316);
          margin-bottom: 0.65rem;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          min-height: 3.6rem;
          display: flex;
          align-items: baseline;
          justify-content: center;
        }
        @media (min-width: 1200px) {
          .stat-huge-number {
            font-size: 3.85rem;
            min-height: 4.2rem;
          }
        }
        .stat-suffix {
          font-size: 0.65em;
          color: var(--primary-saffron-hover, #EA580C);
          font-weight: 800;
          margin-left: 3px;
        }
        .stat-label-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary, #0F172A);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Prominent Total Volunteer Count Display Ribbon */
        .volunteer-prominent-ribbon {
          background: linear-gradient(135deg, rgba(253, 251, 247, 0.92) 0%, rgba(248, 244, 236, 0.86) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-left: 5px solid var(--primary-saffron, #F97316);
          border-radius: 20px;
          padding: 2rem 2.5rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          align-items: flex-start;
          justify-content: space-between;
        }
        @media (min-width: 992px) {
          .volunteer-prominent-ribbon {
            flex-direction: row;
            align-items: center;
            padding: 2.25rem 3rem;
          }
        }
        .volunteer-ribbon-left {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 750px;
        }
        .volunteer-ribbon-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--primary-saffron, #F97316);
          text-transform: uppercase;
        }
        .volunteer-count-hero {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        @media (min-width: 640px) {
          .volunteer-count-hero {
            flex-direction: row;
            align-items: baseline;
            gap: 1.5rem;
          }
        }
        .volunteer-count-number {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          line-height: 1;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.03em;
        }
        .volunteer-count-plus {
          color: var(--primary-saffron, #F97316);
          margin-left: 2px;
        }
        .volunteer-count-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .volunteer-count-heading {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
        }
        .volunteer-count-subtext {
          font-size: 0.95rem;
          color: var(--text-secondary, #475569);
          line-height: 1.5;
        }
        .volunteer-join-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          background: var(--primary-saffron, #F97316);
          color: #FFFFFF;
          padding: 0.9rem 1.8rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .volunteer-join-btn:hover {
          background: var(--primary-saffron-hover, #EA580C);
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(249, 115, 22, 0.45);
        }

        /* Accessibility: Respect Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .editorial-stat-card,
          .stat-huge-number,
          .volunteer-count-number {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
