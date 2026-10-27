import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Eye, Play, Pause } from 'lucide-react';

export default function VisionSection() {
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
      // Reduce threshold on mobile so tall sections still trigger
      { threshold: typeof window !== 'undefined' && window.innerWidth < 768 ? 0.05 : 0.2 }
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
      className={`vision-editorial-section ${isVisible ? 'is-revealed' : ''}`}
      aria-labelledby="vision-section-title"
    >
      <div className="container">
        <div className="vision-editorial-grid">
          {/* Visual Column: Integrated Existing Vision Video Asset */}
          <div className="vision-visual-col">
            <div className="vision-media-frame">
              {!hasVideoError && !reducedMotion ? (
                <video
                  ref={videoRef}
                  src="/videos/vision.mp4"
                  poster="/images/about-vision.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={() => { if (videoRef.current) videoRef.current.playbackRate = 0.75; }}
                  className="vision-video-element"
                  onError={() => setHasVideoError(true)}
                  aria-label="Vision illustration video of empowered communities and children thriving"
                />
              ) : (
                <img
                  src="/images/about-vision.jpg"
                  alt="Rural government school students reading books together in an improved classroom with their teacher"
                  className="vision-photo-fallback"
                  loading="lazy"
                />
              )}

              {/* Readability Ambient Vignette */}
              <div className="vision-media-overlay" aria-hidden="true" />

              {/* Floating Badge */}
              <div className="vision-floating-badge">
                <Sparkles size={14} className="text-saffron" />
                <span>Empowered Communities • Inspiring Generations</span>
              </div>

              {/* Optional User Play/Pause Control */}
              {!hasVideoError && !reducedMotion && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="vision-play-pause-btn"
                  aria-label={isPlaying ? 'Pause Vision video' : 'Play Vision video'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
              )}
            </div>
          </div>

          {/* Text Content Column */}
          <div className="vision-content-col">
            <div className="vision-eyebrow">
              <Eye size={15} />
              <span>Our Vision</span>
            </div>

            {/* Display Title — Significantly Larger */}
            <h2 id="vision-section-title" className="vision-heading">
              Our Vision
            </h2>

            {/* Visual Focal Point: Authoritative Opening Sentence */}
            <div className="vision-focal-point-wrap">
              <p className="vision-focal-statement">
                &ldquo;To create a world where every life we touch is empowered, nurtured, and inspired to thrive.&rdquo;
              </p>
            </div>

            {/* Supporting Context */}
            <p className="vision-supporting-text">
              We believe that true change begins with compassion and responsibility. Our vision is to be a catalyst for positive impact, thereby igniting waves of change.
            </p>

            <div className="vision-cta-row">
              <Link to="/about#vision" className="vision-explore-link">
                <span>Learn more about our Vision &amp; Philosophy</span>
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
            grid-template-columns: 1.15fr 1fr;
            gap: 4.5rem;
          }
        }

        /* Visual Column & Video Frame */
        .vision-visual-col {
          position: relative;
          opacity: 0;
          transform: translateX(-32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .is-revealed .vision-visual-col {
          opacity: 1;
          transform: translateX(0);
        }

        .vision-media-frame {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12);
          border: 1px solid var(--border-subtle, #E2E8F0);
          aspect-ratio: 16 / 10;
          background: #0F172A;
        }

        .vision-video-element,
        .vision-photo-fallback {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .vision-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.38) 100%);
          pointer-events: none;
        }

        .vision-floating-badge {
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

        .vision-play-pause-btn {
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

        .vision-play-pause-btn:hover {
          background: rgba(15, 23, 42, 0.85);
          transform: scale(1.08);
        }

        /* Text Content Column */
        .vision-content-col {
          opacity: 0;
          transform: translateX(32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .is-revealed .vision-content-col {
          opacity: 1;
          transform: translateX(0);
        }

        .vision-eyebrow {
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

        /* Distinctive Section Heading */
        .vision-heading {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 4vw, 3.5rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1.75rem;
        }

        /* Opening Sentence: Prominent Visual Focal Point */
        .vision-focal-point-wrap {
          border-left: 4px solid var(--primary-saffron, #F59E0B);
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .vision-focal-statement {
          font-family: var(--font-heading);
          font-size: clamp(1.4rem, 2.2vw, 1.85rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.02em;
          line-height: 1.35;
          margin: 0;
        }

        /* Supporting Text Context */
        .vision-supporting-text {
          font-family: var(--font-body);
          font-size: clamp(1.05rem, 1.3vw, 1.18rem);
          line-height: 1.75;
          color: var(--slate-600, #475569);
          margin-bottom: 2.25rem;
          max-width: 580px;
        }

        .vision-cta-row {
          display: flex;
          align-items: center;
        }

        .vision-explore-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.98rem;
          color: var(--primary-saffron-dark, #B45309);
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .vision-explore-link:hover {
          gap: 0.75rem;
          color: var(--primary-saffron-hover, #D97706);
        }

        @media (max-width: 768px) {
          .vision-editorial-section {
            padding: 4.5rem 0;
          }
          .vision-media-frame {
            aspect-ratio: 16 / 11;
          }
          .vision-floating-badge {
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
