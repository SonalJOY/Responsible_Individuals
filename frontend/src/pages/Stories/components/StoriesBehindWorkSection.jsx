import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function StoriesBehindWorkSection() {
  const qualitativePillars = [
    {
      icon: Compass,
      color: '#10B981',
      bg: '#ECFDF5',
      title: 'Community-Led Priorities',
      desc: 'Interventions originate from participatory community mapping rather than top-down assumptions.'
    },
    {
      icon: ShieldCheck,
      color: '#2563EB',
      bg: '#EFF6FF',
      title: 'Scientific Accountability',
      desc: 'Every ecological and educational milestone is documented with transparent baseline benchmarks.'
    },
    {
      icon: HeartHandshake,
      color: '#F59E0B',
      bg: '#FEF3C7',
      title: 'Enduring Stewardship',
      desc: 'Local committees take over continuous maintenance to ensure outcomes outlast external funding cycles.'
    }
  ];

  return (
    <section className="stories-behind-section" aria-label="Stories Behind the Work">
      <div className="container">
        <div className="stories-behind-header">
          <span className="section-badge">Humanity Behind Metrics</span>
          <h2 className="stories-behind-title">Every Number Has a Story.</h2>
          <p className="stories-behind-subtitle">
            Behind every project are people, communities and moments that make change possible.
          </p>
        </div>

        <div className="impact-pillars-row">
          {qualitativePillars.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <div key={idx} className="impact-pillar-card">
                <div className="pillar-icon-box" style={{ backgroundColor: pillar.bg, color: pillar.color }}>
                  <IconComp size={26} />
                </div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="impact-bridge-action">
          <Link to="/impact" className="btn btn-primary btn-lg">
            <span>Explore Our Impact</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
