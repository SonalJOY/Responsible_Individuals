import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, TreePine, HeartPulse, CheckCircle2, 
  ArrowRight, Sparkles
} from 'lucide-react';

export default function FocusAreasSection() {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const focusAreas = [
    {
      id: 'education',
      title: 'Education, Youth Empowerment & Skill Development',
      shortTitle: 'Education & Youth',
      icon: GraduationCap,
      color: '#2563EB',
      bgLight: '#EFF6FF',
      borderColor: 'rgba(37, 99, 235, 0.28)',
      introduction: 'We believe in nurturing potential through inclusive and innovative learning experiences.',
      initiatives: [
        'Closing learning gaps via experiential and digital education tailored to diverse needs.',
        'Creating safe, inclusive learning spaces that spark creativity, curiosity, and collaboration.',
        'Empowering educators through robust teacher training and capacity-building programs to elevate classroom impact.',
        'Equipping youth for the future with vocational training, career guidance, and digital literacy initiatives.',
      ],
      link: '/projects?focus_area=education',
    },
    {
      id: 'environment',
      title: 'Environment & Sustainability',
      shortTitle: 'Environment & Climate',
      icon: TreePine,
      color: '#059669',
      bgLight: '#ECFDF5',
      borderColor: 'rgba(5, 150, 105, 0.28)',
      introduction: 'We champion community-led environmental stewardship to build a greener tomorrow.',
      initiatives: [
        'Sustainable water management through rainwater harvesting and conservation practices.',
        'Eco-restoration efforts including native tree plantations, waste reduction, pollution control, and clean-campus campaigns.',
        'Reviving local ecosystems by desilting and restoring water bodies through community participation.',
        'Environmental education via workshops that foster awareness and sustainable habits among youth and local communities.',
      ],
      link: '/projects?focus_area=environment',
    },
    {
      id: 'health',
      title: 'Health & Well-being',
      shortTitle: 'Health & Well-being',
      icon: HeartPulse,
      color: '#E11D48',
      bgLight: '#FFF1F2',
      borderColor: 'rgba(225, 29, 72, 0.28)',
      introduction: 'We promote holistic health and hygiene for thriving communities.',
      initiatives: [
        'Awareness campaigns on menstrual hygiene, nutrition, and mental wellness.',
        'Improved sanitation infrastructure with clean toilets and hygiene units.',
        'Access to safe drinking water as a fundamental right.',
        'Community health drives including blood donation camps and preventive care outreach.',
      ],
      link: '/projects?focus_area=health',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`focus-areas-editorial-section ${isVisible ? 'is-revealed' : ''}`}
      aria-labelledby="focus-areas-title"
    >
      <div className="container">
        {/* Section Header */}
        <div className="focus-areas-header">
          <div className="focus-areas-eyebrow">
            <Sparkles size={15} className="text-saffron" />
            <span>Strategic Impact Pillars</span>
          </div>

          <h2 id="focus-areas-title" className="focus-areas-main-title">
            Focus Areas of Our NGO
          </h2>

          <p className="focus-areas-subtitle">
            Our interventions are concentrated in three essential domains to create measurable, sustainable transformation across grassroots communities.
          </p>
        </div>

        {/* Two-Sided Balanced Composition: Exactly 50/50 Equal Height Columns */}
        <div className="focus-areas-impact-layout">
          {/* Side A: Dedicated Visual Showcase Card with Actual focusarea Asset (Equal 50% Desktop Width) */}
          <aside className="focus-visual-showcase-col" aria-label="Visual showcase of grassroots initiatives">
            <div className="focus-visual-card">
              <picture className="focus-picture-frame">
                <source srcSet="/images/focusarea.webp" type="image/webp" />
                <img
                  src="/images/focusarea.jpg"
                  alt="Authentic Warli folk art mural of Surya Namaskar painted on a rural community school wall supported by Responsible Individuals"
                  className="focus-visual-photo"
                  loading="lazy"
                  onError={(e) => {
                    if (e.currentTarget.src !== '/videos/focusarea.jpg') {
                      e.currentTarget.src = '/videos/focusarea.jpg';
                    }
                  }}
                />
              </picture>

              {/* Atmospheric Gradient Overlay for Text Readability & Brand Depth */}
              <div className="focus-visual-gradient" aria-hidden="true" />

              {/* Floating Top Eyebrow Badge */}
              <div className="focus-visual-top-badge">
                <span className="visual-badge-pill">
                  <Sparkles size={14} className="text-saffron" />
                  <span>Grassroots Transformation</span>
                </span>
              </div>

              {/* Bottom Editorial Caption & Impact Summary */}
              <div className="focus-visual-caption">
                <div className="caption-eyebrow">On-Ground Action</div>
                <h3 className="caption-heading">Nurturing Roots, Health &amp; Future Potential</h3>
                <p className="caption-description">
                  From traditional folk wall art at rural learning centers to clean water filtration and youth skill hubs, our initiatives build community pride and sustainable self-reliance.
                </p>

                <div className="caption-metrics-strip">
                  <div className="metric-item">
                    <span className="metric-val">3</span>
                    <span className="metric-lbl">Pillars</span>
                  </div>
                  <div className="metric-divider" />
                  <div className="metric-item">
                    <span className="metric-val">100%</span>
                    <span className="metric-lbl">Grassroots</span>
                  </div>
                  <div className="metric-divider" />
                  <div className="metric-item">
                    <span className="metric-val">80G</span>
                    <span className="metric-lbl">Tax Verified</span>
                  </div>
                </div>

                <div className="caption-cta-row">
                  <Link to="/projects" className="caption-explore-link">
                    <span>Explore Field Projects</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Side B: Focus Areas Compact Content Column (Equal 50% Desktop Width) */}
          <div className="focus-cards-content-col">
            {focusAreas.map((area, index) => {
              const IconComp = area.icon;
              return (
                <article
                  key={area.id}
                  className="focus-area-card"
                  style={{
                    '--area-color': area.color,
                    '--area-bg-light': area.bgLight,
                    '--area-border': area.borderColor,
                  }}
                >
                  {/* Card Top: Icon & Indicator */}
                  <div className="focus-area-card-top">
                    <div className="focus-area-icon-wrap">
                      <IconComp size={20} />
                    </div>
                    <span className="focus-area-index">Pillar 0{index + 1}</span>
                  </div>

                  {/* Focus Area Title */}
                  <h3 className="focus-area-title">{area.title}</h3>

                  {/* Introduction */}
                  <div className="focus-area-intro-box">
                    <p className="focus-area-intro-text">
                      {area.introduction}
                    </p>
                  </div>

                  {/* Key Initiatives List */}
                  <div className="focus-area-initiatives-wrap">
                    <h4 className="initiatives-list-title">Key Initiatives</h4>
                    <ul className="initiatives-list">
                      {area.initiatives.map((initiative, initIdx) => (
                        <li key={initIdx} className="initiative-item">
                          <CheckCircle2 size={15} className="initiative-check-icon" />
                          <span className="initiative-text">{initiative}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer Link */}
                  <div className="focus-area-card-footer">
                    <Link to={area.link} className="focus-area-link">
                      <span>Explore {area.shortTitle} Projects</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .focus-areas-editorial-section {
          background-color: var(--cream-50, #FDFBF7);
          padding: 6rem 0;
          position: relative;
          overflow: hidden;
        }

        .focus-areas-header {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 3.5rem auto;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .focus-areas-editorial-section.is-revealed .focus-areas-header {
          opacity: 1;
          transform: translateY(0);
        }

        .focus-areas-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.28);
          color: var(--primary-saffron-dark, #B45309);
          padding: 0.35rem 1.1rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 1.15rem;
        }

        .text-saffron {
          color: var(--primary-saffron, #F59E0B);
        }

        .focus-areas-main-title {
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 4vw, 3.5rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1.15rem;
        }

        .focus-areas-subtitle {
          font-family: var(--font-body);
          font-size: clamp(1.05rem, 1.3vw, 1.2rem);
          line-height: 1.65;
          color: var(--slate-600, #475569);
          margin: 0;
        }

        /* Two-Sided Balanced Composition: Exactly 50/50 Equal Height Columns */
        .focus-areas-impact-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: stretch;
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
        }

        .focus-areas-editorial-section.is-revealed .focus-areas-impact-layout {
          opacity: 1;
          transform: translateY(0);
        }

        @media (min-width: 1024px) {
          .focus-areas-impact-layout {
            grid-template-columns: 1fr 1fr;
            gap: 2.75rem;
            align-items: stretch;
          }
        }

        /* Side A: Dedicated Visual Showcase Column (Equal 50% Desktop Width) */
        .focus-visual-showcase-col {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .focus-visual-card {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 520px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid var(--border-subtle, #E2E8F0);
          background-color: #0F172A;
        }

        .focus-picture-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .focus-visual-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .focus-visual-card:hover .focus-visual-photo {
          transform: scale(1.04);
        }

        /* Atmospheric Gradient: Ensures high text contrast on bottom while keeping artwork visible */
        .focus-visual-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.35) 0%,
            rgba(15, 23, 42, 0.08) 35%,
            rgba(15, 23, 42, 0.72) 68%,
            rgba(15, 23, 42, 0.94) 100%
          );
          pointer-events: none;
        }

        /* Top Floating Badge */
        .focus-visual-top-badge {
          position: relative;
          z-index: 2;
          padding: 1.5rem;
          display: flex;
          justify-content: flex-start;
        }

        .visual-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          padding: 0.35rem 0.95rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* Bottom Caption Block */
        .focus-visual-caption {
          position: relative;
          z-index: 2;
          padding: 2.25rem 2rem;
          color: #FFFFFF;
        }

        .caption-eyebrow {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--primary-saffron, #F59E0B);
          margin-bottom: 0.5rem;
        }

        .caption-heading {
          font-family: var(--font-heading);
          font-size: clamp(1.35rem, 1.8vw, 1.7rem);
          font-weight: 800;
          line-height: 1.25;
          letter-spacing: -0.015em;
          color: #FFFFFF;
          margin-bottom: 0.75rem;
        }

        .caption-description {
          font-size: 0.92rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.88);
          margin-bottom: 1.4rem;
          max-width: 480px;
        }

        /* Metric Summary Strip */
        .caption-metrics-strip {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 1.4rem;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
        }

        .metric-val {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1;
        }

        .metric-lbl {
          font-size: 0.7rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.75);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 0.25rem;
        }

        .metric-divider {
          width: 1px;
          height: 28px;
          background-color: rgba(255, 255, 255, 0.2);
        }

        .caption-cta-row {
          display: flex;
        }

        .caption-explore-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-weight: 700;
          font-size: 0.88rem;
          color: #FFFFFF;
          padding: 0.55rem 1.25rem;
          background: rgba(245, 158, 11, 0.9);
          border-radius: var(--radius-pill, 9999px);
          transition: all 0.25s ease;
          text-decoration: none;
        }

        .caption-explore-link:hover {
          gap: 0.65rem;
          background: #F59E0B;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
          transform: translateY(-1px);
        }

        /* Side B: Focus Cards Content Column — Equal 50% Desktop Width */
        .focus-cards-content-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          justify-content: space-between;
          height: 100%;
        }

        .focus-area-card {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-left: 4px solid var(--area-color);
          border-radius: 16px;
          padding: 1.35rem 1.6rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .focus-area-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
          border-color: var(--area-border);
        }

        .focus-area-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.65rem;
        }

        .focus-area-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--area-bg-light);
          color: var(--area-color);
          border: 1px solid var(--area-border);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .focus-area-index {
          font-family: var(--font-heading);
          font-size: 0.74rem;
          font-weight: 800;
          color: var(--slate-400, #94A3B8);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .focus-area-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          line-height: 1.3;
          letter-spacing: -0.015em;
          margin-bottom: 0.5rem;
        }

        .focus-area-intro-box {
          background: var(--cream-50, #FDFBF7);
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-left: 3px solid var(--area-color);
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          margin-bottom: 0.75rem;
        }

        .focus-area-intro-text {
          font-family: var(--font-body);
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--slate-700, #334155);
          font-weight: 500;
          margin: 0;
        }

        .focus-area-initiatives-wrap {
          margin-bottom: 0.85rem;
        }

        .initiatives-list-title {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--slate-400, #94A3B8);
          margin-bottom: 0.45rem;
        }

        .initiatives-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .initiative-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .initiative-check-icon {
          flex-shrink: 0;
          color: var(--area-color);
          margin-top: 0.15rem;
        }

        .initiative-text {
          font-size: 0.84rem;
          line-height: 1.45;
          color: var(--slate-600, #475569);
        }

        .focus-area-card-footer {
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle, #F1F5F9);
        }

        .focus-area-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          font-size: 0.84rem;
          color: var(--area-color);
          transition: gap 0.2s ease;
        }

        .focus-area-link:hover {
          gap: 0.55rem;
        }

        @media (max-width: 1023px) {
          .focus-visual-card {
            min-height: 440px;
          }
          .focus-visual-caption {
            padding: 1.75rem 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .focus-areas-editorial-section {
            padding: 4rem 0;
          }
          .focus-visual-card {
            min-height: 380px;
          }
          .focus-area-card {
            padding: 1.25rem 1.35rem;
          }
          .focus-visual-caption {
            padding: 1.5rem 1.25rem;
          }
        }
      `}</style>
    </section>
  );
}
