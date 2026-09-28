import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import riLogo from '../../assets/ri-logo.png';
import stockVideo from '../../assets/stock.mp4';
import FoldText from './FoldText';

export default function Hero() {
  return (
    <section className="hero-editorial-root">
      {/* 1. Full Hero Background Video (z-index: 0) */}
      <video 
        src={stockVideo}
        autoPlay
        muted
        loop
        playsInline
        className="hero-full-bg-video"
      />

      {/* 2. Brand-tinted Readability Overlay (z-index: 1) */}
      <div className="hero-video-bg-overlay" />

      {/* 3. Foreground Hero Content (z-index: 10 - strictly above Dot Grid z-index: 2) */}
      <div className="container hero-layout-container">
        {/* Top Eyebrow Badge */}
        <div className="hero-eyebrow-wrap hero-fade-item" style={{ animationDelay: '0.05s' }}>
          <div className="hero-badge-pill">
            <img src={riLogo} alt="" className="hero-badge-mini-logo" />
            <Sparkles size={14} className="text-emerald" />
            <span>Building Responsible Communities • 2026</span>
          </div>
        </div>

        {/* FoldText Entrance Heading */}
        <div className="hero-heading-wrapper">
          <h1 className="sr-only">Empowering Citizens. Creating Sustainable Impact.</h1>
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
            fontSize="clamp(50px, 5.8vw, 86px)"
            fontWeight={800}
            color="#FFFFFF"
            highlightWords={['Citizens.']}
            highlightColor="#34D399"
            className="hero-fold-headline"
          />
        </div>

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
          min-height: calc(100vh - 76px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 5.5rem 1.5rem 5rem 1.5rem;
          background-color: #08291F;
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
        }

        /* 2. Subtle Brand-Tinted Video Overlay: z-index: 1 */
        .hero-video-bg-overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 50% 45%, rgba(8, 41, 31, 0.62) 0%, rgba(8, 41, 31, 0.82) 70%, rgba(4, 25, 18, 0.94) 100%),
            linear-gradient(180deg, rgba(8, 41, 31, 0.65) 0%, rgba(8, 41, 31, 0.45) 50%, rgba(8, 41, 31, 0.9) 100%);
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
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          padding: 0.5rem 1.35rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.85rem;
          font-weight: 700;
          color: #FFFFFF;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          letter-spacing: 0.03em;
        }

        .hero-badge-mini-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
          filter: brightness(1.2);
        }

        .text-emerald {
          color: #34D399;
        }

        /* Hero FoldText Headline */
        .hero-heading-wrapper {
          position: relative;
          width: 100%;
          margin-bottom: 1.75rem;
          text-align: center;
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
          font-size: clamp(1.1rem, 1.35vw, 1.25rem);
          color: rgba(243, 244, 246, 0.92);
          line-height: 1.65;
          max-width: 680px;
          margin: 0 auto 2.25rem auto;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        }

        .hero-cta-cluster {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          margin-bottom: 2.75rem;
        }

        .btn-editorial-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          background: #10B981;
          color: #042F1A;
          font-weight: 700;
          font-size: 1.05rem;
          padding: 0.9rem 1.35rem 0.9rem 1.95rem;
          border-radius: var(--radius-pill, 9999px);
          box-shadow: 0 8px 28px rgba(16, 185, 129, 0.45);
          transition: all var(--transition-normal, 0.3s cubic-bezier(0.16, 1, 0.3, 1));
          text-decoration: none;
        }

        .btn-editorial-primary:hover {
          background: #34D399;
          color: #042F1A;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(16, 185, 129, 0.6);
        }

        .btn-arrow-circle {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-pill, 9999px);
          background: rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast, 0.15s ease);
        }

        .btn-editorial-primary:hover .btn-arrow-circle {
          transform: translateX(3px);
          background: rgba(0, 0, 0, 0.2);
        }

        .btn-editorial-secondary {
          display: inline-flex;
          align-items: center;
          padding: 0.95rem 2rem;
          border-radius: var(--radius-pill, 9999px);
          font-weight: 700;
          font-size: 1.05rem;
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          transition: all var(--transition-fast, 0.15s ease);
          text-decoration: none;
        }

        .btn-editorial-secondary:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .hero-proof-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding-top: 1.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.18);
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          max-width: 650px;
          width: 100%;
        }

        .proof-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .proof-icon {
          color: #34D399;
        }

        /* Staggered Entrance Animations */
        .hero-fade-item {
          opacity: 0;
          transform: translateY(18px);
          animation: smoothFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes smoothFadeUp {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsiveness */
        @media (max-width: 640px) {
          .hero-editorial-root {
            padding: 4.5rem 1rem 3.5rem 1rem;
            min-height: 85vh;
          }
          .hero-cta-cluster {
            flex-direction: column;
            width: 100%;
          }
          .btn-editorial-primary,
          .btn-editorial-secondary {
            width: 100%;
            justify-content: center;
          }
          .hero-proof-bar {
            flex-direction: column;
            gap: 0.85rem;
          }
        }
      `}</style>
    </section>
  );
}
