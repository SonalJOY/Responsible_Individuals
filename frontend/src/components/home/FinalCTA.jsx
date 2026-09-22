import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShieldCheck, Sparkles, Users, TreePine } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="final-cta-root">
      <div className="container final-cta-container">
        {/* Floating Community Photographic Vignettes (Inspired by Reference Video 00:19-00:20) */}
        <div className="floating-bubble bubble-left-top">
          <div className="bubble-circle-photo wetland-photo">
            <TreePine size={24} color="#FFFFFF" />
          </div>
          <span className="bubble-tag">Lake Rejuvenation</span>
        </div>

        <div className="floating-bubble bubble-right-top">
          <div className="bubble-circle-photo stem-photo">
            <Users size={24} color="#FFFFFF" />
          </div>
          <span className="bubble-tag">STEM Labs</span>
        </div>

        <div className="floating-bubble bubble-left-bottom">
          <div className="bubble-circle-photo volunteer-photo">
            <Heart size={22} color="#FFFFFF" fill="currentColor" />
          </div>
          <span className="bubble-tag">Citizen Volunteers</span>
        </div>

        <div className="floating-bubble bubble-right-bottom">
          <div className="bubble-circle-photo csr-photo">
            <ShieldCheck size={24} color="#FFFFFF" />
          </div>
          <span className="bubble-tag">80G Audited</span>
        </div>

        {/* Central Content */}
        <div className="final-cta-content">
          <div className="final-cta-badge">
            <Sparkles size={14} className="text-emerald" />
            <span>RESPONSIBILITY INTO ACTION</span>
          </div>

          <h2 className="final-cta-heading">
            Ready to Make a Measurable Difference?
          </h2>

          <p className="final-cta-lead">
            Whether you choose to contribute your time as a weekend volunteer, fund a classroom smart lab, or partner with your corporate CSR grant — your action creates ripple effects.
          </p>

          <div className="final-cta-buttons">
            <Link to="/donate" className="btn-cta-emerald">
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

          <div className="final-cta-tax-note">
            <ShieldCheck size={16} className="text-emerald" />
            <span>All donations eligible for 50% deduction under Section 80G of the Indian Income Tax Act.</span>
          </div>
        </div>
      </div>

      <style>{`
        .final-cta-root {
          background-color: var(--cream-100);
          padding: 8rem 0;
          position: relative;
          overflow: hidden;
        }
        .final-cta-container {
          position: relative;
          z-index: 2;
        }
        .final-cta-content {
          text-align: center;
          max-width: 820px;
          margin: 0 auto;
          position: relative;
          z-index: 5;
        }
        .final-cta-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--charcoal-800);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .final-cta-heading {
          font-family: var(--font-heading);
          font-size: 2.75rem;
          font-weight: 800;
          color: var(--charcoal-900);
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 768px) {
          .final-cta-heading {
            font-size: 4rem;
          }
        }
        @media (min-width: 1200px) {
          .final-cta-heading {
            font-size: 4.6rem;
          }
        }
        .final-cta-lead {
          font-size: 1.15rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 2.75rem;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 768px) {
          .final-cta-lead {
            font-size: 1.25rem;
          }
        }
        .final-cta-buttons {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .btn-cta-emerald {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #10B981;
          color: #042F1A;
          font-weight: 700;
          font-size: 1.1rem;
          padding: 0.95rem 1.75rem;
          border-radius: var(--radius-pill);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
          transition: all var(--transition-fast);
        }
        .btn-cta-emerald:hover {
          background: #059669;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(16, 185, 129, 0.45);
        }
        .cta-arrow-dot {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-pill);
          background: rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-cta-secondary {
          display: inline-flex;
          align-items: center;
          padding: 0.95rem 2rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--charcoal-900);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }
        .btn-cta-secondary:hover {
          background: var(--cream-200);
          transform: translateY(-2px);
        }
        .final-cta-tax-note {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill);
        }
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
          left: 4%;
        }
        .bubble-right-top {
          top: 8%;
          right: 4%;
        }
        .bubble-left-bottom {
          bottom: 12%;
          left: 6%;
        }
        .bubble-right-bottom {
          bottom: 10%;
          right: 6%;
        }
        .bubble-circle-photo {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-pill);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 28px rgba(8, 41, 31, 0.16);
          border: 3px solid #FFFFFF;
        }
        .wetland-photo {
          background: linear-gradient(135deg, #091712 0%, #10B981 100%);
        }
        .stem-photo {
          background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
        }
        .volunteer-photo {
          background: linear-gradient(135deg, #BE123C 0%, #F43F5E 100%);
        }
        .csr-photo {
          background: linear-gradient(135deg, #047857 0%, #059669 100%);
        }
        .bubble-tag {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--charcoal-800);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.65rem;
          border-radius: var(--radius-pill);
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </section>
  );
}
