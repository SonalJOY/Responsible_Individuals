import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Heart, Zap, Sparkles } from 'lucide-react';

export default function OurValuesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const values = [
    {
      id: 'integrity',
      name: 'Integrity',
      icon: ShieldCheck,
      color: '#0D9488',
      bgGlow: 'rgba(13, 148, 136, 0.12)',
      borderAccent: 'rgba(13, 148, 136, 0.35)',
    },
    {
      id: 'empathy',
      name: 'Empathy',
      icon: Heart,
      color: '#E11D48',
      bgGlow: 'rgba(225, 29, 72, 0.12)',
      borderAccent: 'rgba(225, 29, 72, 0.35)',
    },
    {
      id: 'action',
      name: 'Action',
      icon: Zap,
      color: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      borderAccent: 'rgba(245, 158, 11, 0.35)',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`our-values-section ${isVisible ? 'is-revealed' : ''}`}
      aria-labelledby="our-values-title"
    >
      <div className="container">
        <div className="our-values-inner">
          {/* Section Eyebrow */}
          <div className="our-values-eyebrow">
            <Sparkles size={15} className="text-accent" />
            <span>Guiding Principles</span>
          </div>

          {/* Section Title — Significantly Larger */}
          <h2 id="our-values-title" className="our-values-title">
            Our Values
          </h2>

          {/* Three Distinct Value Cards */}
          <div className="values-cards-grid">
            {values.map((v) => {
              const IconComp = v.icon;
              return (
                <div
                  key={v.id}
                  className="value-distinct-card"
                  style={{
                    '--value-color': v.color,
                    '--value-glow': v.bgGlow,
                    '--value-border': v.borderAccent,
                  }}
                >
                  <div className="value-card-glow" aria-hidden="true" />
                  <div className="value-icon-circle">
                    <IconComp size={36} />
                  </div>
                  <h3 className="value-card-name">{v.name}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .our-values-section {
          background-color: var(--cream-50, #FDFBF7);
          padding: 6.5rem 0;
          position: relative;
          overflow: hidden;
        }

        .our-values-inner {
          max-width: 1040px;
          margin: 0 auto;
          text-align: center;
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .our-values-section.is-revealed .our-values-inner {
          opacity: 1;
          transform: translateY(0);
        }

        .our-values-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.28);
          color: var(--primary-saffron-dark, #B45309);
          padding: 0.38rem 1.15rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }

        .text-accent {
          color: var(--primary-saffron, #F59E0B);
        }

        .our-values-title {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 4.4vw, 3.8rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 3.5rem;
        }

        .values-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .values-cards-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2.5rem;
          }
        }

        .value-distinct-card {
          position: relative;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-radius: 24px;
          padding: 3.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .value-distinct-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.1);
          border-color: var(--value-border);
        }

        .value-card-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 20%, var(--value-glow) 0%, transparent 70%);
          opacity: 0.6;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .value-distinct-card:hover .value-card-glow {
          opacity: 1;
        }

        .value-icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--value-glow);
          color: var(--value-color);
          border: 2px solid var(--value-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.75rem;
          position: relative;
          z-index: 1;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .value-distinct-card:hover .value-icon-circle {
          transform: scale(1.1) rotate(4deg);
        }

        .value-card-name {
          font-family: var(--font-heading);
          font-size: clamp(1.6rem, 2.4vw, 2.1rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.02em;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .our-values-section {
            padding: 4.5rem 0;
          }
          .value-distinct-card {
            padding: 2.75rem 1.5rem;
          }
          .value-icon-circle {
            width: 68px;
            height: 68px;
          }
        }
      `}</style>
    </section>
  );
}
