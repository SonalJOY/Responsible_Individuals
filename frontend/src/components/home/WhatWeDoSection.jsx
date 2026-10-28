import React, { useEffect, useRef, useState } from 'react';
import { Compass, GraduationCap, HeartPulse, TreePine, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhatWeDoSection() {
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

  const photographicItems = [
    {
      id: 'education',
      theme: 'Education',
      title: 'Education & Youth Empowerment',
      description:
        'Closing learning gaps through experiential education, modern classroom upgrades, and comprehensive digital literacy tailored to rural students.',
      imageSrc: '/images/whatwedo3.jpg',
      fallbackSrc: '/images/about-vision.jpg',
      icon: GraduationCap,
      color: '#D97706',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
      alt: 'Responsible Individuals team and volunteers outside Government Senior Primary School with banner supporting students',
      link: '/projects?focus_area=education',
    },
    {
      id: 'health',
      theme: 'Health',
      title: 'Health & Community Well-being',
      description:
        'Promoting holistic hygiene, menstrual health education, preventative medical camps, and guaranteed access to safe drinking water.',
      imageSrc: '/images/whatwedo1.avif',
      fallbackSrc: '/images/about-mission.jpg',
      icon: HeartPulse,
      color: '#E11D48',
      badgeBg: 'rgba(225, 29, 72, 0.15)',
      badgeBorder: 'rgba(225, 29, 72, 0.35)',
      alt: 'Community wellness initiative with young children in a supportive healthcare setting',
      link: '/projects?focus_area=health',
    },
    {
      id: 'environment',
      theme: 'Environment',
      title: 'Environment & Sustainability',
      description:
        'Mobilizing citizen stewardship for lake rejuvenation, desilting water bodies, native biodiversity planting, and clean green community drives.',
      imageSrc: '/images/whatwedo2.avif',
      fallbackSrc: '/images/about-hero.jpg',
      icon: TreePine,
      color: '#059669',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeBorder: 'rgba(16, 185, 129, 0.35)',
      alt: 'Volunteer engaged in eco-restoration and environment conservation surrounded by greenery',
      link: '/projects?focus_area=environment',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`what-we-do-section ${isVisible ? 'is-revealed' : ''}`}
      aria-labelledby="what-we-do-title"
    >
      <div className="container what-we-do-content-container">
        <div className="what-we-do-inner">
          {/* Section Eyebrow */}
          <div className="what-we-do-eyebrow">
            <Compass size={15} className="text-saffron" />
            <span>Core Foundation</span>
          </div>

          {/* Section Title — Noticeably Prominent Display */}
          <h2 id="what-we-do-title" className="what-we-do-title">
            What We Do
          </h2>

          {/* Authoritative Supporting Context with Meaningful Emphasis */}
          <p className="what-we-do-lead">
            We are a non-profit organization committed to driving{' '}
            <span className="emphasis-phrase saffron">sustainable social change</span>. Our strength lies in{' '}
            <span className="emphasis-phrase amber">decades of grassroots experience</span> and a deep understanding of{' '}
            <span className="emphasis-phrase blue">community development programs</span>.
          </p>

          {/* Three Real Photographic Thematic Items */}
          <div className="what-we-do-photo-grid">
            {photographicItems.map((item) => {
              const IconComp = item.icon;
              return (
                <article
                  key={item.id}
                  className="photo-theme-card"
                  style={{ '--card-accent': item.color }}
                >
                  {/* Photographic Media Container */}
                  <div className="card-media-wrapper">
                    <img
                      src={item.imageSrc}
                      alt={item.alt}
                      className="card-photo-img"
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== item.fallbackSrc) {
                          e.currentTarget.src = item.fallbackSrc;
                        }
                      }}
                    />
                    <div className="card-media-overlay" aria-hidden="true" />
                    
                    {/* Thematic Float Badge */}
                    <div 
                      className="card-theme-badge"
                      style={{
                        backgroundColor: item.badgeBg,
                        borderColor: item.badgeBorder,
                        color: item.color,
                      }}
                    >
                      <IconComp size={15} />
                      <span>{item.theme}</span>
                    </div>
                  </div>

                  {/* Card Editorial Content */}
                  <div className="card-content-body">
                    <h3 className="card-theme-title">{item.title}</h3>
                    <p className="card-theme-desc">{item.description}</p>
                    
                    <div className="card-action-wrap">
                      <Link to={item.link} className="card-action-link">
                        <span>Explore initiatives</span>
                        <ArrowRight size={15} className="action-arrow" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom Supporting Link */}
          <div className="what-we-do-cta">
            <Link to="/projects" className="what-we-do-link">
              <Sparkles size={16} />
              <span>See our community development programs in action</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .what-we-do-section {
          background-color: var(--cream-50, #FDFBF7);
          padding: 6.5rem 0;
          position: relative;
          overflow: hidden;
          width: 100%;
          border-bottom: 1px solid var(--border-subtle, #F1F5F9);
        }

        .what-we-do-content-container {
          position: relative;
          z-index: 2;
        }

        .what-we-do-inner {
          max-width: 1140px;
          margin: 0 auto;
          text-align: center;
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .what-we-do-section.is-revealed .what-we-do-inner {
          opacity: 1;
          transform: translateY(0);
        }

        .what-we-do-eyebrow {
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
          margin-bottom: 1.5rem;
        }

        .text-saffron {
          color: var(--primary-saffron, #F59E0B);
        }

        /* Large Prominent Display Title */
        .what-we-do-title {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 4.4vw, 3.8rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1.75rem;
        }

        /* Comfortable, High-Readability Supporting Lead Text */
        .what-we-do-lead {
          font-family: var(--font-body);
          font-size: clamp(1.15rem, 1.6vw, 1.4rem);
          font-weight: 500;
          color: var(--slate-800, #1E293B);
          line-height: 1.75;
          max-width: 880px;
          margin: 0 auto 3.75rem auto;
        }

        .emphasis-phrase {
          font-weight: 700;
          position: relative;
          padding: 0 0.15rem;
        }

        .emphasis-phrase.saffron {
          color: #B45309;
          background: linear-gradient(180deg, transparent 65%, rgba(245, 158, 11, 0.2) 65%);
        }

        .emphasis-phrase.amber {
          color: #92400E;
          background: linear-gradient(180deg, transparent 65%, rgba(251, 191, 36, 0.25) 65%);
        }

        .emphasis-phrase.blue {
          color: #0369A1;
          background: linear-gradient(180deg, transparent 65%, rgba(125, 211, 252, 0.3) 65%);
        }

        /* Photographic Theme Grid */
        .what-we-do-photo-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 3.5rem;
          text-align: left;
        }

        @media (min-width: 768px) {
          .what-we-do-photo-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
        }

        /* Individual Photographic Card */
        .photo-theme-card {
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
          display: flex;
          flex-direction: column;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.4s ease;
          position: relative;
        }

        .photo-theme-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 42px rgba(15, 23, 42, 0.12);
          border-color: var(--card-accent);
        }

        /* Media Frame with Zoom on Hover */
        .card-media-wrapper {
          position: relative;
          width: 100%;
          height: 230px;
          overflow: hidden;
          background-color: #E2E8F0;
        }

        @media (min-width: 1200px) {
          .card-media-wrapper {
            height: 250px;
          }
        }

        .card-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .photo-theme-card:hover .card-photo-img {
          transform: scale(1.07);
        }

        .card-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.3) 100%);
          pointer-events: none;
          transition: opacity 0.4s ease;
        }

        .photo-theme-card:hover .card-media-overlay {
          opacity: 0.85;
        }

        /* Floated Pill Badge on top of image */
        .card-theme-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.32rem 0.85rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid;
          z-index: 2;
        }

        /* Editorial Body */
        .card-content-body {
          padding: 2rem 1.85rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-theme-title {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          line-height: 1.3;
          letter-spacing: -0.015em;
          margin-bottom: 0.75rem;
          transition: color 0.2s ease;
        }

        .photo-theme-card:hover .card-theme-title {
          color: var(--card-accent);
        }

        .card-theme-desc {
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--slate-600, #475569);
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .card-action-wrap {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle, #F1F5F9);
        }

        .card-action-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--card-accent);
          transition: gap 0.25s ease;
        }

        .action-arrow {
          transition: transform 0.25s ease;
        }

        .photo-theme-card:hover .action-arrow {
          transform: translateX(4px);
        }

        /* Section CTA */
        .what-we-do-cta {
          display: flex;
          justify-content: center;
        }

        .what-we-do-link {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--primary-saffron-dark, #B45309);
          padding: 0.75rem 1.75rem;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-pill, 9999px);
          transition: all 0.3s ease;
        }

        .what-we-do-link:hover {
          gap: 0.85rem;
          color: #FFFFFF;
          background: var(--primary-saffron, #F59E0B);
          border-color: var(--primary-saffron, #F59E0B);
          box-shadow: 0 8px 22px rgba(245, 158, 11, 0.35);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .what-we-do-section {
            padding: 4.5rem 0;
          }
          .what-we-do-content-container {
            padding-left: clamp(2.5rem, 8vw, 3.5rem);
            padding-right: clamp(2.5rem, 8vw, 3.5rem);
          }
          .what-we-do-lead {
            margin-bottom: 2.75rem;
          }
          .card-content-body {
            padding: 1.6rem 1.4rem;
          }
        }
      `}</style>
    </section>
  );
}
