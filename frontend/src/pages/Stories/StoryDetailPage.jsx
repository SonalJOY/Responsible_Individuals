import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, MapPin, Clock, Calendar, 
  Quote, Sparkles, CheckCircle2, Users, AlertCircle, Compass 
} from 'lucide-react';
import { getStoryBySlug, getRelatedStories } from '../../data/storiesData';
import { storyService } from '../../services/api';
import StoryEditorialCard from './components/StoryEditorialCard';
import './stories.css';

export default function StoryDetailPage() {
  const { slug } = useParams();
  const initialStory = getStoryBySlug(slug);
  const [story, setStory] = useState(initialStory);
  const [loading, setLoading] = useState(!initialStory);
  const relatedStories = getRelatedStories(slug, 3);

  // Scroll to top whenever slug changes
  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;
    async function fetchStoryDetails() {
      try {
        const liveDetail = await storyService.getStoryDetail(slug);
        if (isMounted && liveDetail) {
          setStory((prev) => ({
            ...(prev || {}),
            ...liveDetail,
            title: liveDetail.title || prev?.title,
            heroImage: liveDetail.cover_image || prev?.heroImage || '/images/stories/varthur-blooming-wetland.jpg',
            coverImage: liveDetail.cover_image || prev?.coverImage || '/images/stories/varthur-blooming-wetland.jpg',
            category: liveDetail.focus_area_name || prev?.category || 'Water & Environment',
            categoryColor: liveDetail.focus_area_color || prev?.categoryColor || '#0D9488',
            quote: liveDetail.quote || prev?.quote,
            quoteAuthor: liveDetail.quote_author || prev?.quoteAuthor,
            challenge: liveDetail.challenge || prev?.challenge,
            response: liveDetail.intervention || prev?.response,
            change: liveDetail.outcome || prev?.change,
            supportingImages: (prev?.supportingImages && prev.supportingImages.length > 0)
              ? prev.supportingImages
              : [
                  ...(liveDetail.before_image ? [{ url: liveDetail.before_image, caption: 'Community desilting squads clearing 4,200 tons of toxic sludge.' }] : []),
                  ...(liveDetail.after_image ? [{ url: liveDetail.after_image, caption: 'Citizen science volunteers conducting multi-parameter water testing.' }] : [])
                ]
          }));
        }
      } catch {
        // Backend offline or error; retain prototype data seamlessly
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStoryDetails();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="story-detail-root">
        <div className="container" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1.5rem auto' }} />
          <p style={{ color: 'var(--slate-600)', fontSize: '1.1rem' }}>Loading field narrative...</p>
        </div>
      </div>
    );
  }

  if (!story && !loading) {
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

  const isVarthur = slug === 'from-barren-silt-to-blooming-lake';

  const title = story?.title || 'From Foul Silt to Blooming Wetland: How 300 Citizens Revived Varthur Inflow';
  const subtitle = story?.subtitle || 'A citizen-driven ecological breakthrough transforming an 8-year stagnant toxic storm drain into a self-filtering wetland biome.';
  const category = story?.category || story?.focus_area_name || 'Water & Environment';
  const categoryColor = story?.categoryColor || story?.focus_area_color || '#0D9488';
  const location = story?.location || 'Bengaluru East, Karnataka';
  const readTime = story?.readTime || (story?.read_time ? `${story.read_time} min read` : '5 min read');
  const date = story?.date || story?.published_date || 'March 2026';
  const heroImage = story?.heroImage || story?.cover_image || story?.coverImage || '/images/stories/varthur-blooming-wetland.jpg';

  // Ensure exact user-requested quote
  const quote = (isVarthur || !story?.quote)
    ? "We proved that when individuals take ownership of their immediate environment with structured scientific backing, government authorities readily step up to partner."
    : story.quote;

  const quoteAuthor = (isVarthur || !story?.quoteAuthor)
    ? "Meera Sundararajan"
    : (story.quoteAuthor || story.quote_author || 'Meera Sundararajan');

  const quoteRole = (isVarthur || !story?.quoteRole)
    ? "Resident Coordinator, Kaikondrahalli & Varthur Catchment Stewardship"
    : (story.quoteRole || 'Grassroots Project Leader');

  const challenge = story?.challenge || "For over eight years, the stormwater drain had degenerated into a stagnant blackwater channel choked with construction debris and industrial effluent. Groundwater borewells had plummeted below 900 feet, and raw sewage odors forced families to keep windows sealed year-round.";
  const response = story?.response || story?.intervention || "Responsible Individuals partnered with neighborhood collectives, municipal engineers, and wetland hydrologists. Over consecutive weekends, 300 citizen volunteers cleared debris, dredged toxic silt berms, and installed floating bio-retention islands anchored with native vetiver and canna roots.";
  const people = story?.people || "From software engineers and retired geologists to school students and municipal staff, 300 community members worked side-by-side every Saturday. A weekly volunteer water monitoring brigade was formed to track dissolved oxygen and nitrogen levels.";
  const change = story?.change || story?.outcome || "Open reflective water has returned, 42 bird species have established nesting habitats on the restored islands, and surrounding borewells recharged by an average of 45 feet, drastically cutting tanker dependencies for thousands of families.";
  const keyTakeaway = story?.keyTakeaway || quote;

  const metrics = (story?.metrics && story.metrics.length > 0)
    ? story.metrics
    : (isVarthur ? [
        { label: 'Silt Removed', value: '4,200 Tons', sub: 'Bio-composted offsite' },
        { label: 'Contaminant Drop', value: '-74% BOD', sub: 'Water quality turnaround' },
        { label: 'Avian Species', value: '42 Species', sub: 'Nesting on new islands' },
        { label: 'Aquifer Recharged', value: '+45 Feet', sub: 'Borewell water level gain' }
      ] : []);

  const supportingImages = (story?.supportingImages && story.supportingImages.length > 0)
    ? story.supportingImages
    : (isVarthur ? [
        {
          url: '/images/stories/varthur-volunteers-desilting.jpg',
          caption: 'Community desilting squads clearing 4,200 tons of toxic sludge and planting native wetland reed beds.'
        },
        {
          url: '/images/stories/citizen-water-monitoring.jpg',
          caption: 'Citizen science volunteers conducting multi-parameter water quality testing at the inlet swale.'
        }
      ] : []);

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
                  backgroundColor: categoryColor,
                  color: '#FFFFFF'
                }}
              >
                {category}
              </span>
              <span className="demo-tag">
                Impact Narrative
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
                e.target.src = '/images/stories/varthur-blooming-wetland.jpg';
              }}
            />
          </div>
          <p className="story-img-caption">
            Field documentation from community initiatives in {location || 'the field'}.
          </p>
        </div>

        {/* Key Impact Metrics Ribbon */}
        {metrics && metrics.length > 0 && (
          <div className="story-detail-metrics-ribbon" role="region" aria-label="Key Impact Metrics">
            {metrics.map((m, idx) => (
              <div key={idx} className="story-detail-metric-card">
                <span className="story-metric-val">{m.value}</span>
                <span className="story-metric-lbl">{m.label}</span>
                {m.sub && <span className="story-metric-sub">{m.sub}</span>}
              </div>
            ))}
          </div>
        )}
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
                    e.target.src = idx === 0 
                      ? '/images/stories/varthur-volunteers-desilting.jpg'
                      : '/images/stories/citizen-water-monitoring.jpg';
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
            {relatedStories.map((relStory, rIdx) => (
              <StoryEditorialCard key={relStory.id || rIdx} story={relStory} index={rIdx} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
