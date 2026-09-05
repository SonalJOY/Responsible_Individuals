import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight, TrendingUp } from 'lucide-react';

export default function ProjectCard({ project }) {
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
    cover_image
  } = project;

  // Format currency in Indian Lakhs/Crores or thousand
  const formatCurrency = (val) => {
    const num = Number(val);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="card project-card-item">
      <div className="project-card-image-wrap">
        {cover_image ? (
          <img src={cover_image} alt={title} className="project-card-img" />
        ) : (
          <div 
            className="project-card-placeholder"
            style={{ background: `linear-gradient(135deg, ${focus_area_color || '#0F4C3A'} 0%, #0F172A 100%)` }}
          >
            <span className="project-placeholder-text">{focus_area_name || 'Social Impact'}</span>
          </div>
        )}
        <div className="project-card-badge" style={{ backgroundColor: focus_area_color || '#10B981' }}>
          {focus_area_name || 'Community Initiative'}
        </div>
      </div>

      <div className="project-card-body">
        <div className="project-location-bar">
          <MapPin size={14} color="#64748B" />
          <span>{location}</span>
        </div>

        <h3 className="project-card-title">
          <Link to={`/projects/${slug}`}>{title}</Link>
        </h3>

        <p className="project-card-summary">{summary}</p>

        {/* Progress Bar & Financial stats */}
        <div className="project-funding-box">
          <div className="funding-labels">
            <span className="raised-text">{formatCurrency(raised_amount)} raised</span>
            <span className="goal-text">Goal: {formatCurrency(budget)}</span>
          </div>
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${Math.min(progress_percentage, 100)}%`, backgroundColor: focus_area_color || '#10B981' }}
            />
          </div>
        </div>

        <div className="project-card-footer">
          <div className="beneficiaries-stat">
            <Users size={16} color="#059669" />
            <span><strong>{(beneficiaries_count || 0).toLocaleString()}</strong> impacted</span>
          </div>
          <Link to={`/projects/${slug}`} className="project-action-link">
            <span>Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <style>{`
        .project-card-item {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .project-card-image-wrap {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #0F172A;
        }
        .project-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }
        .project-card-item:hover .project-card-img {
          transform: scale(1.05);
        }
        .project-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          text-align: center;
        }
        .project-placeholder-text {
          color: rgba(255, 255, 255, 0.9);
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
        }
        .project-card-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-pill);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          letter-spacing: 0.02em;
        }
        .project-card-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .project-location-bar {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .project-card-title {
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1.35;
          margin-bottom: 0.75rem;
          color: var(--slate-900);
        }
        .project-card-title a:hover {
          color: var(--primary-700);
        }
        .project-card-summary {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .project-funding-box {
          background: var(--slate-50);
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.25rem;
          border: 1px solid var(--slate-200);
        }
        .funding-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 0.4rem;
        }
        .raised-text {
          font-weight: 700;
          color: var(--slate-900);
        }
        .goal-text {
          color: var(--text-muted);
        }
        .progress-bar-track {
          height: 6px;
          background: var(--slate-200);
          border-radius: var(--radius-pill);
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: var(--radius-pill);
          transition: width var(--transition-slow);
        }
        .project-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle);
          font-size: 0.85rem;
        }
        .beneficiaries-stat {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--slate-700);
        }
        .project-action-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          color: var(--primary-800);
        }
        .project-action-link:hover {
          color: var(--primary-600);
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
}
