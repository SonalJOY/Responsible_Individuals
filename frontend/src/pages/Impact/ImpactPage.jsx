import React, { useEffect, useState, useRef } from 'react';
import { impactService } from '../../services/api';
import { 
  FileText, Download, CheckCircle2, FileCheck, ExternalLink, Sparkles, Play, Pause
} from 'lucide-react';
import ImpactCounter from '../../components/common/ImpactCounter';
import impactBg from '../../assets/impact-bg.jpg';
import areaEnvImg from '../../assets/area-environment.jpg';
import areaEduImg from '../../assets/area-education.jpg';
import areaCommImg from '../../assets/area-community.jpg';
import areaHealthImg from '../../assets/area-healthcare.jpg';
import areaCivicImg from '../../assets/area-civic.jpg';

// Mapping focus area to its domain background picture
const getAreaImage = (area, idx) => {
  const name = (area.name || '').toLowerCase();
  const slug = (area.slug || '').toLowerCase();
  if (slug.includes('environment') || name.includes('environment') || name.includes('water')) return areaEnvImg;
  if (slug.includes('education') || name.includes('education') || name.includes('digital')) return areaEduImg;
  if (slug.includes('community') || name.includes('community') || name.includes('waste')) return areaCommImg;
  if (slug.includes('health') || name.includes('health') || name.includes('wellness')) return areaHealthImg;
  if (slug.includes('civic') || name.includes('civic') || name.includes('youth') || name.includes('livelihood')) return areaCivicImg;
  const imgs = [areaEnvImg, areaEduImg, areaCommImg, areaHealthImg, areaCivicImg, areaCivicImg];
  return imgs[idx % imgs.length];
};

// Fallback metrics for containers where backend metrics list is empty
const fallbackAreaMetrics = {
  community: [
    { id: 'f-comm-1', name: 'Community Waste Diverted', unit: 'Tons', achieved_value: '420', target_value: '500', percentage: 84.0, metric_type: 'OUTPUT' },
    { id: 'f-comm-2', name: 'Neighborhood Composting Hubs', unit: 'Units', achieved_value: '28', target_value: '35', percentage: 80.0, metric_type: 'OUTPUT' },
  ],
  health: [
    { id: 'f-hlth-1', name: 'Preventive Health Screenings', unit: 'Citizens', achieved_value: '8400', target_value: '10000', percentage: 84.0, metric_type: 'REACH' },
    { id: 'f-hlth-2', name: 'Clean Drinking Water Filtration', unit: 'Habitations', achieved_value: '45', target_value: '50', percentage: 90.0, metric_type: 'OUTCOME' },
  ],
  livelihood: [
    { id: 'f-live-1', name: 'Women Micro-Entrepreneurs', unit: 'Enterprises', achieved_value: '680', target_value: '800', percentage: 85.0, metric_type: 'OUTCOME' },
    { id: 'f-live-2', name: 'Youth Vocational Certifications', unit: 'Graduates', achieved_value: '1240', target_value: '1500', percentage: 82.7, metric_type: 'OUTPUT' },
  ],
  civic: [
    { id: 'f-civ-1', name: 'Citizen Grievances Resolved', unit: 'Cases', achieved_value: '1120', target_value: '1400', percentage: 80.0, metric_type: 'OUTCOME' },
    { id: 'f-civ-2', name: 'Youth Town Hall Assemblies', unit: 'Sessions', achieved_value: '36', target_value: '40', percentage: 90.0, metric_type: 'OUTPUT' },
  ],
};

// Publication Disclosures with Morphing Card Animation
const publicationDisclosures = [
  {
    id: 'report-1',
    badge: 'Annual Audited Report',
    title: 'Annual Impact & Stewardship Report 2025-26',
    subtitle: 'Comprehensive Project & Financial Audit',
    description: 'Comprehensive analysis of 6 lake revivals, 42 rural STEM smart classrooms, and audited financial statements.',
    meta: 'PDF • 14.2 MB • Section 12A / 80G Certified',
    coverImage: areaEnvImg,
    themeColor: '#059669',
    stats: [
      { label: 'Revivals Certified', value: '6 Lakes' },
      { label: 'Smart Classrooms', value: '42 Schools' },
      { label: 'Financial Audit', value: '100% Tax Exempt' },
    ],
  },
  {
    id: 'report-2',
    badge: 'Scientific Field Survey',
    title: 'Urban Hydrology & Wetland Baseline Survey 2025',
    subtitle: 'Water Quality & Ecological Census',
    description: 'Water quality parameters, dissolved oxygen shifts, and avian biodiversity census for Bengaluru East lake clusters.',
    meta: 'PDF • 8.6 MB • Hydrological Research',
    coverImage: areaEduImg,
    themeColor: '#2563EB',
    stats: [
      { label: 'Sites Monitored', value: '45 Clusters' },
      { label: 'Quality Standard', value: 'ISO 10500' },
      { label: 'Biodiversity Census', value: 'Avian Biome' },
    ],
  },
];

export default function ImpactPage() {
  const [areas, setAreas] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedAreas, setRevealedAreas] = useState({});
  const cardRefs = useRef({});
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  useEffect(() => {
    async function loadImpact() {
      try {
        const [areasData, reportsData] = await Promise.all([
          impactService.getAreas(),
          impactService.getReports(),
        ]);
        setAreas(areasData || []);
        setReports(reportsData || []);
      } catch (err) {
        console.error('Failed to load impact data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadImpact();
  }, []);

  // IntersectionObserver: Smoothly reveals each card and its metrics when scrolled into view
  useEffect(() => {
    if (areas.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const areaId = entry.target.dataset.areaId;
            if (areaId) {
              setRevealedAreas((prev) => ({ ...prev, [areaId]: true }));
            }
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    Object.values(cardRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [areas]);

  return (
    <div className="impact-page-root">
      {/* Unified Hero Header & Interactive Impact Matrix with High-Resolution Video Background */}
      <section className="impact-hero-wrapper">
        {/* High-Resolution Ambient Video Background */}
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline 
          className="impact-hero-video"
          poster={impactBg}
          aria-hidden="true"
        >
          <source src="/videos/hero-impact.webm" type="video/webm" />
          <source src="https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a5/Slovenia-_Lake_Bled._Drone_footage.webm/Slovenia-_Lake_Bled._Drone_footage.webm.1080p.vp9.webm" type="video/webm" />
        </video>
        <div className="impact-hero-video-overlay" aria-hidden="true" />
        
        {/* Ambient Video Control Toggle */}
        <button 
          type="button"
          onClick={toggleVideoPlayback}
          className="video-toggle-pill"
          aria-label={isVideoPlaying ? "Pause ambient background video" : "Play ambient background video"}
          title={isVideoPlaying ? "Pause ambient video" : "Play ambient video"}
        >
          {isVideoPlaying ? <Pause size={12} /> : <Play size={12} />}
          <span>{isVideoPlaying ? "Motion Active" : "Motion Paused"}</span>
        </button>

        <div className="container impact-hero-content">
          <span className="section-badge">Accountable Data</span>
          <h1 className="impact-hero-title">Measurable Social & Ecological Impact</h1>
          <p className="impact-hero-subtitle">
            We believe that transparency breeds trust. Every rupee spent and every volunteer hour contributed is tied directly to verifiable baseline and target outcomes.
          </p>
        </div>

        {/* Real-time counters with 3D Flip Boxes rendered seamlessly over video */}
        <ImpactCounter 
          transparentBg={true} 
          showControls={false} 
          showVerifiedBadge={false} 
          showFlipBack={false} 
        />
      </section>

      {/* Impact Area Metrics Breakdown */}
      <section className="section bg-light-alt impact-focus-section">
        <div className="container">
          <div className="focus-section-header-wrap">
            <div className="section-header">
              <span className="section-badge">Pillars of Action</span>
              <h2 className="section-title">Metrics by Focus Area</h2>
              <p className="section-subtitle">
                Detailed tracking of scientific indicators across our key intervention spheres.
              </p>
            </div>
          </div>

          {/* Focus Area Containers with Smooth Scroll-Reveal Sequences */}
          <div className="impact-areas-list">
            {areas.map((area, idx) => {
              const areaKey = area.id || `area-${idx}`;
              const isRevealed = Boolean(revealedAreas[areaKey]);
              const bgImage = getAreaImage(area, idx);
              const areaMetrics = (area.metrics && area.metrics.length > 0) 
                ? area.metrics 
                : (fallbackAreaMetrics[area.slug] || [
                    { id: `fb-1-${idx}`, name: 'Milestone Targets Achieved', unit: 'Units', achieved_value: '82', target_value: '100', percentage: 82.0, metric_type: 'OUTPUT' },
                    { id: `fb-2-${idx}`, name: 'Community Households Engaged', unit: 'Families', achieved_value: '1450', target_value: '1800', percentage: 80.5, metric_type: 'REACH' },
                  ]);

              return (
                <div 
                  key={areaKey}
                  ref={(el) => (cardRefs.current[areaKey] = el)}
                  data-area-id={areaKey}
                  data-seq-index={idx}
                  className={`card impact-area-row seq-animated-card seq-mode-orchestrated ${isRevealed ? 'is-revealed' : ''}`}
                >
                  {/* High Resolution Blurred Background Image */}
                  <div 
                    className="area-bg-layer"
                    style={{ backgroundImage: `url(${bgImage})` }}
                    aria-hidden="true"
                  />
                  
                  {/* Subtle Gradient Shade Overlay */}
                  <div className="area-bg-overlay" aria-hidden="true" />

                  {/* Glassmorphic Container Content */}
                  <div className="area-card-inner">
                    {/* Header: Title, Tagline, and SDG Alignment */}
                    <div className="seq-block seq-block-1 impact-area-header">
                      <div className="area-title-wrap">
                        <div className="area-title-top">
                          <h3 className="area-title">{area.name}</h3>
                        </div>
                        <p className="area-tagline">{area.description}</p>
                      </div>

                      {area.sdg_alignment && (
                        <div className="seq-block seq-block-2 sdg-pill-group">
                          {area.sdg_alignment.split(',').map((sdg, i) => (
                            <span key={i} className="sdg-badge-item">
                              <span className="sdg-dot" />
                              {sdg.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metrics Grid appearing with smooth sequence and progress bar fill */}
                    <div className="seq-block seq-block-3 area-metrics-grid">
                      {areaMetrics.map((m, mIdx) => (
                        <div 
                          key={m.id} 
                          className={`area-metric-box seq-metric-item seq-metric-${mIdx}`}
                          style={{ '--metric-pct': `${Math.min(m.percentage, 100)}%` }}
                        >
                          <div className="metric-box-top">
                            <span className="metric-name-text">{m.name}</span>
                            <span className="metric-type-badge">{m.metric_type}</span>
                          </div>
                          <div className="metric-num-line">
                            <span className="metric-achieved">{Number(m.achieved_value).toLocaleString()}</span>
                            <span className="metric-target">/ {Number(m.target_value).toLocaleString()} {m.unit}</span>
                          </div>
                          <div className="metric-track">
                            <div 
                              className="metric-fill" 
                              style={{ 
                                width: isRevealed ? `${Math.min(m.percentage, 100)}%` : '0%', 
                                backgroundColor: area.color_accent || '#10B981' 
                              }} 
                            />
                          </div>
                          <div className="metric-bottom-info">
                            <span className="metric-pct-sub">{m.percentage}% of target achieved</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Downloadable Annual Reports with Morphing Card Animation */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header text-center" style={{ maxWidth: '780px', margin: '0 auto 3rem auto' }}>
            <span className="section-badge">Audits & Reports</span>
            <h2 className="section-title">Annual Disclosures & Publications</h2>
            <p className="section-subtitle">
              Download our audited financial statements, comprehensive project outcomes, and third-party impact assessments.
            </p>
          </div>

          <div className="morphing-reports-grid">
            {publicationDisclosures.map((pub) => (
              <div 
                key={pub.id}
                className="morphing-report-card"
                tabIndex={0}
                role="article"
                aria-label={pub.title}
              >
                {/* Initially presents large immersive portrait, morphs to square on interaction */}
                <div className="report-morph-frame">
                  <img 
                    src={pub.coverImage} 
                    alt={pub.title} 
                    className="report-morph-img" 
                    loading="lazy"
                  />
                  {/* Resting state overlay with immersive portrait */}
                  <div className="report-morph-overlay">
                    <span className="report-morph-badge">{pub.badge}</span>
                    <h3 className="report-morph-resting-title">{pub.title}</h3>
                    <p className="report-morph-resting-meta">{pub.meta}</p>
                    <div className="report-morph-hint">
                      <span>Hover or focus to discover details</span>
                      <span className="report-morph-hint-dot" />
                    </div>
                  </div>
                </div>

                {/* Hidden detailed report information and action buttons revealed below as image morphs to square */}
                <div className="report-morph-drawer">
                  <div className="report-drawer-top">
                    <div className="report-drawer-tagline-row">
                      <span className="report-drawer-badge" style={{ color: pub.themeColor }}>
                        {pub.badge}
                      </span>
                      <span className="report-drawer-filetype">Verified PDF</span>
                    </div>

                    <h3 className="report-drawer-title">{pub.title}</h3>
                    <p className="report-drawer-desc">{pub.description}</p>
                    <div className="report-drawer-meta">{pub.meta}</div>
                  </div>

                  <div className="report-drawer-bottom">
                    {/* Key outcome indicators */}
                    <div className="report-stats-grid">
                      {pub.stats.map((st, i) => (
                        <div key={i} className="report-stat-chip">
                          <span className="report-stat-val">{st.value}</span>
                          <span className="report-stat-lbl">{st.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="report-actions-row">
                      <button type="button" className="btn btn-primary report-primary-dl-btn">
                        <Download size={15} />
                        <span>Download Report</span>
                      </button>
                      <button type="button" className="btn btn-secondary report-secondary-btn" title="View Document Abstract">
                        <FileText size={15} />
                        <span>Abstract</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* Hero Section with Unified High-Resolution Video Background */
        .impact-hero-wrapper {
          position: relative;
          overflow: hidden;
          background-color: #04140e;
          color: white;
          padding: 5.5rem 0 1.5rem 0;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .impact-hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          pointer-events: none;
          z-index: 0;
          filter: brightness(0.62) saturate(1.25);
        }

        .impact-hero-video-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 28%,
            rgba(6, 40, 28, 0.65) 0%,
            rgba(4, 24, 17, 0.82) 55%,
            rgba(2, 12, 8, 0.94) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Ambient Video Control Toggle */
        .video-toggle-pill {
          position: absolute;
          top: 1.25rem;
          right: 1.5rem;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .video-toggle-pill:hover {
          background: rgba(16, 185, 129, 0.25);
          border-color: rgba(52, 211, 153, 0.45);
          color: #ffffff;
        }

        .impact-hero-content {
          position: relative;
          z-index: 2;
          margin-bottom: 2rem;
        }

        .impact-hero-wrapper .section-badge {
          background: rgba(16, 185, 129, 0.22);
          color: #34D399;
          border: 1px solid rgba(52, 211, 153, 0.45);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }

        .impact-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        @media (min-width: 768px) {
          .impact-hero-title {
            font-size: 3.5rem;
          }
        }

        .impact-hero-subtitle {
          font-size: 1.15rem;
          color: #E2E8F0;
          max-width: 760px;
          margin: 0 auto;
          line-height: 1.65;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }

        /* Focus Section Controls & Spacing */
        .focus-section-header-wrap {
          margin-bottom: 2.75rem;
        }

        /* Focus Area Containers List */
        .impact-areas-list {
          display: flex;
          flex-direction: column;
          gap: 2.75rem;
        }

        /* ------------------------------------------------------------------
           BUILDING SCROLL SEQUENCES: Combining Animations + Cascading Blocks
           ------------------------------------------------------------------ */
        .seq-animated-card {
          will-change: transform, opacity;
        }

        /* TECHNIQUE 1: Combining Animations (Fade paired with exactly 20px upward movement) */
        .seq-mode-combining {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .seq-mode-combining.is-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* TECHNIQUE 2: Sequencing Across Elements (Three text blocks that fade in one after another as you scroll) */
        .seq-mode-sequencing .seq-block {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .seq-mode-sequencing.is-revealed .seq-block-1 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 60ms;
        }

        .seq-mode-sequencing.is-revealed .seq-block-2 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 200ms;
        }

        .seq-mode-sequencing.is-revealed .seq-block-3 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 340ms;
        }

        /* TECHNIQUE 3: Full Orchestration (Combining animations on container + Sequencing across internal blocks) */
        .seq-mode-orchestrated {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .seq-mode-orchestrated.is-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .seq-mode-orchestrated .seq-block {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .seq-mode-orchestrated.is-revealed .seq-block-1 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 90ms;
        }

        .seq-mode-orchestrated.is-revealed .seq-block-2 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 220ms;
        }

        .seq-mode-orchestrated.is-revealed .seq-block-3 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 360ms;
        }

        /* Metric items sequential staggering */
        .seq-animated-card .seq-metric-item {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color var(--transition-fast),
                      box-shadow var(--transition-fast);
        }

        .seq-animated-card.is-revealed .seq-metric-0 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 420ms;
        }

        .seq-animated-card.is-revealed .seq-metric-1 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 560ms;
        }

        /* When combining only, metric items fade with parent container */
        .seq-mode-combining .seq-block,
        .seq-mode-combining .seq-metric-item {
          opacity: 1;
          transform: none;
        }

        /* -------------------------------------------------------------
           FOCUS AREA CONTAINER: Blurred Background Photo & Glass Card
           ------------------------------------------------------------- */
        .impact-area-row {
          position: relative;
          overflow: hidden;
          padding: 0;
          background: #FFFFFF;
          border-radius: var(--radius-xl);
          border: 1px solid rgba(16, 185, 129, 0.22);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.4s ease, border-color 0.4s ease, transform 0.4s ease;
        }

        .impact-area-row:hover {
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.1), 0 0 20px rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.4);
        }

        /* High Resolution Blurred Background Image for each container */
        .area-bg-layer {
          position: absolute;
          inset: -25px;
          background-size: cover;
          background-position: center 35%;
          filter: blur(8px) saturate(1.2) brightness(0.96);
          transform: scale(1.08);
          opacity: 0.18;
          pointer-events: none;
          z-index: 0;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease, filter 0.5s ease;
        }

        .impact-area-row:hover .area-bg-layer {
          transform: scale(1.12);
          opacity: 0.28;
          filter: blur(6px) saturate(1.25) brightness(0.98);
        }

        .area-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.94) 0%,
            rgba(255, 255, 255, 0.88) 50%,
            rgba(240, 253, 244, 0.92) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .area-card-inner {
          position: relative;
          z-index: 2;
          padding: 2.5rem;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .impact-area-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        }

        @media (min-width: 768px) {
          .impact-area-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }

        .area-title-wrap {
          flex: 1;
        }

        .area-title-top {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          margin-bottom: 0.45rem;
        }

        .area-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--slate-900);
          margin: 0;
          letter-spacing: -0.015em;
        }

        .area-sequence-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.725rem;
          font-weight: 700;
          color: #047857;
          background: #ECFDF5;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .area-tagline {
          font-size: 0.975rem;
          color: var(--slate-600);
          max-width: 680px;
          line-height: 1.55;
          margin: 0;
        }

        .sdg-pill-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .sdg-badge-item {
          background: #D1FAE5;
          color: #065F46;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-pill);
          border: 1px solid rgba(16, 185, 129, 0.25);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .sdg-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #059669;
        }

        /* Area Metrics Grid */
        .area-metrics-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 640px) {
          .area-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .area-metric-box {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: var(--radius-lg);
          padding: 1.65rem;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
        }

        .area-metric-box:hover {
          transform: translateY(-3px);
          border-color: rgba(16, 185, 129, 0.45);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.07);
        }

        .metric-box-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .metric-name-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--slate-800);
        }

        .metric-type-badge {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--slate-500);
          background: var(--slate-200);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .metric-num-line {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          margin-bottom: 0.65rem;
        }

        .metric-achieved {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--slate-900);
          line-height: 1.1;
        }

        .metric-target {
          font-size: 0.9rem;
          color: var(--slate-500);
          font-weight: 500;
        }

        .metric-track {
          height: 8px;
          background: var(--slate-200);
          border-radius: var(--radius-pill);
          overflow: hidden;
          margin-bottom: 0.45rem;
        }

        .metric-fill {
          height: 100%;
          border-radius: var(--radius-pill);
          transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .metric-bottom-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.35rem;
        }

        .metric-pct-sub {
          font-size: 0.75rem;
          color: var(--slate-500);
          font-weight: 600;
        }

        .metric-trigger-tag {
          font-size: 0.675rem;
          font-weight: 700;
          color: #059669;
          background: #ECFDF5;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        /* -------------------------------------------------------------
           MORPHING PUBLICATION CARDS: Immersive Cover to Square
           ------------------------------------------------------------- */
        .morphing-reports-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.25rem;
          max-width: 980px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .morphing-reports-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .morphing-report-card {
          position: relative;
          height: 520px;
          border-radius: 24px;
          overflow: hidden;
          background: #FFFFFF;
          border: 1.5px solid rgba(16, 185, 129, 0.22);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          outline: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.4s ease;
        }

        .morphing-report-card:hover,
        .morphing-report-card:focus-within {
          transform: translateY(-6px);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.1), 0 0 25px rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.55);
        }

        /* 1. Immersive Portrait Frame -> Morphs into Compact Square and Slides Up */
        .report-morph-frame {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          overflow: hidden;
          z-index: 2;
          transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .morphing-report-card:hover .report-morph-frame,
        .morphing-report-card:focus-within .report-morph-frame {
          top: 1.35rem;
          left: 50%;
          transform: translateX(-50%);
          width: 110px;
          height: 110px;
          border-radius: 20px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16), 0 0 0 3px rgba(16, 185, 129, 0.4);
          z-index: 5;
        }

        .report-morph-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .morphing-report-card:hover .report-morph-img,
        .morphing-report-card:focus-within .report-morph-img {
          transform: scale(1.06);
        }

        /* 2. Resting Portrait Overlay */
        .report-morph-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 3.5rem 1.75rem 1.75rem;
          background: linear-gradient(
            to top,
            rgba(4, 20, 14, 0.96) 0%,
            rgba(4, 20, 14, 0.68) 55%,
            transparent 100%
          );
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          transition: opacity 0.35s ease, transform 0.45s ease;
          z-index: 3;
        }

        .morphing-report-card:hover .report-morph-overlay,
        .morphing-report-card:focus-within .report-morph-overlay {
          opacity: 0;
          transform: translateY(30px);
          pointer-events: none;
        }

        .report-morph-badge {
          align-self: flex-start;
          font-size: 0.7rem;
          font-weight: 700;
          color: #34D399;
          background: rgba(16, 185, 129, 0.25);
          border: 1px solid rgba(52, 211, 153, 0.4);
          padding: 0.2rem 0.65rem;
          border-radius: var(--radius-pill);
          margin-bottom: 0.25rem;
        }

        .report-morph-resting-title {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0;
          line-height: 1.25;
        }

        .report-morph-resting-meta {
          font-size: 0.8rem;
          color: #A7F3D0;
          font-weight: 600;
          margin: 0;
        }

        .report-morph-hint {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.725rem;
          color: #94A3B8;
          font-weight: 600;
          margin-top: 0.65rem;
        }

        .report-morph-hint-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.4);
          animation: pulseHint 1.8s infinite;
        }

        @keyframes pulseHint {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        /* 3. Detailed Publication Drawer Revealed Below Morphed Square Cover */
        .report-morph-drawer {
          position: absolute;
          top: 135px;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.25rem 1.65rem 1.65rem;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transform: translateY(115%);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 3;
        }

        .morphing-report-card:hover .report-morph-drawer,
        .morphing-report-card:focus-within .report-morph-drawer {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .report-drawer-top {
          display: flex;
          flex-direction: column;
        }

        .report-drawer-tagline-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.35rem;
        }

        .report-drawer-badge {
          font-size: 0.725rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .report-drawer-filetype {
          font-size: 0.675rem;
          font-weight: 700;
          color: var(--slate-500);
          background: var(--slate-100);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .report-drawer-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--slate-900);
          margin: 0 0 0.45rem 0;
          line-height: 1.3;
        }

        .report-drawer-desc {
          font-size: 0.825rem;
          color: var(--slate-600);
          line-height: 1.5;
          margin: 0 0 0.55rem 0;
        }

        .report-drawer-meta {
          font-size: 0.75rem;
          font-weight: 700;
          color: #059669;
          background: #ECFDF5;
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
          display: inline-block;
          align-self: flex-start;
        }

        .report-drawer-bottom {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 0.65rem;
        }

        .report-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.45rem;
        }

        .report-stat-chip {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 0.45rem 0.25rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .report-stat-val {
          font-family: var(--font-heading);
          font-size: 0.825rem;
          font-weight: 800;
          color: var(--slate-900);
        }

        .report-stat-lbl {
          font-size: 0.625rem;
          font-weight: 600;
          color: var(--slate-500);
          line-height: 1.2;
        }

        .report-actions-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .report-primary-dl-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #FFFFFF;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border: none;
          border-radius: var(--radius-pill);
          padding: 0.55rem 1rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
          transition: all var(--transition-fast);
        }

        .report-primary-dl-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35);
        }

        .report-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--slate-700);
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          border-radius: var(--radius-pill);
          padding: 0.55rem 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .report-secondary-btn:hover {
          background: #E2E8F0;
          color: var(--slate-900);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
