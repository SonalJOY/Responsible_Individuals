import React, { useState } from 'react';
import { MapPin, ArrowRight, Leaf } from 'lucide-react';

export default function GalleryCard({ item, index, onClick, isVisible }) {
  const [imgSrc, setImgSrc] = useState(item.image);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleImgError = () => {
    if (!fallbackAttempted && item.localFallback) {
      setFallbackAttempted(true);
      setImgSrc(item.localFallback);
    } else {
      setImgFailed(true);
    }
  };

  return (
    <div
      className={`gallery-card ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${(index % 6) * 70}ms` }}
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item);
        }
      }}
      aria-label={`View gallery item: ${item.title}`}
    >
      <div className="gallery-card-img-box">
        {!imgFailed ? (
          <img
            src={imgSrc}
            alt={item.title}
            className="gallery-card-img"
            loading="lazy"
            onError={handleImgError}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: item.fallbackGradient || 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#FFFFFF',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            <Leaf size={38} style={{ color: item.themeColor || '#34D399', marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9 }}>{item.category}</span>
          </div>
        )}

        <div className="gallery-card-overlay" />

        <div className="gallery-card-badge-container">
          <span
            className="gallery-card-tag"
            style={{ backgroundColor: item.themeColor || '#0D9488' }}
          >
            {item.category}
          </span>
          <span className="gallery-card-loc-pill">
            <MapPin size={11} /> {item.location.split(',')[0]}
          </span>
        </div>

        <div className="gallery-card-action-btn">
          <span>VIEW STORY</span>
          <ArrowRight size={14} />
        </div>
      </div>

      <div className="gallery-card-body">
        <div className="gallery-card-header">
          <span className="gallery-card-date">{item.date || 'Field Action'}</span>
        </div>

        <h3 className="gallery-card-title">{item.title}</h3>

        <div className="gallery-card-meta">
          <MapPin size={13} style={{ color: item.themeColor || '#0D9488' }} />
          <span>{item.location}</span>
        </div>
      </div>
    </div>
  );
}
