import React from 'react';
import { Link } from 'react-router-dom';
import { Quote, ArrowRight, MapPin } from 'lucide-react';

export default function StoryCard({ story }) {
  const {
    title,
    slug,
    focus_area_name,
    focus_area_color,
    beneficiary_name,
    location,
    challenge,
    outcome,
    quote,
    quote_author,
    cover_image
  } = story;

  return (
    <div className="card story-card-root">
      <div className="story-card-top">
        <div className="story-meta-bar">
          <span 
            className="story-area-badge" 
            style={{ backgroundColor: focus_area_color || '#10B981' }}
          >
            {focus_area_name || 'Story of Change'}
          </span>
          <span className="story-location">
            <MapPin size={12} /> {location}
          </span>
        </div>

        <h3 className="story-title">
          <Link to={`/stories/${slug}`}>{title}</Link>
        </h3>
      </div>

      <div className="story-body">
        {quote && (
          <div className="story-quote-box">
            <Quote size={20} className="quote-icon" />
            <p className="quote-text">"{quote}"</p>
            {quote_author && <span className="quote-author">— {quote_author}</span>}
          </div>
        )}

        <div className="story-narrative-preview">
          <div className="narrative-point">
            <span className="narrative-label">The Challenge:</span>
            <p className="narrative-desc">{challenge.slice(0, 110)}...</p>
          </div>
          <div className="narrative-point">
            <span className="narrative-label success-label">The Transformation:</span>
            <p className="narrative-desc">{outcome.slice(0, 120)}...</p>
          </div>
        </div>
      </div>

      <div className="story-footer">
        <span className="beneficiary-tag">Beneficiary: <strong>{beneficiary_name}</strong></span>
        <Link to={`/stories/${slug}`} className="story-read-link">
          <span>Read Story</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <style>{`
        .story-card-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #FFFFFF;
        }
        .story-card-top {
          padding: 1.5rem 1.5rem 1rem 1.5rem;
        }
        .story-meta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .story-area-badge {
          color: white;
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
        }
        .story-location {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .story-title {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.35;
          color: var(--slate-900);
        }
        .story-title a:hover {
          color: var(--primary-700);
        }
        .story-body {
          padding: 0 1.5rem 1.25rem 1.5rem;
          flex: 1;
        }
        .story-quote-box {
          background: var(--slate-50);
          border-left: 3px solid var(--primary-500);
          padding: 1rem 1.2rem;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          margin-bottom: 1.25rem;
          position: relative;
        }
        .quote-icon {
          color: var(--primary-400);
          margin-bottom: 0.25rem;
        }
        .quote-text {
          font-style: italic;
          font-size: 0.875rem;
          color: var(--slate-700);
          line-height: 1.5;
          margin-bottom: 0.4rem;
        }
        .quote-author {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--slate-500);
        }
        .story-narrative-preview {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .narrative-point {
          font-size: 0.85rem;
        }
        .narrative-label {
          font-weight: 700;
          color: var(--slate-700);
          display: block;
          margin-bottom: 0.15rem;
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
        }
        .success-label {
          color: var(--primary-700);
        }
        .narrative-desc {
          color: var(--text-muted);
          line-height: 1.45;
        }
        .story-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: var(--slate-50);
          border-top: 1px solid var(--border-subtle);
          font-size: 0.825rem;
        }
        .beneficiary-tag {
          color: var(--slate-600);
        }
        .story-read-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          color: var(--primary-800);
        }
        .story-read-link:hover {
          color: var(--primary-600);
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
}
