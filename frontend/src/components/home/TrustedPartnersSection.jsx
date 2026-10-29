import React, { useState, useEffect } from 'react';
import { Building2, Sparkles } from 'lucide-react';
import { partnerService } from '../../services/api';

const DEFAULT_PARTNERS = [
  { id: 'p1', name: 'Infosys Foundation', tier: 'CSR Strategic Partner', category: 'STEM & Digital Education' },
  { id: 'p2', name: 'Wipro Cares', tier: 'Community Partner', category: 'Ecology & Water Stewardship' },
  { id: 'p3', name: 'Azim Premji Philanthropic', tier: 'Philanthropic Partner', category: 'Public Education Support' },
  { id: 'p4', name: 'Titan CSR Initiative', tier: 'Grassroots Partner', category: 'Skill & Livelihood Training' },
  { id: 'p5', name: 'Bengaluru Citizen Action', tier: 'Civic Collective', category: 'Ward Lake Restoration' },
  { id: 'p6', name: 'Tata Sustainability Group', tier: 'Advisory Partner', category: 'Water Body Revival' },
];

export default function TrustedPartnersSection() {
  const [partners, setPartners] = useState(DEFAULT_PARTNERS);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  ));

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const listener = (e) => setReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const data = await partnerService.getPartners();
        if (data && data.length > 0) {
          // Merge API partners with established partners
          const apiPartners = data.map((item, idx) => ({
            id: item.id || `api-${idx}`,
            name: item.name || item.title,
            tier: item.partner_type || item.tier || 'CSR Partner',
            category: item.focus_area || 'Community Action',
          }));
          setPartners(apiPartners.length >= 4 ? apiPartners : [...apiPartners, ...DEFAULT_PARTNERS.slice(apiPartners.length)]);
        }
      } catch {
        // Fallback to DEFAULT_PARTNERS on API error or offline mode
      }
    }
    fetchPartners();
  }, []);

  return (
    <section 
      className="trusted-partners-section"
      aria-label="Trusted Partners and CSR Collaborators"
    >
      <div className="container">
        {/* Section Header */}
        <div className="trusted-partners-header">
          <div className="partners-badge">
            <Sparkles size={14} className="text-saffron" />
            <span>Institutional Backing</span>
          </div>
          <h2 className="partners-title">
            Trusted by CSR Partners &amp; Citizen Collectives
          </h2>
          <p className="partners-subtitle">
            Collaborating with leading philanthropic foundations, corporate CSR initiatives, and resident associations to scale grassroots impact.
          </p>
        </div>
      </div>

      {/* Sliding Marquee Container */}
      <div 
        className="partners-marquee-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          className={`partners-marquee-track ${isPaused ? 'is-paused' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}
        >
          {/* Primary List */}
          <div className="partners-track-group">
            {partners.map((partner) => (
              <div key={partner.id} className="partner-card-capsule">
                <div className="partner-icon-circle">
                  <Building2 size={18} />
                </div>
                <div className="partner-info">
                  <span className="partner-name">{partner.name}</span>
                  <span className="partner-tier">{partner.tier}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Duplicate List for Seamless Infinite Loop (Aria-Hidden for Accessibility) */}
          <div className="partners-track-group" aria-hidden="true">
            {partners.map((partner, idx) => (
              <div key={`dup-${partner.id}-${idx}`} className="partner-card-capsule">
                <div className="partner-icon-circle">
                  <Building2 size={18} />
                </div>
                <div className="partner-info">
                  <span className="partner-name">{partner.name}</span>
                  <span className="partner-tier">{partner.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .trusted-partners-section {
          background-color: transparent;
          padding: 5.5rem 0 6rem 0;
          border-top: 1px solid var(--border-subtle, #E2E8F0);
          border-bottom: 1px solid var(--border-subtle, #E2E8F0);
          position: relative;
          overflow: hidden;
        }

        .trusted-partners-header {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 3.5rem auto;
        }

        .partners-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.28);
          color: var(--primary-saffron-dark, #B45309);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }

        .text-saffron {
          color: var(--primary-saffron, #F59E0B);
        }

        .partners-title {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 3.4vw, 2.9rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin-bottom: 1rem;
        }

        .partners-subtitle {
          font-family: var(--font-body);
          font-size: clamp(1rem, 1.3vw, 1.15rem);
          line-height: 1.65;
          color: var(--slate-600, #475569);
          margin: 0;
        }

        /* Marquee Viewport & Linear Gradient Edge Masking */
        .partners-marquee-viewport {
          width: 100%;
          overflow: hidden;
          position: relative;
          padding: 0.75rem 0;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .partners-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: slideContinuous 32s linear infinite;
        }

        .partners-marquee-track.is-paused {
          animation-play-state: paused;
        }

        .partners-marquee-track.reduced-motion {
          animation: none;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          mask-image: none;
        }

        .partners-track-group {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding-right: 2rem;
          flex-shrink: 0;
        }

        .partner-card-capsule {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: rgba(253, 251, 247, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          padding: 0.95rem 1.85rem;
          border-radius: var(--radius-pill, 9999px);
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
          user-select: none;
          white-space: nowrap;
        }

        .partner-card-capsule:hover {
          transform: translateY(-3px) scale(1.02);
          background: rgba(255, 255, 255, 0.96);
          border-color: var(--primary-saffron, #F59E0B);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
        }

        .partner-icon-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(125, 211, 252, 0.18);
          color: #0284C7;
          border: 1px solid rgba(125, 211, 252, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .partner-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .partner-name {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.01em;
          line-height: 1.25;
        }

        .partner-tier {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary-saffron-dark, #B45309);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        @keyframes slideContinuous {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 768px) {
          .trusted-partners-section {
            padding: 4rem 0 4.5rem 0;
          }
          .trusted-partners-header {
            margin-bottom: 2.5rem;
          }
          .partners-track-group {
            gap: 1.25rem;
            padding-right: 1.25rem;
          }
          .partner-card-capsule {
            padding: 0.75rem 1.35rem;
          }
        }
      `}</style>
    </section>
  );
}
