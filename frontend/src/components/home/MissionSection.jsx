import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, ArrowRight, HeartHandshake } from 'lucide-react';

export default function MissionSection() {
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`mission-editorial-section ${isVisible ? 'is-revealed' : ''}`}
      aria-label="Our Mission"
    >
      <div className="container">
        <div className="mission-editorial-grid">
          {/* Text Content Column (Left on Desktop for Alternating Rhythm) */}
          <div className="mission-content-col">
            <div className="mission-eyebrow">
              <Target size={15} />
              <span>Our Mission</span>
            </div>

            <h2 className="mission-statement">
              &ldquo;Strengthening rural government schools through resources, people, and opportunity.&rdquo;
            </h2>

            <p className="mission-description">
              Working with teachers, communities, volunteers, and corporate CSR partners to create measurable, generational improvements in public education and grassroots community stewardship.
            </p>

            <div className="mission-pillars-row">
              <div className="mission-pillar-item">
                <Users size={16} className="text-blue" />
                <span>Community Action &amp; School Support</span>
              </div>
            </div>

            <div className="mission-cta-row">
              <Link to="/about#vision" className="mission-explore-link">
                <span>Explore our Mission in Action</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Visual Column (Right on Desktop) */}
          <div className="mission-visual-col">
            <div className="mission-image-frame">
              <img
                src="/images/about-mission.jpg"
                alt="Volunteers and teachers collaborating in a rural school classroom to provide educational materials and digital learning resources"
                className="mission-photo"
                loading="lazy"
              />
              <div className="mission-photo-overlay" aria-hidden="true" />
              <div className="mission-floating-badge">
                <HeartHandshake size={14} className="text-blue" />
                <span>Measurable Grassroots Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mission-editorial-section {
          background-color: #FFFFFF;
          padding: 6.5rem 0;
          position: relative;
          overflow: hidden;
        }

        .mission-editorial-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3.5rem;
          align-items: center;
        }

        @media (min-width: 992px) {
          .mission-editorial-grid {
            grid-template-columns: 1fr 1.05fr;
            gap: 5rem;
          }
        }

        /* Content Column Animation (slides in from left) */
        .mission-content-col {
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .is-revealed .mission-content-col {
          opacity: 1;
          transform: translateX(0);
        }

        .mission-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.25);
          color: var(--primary-saffron-hover, #EA580C);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .mission-statement {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.025em;
          line-height: 1.22;
          margin-bottom: 1.35rem;
        }

        @media (min-width: 768px) {
          .mission-statement {
            font-size: 2.85rem;
          }
        }

        .mission-description {
          font-size: 1.15rem;
          color: var(--text-secondary, #475569);
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 580px;
        }

        .mission-pillars-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2.25rem;
        }

        .mission-pillar-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--cream-50, #FDFBF7);
          border: 1px solid var(--border-subtle, #E2E8F0);
          padding: 0.55rem 1.15rem;
          border-radius: var(--radius-pill);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--charcoal-800, #1E293B);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .text-blue {
          color: var(--secondary-light-blue-hover, #0284C7);
        }

        .mission-explore-link {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          font-size: 1rem;
          color: var(--primary-saffron, #F97316);
          text-decoration: none;
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .mission-explore-link:hover {
          gap: 0.85rem;
          color: var(--primary-saffron-hover, #EA580C);
        }

        /* Visual Column Animation (slides in from right) */
        .mission-visual-col {
          position: relative;
          opacity: 0;
          transform: translateX(40px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
        }

        .is-revealed .mission-visual-col {
          opacity: 1;
          transform: translateX(0);
        }

        .mission-image-frame {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
          border: 1px solid var(--border-subtle, #E2E8F0);
          aspect-ratio: 4 / 3;
          background: #0F172A;
        }

        .mission-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mission-image-frame:hover .mission-photo {
          transform: scale(1.04);
        }

        .mission-photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.45) 100%);
          pointer-events: none;
        }

        .mission-floating-badge {
          position: absolute;
          bottom: 20px;
          left: 20px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 0.45rem 1rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--charcoal-900, #0F172A);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        /* Accessibility: Respect Reduced Motion Preferences */
        @media (prefers-reduced-motion: reduce) {
          .mission-content-col,
          .mission-visual-col {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .mission-photo {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
