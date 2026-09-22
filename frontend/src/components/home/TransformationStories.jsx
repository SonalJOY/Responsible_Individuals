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
      gradient: 'linear-gradient(135deg, #091712 0%, #0F4C3A 60%, #10B981 100%)',
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
            <Sparkles size={14} className="text-emerald" />
            <span>Real Lives, Real Change</span>
          </div>

          <h2 className="stories-main-title">
            Inspiring Journeys of Transformation
          </h2>

          <p className="stories-sub-lead">
            Behind every metric is an individual, student, or neighborhood collective whose story proves the multiplier effect of accountable grassroots action.
          </p>
        </div>

        {/* Story Spotlight Carousel Layout (Inspired by Reference Video 00:10-00:12) */}
        <div className="story-spotlight-wrapper">
          {/* Side preview card (Left) */}
          <button 
            onClick={handlePrev} 
            className="carousel-side-card left-preview" 
            aria-label="Previous Story"
          >
            <div className="preview-indicator">
              <ChevronLeft size={24} />
            </div>
            <span className="preview-label">PREVIOUS STORY</span>
          </button>

          {/* Central Active Featured Story */}
          <div className="spotlight-active-card animate-fade-in" key={activeStory.slug || activeStory.id}>
            {/* Visual Header / Backdrop */}
            <div 
              className="spotlight-hero-art"
              style={{ background: activeStory.gradient || 'linear-gradient(135deg, #091712 0%, #0F4C3A 100%)' }}
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
                  <span className="contrast-label text-emerald">THE OUTCOME</span>
                  <p className="contrast-text">{activeStory.outcome}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="spotlight-action-bar">
                <Link to={`/stories/${activeStory.slug}`} className="btn-read-journey">
                  <span>Read Full Journey</span>
                  <ArrowRight size={16} />
                </Link>

                <div className="carousel-stepper-dots">
                  {storyList.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`stepper-dot ${i === currentIndex ? 'active' : ''}`}
                      aria-label={`Go to story ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side preview card (Right) */}
          <button 
            onClick={handleNext} 
            className="carousel-side-card right-preview" 
            aria-label="Next Story"
          >
            <div className="preview-indicator">
              <ChevronRight size={24} />
            </div>
            <span className="preview-label">NEXT STORY</span>
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
        .stories-main-title {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--charcoal-900);
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
          gap: 1.5rem;
          position: relative;
        }
        .carousel-side-card {
          display: none;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: 24px;
          width: 80px;
          height: 380px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          color: var(--charcoal-700);
          padding: 1rem;
        }
        @media (min-width: 1024px) {
          .carousel-side-card {
            display: flex;
          }
        }
        .carousel-side-card:hover {
          background: var(--cream-200);
          border-color: #10B981;
          color: #10B981;
        }
        .preview-indicator {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-pill);
          background: var(--cream-100);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .preview-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }
        .spotlight-active-card {
          flex: 1;
          max-width: 880px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: 36px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(8, 41, 31, 0.1);
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
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .spotlight-location-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #E2E8F0;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .beneficiary-callout {
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          padding: 0.45rem 1.25rem;
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
          color: var(--charcoal-900);
          margin-bottom: 1.5rem;
        }
        .spotlight-story-title a:hover {
          color: #059669;
        }
        .spotlight-quote-bubble {
          background: var(--cream-50);
          border-left: 4px solid #10B981;
          padding: 1.5rem 1.75rem;
          border-radius: 0 20px 20px 0;
          margin-bottom: 2rem;
        }
        .quote-mark {
          color: #10B981;
          margin-bottom: 0.5rem;
        }
        .quote-paragraph {
          font-style: italic;
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--charcoal-800);
          margin-bottom: 0.5rem;
        }
        .quote-byline {
          display: block;
          font-size: 0.825rem;
          font-weight: 700;
          color: #059669;
        }
        .transformation-contrast-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        @media (min-width: 640px) {
          .transformation-contrast-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .contrast-box {
          padding: 1.25rem;
          border-radius: 16px;
          border: 1px solid var(--border-subtle);
        }
        .challenge-box {
          background: #FFFDF9;
        }
        .outcome-box {
          background: #F0FDF4;
          border-color: #BBF7D0;
        }
        .contrast-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
        }
        .contrast-text {
          font-size: 0.9rem;
          line-height: 1.55;
          color: var(--charcoal-800);
        }
        .spotlight-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }
        .btn-read-journey {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: #10B981;
          color: #042F1A;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.8rem 1.65rem;
          border-radius: var(--radius-pill);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
          transition: all var(--transition-fast);
        }
        .btn-read-journey:hover {
          background: #059669;
          color: #FFFFFF;
          transform: translateY(-2px);
        }
        .carousel-stepper-dots {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .stepper-dot {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-pill);
          background: var(--cream-300);
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .stepper-dot.active {
          width: 32px;
          background: #10B981;
        }
      `}</style>
    </section>
  );
}
