import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function VisionSection() {
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
      className={`vision-editorial-section ${isVisible ? 'is-revealed' : ''}`}
      aria-label="Our Vision"
    >
      <div className="container">
        <div className="vision-editorial-grid">
          {/* Visual Column */}
          <div className="vision-visual-col">
            <div className="vision-image-frame">
              <img
                src="/images/about-vision.jpg"
                alt="Rural government school students reading books together in an improved classroom with their teacher"
                className="vision-photo"
                loading="lazy"
              />
              <div className="vision-photo-overlay" aria-hidden="true" />
              <div className="vision-floating-badge">
                <Sparkles size={14} className="text-accent" />
                <span>Future-Focused Horizon</span>
              </div>
            </div>
          </div>

          {/* Text Content Column */}
          <div className="vision-content-col">
            <div className="vision-eyebrow">
              <BookOpen size={15} />
              <span>Our Vision</span>
            </div>

            <h2 className="vision-statement">
              &ldquo;Every child deserves the opportunity to learn, grow, and thrive.&rdquo;
            </h2>

            <p className="vision-description">
              Building stronger rural schools and creating supportive learning environments where every student can reach their full potential regardless of postal code.
            </p>

            <div className="vision-pillars-row">
              <div className="vision-pillar-item">
                <ShieldCheck size={16} className="text-accent" />
                <span>Equal Opportunity &amp; Quality Learning</span>
              </div>
            </div>

            <div className="vision-cta-row">
              <Link to="/about#vision" className="vision-explore-link">
                <span>Learn more about our Vision</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .vision-editorial-section {
          background-color: var(--cream-50, #FDFBF7);
          padding: 6.5rem 0;
          position: relative;
          overflow: hidden;
        }

        .vision-editorial-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3.5rem;
          align-items: center;
        }

        @media (min-width: 992px) {
          .vision-editorial-grid {
            grid-template-columns: 1.05fr 1fr;
            gap: 5rem;
          }
        }

        /* Visual Column & Image Animation */
        .vision-visual-col {
          position: relative;
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .is-revealed .vision-visual-col {
          opacity: 1;
          transform: translateX(0);
        }

        .vision-image-frame {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
          border: 1px solid var(--border-subtle, #E2E8F0);
          aspect-ratio: 4 / 3;
          background: #0F172A;
        }

        .vision-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .vision-image-frame:hover .vision-photo {
          transform: scale(1.04);
        }

        .vision-photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.45) 100%);
          pointer-events: none;
        }

        .vision-floating-badge {
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

        /* Content Column Animation */
        .vision-content-col {
          opacity: 0;
          transform: translateX(40px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
        }

        .is-revealed .vision-content-col {
          opacity: 1;
          transform: translateX(0);
        }

        .vision-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--secondary-blue-light, #F0F9FF);
          border: 1px solid rgba(14, 165, 233, 0.25);
          color: var(--secondary-light-blue-hover, #0284C7);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .vision-statement {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.025em;
          line-height: 1.22;
          margin-bottom: 1.35rem;
        }

        @media (min-width: 768px) {
          .vision-statement {
            font-size: 2.85rem;
          }
        }

        .vision-description {
          font-size: 1.15rem;
          color: var(--text-secondary, #475569);
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 580px;
        }

        .vision-pillars-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2.25rem;
        }

        .vision-pillar-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          padding: 0.55rem 1.15rem;
          border-radius: var(--radius-pill);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--charcoal-800, #1E293B);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .text-accent {
          color: var(--primary-saffron, #F97316);
        }

        .vision-explore-link {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          font-size: 1rem;
          color: var(--secondary-light-blue-hover, #0284C7);
          text-decoration: none;
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .vision-explore-link:hover {
          gap: 0.85rem;
          color: var(--primary-saffron, #F97316);
        }

        /* Accessibility: Respect Reduced Motion Preferences */
        @media (prefers-reduced-motion: reduce) {
          .vision-visual-col,
          .vision-content-col {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .vision-photo {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
