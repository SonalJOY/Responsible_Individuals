import React, { useEffect, useRef, useState } from 'react';
import { BookMarked, Quote, ArrowRight, Play, Pause, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OurStorySection() {
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
    if (videoRef.current && !reducedMotion) {
      videoRef.current.playbackRate = 0.75;
    }
  }, [reducedMotion]);

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
      className={`our-story-section ${isVisible ? 'is-revealed' : ''}`}
      aria-labelledby="our-story-title"
    >
      <div className="container">
        {/* Section Header */}
        <div className="our-story-header">
          <div className="our-story-eyebrow">
            <BookMarked size={15} className="text-emerald" />
            <span>Our Journey &amp; Origins</span>
          </div>

          <h2 id="our-story-title" className="our-story-title">
            Our Story
          </h2>
        </div>

        {/* Two-Sided Balanced Composition Grid: Equal 50/50 Width & Matching Card Height */}
        <div className="our-story-two-sided-grid">
          {/* Side A: Dedicated Full-Height Media Card (Equal 50% Width) */}
          <div className="our-story-video-col">
            <div className="our-story-media-frame">
              {!hasVideoError && !reducedMotion ? (
                <video
                  ref={videoRef}
                  src="/videos/ourstory.mp4"
                  poster="/images/about-hero.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="our-story-video-element"
                  onLoadedMetadata={() => {
                    if (videoRef.current) videoRef.current.playbackRate = 0.75;
                  }}
                  onError={() => setHasVideoError(true)}
                  aria-label="Video documentary illustrating Responsible Individuals volunteer journey and grassroots milestones"
                />
              ) : (
                <img
                  src="/images/about-hero.jpg"
                  alt="Responsible Individuals founders, volunteers, and community members working together on location"
                  className="our-story-photo-fallback"
                  loading="lazy"
                />
              )}

              {/* Readability Ambient Vignette */}
              <div className="our-story-media-overlay" aria-hidden="true" />

              {/* Floating Story Badge */}
              <div className="our-story-floating-badge">
                <Sparkles size={14} className="text-saffron" />
                <span>Grassroots Journey • Community Ownership</span>
              </div>

              {/* Play/Pause Control */}
              {!hasVideoError && !reducedMotion && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="our-story-play-pause-btn"
                  aria-label={isPlaying ? 'Pause Our Story video' : 'Play Our Story video'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                </button>
              )}

              {/* Integrated Bottom Story Caption Bar */}
              <div className="our-story-bottom-bar">
                <p className="our-story-bottom-caption">
                  A documentary glimpse of citizen volunteers and local leaders transforming communities one initiative at a time.
                </p>
              </div>
            </div>
          </div>

          {/* Side B: Narrative Flow with 3 Chapters & Closing Affirmation (Equal 50% Width) */}
          <div className="our-story-content-col">
            <div className="story-chapters-list">
              {/* Chapter 01: The Spark */}
              <div className="narrative-chapter-card">
                <div className="chapter-marker">
                  <span className="chapter-number">01</span>
                  <span className="chapter-label">The Spark</span>
                </div>
                <p className="narrative-text">
                  Responsible Individuals began with a simple belief that small, consistent actions can create a big change. A group of like-minded individuals came together, united by a shared vision of a better world—one where education opens doors, health empowers lives, the environment thrives, and communities rise together.
                </p>
              </div>

              {/* Chapter 02: The Movement */}
              <div className="narrative-chapter-card">
                <div className="chapter-marker">
                  <span className="chapter-number">02</span>
                  <span className="chapter-label">The Movement</span>
                </div>
                <p className="narrative-text">
                  What started as conversations and small initiatives soon grew into a movement. Today, we are a community-driven NGO dedicated to making a lasting impact through education, health, environmental care, and empowerment programs.
                </p>
              </div>

              {/* Chapter 03: The Purpose */}
              <div className="narrative-chapter-card">
                <div className="chapter-marker">
                  <span className="chapter-number">03</span>
                  <span className="chapter-label">The Purpose</span>
                </div>
                <p className="narrative-text">
                  Every project we take on is rooted in the idea that change doesn’t happen overnight—it happens when individuals come together, take responsibility, and act with purpose.
                </p>
              </div>
            </div>

            {/* Closing Statement — Special Visual Emphasis Banner */}
            <div className="our-story-closing-banner" role="complementary" aria-label="Closing Affirmation">
              <div className="closing-quote-icon-wrap" aria-hidden="true">
                <Quote size={24} />
              </div>
              <div className="closing-banner-content">
                <blockquote className="closing-statement-quote">
                  &ldquo;We are Responsible Individuals — who believe change begins with us.&rdquo;
                </blockquote>
                <span className="closing-statement-attribution">
                  The Foundational Pledge of Our Community
                </span>
              </div>
            </div>

            {/* Link to About Us Page */}
            <div className="our-story-cta">
              <Link to="/about" className="story-read-more-link">
                <span>Read more about our leadership and journey</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .our-story-section {
          background-color: #FFFFFF;
          padding: 6.5rem 0;
          position: relative;
          overflow: hidden;
        }

        .our-story-header {
          text-align: center;
          margin-bottom: 3.75rem;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .our-story-section.is-revealed .our-story-header {
          opacity: 1;
          transform: translateY(0);
        }

        .our-story-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.28);
          color: #047857;
          padding: 0.38rem 1.15rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }

        .text-emerald {
          color: #10B981;
        }

        .text-saffron {
          color: #F59E0B;
        }

        .our-story-title {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 4.4vw, 3.8rem);
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0;
        }

        /* Two-Sided Balanced Composition Layout — Exactly 50/50 Equal Widths */
        .our-story-two-sided-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: stretch;
        }

        @media (min-width: 992px) {
          .our-story-two-sided-grid {
            grid-template-columns: 1fr 1fr;
            gap: 3.5rem;
            align-items: stretch;
          }
        }

        /* Video Column — Equal 50% Desktop Width, Full Height */
        .our-story-video-col {
          display: flex;
          flex-direction: column;
          height: 100%;
          opacity: 0;
          transform: translateX(-32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .our-story-section.is-revealed .our-story-video-col {
          opacity: 1;
          transform: translateX(0);
        }

        /* Media Frame completely fills the visual card with object-fit: cover */
        .our-story-media-frame {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 520px;
          flex: 1;
          border-radius: 24px;
          overflow: hidden;
          background-color: #0F172A;
          box-shadow: 0 20px 48px rgba(15, 23, 42, 0.14);
          border: 1px solid var(--border-subtle, #E2E8F0);
          display: flex;
          flex-direction: column;
        }

        .our-story-video-element,
        .our-story-photo-fallback {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .our-story-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.15) 50%, rgba(15, 23, 42, 0.75) 100%);
          pointer-events: none;
        }

        .our-story-floating-badge {
          position: absolute;
          top: 1.35rem;
          left: 1.35rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(245, 158, 11, 0.45);
          color: #FFFFFF;
          padding: 0.45rem 1rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          z-index: 2;
        }

        .our-story-play-pause-btn {
          position: absolute;
          top: 1.35rem;
          right: 1.35rem;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.25s ease, background 0.25s ease;
          z-index: 2;
        }

        .our-story-play-pause-btn:hover {
          transform: scale(1.1);
          background: var(--primary-saffron, #F59E0B);
          color: #0F172A;
          border-color: var(--primary-saffron, #F59E0B);
        }

        /* Bottom Caption Bar integrated inside the frame */
        .our-story-bottom-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.75rem 1.5rem 1.5rem 1.5rem;
          z-index: 2;
        }

        .our-story-bottom-caption {
          font-family: var(--font-body);
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.55;
          margin: 0;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
          font-weight: 500;
        }

        /* Content Column — Equal 50% Desktop Width */
        .our-story-content-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          opacity: 0;
          transform: translateX(32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .our-story-section.is-revealed .our-story-content-col {
          opacity: 1;
          transform: translateX(0);
        }

        .story-chapters-list {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .narrative-chapter-card {
          background: var(--cream-50, #FDFBF7);
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-left: 4px solid var(--primary-saffron, #F59E0B);
          border-radius: 16px;
          padding: 1.65rem 1.85rem;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-left-color 0.25s ease;
        }

        .narrative-chapter-card:hover {
          transform: translateX(4px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          border-left-color: var(--primary-saffron-dark, #B45309);
        }

        .chapter-marker {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.65rem;
        }

        .chapter-number {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--primary-saffron-dark, #B45309);
          background: rgba(245, 158, 11, 0.15);
          padding: 0.15rem 0.55rem;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }

        .chapter-label {
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--slate-500, #64748B);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .narrative-text {
          font-family: var(--font-body);
          font-size: clamp(0.98rem, 1.2vw, 1.12rem);
          line-height: 1.7;
          color: var(--slate-700, #334155);
          margin: 0;
        }

        /* Closing Statement — Special Visual Emphasis Banner */
        .our-story-closing-banner {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          color: #FFFFFF;
          border-radius: 20px;
          padding: 2rem 2.25rem;
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
          border: 1px solid rgba(245, 158, 11, 0.25);
          position: relative;
          overflow: hidden;
        }

        .our-story-closing-banner::after {
          content: '';
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .closing-quote-icon-wrap {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.18);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: var(--primary-saffron, #F59E0B);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .closing-banner-content {
          flex-grow: 1;
        }

        .closing-statement-quote {
          font-family: var(--font-heading);
          font-size: clamp(1.15rem, 1.75vw, 1.45rem);
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.38;
          margin: 0 0 0.65rem 0;
          letter-spacing: -0.015em;
        }

        .closing-statement-attribution {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--primary-saffron, #F59E0B);
        }

        .our-story-cta {
          display: flex;
          justify-content: flex-start;
          padding-top: 0.25rem;
        }

        .story-read-more-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.96rem;
          color: var(--slate-700, #334155);
          padding: 0.4rem 0.5rem;
          border-radius: var(--radius-pill, 9999px);
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .story-read-more-link:hover {
          gap: 0.75rem;
          color: var(--primary-saffron-dark, #B45309);
        }

        @media (max-width: 991px) {
          .our-story-video-col {
            height: auto;
          }
          .our-story-media-frame {
            min-height: 380px;
            aspect-ratio: 16 / 10;
            flex: none;
          }
        }

        @media (max-width: 768px) {
          .our-story-section {
            padding: 4.5rem 0;
          }
          .our-story-header {
            margin-bottom: 2.5rem;
          }
          .narrative-chapter-card {
            padding: 1.5rem 1.35rem;
          }
          .our-story-closing-banner {
            flex-direction: column;
            gap: 1.25rem;
            padding: 1.75rem 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
