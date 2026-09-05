import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock } from 'lucide-react';

export default function StoryEditorialCard({ story }) {
  if (!story) return null;

  const {
    slug,
    category,
    categoryColor,
    title,
    description,
    coverImage,
    location,
    readTime
  } = story;

  return (
    <article className="story-editorial-card">
      <div className="story-card-img-box">
        <img 
          src={coverImage} 
          alt={title} 
          className="story-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
        <div className="story-card-category-overlay">
          <span 
            className="story-category-pill"
            style={{ 
              backgroundColor: categoryColor || '#10B981',
              color: '#FFFFFF'
            }}
          >
            {category}
          </span>
        </div>
      </div>

      <div className="story-card-body">
        <div className="story-card-meta">
          <div className="story-meta-row">
            {location && (
              <span className="story-meta-item">
                <MapPin size={12} color="#10B981" />
                <span>{location}</span>
              </span>
            )}
            {location && readTime && <span>•</span>}
            {readTime && (
              <span className="story-meta-item">
                <Clock size={12} />
                <span>{readTime}</span>
              </span>
            )}
          </div>
        </div>

        <h3 className="story-card-title">
          <Link to={`/stories/${slug}`}>
            {title}
          </Link>
        </h3>

        <p className="story-card-desc">
          {description}
        </p>
      </div>

      <div className="story-card-footer">
        <span className="demo-tag">Prototype Story</span>
        <Link to={`/stories/${slug}`} className="story-card-read-link" aria-label={`Read story: ${title}`}>
          <span>Read Story</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
