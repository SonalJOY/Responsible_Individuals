import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, MapPin, Clock, Calendar, 
  Quote, Sparkles, CheckCircle2, Users, AlertCircle, Compass 
} from 'lucide-react';
import { getStoryBySlug, getRelatedStories } from '../../data/storiesData';
import StoryEditorialCard from './components/StoryEditorialCard';
import './stories.css';

export default function StoryDetailPage() {
  const { slug } = useParams();
  const story = getStoryBySlug(slug);
  const relatedStories = getRelatedStories(slug, 3);

  // Scroll to top whenever slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!story) {
    return (
      <div className="story-detail-root">
        <div className="container" style={{ padding: '7rem 1.5rem', textAlign: 'center' }}>
          <AlertCircle size={48} color="#F59E0B" style={{ margin: '0 auto 1.5rem auto' }} />
          <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: 'var(--slate-900)' }}>
            Story Not Found
          </h1>
          <p style={{ color: 'var(--slate-600)', maxWidth: '540px', margin: '0 auto 2rem auto', fontSize: '1.1rem' }}>
            The story you are looking for does not exist or may have been updated.
          </p>
          <Link to="/stories" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Back to All Stories</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    category,
    categoryColor,
    title,
    subtitle,
    location,
    readTime,
    date,
    heroImage,
    supportingImages = [],
    quote,
    quoteAuthor,
    quoteRole,
    challenge,
    response,
    people,
    change,
    keyTakeaway
  } = story;

  return (
    <div className="story-detail-root">
      {/* Top Sticky Navigation Bar */}
      <nav className="story-detail-nav-bar" aria-label="Story Navigation">
        <div className="container">
          <Link to="/stories" className="story-detail-back-link">
            <ArrowLeft size={16} />
            <span>Back to Stories</span>
          </Link>
        </div>
      </nav>

      {/* Header Section */}
      <header className="story-detail-header-section">
        <div className="container">
          <div className="story-detail-header-inner">
            <div className="story-detail-badges-row">
              <span 
                className="story-category-pill"
                style={{ 
                  backgroundColor: categoryColor || '#10B981',
                  color: '#FFFFFF'
                }}
              >
                {category}
              </span>
              <span className="demo-tag">
                Prototype Story Narrative
              </span>
            </div>

            <h1 className="story-detail-title">{title}</h1>
            
            {subtitle && (
              <p className="story-detail-subtitle">{subtitle}</p>
            )}

            <div className="story-detail-meta-bar">
              {location && (
                <span className="story-meta-item">
                  <MapPin size={15} color="#10B981" />
                  <span>{location}</span>
                </span>
              )}
              {readTime && (
                <span className="story-meta-item">
                  <Clock size={15} />
                  <span>{readTime}</span>
                </span>
              )}
              {date && (
                <span className="story-meta-item">
                  <Calendar size={15} />
                  <span>{date}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Large Hero Image */}
      <div className="container">
        <div className="story-detail-hero-media">
          <div className="story-detail-hero-img-box">
            <img 
              src={heroImage} 
              alt={title} 
              className="story-detail-hero-img"
              loading="eager"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
          <p className="story-img-caption">
            Field documentation from community initiatives in {location || 'the field'}.
          </p>
        </div>
      </div>

      {/* Main Narrative Body */}
      <main className="story-detail-body-container">
        {/* The Challenge */}
        {challenge && (
          <section className="narrative-block" aria-labelledby="heading-challenge">
            <h2 id="heading-challenge" className="narrative-section-heading challenge-heading">
              <AlertCircle size={18} color="#F59E0B" />
              <span>The Challenge</span>
            </h2>
            <p className="narrative-paragraph">
              {challenge}
            </p>
          </section>
        )}

        {/* The Response */}
        {response && (
          <section className="narrative-block" aria-labelledby="heading-response">
            <h2 id="heading-response" className="narrative-section-heading response-heading">
              <Compass size={18} color="#2563EB" />
              <span>The Response</span>
            </h2>
            <p className="narrative-paragraph">
              {response}
            </p>
          </section>
        )}

        {/* Pull Quote */}
        {quote && (
          <aside className="story-detail-pull-quote" aria-label="Story Quote">
            <Quote size={32} color="#10B981" style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
            <blockquote className="pull-quote-text">
              "{quote}"
            </blockquote>
            <div className="pull-quote-author">
              — {quoteAuthor || 'Community Participant'}
              {quoteRole && (
                <span style={{ display: 'block', color: 'var(--slate-500)', fontWeight: 500, fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  {quoteRole}
                </span>
              )}
            </div>
          </aside>
        )}

        {/* The People */}
        {people && (
          <section className="narrative-block" aria-labelledby="heading-people">
            <h2 id="heading-people" className="narrative-section-heading people-heading">
              <Users size={18} color="#7C3AED" />
              <span>The People</span>
            </h2>
            <p className="narrative-paragraph">
              {people}
            </p>
          </section>
        )}

        {/* Supporting Images */}
        {supportingImages.length > 0 && (
          <div className="story-detail-supporting-gallery">
            {supportingImages.map((imgItem, idx) => (
              <figure key={idx} className="supporting-img-card">
                <img 
                  src={imgItem.url} 
                  alt={imgItem.caption || `${title} supporting photo ${idx + 1}`}
                  className="supporting-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                {imgItem.caption && (
                  <figcaption className="supporting-img-caption">
                    {imgItem.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {/* The Change */}
        {change && (
          <section className="narrative-block" aria-labelledby="heading-change">
            <h2 id="heading-change" className="narrative-section-heading change-heading">
              <CheckCircle2 size={18} color="#10B981" />
              <span>The Change</span>
            </h2>
            <p className="narrative-paragraph">
              {change}
            </p>
          </section>
        )}

        {/* Key Human Takeaway */}
        {keyTakeaway && (
          <div className="story-takeaway-card">
            <div className="takeaway-icon-box">
              <Sparkles size={22} color="#10B981" />
            </div>
            <div>
              <h3 className="takeaway-title">Grassroots Insight</h3>
              <p className="takeaway-text">{keyTakeaway}</p>
            </div>
          </div>
        )}
      </main>

      {/* More Stories Section */}
      <aside className="more-stories-section" aria-label="More Stories of Change">
        <div className="container">
          <div className="more-stories-header">
            <div>
              <span className="section-badge">Keep Exploring</span>
              <h2 className="more-stories-title">More Stories</h2>
            </div>
            <Link to="/stories" className="more-stories-action-link">
              <span>Explore All Stories</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="field-stories-grid">
            {relatedStories.map((relStory) => (
              <StoryEditorialCard key={relStory.id} story={relStory} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
