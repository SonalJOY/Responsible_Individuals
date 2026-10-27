import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, TreePine, HeartPulse, CheckCircle2, 
  ArrowRight, Sparkles, Eye, Target, Play, Pause
} from 'lucide-react';

export default function FocusAreasSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isVisionPlaying, setIsVisionPlaying] = useState(true);
  const [isMissionPlaying, setIsMissionPlaying] = useState(true);
  const [hasVisionError, setHasVisionError] = useState(false);
  const [hasMissionError, setHasMissionError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  ));

  const sectionRef = useRef(null);
  const visionVideoRef = useRef(null);
  const missionVideoRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const listener = (e) => setReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    if (visionVideoRef.current && !reducedMotion) {
      visionVideoRef.current.playbackRate = 0.75;
    }
    if (missionVideoRef.current && !reducedMotion) {
      missionVideoRef.current.playbackRate = 0.75;
    }
  }, [reducedMotion]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (visionVideoRef.current && !reducedMotion) {
            visionVideoRef.current.play().catch(() => {});
          }
          if (missionVideoRef.current && !reducedMotion) {
            missionVideoRef.current.play().catch(() => {});
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [reducedMotion]);

  const toggleVisionPlay = () => {
    if (!visionVideoRef.current) return;
    if (isVisionPlaying) {
      visionVideoRef.current.pause();
      setIsVisionPlaying(false);
    } else {
      visionVideoRef.current.play().then(() => setIsVisionPlaying(true)).catch(() => {});
    }
  };

  const toggleMissionPlay = () => {
    if (!missionVideoRef.current) return;
    if (isMissionPlaying) {
      missionVideoRef.current.pause();
      setIsMissionPlaying(false);
    } else {
      missionVideoRef.current.play().then(() => setIsMissionPlaying(true)).catch(() => {});
    }
  };

  const focusAreas = [
    {
      id: 'education',
      title: 'Education, Youth Empowerment & Skill Development',
      shortTitle: 'Education & Youth',
      icon: GraduationCap,
      color: '#2563EB',
      bgLight: 'rgba(239, 246, 255, 0.65)',
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
      bgLight: 'rgba(236, 253, 245, 0.65)',
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
      bgLight: 'rgba(255, 241, 242, 0.65)',
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
            <span>Guiding Purpose &amp; Impact Pillars</span>
          </div>

          <h2 id="focus-areas-title" className="focus-areas-main-title">
            Focus Areas of Our NGO
          </h2>

          <p className="focus-areas-subtitle">
            Our interventions are concentrated across three strategic domains to drive long-term, measurable grassroots transformation.
          </p>
        </div>

        {/* Balanced Two-Column Composition: Media Showcase (Vision & Mission Videos) + Focus Area Pillars */}
        <div className="focus-areas-impact-layout">
          {/* Side A: Dedicated Visual Media Showcase with Existing Mission & Vision Videos (Secondary Media) */}
          <aside className="focus-media-showcase-col" aria-label="On-ground documentary media for Vision and Mission">
            <div className="focus-media-stack">
              {/* 1. Vision Video Media Element */}
              <div className="focus-video-card vision-media-card">
                <div className="focus-video-frame">
                  {!hasVisionError && !reducedMotion ? (
                    <video
                      ref={visionVideoRef}
                      src="/videos/vision.mp4"
                      poster="/images/about-vision.jpg"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="focus-video-element"
                      onError={() => setHasVisionError(true)}
                      aria-label="Our Vision in action: Children in digital classrooms and grassroots communities"
                    />
                  ) : (
                    <img
                      src="/images/about-vision.jpg"
                      alt="Rural government school students reading books together in an improved classroom"
                      className="focus-photo-fallback"
                      loading="lazy"
                    />
                  )}
                  <div className="focus-video-scrim" aria-hidden="true" />

                  {/* Clean Vision Pill Badge */}
                  <div className="focus-video-badge vision-badge">
                    <Eye size={13} className="text-blue" />
                    <span>Vision in Action</span>
                  </div>

                  {/* Video Play/Pause Control */}
                  {!hasVisionError && !reducedMotion && (
                    <button
                      type="button"
                      onClick={toggleVisionPlay}
                      className="focus-play-pause-btn"
                      aria-label={isVisionPlaying ? 'Pause Vision video' : 'Play Vision video'}
                    >
                      {isVisionPlaying ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Mission Video Media Element */}
              <div className="focus-video-card mission-media-card">
                <div className="focus-video-frame">
                  {!hasMissionError && !reducedMotion ? (
                    <video
                      ref={missionVideoRef}
                      src="/videos/mission.mp4"
                      poster="/images/about-mission.jpg"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="focus-video-element"
                      onError={() => setHasMissionError(true)}
                      aria-label="Our Mission on the ground: Citizen volunteers and youth community drives"
                    />
                  ) : (
                    <img
                      src="/images/about-mission.jpg"
                      alt="Volunteers and teachers collaborating in a rural school classroom"
                      className="focus-photo-fallback"
                      loading="lazy"
                    />
                  )}
                  <div className="focus-video-scrim" aria-hidden="true" />

                  {/* Clean Mission Pill Badge */}
                  <div className="focus-video-badge mission-badge">
                    <Target size={13} className="text-saffron" />
                    <span>Mission on the Ground</span>
                  </div>

                  {/* Video Play/Pause Control */}
                  {!hasMissionError && !reducedMotion && (
                    <button
                      type="button"
                      onClick={toggleMissionPlay}
                      className="focus-play-pause-btn"
                      aria-label={isMissionPlaying ? 'Pause Mission video' : 'Play Mission video'}
                    >
                      {isMissionPlaying ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Side B: Focus Cards Content Column (Primary Focus Area Content) */}
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
                  {/* Card Header: Icon + Index */}
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
                    <p className="focus-area-intro-text">{area.introduction}</p>
                  </div>

                  {/* Initiatives Checklist */}
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

                  {/* Action Link */}
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
          background: transparent;
          padding: 5.5rem 0 5rem 0;
          position: relative;
          overflow: hidden;
        }

        .focus-areas-header {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 3rem auto;
        }

        .focus-areas-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(253, 251, 247, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          color: var(--charcoal-900, #0F172A);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .text-saffron {
          color: var(--primary-saffron, #F59E0B);
        }

        .text-blue {
          color: #2563EB;
        }

        .focus-areas-main-title {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--charcoal-900, #0F172A);
          margin-bottom: 0.85rem;
        }

        @media (min-width: 768px) {
          .focus-areas-main-title {
            font-size: 3.25rem;
          }
        }

        .focus-areas-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary, #475569);
          line-height: 1.6;
          margin: 0 auto;
        }

        /* Two-Column Balanced Composition: Media Showcase (Side A) & Focus Areas (Side B) */
        .focus-areas-impact-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .focus-areas-impact-layout {
            grid-template-columns: 44% 53%;
            gap: 3%;
          }
        }

        /* Side A: Dedicated Visual Media Showcase Column */
        .focus-media-showcase-col {
          width: 100%;
        }

        .focus-media-stack {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .focus-media-stack {
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
          }
        }

        .focus-video-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(15, 23, 42, 0.04);
          border: 1px solid rgba(226, 232, 240, 0.75);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .focus-video-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
          border-color: rgba(245, 158, 11, 0.45);
        }

        .focus-video-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9.6;
          overflow: hidden;
          background: #0F172A;
        }

        .focus-video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .focus-photo-fallback {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .focus-video-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.45) 0%,
            rgba(15, 23, 42, 0) 35%,
            rgba(15, 23, 42, 0.35) 100%
          );
          pointer-events: none;
        }

        .focus-video-badge {
          position: absolute;
          top: 0.9rem;
          left: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 2;
        }

        .vision-badge .text-blue {
          color: #60A5FA;
        }

        .mission-badge .text-saffron {
          color: #FBBF24;
        }

        .focus-play-pause-btn {
          position: absolute;
          bottom: 0.85rem;
          right: 0.85rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 2;
        }

        .focus-play-pause-btn:hover {
          background: rgba(245, 158, 11, 0.9);
          color: #0F172A;
          transform: scale(1.08);
        }

        /* Side B: Focus Cards Content Column (Three Pillars) */
        .focus-cards-content-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .focus-area-card {
          background: rgba(253, 251, 247, 0.78);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.75);
          border-left: 4px solid var(--area-color);
          border-radius: 18px;
          padding: 1.35rem 1.6rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .focus-area-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
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
          font-size: 1.18rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          line-height: 1.3;
          letter-spacing: -0.015em;
          margin-bottom: 0.5rem;
        }

        .focus-area-intro-box {
          background: rgba(253, 251, 247, 0.6);
          border: 1px solid rgba(226, 232, 240, 0.65);
          border-left: 3px solid var(--area-color);
          border-radius: 8px;
          padding: 0.55rem 0.85rem;
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
          border-top: 1px solid rgba(226, 232, 240, 0.6);
        }

        .focus-area-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          font-size: 0.84rem;
          color: var(--area-color);
          transition: gap 0.2s ease;
          text-decoration: none;
        }

        .focus-area-link:hover {
          gap: 0.55rem;
        }

        @media (max-width: 768px) {
          .focus-areas-editorial-section {
            padding: 4rem 0 3.5rem 0;
          }
          .focus-area-card {
            padding: 1.25rem 1.35rem;
          }
        }
      `}</style>
    </section>
  );
}
