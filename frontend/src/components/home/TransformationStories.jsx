import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Quote, ArrowRight, MapPin, ChevronLeft, ChevronRight, Sparkles, Heart } from 'lucide-react';

export default function TransformationStories({ stories = [] }) {
  const defaultStories = [
    {
      id: 's1',
      slug: 'from-barren-silt-to-blooming-lake',
      title: 'From Foul Silt to Blooming Wetland: How 300 Citizens Revived Varthur Inflow',
      focus_area_name: 'Water & Environment',
      beneficiary_name: 'Kaikondrahalli Neighborhood Welfare Association',
      location: 'Bengaluru East',
      quote: 'We proved that when individuals take ownership of their immediate environment with structured scientific backing, government authorities readily step up to partner.',
      quote_author: 'Meera Sundararajan, Resident Coordinator',
      challenge: 'For over eight years, the stormwater drain had become a stagnant blackwater channel choked with construction debris. Groundwater borewells had run dry down to 900 feet.',
      outcome: 'Today, open water has returned, 42 bird species nest on the created island, and neighboring borewells recharged by 45 feet.',
      gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #B45309 100%)',
    },
    {
      id: 's2',
      slug: 'first-generation-coder-from-kolar',
      title: 'Cracking the Code: How 15-Year-Old Anitha Built an IoT Soil Sensor for Her Village',
      focus_area_name: 'Education & Youth',
      beneficiary_name: 'Anitha M. & Government High School Batch',
      location: 'Kolar District, Karnataka',
      quote: 'The STEM lab showed me that science is not just exam textbooks — it is a tool to solve my father’s struggles in the field.',
      quote_author: 'Anitha M., Student Fellow',
      challenge: 'Anitha had never touched a computer until 9th grade. Her father, a dryland farmer, suffered repeated crop losses from irregular soil moisture cycles.',
      outcome: 'Anitha won the State Science Exhibition with her solar-powered automated soil moisture alarm, and received an engineering fellowship.',
      gradient: 'linear-gradient(135deg, #0C1E38 0%, #1E3A8A 60%, #3B82F6 100%)',
    },
  ];

  const storyList = stories.length > 0 ? stories : defaultStories;
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeStory = storyList[currentIndex] || storyList[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % storyList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + storyList.length) % storyList.length);
  };

  return (
    <section className="stories-editorial-root">
      <div className="container">
        {/* Editorial Section Header */}
        <div className="stories-header-center">
          <div className="stories-badge">
            <Sparkles size={14} className="text-accent" />
            <span>Real Lives, Real Change</span>
          </div>

          <h2 className="stories-main-title">
            Inspiring Journeys of Transformation
          </h2>

          <p className="stories-sub-lead">
            Behind every metric is an individual, student, or neighborhood collective whose story proves the multiplier effect of accountable grassroots action.
          </p>
        </div>

        {/* Story Spotlight Card */}
        <div className="story-spotlight-wrapper">
          {/* Central Active Featured Story */}
          <div className="spotlight-active-card animate-fade-in" key={activeStory.slug || activeStory.id}>
            {/* Visual Header / Backdrop */}
            <div 
              className="spotlight-hero-art"
              style={{ background: activeStory.gradient || 'linear-gradient(135deg, #0C1E38 0%, #1E3A8A 60%, #0EA5E9 100%)' }}
            >
              <div className="spotlight-art-meta">
                <span className="spotlight-category-tag">
                  {activeStory.focus_area_name || 'Story of Change'}
                </span>
                <span className="spotlight-location-tag">
                  <MapPin size={13} /> {activeStory.location}
                </span>
              </div>

              <div className="spotlight-center-badge">
                <span className="beneficiary-callout">
                  {activeStory.beneficiary_name}
                </span>
              </div>
            </div>

            {/* Story Content & Narrative */}
            <div className="spotlight-content-body">
              <h3 className="spotlight-story-title">
                <Link to={`/stories/${activeStory.slug}`}>{activeStory.title}</Link>
              </h3>

              {activeStory.quote && (
                <div className="spotlight-quote-bubble">
                  <Quote size={22} className="quote-mark" />
                  <p className="quote-paragraph">"{activeStory.quote}"</p>
                  {activeStory.quote_author && (
                    <span className="quote-byline">— {activeStory.quote_author}</span>
                  )}
                </div>
              )}

              {/* 2-Column Transformation Summary */}
              <div className="transformation-contrast-grid">
                <div className="contrast-box challenge-box">
                  <span className="contrast-label">THE CHALLENGE</span>
                  <p className="contrast-text">{activeStory.challenge}</p>
                </div>
                <div className="contrast-box outcome-box">
                  <span className="contrast-label text-blue">THE OUTCOME</span>
                  <p className="contrast-text">{activeStory.outcome}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="spotlight-action-bar">
                <Link to={`/stories/${activeStory.slug}`} className="btn-read-journey">
                  <span>Read Full Journey</span>
                  <ArrowRight size={16} />
                </Link>

                <div className="spotlight-counter-indicator">
                  <span>Story {currentIndex + 1} of {storyList.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Story Navigation Controls (Strictly Same Horizontal Axis) */}
        <div className="story-horizontal-navigation" role="navigation" aria-label="Story carousel navigation">
          <button 
            type="button"
            onClick={handlePrev} 
            className="story-nav-btn prev-btn" 
            aria-label="Previous Story"
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>

          <div className="story-nav-dots" role="tablist">
            {storyList.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`story-dot ${i === currentIndex ? 'active' : ''}`}
                aria-label={`Go to story ${i + 1}`}
                aria-selected={i === currentIndex}
              />
            ))}
          </div>

          <button 
            type="button"
            onClick={handleNext} 
            className="story-nav-btn next-btn" 
            aria-label="Next Story"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .stories-editorial-root {
          background-color: var(--cream-100);
          padding: 6rem 0;
          position: relative;
        }
        .stories-header-center {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 4rem auto;
        }
        .stories-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--charcoal-800);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .stories-badge .text-accent {
          color: var(--primary-saffron, #F97316);
        }
        .stories-main-title {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary, #0F172A);
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .stories-main-title {
            font-size: 3.5rem;
          }
        }
        .stories-sub-lead {
          font-size: 1.1rem;
          color: var(--text-muted);
          line-height: 1.65;
        }
        .story-spotlight-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          position: relative;
        }
        .spotlight-active-card {
          width: 100%;
          max-width: 900px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04);
          transition: box-shadow 0.28s ease, transform 0.28s ease;
        }
        .spotlight-active-card:hover {
          box-shadow: 0 24px 50px rgba(15, 23, 42, 0.12), 0 6px 16px rgba(15, 23, 42, 0.05);
        }
        .spotlight-hero-art {
          height: 240px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2rem;
          color: white;
        }
        .spotlight-art-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .spotlight-category-tag {
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          padding: 0.35rem 0.95rem;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .spotlight-location-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #E2E8F0;
          padding: 0.35rem 0.95rem;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .beneficiary-callout {
          display: inline-block;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #FFFFFF;
          padding: 0.45rem 1.35rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.85rem;
        }
        .spotlight-content-body {
          padding: 3rem;
        }
        @media (max-width: 640px) {
          .spotlight-content-body {
            padding: 1.75rem;
          }
        }
        .spotlight-story-title {
          font-family: var(--font-heading);
          font-size: 1.85rem;
          font-weight: 800;
          line-height: 1.25;
          color: var(--text-primary, #0F172A);
          margin-bottom: 1.5rem;
        }
        .spotlight-story-title a:hover {
          color: var(--primary-saffron, #F97316);
        }
        .spotlight-quote-bubble {
          background: var(--cream-50, #FDFBF7);
          border-left: 4px solid var(--primary-saffron, #F97316);
          padding: 1.5rem 1.75rem;
          border-radius: 0 20px 20px 0;
          margin-bottom: 2rem;
        }
        .quote-mark {
          color: var(--primary-saffron, #F97316);
          margin-bottom: 0.5rem;
        }
        .quote-paragraph {
          font-style: italic;
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-primary, #0F172A);
          margin-bottom: 0.5rem;
        }
        .quote-byline {
          display: block;
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--primary-saffron-hover, #EA580C);
        }
        .transformation-contrast-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2.25rem;
        }
        @media (min-width: 640px) {
          .transformation-contrast-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .contrast-box {
          padding: 1.35rem;
          border-radius: 16px;
          border: 1px solid var(--border-subtle, #E2E8F0);
        }
        .challenge-box {
          background: #FFFDF9;
        }
        .outcome-box {
          background: var(--secondary-blue-light, #F0F9FF);
          border-color: rgba(14, 165, 233, 0.25);
        }
        .contrast-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--text-secondary, #475569);
          margin-bottom: 0.4rem;
        }
        .contrast-label.text-blue {
          color: var(--secondary-light-blue-hover, #0284C7);
        }
        .contrast-text {
          font-size: 0.9rem;
          line-height: 1.55;
          color: var(--text-primary, #0F172A);
        }
        .spotlight-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle, #E2E8F0);
        }
        .btn-read-journey {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--primary-saffron, #F97316);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.8rem 1.65rem;
          border-radius: var(--radius-pill);
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.25);
          transition: all var(--transition-fast);
        }
        .btn-read-journey:hover {
          background: var(--primary-saffron-hover, #EA580C);
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(234, 88, 12, 0.35);
        }
        .spotlight-counter-indicator {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary, #64748B);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* 3 & 4. HORIZONTAL STORY NAVIGATION CONTROLS */
        .story-horizontal-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 900px;
          margin: 2rem auto 0 auto;
          padding: 0.5rem 0.5rem;
          gap: 1rem;
        }
        .story-nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 44px;
          min-width: 130px;
          padding: 0 1.4rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-radius: var(--radius-pill);
          color: var(--text-primary, #0F172A);
          font-weight: 700;
          font-size: 0.925rem;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .story-nav-btn:hover {
          background: var(--primary-saffron, #F97316);
          color: #FFFFFF;
          border-color: var(--primary-saffron, #F97316);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(249, 115, 22, 0.28);
        }
        .story-nav-btn:active {
          transform: translateY(0);
        }
        .story-nav-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          flex: 1;
        }
        .story-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-pill);
          background: #CBD5E1;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          padding: 0;
        }
        .story-dot.active {
          width: 32px;
          background: var(--primary-saffron, #F97316);
        }
        .story-dot:hover:not(.active) {
          background: #94A3B8;
        }
        @media (max-width: 640px) {
          .story-horizontal-navigation {
            padding: 0.5rem 0.25rem;
            gap: 0.5rem;
          }
          .story-nav-btn {
            height: 40px;
            min-width: 95px;
            padding: 0 0.9rem;
            font-size: 0.825rem;
          }
          .story-nav-dots {
            gap: 0.4rem;
          }
          .story-dot {
            width: 8px;
            height: 8px;
          }
          .story-dot.active {
            width: 22px;
          }
        }
      `}</style>
    </section>
  );
}
