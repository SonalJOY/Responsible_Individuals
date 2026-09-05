import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Camera } from 'lucide-react';
import { communityMoments } from '../../../data/storiesData';

export default function FromCommunitySection({ moments = communityMoments }) {
  return (
    <section className="from-community-section" aria-label="From the Community Gallery">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            <Camera size={14} />
            <span>Field Moments</span>
          </span>
          <h2 className="section-title">From the Community</h2>
          <p className="section-subtitle">
            Moments of learning, collaboration and action from the field.
          </p>
        </div>

        <div className="community-gallery-grid">
          {moments.slice(0, 6).map((moment) => (
            <div key={moment.id} className="community-moment-card">
              <img 
                src={moment.image} 
                alt={moment.title} 
                className="community-moment-img"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <div className="moment-overlay">
                <span className="moment-tag">{moment.tag}</span>
                <h4 className="moment-title">{moment.title}</h4>
                <span className="moment-location">
                  <MapPin size={12} color="#34D399" />
                  <span>{moment.location}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="from-community-actions">
          <Link to="/gallery" className="btn btn-secondary btn-lg">
            <span>View Gallery</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
