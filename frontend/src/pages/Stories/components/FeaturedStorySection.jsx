import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Droplets } from 'lucide-react';

export default function FeaturedStorySection({ story }) {
  if (!story) return null;

  const {
    slug,
    category,
    categoryColor,
    title,
    description,
    coverImage,
    location,
    readTime,
    quote
  } = story;

  return (
    <section className="featured-story-section" aria-label="Featured Story">
      <div className="container">
        <div className="featured-story-card">
          <div className="featured-image-box">
            <img 
              src={coverImage} 
              alt={title}
              className="featured-image"
              loading="eager"
              onError={(e) => {
                // Fallback graceful tint if network issue
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <div className="featured-badge-float">
              <span 
                className="story-category-pill"
                style={{ 
                  backgroundColor: categoryColor || '#0D9488',
                  color: '#FFFFFF'
                }}
              >
                <Droplets size={12} />
                <span>{category}</span>
              </span>
            </div>
          </div>

          <div className="featured-content-box">
            <div className="featured-eyebrow-row">
              <div className="story-meta-row">
                <span className="story-meta-item">
                  <MapPin size={13} color="#10B981" />
                  <span>{location}</span>
                </span>
                <span>•</span>
                <span className="story-meta-item">
                  <Clock size={13} />
                  <span>{readTime}</span>
                </span>
              </div>
              <span className="demo-tag">Featured Narrative</span>
            </div>

            <h2 className="featured-title">
              <Link to={`/stories/${slug}`}>
                {title}
              </Link>
            </h2>

            <p className="featured-desc">
              {description}
            </p>

            {quote && (
              <div className="featured-quote-callout">
                "{quote}"
              </div>
            )}

            <div className="featured-actions">
              <Link to={`/stories/${slug}`} className="featured-cta-link">
                <span>Read the Story</span>
                <ArrowRight size={16} />
              </Link>
              <span className="story-meta-item" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Field Initiative
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
