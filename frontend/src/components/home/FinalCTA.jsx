import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShieldCheck, Sparkles, Users, TreePine } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="final-cta-root" aria-labelledby="final-cta-title">
      <div className="container final-cta-container">
        {/* Floating Community Impact Vignettes — Desktop (>= 1024px) */}
        <div className="floating-bubble bubble-left-top" aria-hidden="true">
          <div className="bubble-circle-photo wetland-photo">
            <TreePine size={24} color="#FFFFFF" />
          </div>
          <span className="bubble-tag">Lake Rejuvenation</span>
        </div>

        <div className="floating-bubble bubble-right-top" aria-hidden="true">
          <div className="bubble-circle-photo stem-photo">
            <Users size={24} color="#FFFFFF" />
          </div>
          <span className="bubble-tag">STEM Labs</span>
        </div>

        <div className="floating-bubble bubble-left-bottom" aria-hidden="true">
          <div className="bubble-circle-photo volunteer-photo">
            <Heart size={22} color="#FFFFFF" fill="currentColor" />
          </div>
          <span className="bubble-tag">Citizen Volunteers</span>
        </div>

        <div className="floating-bubble bubble-right-bottom" aria-hidden="true">
          <div className="bubble-circle-photo csr-photo">
            <ShieldCheck size={24} color="#FFFFFF" />
          </div>
          <span className="bubble-tag">80G Audited</span>
        </div>

        {/* Central CTA Content — Rendered directly over the illustrated background with NO white box */}
        <div className="final-cta-content">
          {/* Eyebrow Badge */}
          <div className="final-cta-badge">
            <Sparkles size={14} className="text-saffron" />
            <span>RESPONSIBILITY INTO ACTION</span>
          </div>

          {/* Large Prominent Display Title */}
          <h2 id="final-cta-title" className="final-cta-heading">
            Ready to Make a Measurable Difference?
          </h2>

          {/* Supporting Lead Description */}
          <p className="final-cta-lead">
            Whether you choose to contribute your time as a weekend volunteer, fund a classroom smart lab, or partner with your corporate CSR grant — your action creates ripple effects.
          </p>

          {/* Action Buttons */}
          <div className="final-cta-buttons">
            <Link to="/donate" className="btn-cta-primary">
              <Heart size={18} fill="currentColor" />
              <span>Donate Now</span>
              <div className="cta-arrow-dot">
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link to="/volunteer" className="btn-cta-secondary">
              <span>Volunteer With Us</span>
            </Link>
          </div>

          {/* Tax Exemption Note */}
          <div className="final-cta-tax-note">
            <ShieldCheck size={16} className="text-light-blue" />
            <span>All donations eligible for 50% deduction under Section 80G of the Indian Income Tax Act.</span>
          </div>

          {/* Mobile & Tablet Impact Badges Strip (< 1024px: Cleanly positioned below tax note, zero overlap) */}
          <div className="mobile-badges-strip" aria-label="Key Impact Areas">
            <div className="mobile-badge-item">
              <TreePine size={14} className="text-emerald" />
              <span>Lake Rejuvenation</span>
            </div>
            <div className="mobile-badge-item">
              <Users size={14} className="text-blue" />
              <span>STEM Labs</span>
            </div>
            <div className="mobile-badge-item">
              <Heart size={14} className="text-saffron" fill="currentColor" />
              <span>Citizen Volunteers</span>
            </div>
            <div className="mobile-badge-item">
              <ShieldCheck size={14} className="text-teal" />
              <span>80G Audited</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .final-cta-root {
          background-color: transparent;
          padding: 7rem 0 6.5rem 0;
          position: relative;
          overflow: hidden;
          width: 100%;
        }
        @media (max-width: 768px) {
          .final-cta-root { padding: 5rem 0; }
          .final-cta-heading { font-size: 2.1rem !important; }
          .final-cta-lead { font-size: 1rem; margin-bottom: 2rem; }
          .final-cta-buttons { flex-direction: column; align-items: stretch; gap: 0.85rem; max-width: 340px; margin-left: auto; margin-right: auto; }
          .btn-cta-primary, .btn-cta-secondary { justify-content: center; width: 100%; font-size: 1rem; }
        }
        @media (max-width: 480px) {
          .final-cta-root { padding: 3rem 0; }
          .final-cta-heading { font-size: 1.75rem !important; }
        }
        .text-saffron {
          color: var(--primary-saffron, #F59E0B);
        }
        .text-light-blue {
          color: var(--secondary-light-blue, #0284C7);
        }
        .text-emerald {
          color: #059669;
        }
        .text-blue {
          color: #2563EB;
        }
        .text-teal {
          color: #0D9488;
        }

        .final-cta-container {
          position: relative;
          z-index: 2;
        }

        /* Central CTA Content: Transparent wrapper with NO card box, borders, or large white rectangles */
        .final-cta-content {
          background: transparent;
          border: none;
          box-shadow: none;
          border-radius: 0;
          padding: 0;
          text-align: center;
          max-width: 860px;
          margin: 0 auto;
          position: relative;
          z-index: 5;
        }

        /* Eyebrow Badge Pill */
        .final-cta-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: var(--primary-saffron-dark, #B45309);
          padding: 0.4rem 1.15rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
        }

        /* Large Prominent Display Title directly on background with subtle readable contrast */
        .final-cta-heading {
          font-family: var(--font-heading);
          font-size: clamp(2.3rem, 4.4vw, 3.8rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0 auto 1.5rem auto;
          max-width: 820px;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.95), 0 2px 14px rgba(255, 255, 255, 0.85);
        }

        /* Supporting Lead Text with enhanced readability over illustration */
        .final-cta-lead {
          font-family: var(--font-body);
          font-size: clamp(1.1rem, 1.4vw, 1.3rem);
          color: var(--slate-800, #1E293B);
          font-weight: 500;
          line-height: 1.75;
          margin: 0 auto 2.5rem auto;
          max-width: 720px;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.95), 0 1px 10px rgba(255, 255, 255, 0.8);
        }

        /* Action Buttons Cluster */
        .final-cta-buttons {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          margin-bottom: 2.25rem;
        }

        .btn-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--primary-saffron, #F59E0B);
          color: #FFFFFF;
          font-weight: 800;
          font-size: 1.1rem;
          padding: 1rem 2rem;
          border-radius: var(--radius-pill, 9999px);
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
          transition: all 0.25s ease;
          text-decoration: none;
        }

        .btn-cta-primary:hover {
          background: var(--primary-saffron-hover, #D97706);
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(217, 119, 6, 0.5);
        }

        .cta-arrow-dot {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .btn-cta-primary:hover .cta-arrow-dot {
          transform: translateX(3px);
        }

        .btn-cta-secondary {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2.25rem;
          border-radius: var(--radius-pill, 9999px);
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--charcoal-900, #0F172A);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(226, 232, 240, 0.95);
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
          transition: all 0.25s ease;
          text-decoration: none;
        }

        .btn-cta-secondary:hover {
          background: #FFFFFF;
          border-color: var(--primary-saffron, #F59E0B);
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
        }

        /* 80G Tax Exemption Note */
        .final-cta-tax-note {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--slate-700, #334155);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.9);
          padding: 0.55rem 1.4rem;
          border-radius: var(--radius-pill, 9999px);
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
          max-width: 640px;
          margin: 0 auto;
        }

        /* Four Floating Impact Badges — Desktop (>= 1024px) */
        .floating-bubble {
          position: absolute;
          display: none;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          pointer-events: none;
          z-index: 1;
        }

        @media (min-width: 1024px) {
          .floating-bubble {
            display: flex;
          }
        }

        .bubble-left-top {
          top: 10%;
          left: 3%;
        }
        .bubble-right-top {
          top: 8%;
          right: 3%;
        }
        .bubble-left-bottom {
          bottom: 12%;
          left: 4%;
        }
        .bubble-right-bottom {
          bottom: 10%;
          right: 4%;
        }

        .bubble-circle-photo {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.15);
          border: 3px solid #FFFFFF;
        }

        .wetland-photo {
          background: linear-gradient(135deg, #0F172A 0%, #0EA5E9 100%);
        }
        .stem-photo {
          background: linear-gradient(135deg, #1E293B 0%, #38BDF8 100%);
        }
        .volunteer-photo {
          background: linear-gradient(135deg, #7C2D12 0%, #F97316 100%);
        }
        .csr-photo {
          background: linear-gradient(135deg, #0F172A 0%, #EA580C 100%);
        }

        .bubble-tag {
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.9);
          color: var(--charcoal-900, #0F172A);
          font-size: 0.74rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-pill, 9999px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
          white-space: nowrap;
        }

        /* Mobile & Tablet Impact Badges Strip (< 1024px) */
        .mobile-badges-strip {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.65rem 1rem;
          margin-top: 2.25rem;
        }

        @media (min-width: 1024px) {
          .mobile-badges-strip {
            display: none;
          }
        }

        .mobile-badge-item {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(226, 232, 240, 0.9);
          padding: 0.4rem 0.9rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--charcoal-900, #0F172A);
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
        }

        @media (max-width: 768px) {
          .final-cta-root {
            padding: 5rem 0 4.5rem 0;
          }
          .final-cta-lead {
            margin-bottom: 2rem;
          }
          .final-cta-buttons {
            flex-direction: column;
            width: 100%;
            gap: 1rem;
          }
          .btn-cta-primary,
          .btn-cta-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
