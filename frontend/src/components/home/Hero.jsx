import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import riLogo from '../../assets/ri-logo.png';
import stockVideo from '../../assets/stock.mp4';
import FoldText from './FoldText';

export default function Hero() {
  const videoRef = useRef(null);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  ));

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

  return (
    <section className="hero-editorial-root">
      {/* 1. Full Hero Background Video with Reduced-Motion Fallback (z-index: 0) */}
      {!reducedMotion && !hasVideoError ? (
        <video 
          ref={videoRef}
          src={stockVideo}
          poster="/images/about-hero.jpg"
          onLoadedMetadata={() => { if (videoRef.current) videoRef.current.playbackRate = 0.75; }}
          autoPlay
          muted
          loop
          playsInline
          className="hero-full-bg-video"
          onError={() => setHasVideoError(true)}
          aria-hidden="true"
        />
      ) : (
        <img
          src="/images/about-hero.jpg"
          alt="Responsible Individuals community initiatives"
          className="hero-full-bg-video"
        />
      )}

      {/* 2. Atmospheric Brand Palette Overlay with Saffron, Navy & Light Blue Hues (z-index: 1) */}
      <div className="hero-video-bg-overlay" aria-hidden="true" />

      {/* 3. Foreground Hero Content (z-index: 10 - strictly above Dot Grid & Video) */}
      <div className="container hero-layout-container">
        {/* Top Eyebrow Badge */}
        <div className="hero-eyebrow-wrap hero-fade-item" style={{ animationDelay: '0.05s' }}>
          <div className="hero-badge-pill">
            <img src={riLogo} alt="" className="hero-badge-mini-logo" />
            <Sparkles size={14} className="text-emerald" />
            <span>Building Responsible Communities • 2026</span>
          </div>
        </div>

        {/* FoldText Entrance Heading — Exactly Single Instance H1 */}
        <h1 className="hero-heading-wrapper">
          <FoldText
            text={"Empowering Citizens.\nCreating Sustainable Impact."}
            splitBy="word"
            hinge="top"
            duration={0.8}
            stagger={0.05}
            ease="power3.out"
            perspective={800}
            creaseShading={0.32}
            trigger="mount"
            fontSize="clamp(44px, 5.8vw, 88px)"
            fontWeight={800}
            color="#FFFFFF"
            highlightWords={['Citizens.']}
            highlightColor="#F59E0B"
            className="hero-fold-headline"
          />
        </h1>

        {/* Supporting Mission Lead Text */}
        <p className="hero-mission-lead hero-fade-item" style={{ animationDelay: '0.35s' }}>
          Responsible Individuals connects communities, volunteers, donors, and corporate CSR partners through transparent, data-driven grassroots action to solve water, ecological, and educational challenges.
        </p>

        {/* CTA Cluster */}
        <div className="hero-cta-cluster hero-fade-item" style={{ animationDelay: '0.5s' }}>
          <Link to="/projects" className="btn-editorial-primary">
            <span>Explore Our Work</span>
            <div className="btn-arrow-circle">
              <ArrowRight size={16} />
            </div>
          </Link>
          <Link to="/volunteer" className="btn-editorial-secondary">
            <span>Join as a Volunteer</span>
          </Link>
        </div>

        {/* Verifiable Proof Points */}
        <div className="hero-proof-bar hero-fade-item" style={{ animationDelay: '0.65s' }}>
          <div className="proof-item">
            <CheckCircle size={16} className="proof-icon" />
            <span>80G Tax Deductible</span>
          </div>
          <div className="proof-item">
            <CheckCircle size={16} className="proof-icon" />
            <span>100% Verified Outcomes</span>
          </div>
          <div className="proof-item">
            <CheckCircle size={16} className="proof-icon" />
            <span>Audited Financials</span>
          </div>
        </div>
      </div>

      <style>{`
        .hero-editorial-root {
          position: relative;
          min-height: 90vh;
          min-height: calc(100vh - 82px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 5.5rem 1.5rem 5rem 1.5rem;
          background-color: #0F172A;
          width: 100%;
        }

        /* 1. Full Hero Background Video: z-index: 0 */
        .hero-full-bg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 0;
          pointer-events: none;
          filter: brightness(0.82) contrast(1.06);
        }

        /* 2. Atmospheric Brand Palette Overlay: Saffron, Light Blue & Navy: z-index: 1 */
        .hero-video-bg-overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 85% 15%, rgba(245, 158, 11, 0.22) 0%, transparent 50%),
            radial-gradient(ellipse at 15% 85%, rgba(125, 211, 252, 0.18) 0%, transparent 55%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.65) 45%, rgba(15, 23, 42, 0.94) 100%);
          z-index: 1;
          pointer-events: none;
        }

        /* 3. Foreground Hero Layout: z-index: 10 (strictly above Dot Grid z-index: 2) */
        .hero-layout-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 1050px;
          margin: 0 auto;
          width: 100%;
        }

        .hero-eyebrow-wrap {
          margin-bottom: 2rem;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(125, 211, 252, 0.35);
          padding: 0.5rem 1.35rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.85rem;
          font-weight: 700;
          color: #FFFFFF;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 0 0 15px rgba(125, 211, 252, 0.1);
          letter-spacing: 0.03em;
        }

        .hero-badge-mini-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
          filter: brightness(1.2);
        }

        .text-emerald {
          color: var(--secondary-light-blue, #7DD3FC);
        }

        /* Hero FoldText Headline */
        .hero-heading-wrapper {
          position: relative;
          width: 100%;
          margin: 0 0 1.75rem 0;
          padding: 0;
          font-size: inherit;
          font-weight: inherit;
          text-align: center;
          display: block;
        }

        .hero-fold-headline {
          font-family: var(--font-heading, "Cabinet Grotesk", sans-serif);
          text-align: center;
          display: inline-block;
          max-width: 1000px;
          line-height: 1.06;
          filter: drop-shadow(0 4px 18px rgba(0, 0, 0, 0.45));
        }

        .hero-mission-lead {
          font-family: var(--font-body);
          font-size: clamp(1.05rem, 1.45vw, 1.3rem);
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.94);
          max-width: 820px;
          margin: 0 auto 2.75rem auto;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
          font-weight: 400;
        }

        /* CTA Buttons Cluster */
        .hero-cta-cluster {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1.25rem;
          margin-bottom: 3.5rem;
        }

        .btn-editorial-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          background: var(--primary-saffron, #F59E0B);
          color: #0F172A;
          font-weight: 800;
          font-size: 1.05rem;
          padding: 0.9rem 1.85rem;
          border-radius: var(--radius-pill, 9999px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-editorial-primary:hover {
          background: var(--primary-saffron-hover, #D97706);
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(217, 119, 6, 0.45);
        }

        .btn-arrow-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease;
        }

        .btn-editorial-primary:hover .btn-arrow-circle {
          transform: translateX(4px);
        }

        .btn-editorial-secondary {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 1.05rem;
          padding: 0.9rem 1.85rem;
          border-radius: var(--radius-pill, 9999px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .btn-editorial-secondary:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.6);
          transform: translateY(-2px);
        }

        /* Proof Bar */
        .hero-proof-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }

        .proof-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.88);
          font-size: 0.92rem;
          font-weight: 600;
        }

        .proof-icon {
          color: var(--secondary-light-blue, #7DD3FC);
        }

        /* Subtle Fade In Animation */
        .hero-fade-item {
          animation: heroFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(18px);
        }

        @keyframes heroFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .hero-editorial-root {
            padding: 4.5rem clamp(2.5rem, 8vw, 3.75rem) 4rem clamp(2.5rem, 8vw, 3.75rem);
            min-height: auto;
          }
          .hero-mission-lead {
            margin-bottom: 2rem;
          }
          .hero-cta-cluster {
            flex-direction: column;
            width: 100%;
            gap: 1rem;
          }
          .btn-editorial-primary,
          .btn-editorial-secondary {
            width: 100%;
            justify-content: center;
          }
          .hero-proof-bar {
            gap: 1rem;
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}
