import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Quote, X, MapPin, CheckCircle2, Clock, 
  Sparkles, ArrowRight, MessageSquarePlus
} from 'lucide-react';
import { volunteerStories } from '../../data/volunteerStoriesData';

/**
 * Voices of Our Volunteers — Vertical Alternating Timeline
 * 
 * Replaces the horizontal carousel with an editorial-grade vertical timeline:
 * - Alternating sequence: Story 1 (image left, text right), Story 2 (text left, image right), etc.
 * - Central vertical timeline spine with smooth scroll-animated saffron progress
 * - Timeline markers for each story (repositions to left edge on mobile)
 * - Authentic organization imagery from /images/
 * - Verified first-person testimonials & tasteful upcoming reflection notices
 * - Detail lightbox modal with milestones and keyboard Escape / body-scroll-lock support
 * - Accessible and respects prefers-reduced-motion
 */
export default function VolunteerPhotoStrip({ onExploreRoles }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [timelineProgress, setTimelineProgress] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      return 1;
    }
    return 0;
  });
  const [revealedRows, setRevealedRows] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      const all = {};
      volunteerStories.forEach((s) => { all[s.id] = true; });
      return all;
    }
    return {};
  });

  const sectionRef = useRef(null);
  const timelineSpineRef = useRef(null);
  const rowRefs = useRef([]);

  // Open & Close Details Lightbox Modal
  const handleOpenStory = (story) => {
    setSelectedStory(story);
  };

  const handleCloseStory = useCallback(() => {
    setSelectedStory(null);
  }, []);

  // Modal Keyboard Dismissal & Body Scroll Locking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedStory) {
        handleCloseStory();
      }
    };

    if (selectedStory) {
      window.addEventListener('keydown', handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedStory, handleCloseStory]);

  // Scroll-Driven Timeline Progress Calculation
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!timelineSpineRef.current) {
            ticking = false;
            return;
          }

          const rect = timelineSpineRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const totalHeight = rect.height;

          // How far down the viewport the scroll head has passed
          const triggerPoint = windowHeight * 0.65;
          const scrolledPast = triggerPoint - rect.top;
          const ratio = Math.min(1, Math.max(0, scrolledPast / (totalHeight || 1)));

          setTimelineProgress(ratio);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // IntersectionObserver for Row Reveal Animations
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const storyId = entry.target.getAttribute('data-story-id');
            if (storyId) {
              setRevealedRows((prev) => ({ ...prev, [storyId]: true }));
            }
          }
        });
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15,
      }
    );

    const currentRows = rowRefs.current;
    currentRows.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      currentRows.forEach((el) => {
        if (el) observer.unobserve(el);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <section 
      className="timeline-section" 
      aria-label="Voices of Our Volunteers Timeline"
      id="volunteer-voices"
      ref={sectionRef}
    >
      <div className="container">
        {/* Section Header */}
        <div className="timeline-header">
          <div className="section-badge timeline-badge">
            <Sparkles size={14} className="badge-sparkle" />
            <span>Community Voices</span>
          </div>
          <h2 className="timeline-title">Voices of Our Volunteers</h2>
          <p className="timeline-subtitle">Real people. Shared responsibility. Lasting community impact.</p>
        </div>

        {/* Vertical Alternating Timeline Container */}
        <div className="timeline-wrapper" ref={timelineSpineRef}>
          {/* Central Vertical Spine (Repositioned to left on mobile) */}
          <div className="timeline-spine-track" aria-hidden="true">
            <div className="timeline-spine-base" />
            <div 
              className="timeline-spine-fill" 
              style={{ height: `${timelineProgress * 100}%` }}
            />
          </div>

          {/* Alternating Story Rows */}
          <div className="timeline-rows-list">
            {volunteerStories.map((story, index) => {
              const isEven = index % 2 === 0; // Even: image left, content right. Odd: content left, image right.
              const isRevealed = !!revealedRows[story.id];

              return (
                <div 
                  key={story.id}
                  ref={(el) => (rowRefs.current[index] = el)}
                  data-story-id={story.id}
                  className={`timeline-row ${isEven ? 'row-even' : 'row-odd'} ${isRevealed ? 'is-revealed' : ''}`}
                >
                  {/* Timeline Marker Node */}
                  <div className={`timeline-node ${isRevealed ? 'node-active' : ''}`} aria-hidden="true">
                    <span className="timeline-node-dot" />
                  </div>

                  {/* Media Column (Photograph) */}
                  <div className="timeline-col timeline-col-media">
                    <div className="timeline-media-card">
                      <img 
                        src={story.image} 
                        alt={`${story.name} — ${story.role}`}
                        className="timeline-media-img"
                        style={{ objectPosition: story.objectPosition || 'center 25%' }}
                        loading={index < 2 ? 'eager' : 'lazy'}
                      />
                      <div className="timeline-media-overlay">
                        <span 
                          className="timeline-focus-pill"
                          style={{ '--focus-accent': story.focusColor || '#F59E0B' }}
                        >
                          {story.focusArea}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Column (Testimonial Narrative) */}
                  <div className="timeline-col timeline-col-content">
                    <article className="timeline-content-card">
                      {/* Status Verification Badge */}
                      <div className="timeline-meta-header">
                        {!story.isPlaceholder ? (
                          <span className="timeline-status-pill verified">
                            <CheckCircle2 size={13} />
                            <span>{story.statusLabel || 'Verified Testimonial'}</span>
                          </span>
                        ) : (
                          <span className="timeline-status-pill upcoming">
                            <Clock size={13} />
                            <span>{story.statusLabel || 'Volunteer Story in Progress'}</span>
                          </span>
                        )}

                        {story.location && (
                          <span className="timeline-location-pill">
                            <MapPin size={13} />
                            <span>{story.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Volunteer / Cohort Title */}
                      <h3 className="timeline-author-name">{story.name}</h3>
                      <p className="timeline-author-role">{story.role}</p>

                      {/* Testimonial Quote or Placeholder */}
                      <div className="timeline-body-content">
                        {!story.isPlaceholder ? (
                          <div className="timeline-quote-wrap">
                            <Quote size={24} className="timeline-quote-icon" aria-hidden="true" />
                            <blockquote className="timeline-quote-text">
                              "{story.quote}"
                            </blockquote>
                          </div>
                        ) : (
                          <div className="timeline-placeholder-box">
                            <p className="timeline-placeholder-text">
                              {story.placeholderNote || story.quote}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="timeline-card-footer">
                        <button
                          type="button"
                          onClick={() => handleOpenStory(story)}
                          className="timeline-detail-btn"
                          aria-label={`Read full story and reflection details for ${story.name}`}
                        >
                          <span>{!story.isPlaceholder ? 'Read full story' : 'Initiative details'}</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </article>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Bottom Community Invitation */}
          <div className="timeline-footer-card">
            <div className="timeline-footer-content">
              <div className="timeline-footer-icon" aria-hidden="true">
                <MessageSquarePlus size={24} />
              </div>
              <div>
                <h4 className="timeline-footer-title">Are you an active volunteer with Responsible Individuals?</h4>
                <p className="timeline-footer-desc">
                  We are gathering authentic first-person stories and ground reflections from our ongoing initiatives. 
                  Share your experience with our community coordination team to be featured in upcoming documentation.
                </p>
              </div>
            </div>
            {onExploreRoles && (
              <button 
                type="button" 
                onClick={onExploreRoles}
                className="btn btn-primary btn-sm timeline-footer-cta"
              >
                <span>Explore Open Roles</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Story Details Lightbox Modal */}
      {selectedStory && (
        <div 
          className="timeline-modal-backdrop"
          onClick={handleCloseStory}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-story-title"
        >
          <div 
            className="timeline-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={handleCloseStory}
              className="timeline-modal-close"
              aria-label="Close reflection details"
            >
              <X size={20} />
            </button>

            <div className="timeline-modal-layout">
              {/* Image Column */}
              <div className="timeline-modal-media">
                <img 
                  src={selectedStory.image} 
                  alt={selectedStory.name} 
                  className="timeline-modal-img"
                  style={{ objectPosition: selectedStory.objectPosition || 'center 25%' }}
                />
                <div className="timeline-modal-media-tags">
                  <span className="timeline-modal-tag saffron">{selectedStory.focusArea}</span>
                  {selectedStory.location && (
                    <span className="timeline-modal-tag slate">{selectedStory.location}</span>
                  )}
                </div>
              </div>

              {/* Text Column */}
              <div className="timeline-modal-body">
                <div className="timeline-modal-header">
                  <span className={`timeline-status-pill ${selectedStory.isPlaceholder ? 'upcoming' : 'verified'}`}>
                    {!selectedStory.isPlaceholder 
                      ? (selectedStory.statusLabel || 'Verified Testimonial') 
                      : (selectedStory.statusLabel || 'Volunteer Story in Progress')}
                  </span>
                  <h3 id="modal-story-title" className="timeline-modal-title">{selectedStory.name}</h3>
                  <p className="timeline-modal-role">{selectedStory.role}</p>
                </div>

                {/* Approved Quote or Status Note */}
                {!selectedStory.isPlaceholder ? (
                  <div className="timeline-modal-quote-box">
                    <Quote size={20} className="modal-quote-glyph" aria-hidden="true" />
                    <p className="timeline-modal-quote">"{selectedStory.quote}"</p>
                  </div>
                ) : (
                  <div className="timeline-modal-placeholder-box">
                    <Clock size={16} className="modal-clock-glyph" aria-hidden="true" />
                    <p className="timeline-modal-placeholder-note">
                      {selectedStory.placeholderNote || selectedStory.quote}
                    </p>
                  </div>
                )}

                {/* Initiative Overview */}
                <div className="timeline-modal-narrative">
                  <h4 className="timeline-modal-section-title">Initiative Overview</h4>
                  <p className="timeline-modal-text">{selectedStory.fullStory}</p>
                </div>

                {/* Milestones / Focus Areas */}
                {selectedStory.milestones && selectedStory.milestones.length > 0 && (
                  <div className="timeline-modal-milestones">
                    <h4 className="timeline-modal-section-title">Key Initiative Focus Areas</h4>
                    <ul className="timeline-modal-milestone-list">
                      {selectedStory.milestones.map((m, i) => (
                        <li key={i} className="timeline-modal-milestone-item">
                          <CheckCircle2 size={14} className="milestone-icon" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action CTA */}
                <div className="timeline-modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseStory();
                      if (onExploreRoles) onExploreRoles();
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <span>Volunteer in Similar Initiatives</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS Styles for Vertical Alternating Timeline */}
      <style>{`
        .timeline-section {
          background-color: #FFFDF8;
          padding: 5rem 0 5.5rem 0;
          position: relative;
          border-bottom: 1px solid #E8E1D5;
          overflow: hidden;
        }

        .timeline-header {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 3.5rem auto;
        }

        .timeline-badge {
          background: #FFF7ED;
          color: #B45309;
          border: 1px solid rgba(245, 158, 11, 0.35);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 1rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.85rem;
        }

        .badge-sparkle {
          color: #D97706;
        }

        .timeline-title {
          font-size: clamp(2.35rem, 5vw, 3rem);
          font-weight: 800;
          color: #171717;
          letter-spacing: -0.025em;
          margin-bottom: 0.85rem;
          line-height: 1.18;
        }

        .timeline-subtitle {
          font-size: 1.15rem;
          color: #475569;
          line-height: 1.65;
          margin: 0 auto;
        }

        /* ------------------------------------------------------------------
           Timeline Spine Architecture
           ------------------------------------------------------------------ */
        .timeline-wrapper {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
        }

        .timeline-spine-track {
          position: absolute;
          top: 40px;
          bottom: 160px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          pointer-events: none;
          z-index: 1;
        }

        .timeline-spine-base {
          position: absolute;
          inset: 0;
          background: #E8E1D5;
          width: 2px;
        }

        .timeline-spine-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          margin-left: -0.5px;
          background: linear-gradient(180deg, #F59E0B 0%, #D97706 100%);
          border-radius: 9999px;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
          transition: height 0.15s ease-out;
        }

        /* ------------------------------------------------------------------
           Alternating Timeline Rows
           ------------------------------------------------------------------ */
        .timeline-rows-list {
          display: flex;
          flex-direction: column;
          gap: 4.5rem;
          position: relative;
          z-index: 2;
        }

        .timeline-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          width: 100%;
        }

        .timeline-col {
          width: calc(50% - 48px);
          box-sizing: border-box;
        }

        /* Desktop Column Ordering */
        /* Row Even (Story 1, 3, 5, 7): Image Left, Text Right */
        .row-even .timeline-col-media {
          order: 1;
        }
        .row-even .timeline-col-content {
          order: 3;
        }

        /* Row Odd (Story 2, 4, 6): Text Left, Image Right */
        .row-odd .timeline-col-content {
          order: 1;
        }
        .row-odd .timeline-col-media {
          order: 3;
        }

        /* Center Node Marker */
        .timeline-node {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #FFFDF8;
          border: 2px solid #E8E1D5;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(23, 23, 23, 0.06);
        }

        .timeline-node-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #CBD5E1;
          transition: all 0.3s ease;
        }

        .timeline-node.node-active {
          border-color: #D97706;
          box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.22);
          transform: translate(-50%, -50%) scale(1.1);
        }

        .timeline-node.node-active .timeline-node-dot {
          background: #D97706;
          box-shadow: 0 0 8px #F59E0B;
        }

        /* ------------------------------------------------------------------
           Media Card (Photograph)
           ------------------------------------------------------------------ */
        .timeline-media-card {
          position: relative;
          width: 100%;
          height: 380px;
          border-radius: 18px;
          overflow: hidden;
          background: #0F172A;
          border: 1px solid #E8E1D5;
          box-shadow: 0 6px 24px rgba(23, 23, 23, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .timeline-media-card:hover {
          transform: translateY(-4px);
          border-color: #F59E0B;
          box-shadow: 0 16px 36px -10px rgba(217, 119, 6, 0.16);
        }

        .timeline-media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .timeline-media-card:hover .timeline-media-img {
          transform: scale(1.04);
        }

        .timeline-media-overlay {
          position: absolute;
          top: 1.25rem;
          left: 1.25rem;
          z-index: 2;
        }

        .timeline-focus-pill {
          display: inline-block;
          background: rgba(23, 23, 23, 0.78);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          color: #FFFDF8;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          letter-spacing: 0.03em;
          border-left: 3px solid var(--focus-accent, #F59E0B);
        }

        /* ------------------------------------------------------------------
           Content Card (Narrative & Testimonial)
           ------------------------------------------------------------------ */
        .timeline-content-card {
          background: #FFFFFF;
          border: 1px solid #E8E1D5;
          border-radius: 18px;
          padding: 2.25rem 2.5rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(23, 23, 23, 0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .timeline-content-card:hover {
          transform: translateY(-3px);
          border-color: #F59E0B;
          box-shadow: 0 14px 34px -8px rgba(217, 119, 6, 0.12);
        }

        .timeline-meta-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 1.15rem;
        }

        .timeline-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.02em;
        }

        .timeline-status-pill.verified {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }

        .timeline-status-pill.upcoming {
          background: #FFFBEB;
          color: #92400E;
          border: 1px solid #FDE68A;
        }

        .timeline-location-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #64748B;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .timeline-location-pill svg {
          color: #D97706;
        }

        .timeline-author-name {
          font-size: 1.65rem;
          font-weight: 800;
          color: #171717;
          margin: 0 0 0.25rem 0;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        .timeline-author-role {
          font-size: 0.95rem;
          color: #D97706;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
        }

        .timeline-body-content {
          margin-bottom: 1.75rem;
        }

        .timeline-quote-wrap {
          position: relative;
          padding-left: 0.5rem;
        }

        .timeline-quote-icon {
          color: #F59E0B;
          opacity: 0.55;
          margin-bottom: 0.5rem;
        }

        .timeline-quote-text {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #1F2937;
          font-style: italic;
          margin: 0;
        }

        .timeline-placeholder-box {
          background: #FAF7F0;
          border-left: 3.5px solid #D97706;
          padding: 1.15rem 1.35rem;
          border-radius: 10px;
        }

        .timeline-placeholder-text {
          font-size: 0.925rem;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .timeline-card-footer {
          padding-top: 1.15rem;
          border-top: 1px solid #F1ECE1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .timeline-detail-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: transparent;
          border: none;
          color: #D97706;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0.45rem 0.75rem;
          border-radius: 8px;
          transition: background 0.15s ease, transform 0.15s ease, color 0.15s ease;
        }

        .timeline-detail-btn:hover {
          background: #FFF7ED;
          color: #B45309;
          transform: translateX(3px);
        }

        /* ------------------------------------------------------------------
           Entrance Animations
           ------------------------------------------------------------------ */
        @media (min-width: 900px) {
          /* Even row: Media enters from left, Content from right */
          .row-even .timeline-col-media {
            opacity: 0;
            transform: translate3d(-32px, 0, 0);
            transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .row-even .timeline-col-content {
            opacity: 0;
            transform: translate3d(32px, 0, 0);
            transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.12s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.12s;
          }

          /* Odd row: Content enters from left, Media from right */
          .row-odd .timeline-col-content {
            opacity: 0;
            transform: translate3d(-32px, 0, 0);
            transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.12s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.12s;
          }
          .row-odd .timeline-col-media {
            opacity: 0;
            transform: translate3d(32px, 0, 0);
            transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          }

          /* Active reveal state */
          .timeline-row.is-revealed .timeline-col-media,
          .timeline-row.is-revealed .timeline-col-content {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        /* ------------------------------------------------------------------
           Timeline Bottom Community Invite Card
           ------------------------------------------------------------------ */
        .timeline-footer-card {
          margin-top: 5rem;
          background: #FFFFFF;
          border: 1px dashed #D97706;
          border-radius: 18px;
          padding: 1.75rem 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: flex-start;
          justify-content: space-between;
          box-shadow: 0 4px 16px rgba(23, 23, 23, 0.03);
        }

        @media (min-width: 768px) {
          .timeline-footer-card {
            flex-direction: row;
            align-items: center;
          }
        }

        .timeline-footer-content {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .timeline-footer-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #FFF7ED;
          color: #D97706;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .timeline-footer-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #171717;
          margin-bottom: 0.35rem;
        }

        .timeline-footer-desc {
          font-size: 0.9rem;
          color: #475569;
          margin: 0;
          line-height: 1.55;
          max-width: 680px;
        }

        .timeline-footer-cta {
          white-space: nowrap;
          font-weight: 700;
        }

        /* ------------------------------------------------------------------
           Mobile & Tablet Layout (< 900px)
           ------------------------------------------------------------------ */
        @media (max-width: 899px) {
          .timeline-spine-track {
            left: 20px;
            transform: none;
            top: 20px;
            bottom: 120px;
          }

          .timeline-rows-list {
            gap: 3.5rem;
          }

          .timeline-row {
            flex-direction: column;
            padding-left: 54px;
            box-sizing: border-box;
          }

          .timeline-col {
            width: 100%;
          }

          .timeline-col-media {
            order: 1 !important;
            margin-bottom: 1.25rem;
          }

          .timeline-col-content {
            order: 2 !important;
          }

          .timeline-node {
            left: 20px;
            top: 24px;
            transform: translate(-50%, 0);
          }

          .timeline-node.node-active {
            transform: translate(-50%, 0) scale(1.1);
          }

          .timeline-media-card {
            height: 270px;
          }

          .timeline-content-card {
            padding: 1.65rem 1.75rem;
          }

          .timeline-author-name {
            font-size: 1.45rem;
          }

          .timeline-quote-text {
            font-size: 1.025rem;
          }

          /* Mobile Entrance Animation */
          .timeline-col-media,
          .timeline-col-content {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .timeline-row.is-revealed .timeline-col-media,
          .timeline-row.is-revealed .timeline-col-content {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        /* ------------------------------------------------------------------
           Light-Dismiss Details Modal
           ------------------------------------------------------------------ */
        .timeline-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(23, 23, 23, 0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .timeline-modal-card {
          background: #FFFFFF;
          border-radius: 20px;
          max-width: 840px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid #E8E1D5;
          animation: timelineModalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes timelineModalPop {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .timeline-modal-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #F1F5F9;
          border: none;
          color: #171717;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background 0.15s ease;
        }

        .timeline-modal-close:hover {
          background: #E2E8F0;
        }

        .timeline-modal-layout {
          display: grid;
          grid-template-columns: 1fr;
        }

        @media (min-width: 768px) {
          .timeline-modal-layout {
            grid-template-columns: 320px 1fr;
          }
        }

        .timeline-modal-media {
          background: #0F172A;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .timeline-modal-img {
          width: 100%;
          height: 100%;
          min-height: 280px;
          object-fit: cover;
          display: block;
        }

        .timeline-modal-media-tags {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .timeline-modal-tag {
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
        }

        .timeline-modal-tag.saffron {
          background: #F59E0B;
          color: #FFFFFF;
        }

        .timeline-modal-tag.slate {
          background: rgba(15, 23, 42, 0.85);
          color: #F8FAFC;
        }

        .timeline-modal-body {
          padding: 2.25rem 2rem;
          display: flex;
          flex-direction: column;
        }

        .timeline-modal-header {
          margin-bottom: 1.25rem;
        }

        .timeline-modal-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #171717;
          margin: 0.5rem 0 0.2rem 0;
          line-height: 1.2;
        }

        .timeline-modal-role {
          font-size: 0.95rem;
          color: #D97706;
          font-weight: 600;
          margin: 0;
        }

        .timeline-modal-quote-box {
          background: #FFFDF8;
          border-left: 3.5px solid #D97706;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .modal-quote-glyph {
          color: #D97706;
          margin-bottom: 0.35rem;
        }

        .timeline-modal-quote {
          font-size: 1.05rem;
          line-height: 1.65;
          color: #171717;
          font-style: italic;
          margin: 0;
        }

        .timeline-modal-placeholder-box {
          background: #FAF7F0;
          border-left: 3.5px solid #D97706;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .modal-clock-glyph {
          color: #D97706;
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .timeline-modal-placeholder-note {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #475569;
          margin: 0;
        }

        .timeline-modal-section-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748B;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .timeline-modal-text {
          font-size: 0.925rem;
          line-height: 1.65;
          color: #334155;
          margin-bottom: 1.5rem;
        }

        .timeline-modal-milestones {
          margin-bottom: 1.75rem;
        }

        .timeline-modal-milestone-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .timeline-modal-milestone-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #334155;
        }

        .milestone-icon {
          color: #059669;
          flex-shrink: 0;
        }

        .timeline-modal-actions {
          margin-top: auto;
          padding-top: 1rem;
        }

        /* ------------------------------------------------------------------
           Reduced Motion Support
           ------------------------------------------------------------------ */
        @media (prefers-reduced-motion: reduce) {
          .timeline-col-media,
          .timeline-col-content,
          .timeline-spine-fill,
          .timeline-media-img,
          .timeline-node,
          .timeline-modal-card {
            transition: none !important;
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
