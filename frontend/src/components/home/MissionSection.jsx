import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, Play, Pause, HeartHandshake } from 'lucide-react';

export default function MissionSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  ));

  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const listener = (e) => setReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (videoRef.current && !reducedMotion) {
            videoRef.current.play().catch(() => {});
          }
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [reducedMotion]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className={`mission-editorial-section ${isVisible ? 'is-revealed' : ''}`}
      aria-labelledby="mission-section-title"
    >
      <div className="container">
        <div className="mission-editorial-grid">
          {/* Text Content Column (Left on Desktop for Alternating Rhythm) */}
          <div className="mission-content-col">
            <div className="mission-eyebrow">
              <Target size={15} />
              <span>Our Mission</span>
            </div>

            {/* Display Title — Significantly Larger */}
            <h2 id="mission-section-title" className="mission-heading">
              Our Mission
            </h2>

            {/* Mission Statement: Clear, Inspiring, and Easy to Read */}
            <div className="mission-statement-wrap">
              <p className="mission-core-statement">
                &ldquo;Build a platform that brings together passionate volunteers who believe in giving back to the community.&rdquo;
              </p>
            </div>

            {/* Supporting Context */}
            <p className="mission-supporting-text">
              Through collaboration and shared purpose, we aim to inspire one another and nurture a culture of responsibility—transforming every individual into a Responsible Individual.
            </p>

            <div className="mission-cta-row">
              <Link to="/volunteer" className="mission-explore-link">
                <span>Join our volunteer community platform</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Visual Column: Integrated Existing Mission Video Asset (Right on Desktop) */}
          <div className="mission-visual-col">
            <div className="mission-media-frame">
              {!hasVideoError && !reducedMotion ? (
                <video
                  ref={videoRef}
                  src="/videos/mission.mp4"
                  poster="/images/about-mission.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={() => { if (videoRef.current) videoRef.current.playbackRate = 0.75; }}
                  className="mission-video-element"
                  onError={() => setHasVideoError(true)}
                  aria-label="Mission illustration video showing community volunteers and teachers collaborating on the ground"
                />
              ) : (
                <img
                  src="/images/about-mission.jpg"
                  alt="Volunteers and teachers collaborating in a rural school classroom to provide educational materials and digital learning resources"
                  className="mission-photo-fallback"
                  loading="lazy"
                />
              )}

              {/* Ambient Readability Overlay */}
              <div className="mission-media-overlay" aria-hidden="true" />

              {/* Floating Badge */}
              <div className="mission-floating-badge">
                <HeartHandshake size={14} className="text-blue" />
                <span>Passionate Volunteers • Shared Purpose</span>
              </div>

              {/* Optional User Play/Pause Control */}
              {!hasVideoError && !reducedMotion && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="mission-play-pause-btn"
                  aria-label={isPlaying ? 'Pause Mission video' : 'Play Mission video'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
              )}
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
            grid-template-columns: 1fr 1.15fr;
            gap: 4.5rem;
          }
        }

        /* Content Column Animation (Left side) */
        .mission-content-col {
          opacity: 0;
          transform: translateX(-32px);
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
          background: rgba(2, 132, 199, 0.1);
          border: 1px solid rgba(2, 132, 199, 0.28);
          color: #0369A1;
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }

        .text-blue {
          color: #0284C7;
        }

        /* Distinctive Section Heading */
        .mission-heading {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 4vw, 3.5rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1.75rem;
        }

        /* Mission Statement: Clear, Inspiring Callout */
        .mission-statement-wrap {
          border-left: 4px solid #0284C7;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .mission-core-statement {
          font-family: var(--font-heading);
          font-size: clamp(1.4rem, 2.2vw, 1.85rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.02em;
          line-height: 1.35;
          margin: 0;
        }

        /* Supporting Text */
        .mission-supporting-text {
          font-family: var(--font-body);
          font-size: clamp(1.05rem, 1.3vw, 1.18rem);
          line-height: 1.75;
          color: var(--slate-600, #475569);
          margin-bottom: 2.25rem;
          max-width: 580px;
        }

        .mission-cta-row {
          display: flex;
          align-items: center;
        }

        .mission-explore-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.98rem;
          color: #0284C7;
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .mission-explore-link:hover {
          gap: 0.75rem;
          color: #0369A1;
        }

        /* Visual Column & Video Frame (Right side) */
        .mission-visual-col {
          position: relative;
          opacity: 0;
          transform: translateX(32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .is-revealed .mission-visual-col {
          opacity: 1;
          transform: translateX(0);
        }

        .mission-media-frame {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12);
          border: 1px solid var(--border-subtle, #E2E8F0);
          aspect-ratio: 16 / 10;
          background: #0F172A;
        }

        .mission-video-element,
        .mission-photo-fallback {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .mission-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.38) 100%);
          pointer-events: none;
        }

        .mission-floating-badge {
          position: absolute;
          bottom: 18px;
          left: 18px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 0.55rem 1.1rem;
          border-radius: var(--radius-pill, 9999px);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--charcoal-900, #0F172A);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.8);
          z-index: 2;
        }

        .mission-play-pause-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.65);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: background-color 0.2s ease, transform 0.2s ease;
          z-index: 2;
        }

        .mission-play-pause-btn:hover {
          background: rgba(15, 23, 42, 0.85);
          transform: scale(1.08);
        }

        @media (max-width: 768px) {
          .mission-editorial-section {
            padding: 4.5rem 0;
          }
          .mission-media-frame {
            aspect-ratio: 16 / 11;
          }
          .mission-floating-badge {
            font-size: 0.75rem;
            padding: 0.4rem 0.85rem;
            bottom: 12px;
            left: 12px;
          }
        }
      `}</style>
    </section>
  );
}
