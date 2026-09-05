import React from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { humanVoiceData } from '../../../data/storiesData';

export default function StoryQuoteSection({ data = humanVoiceData }) {
  const { quote, attribution, context, image, alt } = data;

  return (
    <section className="story-quote-section" aria-label="Human Voice Narrative">
      <div className="container">
        <div className="story-quote-container">
          {/* Left / Portrait Column */}
          <div className="quote-image-wrap">
            <img 
              src={image} 
              alt={alt || 'Community participant portrait'} 
              className="quote-image"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <div className="quote-image-badge">
              <span>Grassroots Reflection</span>
            </div>
          </div>

          {/* Right / Content Column */}
          <div className="quote-content-col">
            <span className="quote-eyebrow">
              <Sparkles size={16} />
              <span>One Story. One Voice.</span>
            </span>

            <div className="quote-block">
              <Quote size={40} className="quote-icon-svg" />
              <blockquote className="quote-body-text">
                "{quote}"
              </blockquote>
            </div>

            <div className="quote-attribution-box">
              <span className="quote-author-name">— {attribution}</span>
              {context && <span className="quote-author-role">{context}</span>}
              <div style={{ marginTop: '0.75rem' }}>
                <span className="demo-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D' }}>
                  Demonstration Quote • Real voices will be published upon field collection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
