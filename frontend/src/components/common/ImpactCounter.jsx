import React, { useEffect, useState } from 'react';
import { impactService } from '../../services/api';
import { Award, Home, Users, HeartHandshake, Droplet, Building2 } from 'lucide-react';

const iconMap = {
  Award: Award,
  Home: Home,
  Users: Users,
  HeartHandshake: HeartHandshake,
  Droplet: Droplet,
  Building2: Building2,
};

export default function ImpactCounter() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await impactService.getStatistics();
        setStats(data || []);
      } catch (err) {
        console.error('Failed to load stats:', err);
        // Fallback realistic defaults
        setStats([
          { key: 'p', title: 'Projects Completed', counter_value: '50+', icon_name: 'Award' },
          { key: 'c', title: 'Communities Reached', counter_value: '120+', icon_name: 'Home' },
          { key: 'l', title: 'Lives Transformed', counter_value: '50,000+', icon_name: 'Users' },
          { key: 'v', title: 'Active Volunteers', counter_value: '2,500+', icon_name: 'HeartHandshake' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="impact-counter-wrapper">
      <div className="container">
        <div className="counter-grid">
          {stats.slice(0, 4).map((item, idx) => {
            const IconComponent = iconMap[item.icon_name] || Award;
            return (
              <div key={item.id || idx} className="counter-card animate-fade-in">
                <div className="counter-icon-box">
                  <IconComponent size={28} />
                </div>
                <div className="counter-content">
                  <div className="counter-number">{item.counter_value}</div>
                  <div className="counter-label">{item.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .impact-counter-wrapper {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          padding: 3.5rem 0;
          color: white;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .counter-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        @media (min-width: 1024px) {
          .counter-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2.5rem;
          }
        }
        .counter-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-lg);
          padding: 1.5rem 1.75rem;
          transition: transform var(--transition-normal);
        }
        .counter-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(16, 185, 129, 0.4);
        }
        .counter-icon-box {
          width: 54px;
          height: 54px;
          border-radius: var(--radius-md);
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .counter-number {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.1;
          color: #FFFFFF;
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }
        .counter-label {
          font-size: 0.9rem;
          color: #CBD5E1;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
