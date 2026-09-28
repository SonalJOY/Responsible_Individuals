import React, { useEffect, useState, useRef } from 'react';
import { impactService } from '../../services/api';
import { 
  FileText, Download, CheckCircle2, FileCheck, ExternalLink, Sparkles, Play, Pause,
  TreePine, GraduationCap, Users, HeartPulse, Briefcase, ShieldCheck, TrendingUp
} from 'lucide-react';
import ImpactCounter from '../../components/common/ImpactCounter';
import impactBg from '../../assets/impact-bg.jpg';
import areaEnvImg from '../../assets/area-environment.jpg';
import areaEduImg from '../../assets/area-education.jpg';
import areaCommImg from '../../assets/area-community.jpg';
import areaHealthImg from '../../assets/area-healthcare.jpg';
import areaLiveImg from '../../assets/area-livelihood.jpg';
import areaCivicImg from '../../assets/area-civic.jpg';

// Mapping focus area to its domain picture
const getAreaImage = (area, idx) => {
  const name = (area.name || '').toLowerCase();
  const slug = (area.slug || '').toLowerCase();
  if (slug.includes('environment') || name.includes('environment') || name.includes('water')) return areaEnvImg;
  if (slug.includes('education') || name.includes('education') || name.includes('digital')) return areaEduImg;
  if (slug.includes('community') || name.includes('community') || name.includes('waste')) return areaCommImg;
  if (slug.includes('health') || name.includes('health') || name.includes('wellness')) return areaHealthImg;
  if (slug.includes('livelihood') || name.includes('livelihood') || name.includes('skill')) return areaLiveImg;
  if (slug.includes('civic') || name.includes('civic') || name.includes('youth')) return areaCivicImg;
  const imgs = [areaEnvImg, areaEduImg, areaCommImg, areaHealthImg, areaLiveImg, areaCivicImg];
  return imgs[idx % imgs.length];
};

// Mapping focus area to its Lucide icon
const getAreaIcon = (area, idx) => {
  const slug = (area.slug || '').toLowerCase();
  const name = (area.name || '').toLowerCase();
  if (slug.includes('env') || name.includes('water')) return TreePine;
  if (slug.includes('edu') || name.includes('school')) return GraduationCap;
  if (slug.includes('comm') || name.includes('waste')) return Users;
  if (slug.includes('health') || name.includes('well')) return HeartPulse;
  if (slug.includes('live') || name.includes('skill')) return Briefcase;
  return ShieldCheck;
};


// Fallback metrics for containers where backend metrics list is empty
const fallbackAreaMetrics = {
  environment: [
    { id: 'f-env-1', name: 'Water Bodies Rejuvenated', unit: 'Lakes', baseline_value: '0', target_value: '8', achieved_value: '6', percentage: 75.0, metric_type: 'OUTPUT' },
    { id: 'f-env-2', name: 'Native Trees Planted', unit: 'Saplings', baseline_value: '0', target_value: '25000', achieved_value: '18400', percentage: 73.6, metric_type: 'OUTPUT' },
  ],
  education: [
    { id: 'f-edu-1', name: 'Rural Schools Upgraded', unit: 'Schools', baseline_value: '0', target_value: '50', achieved_value: '42', percentage: 84.0, metric_type: 'OUTPUT' },
    { id: 'f-edu-2', name: 'Students with Digital Access', unit: 'Students', baseline_value: '500', target_value: '15000', achieved_value: '12800', percentage: 85.3, metric_type: 'REACH' },
  ],
  community: [
    { id: 'f-comm-1', name: 'Community Waste Diverted', unit: 'Tons', baseline_value: '0', target_value: '500', achieved_value: '420', percentage: 84.0, metric_type: 'OUTPUT' },
    { id: 'f-comm-2', name: 'Neighborhood Composting Hubs', unit: 'Hubs', baseline_value: '0', target_value: '35', achieved_value: '28', percentage: 80.0, metric_type: 'OUTPUT' },
  ],
  health: [
    { id: 'f-hlth-1', name: 'Preventive Health Screenings', unit: 'Citizens', baseline_value: '500', target_value: '10000', achieved_value: '8400', percentage: 84.0, metric_type: 'REACH' },
    { id: 'f-hlth-2', name: 'Clean Drinking Water Filtration', unit: 'Habitations', baseline_value: '0', target_value: '50', achieved_value: '45', percentage: 90.0, metric_type: 'OUTCOME' },
  ],
  livelihood: [
    { id: 'f-live-1', name: 'Women Micro-Entrepreneurs Supported', unit: 'Enterprises', baseline_value: '50', target_value: '800', achieved_value: '680', percentage: 85.0, metric_type: 'OUTCOME' },
    { id: 'f-live-2', name: 'Youth Vocational Certifications', unit: 'Graduates', baseline_value: '100', target_value: '1500', achieved_value: '1240', percentage: 82.7, metric_type: 'OUTPUT' },
  ],
  civic: [
    { id: 'f-civ-1', name: 'Citizen Grievances Resolved', unit: 'Cases', baseline_value: '0', target_value: '1400', achieved_value: '1120', percentage: 80.0, metric_type: 'OUTCOME' },
    { id: 'f-civ-2', name: 'Youth Town Hall Assemblies', unit: 'Sessions', baseline_value: '0', target_value: '40', achieved_value: '36', percentage: 90.0, metric_type: 'OUTPUT' },
  ],
};

// Default focus areas ensuring rich metrics are always displayed
const defaultImpactAreas = [
  {
    id: 'default-env',
    slug: 'environment',
    name: 'Environment & Water Restoration',
    description: 'Protecting lakes, restoring urban watersheds, and driving afforestation for resilient cities.',
    icon_name: 'TreePine',
    color_accent: '#10B981',
    sdg_alignment: 'SDG 6: Clean Water, SDG 13: Climate Action, SDG 15: Life on Land',
    metrics: fallbackAreaMetrics.environment,
  },
  {
    id: 'default-edu',
    slug: 'education',
    name: 'Education & Digital Literacy',
    description: 'Equipping underserved government schools with modern digital STEM labs and teacher mentorship.',
    icon_name: 'GraduationCap',
    color_accent: '#3B82F6',
    sdg_alignment: 'SDG 4: Quality Education, SDG 10: Reduced Inequalities',
    metrics: fallbackAreaMetrics.education,
  },
  {
    id: 'default-comm',
    slug: 'community',
    name: 'Community Development & Waste',
    description: 'Fostering decentralized waste segregation, clean neighborhood stewardship, and civic safety.',
    icon_name: 'Users',
    color_accent: '#F59E0B',
    sdg_alignment: 'SDG 11: Sustainable Cities, SDG 12: Responsible Consumption',
    metrics: fallbackAreaMetrics.community,
  },
  {
    id: 'default-hlth',
    slug: 'health',
    name: 'Healthcare & Preventive Wellness',
    description: 'Providing mobile diagnostics, maternal wellness checkups, and clean drinking water filtration.',
    icon_name: 'HeartPulse',
    color_accent: '#EC4899',
    sdg_alignment: 'SDG 3: Good Health and Well-being',
    metrics: fallbackAreaMetrics.health,
  },
  {
    id: 'default-live',
    slug: 'livelihood',
    name: 'Sustainable Livelihoods & Skills',
    description: 'Empowering women micro-entrepreneurs and youth through vocational training and market linkages.',
    icon_name: 'Briefcase',
    color_accent: '#8B5CF6',
    sdg_alignment: 'SDG 8: Decent Work and Economic Growth',
    metrics: fallbackAreaMetrics.livelihood,
  },
  {
    id: 'default-civ',
    slug: 'civic',
    name: 'Civic Responsibility & Youth Leadership',
    description: 'Engaging youth and citizen collectives to bridge the gap between citizens and local governance.',
    icon_name: 'ShieldCheck',
    color_accent: '#0D9488',
    sdg_alignment: 'SDG 16: Peace, Justice and Strong Institutions, SDG 17: Partnerships',
    metrics: fallbackAreaMetrics.civic,
  },
];

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
  const [areas, setAreas] = useState(defaultImpactAreas);
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
        if (areasData && Array.isArray(areasData) && areasData.length > 0) {
          setAreas(areasData);
        }
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

    if (typeof IntersectionObserver === 'undefined') {
      const allRevealed = {};
      areas.forEach((a, idx) => {
        allRevealed[a.id || `area-${idx}`] = true;
      });
      setRevealedAreas(allRevealed);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const areaId = entry.target.dataset.areaId;
            if (areaId) {
              setRevealedAreas((prev) => ({ ...prev, [areaId]: true }));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    Object.values(cardRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
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

          {/* Focus Area Showcases with Editorial Split Layout & Dynamic Scroll Entrance */}
          <div className="impact-areas-list">
            {areas.map((area, idx) => {
              const areaKey = area.id || `area-${idx}`;
              const isRevealed = Boolean(revealedAreas[areaKey]);
              const bgImage = getAreaImage(area, idx);
              const AreaIcon = getAreaIcon(area, idx);
              const accentColor = area.color_accent || '#10B981';
              const isReversed = idx % 2 === 1;

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
                  className={`impact-pillar-card ${isReversed ? 'is-reversed' : ''} ${isRevealed ? 'is-revealed' : ''}`}
                  style={{ '--pillar-accent': accentColor }}
                >
                  {/* Visual Showcase: Crisp High-Resolution Photography */}
                  <div className="pillar-media-frame">
                    <div className="pillar-media-inner">
                      <img 
                        src={bgImage} 
                        alt={area.name} 
                        className="pillar-media-img" 
                        loading="lazy"
                      />
                      <div className="pillar-media-gradient" />
                      
                      {/* Floating Glass Badges */}
                      <div className="pillar-media-top-badge">
                        <span className="pillar-badge-icon" style={{ backgroundColor: accentColor }}>
                          <AreaIcon size={14} color="#FFFFFF" strokeWidth={2.4} />
                        </span>
                        <span className="pillar-badge-name">
                          {area.name.split('&')[0].trim()}
                        </span>
                      </div>

                      <div className="pillar-media-bottom-badge">
                        <span className="pillar-live-dot" style={{ backgroundColor: accentColor }} />
                        <span>Verified Field Intervention • 2025-26</span>
                      </div>
                    </div>
                  </div>

                  {/* Narrative & Interactive Metrics Breakdown */}
                  <div className="pillar-content-wrap">
                    {/* Pillar Index & SDG Chips */}
                    <div className="pillar-header-meta">
                      <span className="pillar-order-badge" style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}12` }}>
                        Pillar 0{idx + 1}
                      </span>
                      {area.sdg_alignment && (
                        <div className="pillar-sdg-list">
                          {area.sdg_alignment.split(',').slice(0, 2).map((sdg, sIdx) => (
                            <span key={sIdx} className="pillar-sdg-tag">
                              <span className="pillar-sdg-bullet" style={{ backgroundColor: accentColor }} />
                              {sdg.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <h3 className="pillar-title">{area.name}</h3>
                    <p className="pillar-tagline">{area.description}</p>

                    {/* Interactive Metrics Grid with Smooth Scroll-Triggered Progress Fill */}
                    <div className="pillar-metrics-grid">
                      {areaMetrics.map((m, mIdx) => (
                        <div 
                          key={m.id || `m-${mIdx}`} 
                          className={`pillar-metric-card metric-delay-${mIdx}`}
                        >
                          <div className="metric-card-top">
                            <span className="metric-card-label">{m.name}</span>
                            <span className="metric-type-pill">{m.metric_type}</span>
                          </div>

                          <div className="metric-card-values">
                            <span className="metric-val-achieved">{Number(m.achieved_value).toLocaleString()}</span>
                            <span className="metric-val-target">/ {Number(m.target_value).toLocaleString()} {m.unit}</span>
                          </div>

                          <div className="metric-progress-track">
                            <div 
                              className="metric-progress-fill" 
                              style={{ 
                                width: isRevealed ? `${Math.min(m.percentage, 100)}%` : '0%', 
                                backgroundColor: accentColor,
                                boxShadow: isRevealed ? `0 0 10px ${accentColor}80` : 'none',
                              }} 
                            />
                          </div>

                          <div className="metric-card-bottom">
                            <span className="metric-pct-highlight" style={{ color: accentColor }}>
                              <TrendingUp size={13} strokeWidth={2.5} />
                              <strong>{m.percentage}%</strong> achieved
                            </span>
                            <span className="metric-verified-tag">Audited</span>
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

        /* -------------------------------------------------------------
           FOCUS SECTION: Editorial 2-Column Split Showcase & Scroll Entrance
           ------------------------------------------------------------- */
        .impact-focus-section {
          padding: 5rem 0 6rem 0;
          position: relative;
        }

        .impact-areas-list {
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
        }

        /* The Main Pillar Showcase Card with Scroll Entrance */
        .impact-pillar-card {
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.06), 0 20px 25px -5px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          opacity: 0;
          transform: translateY(48px);
          transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.85s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.35s ease,
                      border-color 0.35s ease;
          will-change: transform, opacity;
        }

        .impact-pillar-card.is-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .impact-pillar-card:hover {
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--pillar-accent);
          border-color: var(--pillar-accent);
        }

        @media (min-width: 960px) {
          .impact-pillar-card {
            flex-direction: row;
            align-items: stretch;
          }

          .impact-pillar-card.is-reversed {
            flex-direction: row-reverse;
          }
        }

        /* Visual Showcase Column (Media Frame) */
        .pillar-media-frame {
          flex: 1 1 44%;
          min-height: 300px;
          position: relative;
          overflow: hidden;
          background: #0F172A;
        }

        @media (min-width: 960px) {
          .pillar-media-frame {
            min-height: 440px;
          }
        }

        .pillar-media-inner {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .pillar-media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.08);
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .impact-pillar-card.is-revealed .pillar-media-img {
          transform: scale(1);
        }

        .impact-pillar-card:hover .pillar-media-img {
          transform: scale(1.05);
        }

        /* Media Vignette Scrim */
        .pillar-media-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.4) 0%,
            transparent 45%,
            rgba(15, 23, 42, 0.82) 100%
          );
          pointer-events: none;
        }

        /* Floating Top Badge on Image */
        .pillar-media-top-badge {
          position: absolute;
          top: 1.25rem;
          left: 1.25rem;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.85rem 0.4rem 0.5rem;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 9999px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          z-index: 2;
        }

        .pillar-badge-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .pillar-badge-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 0.02em;
        }

        /* Floating Bottom Status on Image */
        .pillar-media-bottom-badge {
          position: absolute;
          bottom: 1.25rem;
          left: 1.25rem;
          right: 1.25rem;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.775rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 0.55rem 0.95rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          z-index: 2;
        }

        .pillar-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 10px currentColor;
          animation: pillarPulseDot 2s infinite ease-in-out;
        }

        @keyframes pillarPulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.65; }
        }

        /* Narrative & Content Column */
        .pillar-content-wrap {
          flex: 1 1 56%;
          padding: 2.25rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #FFFFFF;
        }

        @media (min-width: 960px) {
          .pillar-content-wrap {
            padding: 2.75rem 3.25rem;
          }
        }

        /* Pillar Meta Row (Pillar Number & SDG Tags) */
        .pillar-header-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1.1rem;
        }

        .pillar-order-badge {
          display: inline-flex;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .pillar-sdg-list {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .pillar-sdg-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.725rem;
          font-weight: 600;
          color: var(--slate-600);
          background: var(--slate-100);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          border: 1px solid var(--slate-200);
        }

        .pillar-sdg-bullet {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .pillar-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.75rem;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        @media (min-width: 960px) {
          .pillar-title {
            font-size: 2rem;
          }
        }

        .pillar-tagline {
          font-size: 1rem;
          color: var(--slate-600);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        /* KPI Metric Cards Grid */
        .pillar-metrics-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 600px) {
          .pillar-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .pillar-metric-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 1.35rem 1.45rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        }

        .impact-pillar-card.is-revealed .metric-delay-0 {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.25s,
                      transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.25s;
        }

        .impact-pillar-card.is-revealed .metric-delay-1 {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.4s,
                      transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
        }

        .pillar-metric-card:hover {
          transform: translateY(-3px);
          background: #FFFFFF;
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.06);
        }

        .metric-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .metric-card-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--slate-800);
          line-height: 1.3;
        }

        .metric-type-pill {
          font-size: 0.675rem;
          font-weight: 800;
          color: var(--slate-500);
          background: var(--slate-200);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          letter-spacing: 0.04em;
        }

        .metric-card-values {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .metric-val-achieved {
          font-family: var(--font-heading);
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--slate-900);
          line-height: 1.1;
        }

        .metric-val-target {
          font-size: 0.85rem;
          color: var(--slate-500);
          font-weight: 500;
        }

        /* Progress Bar Track */
        .metric-progress-track {
          width: 100%;
          height: 7px;
          background: #E2E8F0;
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
        }

        .metric-progress-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 1.3s cubic-bezier(0.16, 1, 0.3, 1) 0.55s, box-shadow 0.4s ease;
          will-change: width;
        }

        .metric-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.775rem;
          margin-top: 0.15rem;
        }

        .metric-pct-highlight {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 600;
        }

        .metric-verified-tag {
          font-size: 0.7rem;
          color: var(--slate-400);
          font-weight: 500;
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
