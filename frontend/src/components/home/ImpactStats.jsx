import React, { useEffect, useState, useRef } from 'react';
import { Award, Home, Users, HeartHandshake, Droplet, Building2, TrendingUp } from 'lucide-react';
import { impactService } from '../../services/api';

const iconMap = {
  Award,
  Home,
  Users,
  HeartHandshake,
  Droplet,
  Building2,
};

// Animated Counter Hook
function useCountUp(targetVal, duration = 1800, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    // Parse target number
    const num = typeof targetVal === 'number' 
      ? targetVal 
      : parseInt(String(targetVal).replace(/[^0-9]/g, ''), 10) || 0;

    if (num <= 0) return;

    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Easing out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * num));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(num);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetVal, duration, start]);

  return count;
}

function StatItem({ item, inView }) {
  const rawNum = item.raw_number || parseInt(String(item.counter_value).replace(/[^0-9]/g, ''), 10) || 0;
  const count = useCountUp(rawNum, 1600, inView);
  const IconComp = iconMap[item.icon_name] || Award;

  // Format displayed number with commas if applicable
  const displayFormatted = inView 
    ? (rawNum >= 1000 ? count.toLocaleString('en-IN') : count)
    : '0';

  return (
    <div className="editorial-stat-card">
      <div className="stat-icon-halo">
        <IconComp size={24} />
      </div>

      <div className="stat-huge-number">
        {displayFormatted}
        <span className="stat-suffix">{item.suffix || '+'}</span>
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
        // Fallback to the real verified Responsible Individuals project numbers
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

  // IntersectionObserver to trigger animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="impact-editorial-section">
      <div className="container">
        {/* Centered Editorial Header */}
        <div className="impact-header-center">
          <div className="impact-eyebrow-pill">
            <TrendingUp size={14} className="text-emerald" />
            <span>Our Impact</span>
          </div>

          <h2 className="impact-main-heading">
            Together, We're Making a Difference
          </h2>

          <p className="impact-sub-description">
            Verifiable, transparent grassroots data reflecting thousands of citizens and communities taking direct ownership of water, ecosystems, and rural classrooms.
          </p>
        </div>

        {/* Large Numbers Showcase */}
        <div className="editorial-stats-grid">
          {stats.slice(0, 4).map((item, idx) => (
            <StatItem key={item.id || idx} item={item} inView={inView} />
          ))}
        </div>
      </div>

      <style>{`
        .impact-editorial-section {
          background-color: #FFFFFF;
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
          background: var(--cream-100);
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
        .impact-main-heading {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--charcoal-900);
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
          color: var(--text-muted);
          line-height: 1.65;
        }
        .editorial-stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        @media (min-width: 640px) {
          .editorial-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 3rem 2rem;
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
          padding: 2.25rem 1.5rem;
          border-radius: 24px;
          background: var(--cream-50);
          border: 1px solid var(--border-subtle);
          transition: all var(--transition-normal);
        }
        .editorial-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(8, 41, 31, 0.08);
          border-color: #10B981;
          background: #FFFFFF;
        }
        .stat-icon-halo {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-pill);
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          transition: transform var(--transition-fast);
        }
        .editorial-stat-card:hover .stat-icon-halo {
          transform: scale(1.1);
          background: #10B981;
          color: #FFFFFF;
        }
        .stat-huge-number {
          font-family: var(--font-heading);
          font-size: 3.25rem;
          font-weight: 800;
          line-height: 1;
          color: #10B981;
          margin-bottom: 0.6rem;
          letter-spacing: -0.03em;
        }
        @media (min-width: 1200px) {
          .stat-huge-number {
            font-size: 3.85rem;
          }
        }
        .stat-suffix {
          font-size: 0.65em;
          color: #059669;
          font-weight: 800;
          margin-left: 2px;
        }
        .stat-label-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--charcoal-800);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
      `}</style>
    </section>
  );
}
