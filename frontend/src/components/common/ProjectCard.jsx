import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight, Camera, Sparkles, CheckCircle2 } from 'lucide-react';

// Authentic project photo assets
import lakeImg from '../../assets/varthur-blooming-wetland.jpg';
import stemImg from '../../assets/rural-stem-sensor-lab.jpg';
import forestImg from '../../assets/area-environment.jpg';
import wasteImg from '../../assets/area-community.jpg';
import waterMonitoringImg from '../../assets/citizen-water-monitoring.jpg';
import desiltingImg from '../../assets/varthur-volunteers-desilting.jpg';
import healthcareImg from '../../assets/area-healthcare.jpg';
import livelihoodImg from '../../assets/area-livelihood.jpg';
import civicImg from '../../assets/area-civic.jpg';
import educationImg from '../../assets/area-education.jpg';
import washCoverImg from '../../assets/hosa-byrohalli-wash-1.jpg';

// Helper to resolve an authentic photo for any project
export function getProjectCoverImage(project) {
  if (project?.cover_image && typeof project.cover_image === 'string' && project.cover_image.trim()) {
    return project.cover_image;
  }
  const s = (project?.slug || '').toLowerCase();
  const t = (project?.title || '').toLowerCase();
  const f = (project?.focus_area_name || '').toLowerCase();

  if (s.includes('wash') || s.includes('byrohalli') || t.includes('wash') || t.includes('byrohalli')) {
    return washCoverImg;
  }
  if (s.includes('miyawaki') || s.includes('forest') || t.includes('forest') || t.includes('miyawaki')) {
    return forestImg;
  }
  if (s.includes('stem') || s.includes('classroom') || s.includes('digital') || t.includes('stem') || t.includes('classroom')) {
    return stemImg;
  }
  if (s.includes('lake') || s.includes('varthur') || s.includes('wetland') || t.includes('lake') || t.includes('wetland')) {
    return lakeImg;
  }
  if (s.includes('waste') || s.includes('compost') || t.includes('compost') || t.includes('waste')) {
    return wasteImg;
  }
  if (s.includes('water-quality') || s.includes('sensor') || t.includes('sensor') || t.includes('monitoring')) {
    return waterMonitoringImg;
  }
  if (s.includes('desilting') || t.includes('desilt')) {
    return desiltingImg;
  }
  if (s.includes('health') || t.includes('health') || f.includes('health')) {
    return healthcareImg;
  }
  if (s.includes('livelihood') || s.includes('artisan') || t.includes('artisan') || f.includes('livelihood')) {
    return livelihoodImg;
  }
  if (s.includes('civic') || t.includes('civic') || f.includes('civic')) {
    return civicImg;
  }
  if (f.includes('education') || t.includes('education') || t.includes('school')) {
    return educationImg;
  }
  if (f.includes('environment') || f.includes('water')) {
    return lakeImg;
  }
  return forestImg;
}

export default function ProjectCard({ project, photoCount = 8 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const {
    title,
    slug,
    focus_area_name,
    focus_area_color,
    location,
    summary,
    budget,
    raised_amount,
    beneficiaries_count,
    progress_percentage,
    cover_image,
    status,
    featured
  } = project;

  // Resolve cover image with authentic fallbacks
  const resolvedImage = getProjectCoverImage(project);

  // Format currency in Indian Lakhs/Crores or thousand
  const formatCurrency = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const badgeColor = focus_area_color || '#10B981';

  return (
    <article className="card project-card-item">
      {/* Top Image Wrap with Glass Badges and Photo Counter */}
      <div className="project-card-image-wrap">
        <img 
          src={imgError ? forestImg : resolvedImage} 
          alt={title} 
          className={`project-card-img ${imgLoaded ? 'loaded' : 'loading'}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Ambient Dark Gradient Vignette for Readability */}
        <div className="project-card-img-overlay" />

        {/* Top Badges Row */}
        <div className="project-card-badge-row">
          <span 
            className="project-card-badge" 
            style={{ 
              backgroundColor: badgeColor,
              boxShadow: `0 4px 14px ${badgeColor}40`
            }}
          >
            {focus_area_name || 'Community Initiative'}
          </span>

          {featured && (
            <span className="project-featured-pill">
              <Sparkles size={11} />
              <span>Priority</span>
            </span>
          )}
        </div>

        {/* Bottom Floating Photo Tag */}
        <div className="project-photo-count-pill" title="Verified field photos in case study">
          <Camera size={13} />
          <span>{photoCount}+ Photos</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="project-card-body">
        <div className="project-meta-top">
          <div className="project-location-bar">
            <MapPin size={13} className="loc-icon" />
            <span>{location}</span>
          </div>
          {status && (
            <span className="project-status-tag">
              <CheckCircle2 size={12} className="status-dot" />
              <span>{status.replace(/_/g, ' ')}</span>
            </span>
          )}
        </div>

        <h3 className="project-card-title">
          <Link to={`/projects/${slug}`}>{title}</Link>
        </h3>

        <p className="project-card-summary">{summary}</p>

        {/* Funding & Implementation Progress Box */}
        <div className="project-funding-box">
          <div className="funding-labels">
            <span className="raised-text">
              <strong>{formatCurrency(raised_amount)}</strong> <span className="sub-text">raised</span>
            </span>
            <span className="goal-text">Goal: {formatCurrency(budget)}</span>
          </div>
          <div className="progress-bar-track" role="progressbar" aria-valuenow={progress_percentage || 0} aria-valuemin="0" aria-valuemax="100">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${Math.min(progress_percentage || 0, 100)}%`, 
                backgroundColor: badgeColor 
              }}
            />
          </div>
          <div className="progress-percentage-label">
            <span>{Math.round(progress_percentage || 0)}% Funded</span>
          </div>
        </div>

        {/* Card Footer with Impact Metrics & CTA Link */}
        <div className="project-card-footer">
          <div className="beneficiaries-stat">
            <Users size={15} className="users-icon" />
            <span><strong>{(beneficiaries_count || 0).toLocaleString()}</strong> impacted</span>
          </div>
          <Link to={`/projects/${slug}`} className="project-action-link" aria-label={`View details of ${title}`}>
            <span>Case Study</span>
            <ArrowRight size={14} className="action-arrow" />
          </Link>
        </div>
      </div>

      <style>{`
        .project-card-item {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #FFFFFF;
          border-radius: var(--radius-lg, 16px);
          border: 1px solid var(--border-subtle, #E2E8F0);
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
          overflow: hidden;
          transition: transform var(--transition-normal, 0.28s ease), box-shadow var(--transition-normal, 0.28s ease), border-color var(--transition-normal, 0.28s ease);
        }
        .project-card-item:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
          border-color: rgba(16, 185, 129, 0.4);
        }
        .project-card-image-wrap {
          position: relative;
          aspect-ratio: 16 / 10;
          width: 100%;
          overflow: hidden;
          background: #0F172A;
        }
        .project-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease;
        }
        .project-card-img.loading {
          filter: blur(4px);
        }
        .project-card-item:hover .project-card-img {
          transform: scale(1.06);
        }
        .project-card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0) 40%, rgba(15, 23, 42, 0.65) 100%);
          pointer-events: none;
        }
        .project-card-badge-row {
          position: absolute;
          top: 0.85rem;
          left: 0.85rem;
          right: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          pointer-events: none;
          z-index: 2;
        }
        .project-card-badge {
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-pill, 9999px);
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .project-featured-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(245, 158, 11, 0.95);
          backdrop-filter: blur(6px);
          color: #FFFFFF;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-pill, 9999px);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
        }
        .project-photo-count-pill {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(15, 23, 42, 0.82);
          backdrop-filter: blur(8px);
          color: #F8FAFC;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.28rem 0.65rem;
          border-radius: var(--radius-pill, 9999px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          z-index: 2;
        }
        .project-card-body {
          padding: 1.35rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .project-meta-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.65rem;
        }
        .project-location-bar {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: var(--slate-500, #64748B);
          font-weight: 500;
        }
        .loc-icon {
          color: #10B981;
          flex-shrink: 0;
        }
        .project-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          font-weight: 700;
          color: #047857;
          background: #ECFDF5;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-pill, 9999px);
          text-transform: uppercase;
        }
        .status-dot {
          color: #10B981;
        }
        .project-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 0.65rem;
          color: var(--slate-900, #0F172A);
        }
        .project-card-title a {
          color: inherit;
          transition: color var(--transition-fast, 0.18s ease);
        }
        .project-card-title a:hover {
          color: #0F766E;
        }
        .project-card-summary {
          font-size: 0.875rem;
          color: var(--slate-600, #475569);
          line-height: 1.6;
          margin-bottom: 1.15rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .project-funding-box {
          background: #F8FAFC;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md, 12px);
          margin-bottom: 1.15rem;
          border: 1px solid var(--slate-200, #E2E8F0);
        }
        .funding-labels {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 0.8rem;
          margin-bottom: 0.45rem;
        }
        .raised-text {
          color: var(--slate-900, #0F172A);
        }
        .raised-text strong {
          font-weight: 800;
          font-size: 0.88rem;
        }
        .sub-text {
          color: var(--slate-500, #64748B);
          font-weight: 500;
        }
        .goal-text {
          color: var(--slate-500, #64748B);
          font-size: 0.78rem;
        }
        .progress-bar-track {
          height: 6px;
          background: #E2E8F0;
          border-radius: var(--radius-pill, 9999px);
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: var(--radius-pill, 9999px);
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .progress-percentage-label {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #0F766E;
        }
        .project-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle, #E2E8F0);
          font-size: 0.85rem;
        }
        .beneficiaries-stat {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--slate-700, #334155);
          font-size: 0.82rem;
        }
        .users-icon {
          color: #0EA5E9;
        }
        .project-action-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          font-size: 0.85rem;
          color: #0F766E;
          transition: all 0.2s ease;
        }
        .project-action-link:hover {
          color: #065F46;
          transform: translateX(3px);
        }
        .action-arrow {
          transition: transform 0.2s ease;
        }
        .project-card-item:hover .action-arrow {
          transform: translateX(3px);
        }
      `}</style>
    </article>
  );
}
