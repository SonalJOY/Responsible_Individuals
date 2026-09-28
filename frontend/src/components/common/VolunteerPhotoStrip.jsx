import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Quote, X, MapPin, Award, CheckCircle2, Clock, 
  Sparkles, ArrowRight, HeartHandshake, UserCheck 
} from 'lucide-react';
import { volunteerStories } from '../../data/volunteerStoriesData';

/**
 * VolunteerPhotoStrip Component (Phase 3B-UI)
 * Continuous animated horizontal photo strip of volunteer stories with interactive modal lightbox.
 * Features:
 * - GPU-accelerated infinite seamless marquee (Right -> Left)
 * - Visual variation: unique card widths, rotations, and vertical offsets
 * - Mouse hover elevations and keyboard accessible focus states
 * - Lightbox modal with rich personal journeys and impact milestones
 * - Background photo strip continues moving while the modal is open
 * - Full support for prefers-reduced-motion, ESC key, and body scroll lock
 */
export default function VolunteerPhotoStrip({ onExploreRoles }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const modalContentRef = useRef(null);

  // Open Story Modal Lightbox
  const handleOpenStory = (story) => {
    setSelectedStory(story);
  };

  // Close Story Modal Lightbox
  const handleCloseStory = useCallback(() => {
    setSelectedStory(null);
  }, []);

  // Keyboard accessibility: Close modal on Escape key & trap ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedStory) {
        handleCloseStory();
      }
    };

    if (selectedStory) {
      window.addEventListener('keydown', handleKeyDown);
      // Lock background body scroll while modal is active
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedStory, handleCloseStory]);

  // Double the stories dataset for a seamless, continuous infinite loop (SET A -> SET B)
  const duplicatedStories = [...volunteerStories, ...volunteerStories];

  return (
    <section className="volunteer-stories-section" aria-label="Volunteer Stories">
      {/* Section Header */}
      <div className="container">
        <div className="stories-section-header">
          <div className="section-badge stories-badge">
            <Sparkles size={14} className="badge-sparkle" />
            <span>Community Stories</span>
          </div>
          <h2 className="stories-section-title">People Who Choose to Make a Difference</h2>
          <p className="stories-section-subtitle">
            Meet the students, engineers, educators, and community stewards dedicating their time, skills, 
            and energy to driving tangible ground-level impact across our grassroots initiatives.
          </p>
        </div>
      </div>

      {/* Infinite Horizontal Photo Strip Container */}
      <div className="photo-strip-viewport" role="region" aria-label="Volunteer Photographs Stream">
        {/* Left and Right Edge Vignette Gradients for Cinematic Blend */}
        <div className="vignette-edge vignette-left" aria-hidden="true" />
        <div className="vignette-edge vignette-right" aria-hidden="true" />

        {/* Animated Marquee Track */}
        <div className="photo-strip-track">
          {duplicatedStories.map((story, index) => {
            const isSetB = index >= volunteerStories.length;
            const uniqueKey = `${story.id}-${isSetB ? 'b' : 'a'}-${index}`;

            return (
              <div
                key={uniqueKey}
                className="photo-card-wrapper"
                style={{
                  '--card-w': `${story.cardWidth || 290}px`,
                  '--rot': `${story.rotation || 0}deg`,
                  '--v-offset': `${story.verticalOffset || 0}px`,
                  '--accent-color': story.focusColor || '#10B981',
                }}
              >
                <button
                  type="button"
                  className="photo-card-btn"
                  onClick={() => handleOpenStory(story)}
                  aria-label={`View story of ${story.name}, ${story.role} in ${story.location}`}
                >
                  <div className="photo-card-inner">
                    {/* Volunteer Photograph */}
                    <img
                      src={story.image}
                      alt={`${story.name} - ${story.role}`}
                      className="photo-card-img"
                      loading={index < 4 ? 'eager' : 'lazy'}
                    />

                    {/* Dark Gradient Overlay with Info */}
                    <div className="photo-card-overlay">
                      <div className="overlay-top">
                        <span 
                          className="focus-pill"
                          style={{ backgroundColor: story.focusColor || '#10B981' }}
                        >
                          {story.focusArea}
                        </span>
                      </div>

                      <div className="overlay-bottom">
                        <h3 className="card-volunteer-name">{story.name}</h3>
                        <p className="card-volunteer-role">{story.role}</p>

                        <div className="card-quote-preview">
                          <Quote size={13} className="quote-preview-icon" />
                          <span>"{story.quote.length > 70 ? `${story.quote.slice(0, 68)}...` : story.quote}"</span>
                        </div>

                        <div className="card-meta-row">
                          <span className="card-location">
                            <MapPin size={11} />
                            <span>{story.location.split(',')[0]}</span>
                          </span>
                          <span className="card-read-hint">
                            <span>Read Story</span>
                            <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Story Lightbox Modal */}
      {selectedStory && (
        <div 
          className="story-modal-backdrop" 
          onClick={handleCloseStory}
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-modal-title"
          aria-describedby="story-modal-desc"
        >
          <div 
            className="story-modal-card" 
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button 
              className="story-modal-close" 
              onClick={handleCloseStory}
              aria-label="Close volunteer story"
            >
              <X size={20} />
            </button>

            {/* Modal Two-Column Content Grid */}
            <div className="story-modal-grid">
              {/* Left Column: Large Portrait & Visual Badges */}
              <div className="story-modal-media-col">
                <img 
                  src={selectedStory.image} 
                  alt={`${selectedStory.name} - ${selectedStory.role}`} 
                  className="story-modal-img"
                />
                <div className="media-overlay-gradient" />
                
                {/* Floating Media Badges */}
                <div className="story-media-badges">
                  <span className="media-badge verified">
                    <UserCheck size={13} />
                    <span>{selectedStory.badge || 'Verified Volunteer'}</span>
                  </span>
                  <span className="media-badge hours">
                    <Clock size={13} />
                    <span>{selectedStory.hoursContributed}</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Detailed Journey & Testimonial */}
              <div className="story-modal-body-col">
                {/* Top Meta Bar */}
                <div className="story-modal-meta-top">
                  <span 
                    className="story-modal-focus-pill"
                    style={{ backgroundColor: selectedStory.focusColor || '#10B981' }}
                  >
                    {selectedStory.focusArea}
                  </span>
                  <span className="story-modal-location">
                    <MapPin size={13} color="#10B981" />
                    <span>{selectedStory.location}</span>
                  </span>
                </div>

                {/* Name & Title */}
                <h3 id="story-modal-title" className="story-modal-name">
                  {selectedStory.name}
                </h3>
                <p className="story-modal-role">{selectedStory.role}</p>

                {/* Pull-Quote Callout */}
                <div className="story-modal-quote-box">
                  <Quote size={24} className="modal-quote-icon" />
                  <blockquote className="modal-quote-text">
                    "{selectedStory.quote}"
                  </blockquote>
                </div>

                {/* Full Personal Story */}
                <div className="story-modal-narrative" id="story-modal-desc">
                  <h4 className="narrative-heading">Their Ground-Level Journey</h4>
                  <p className="narrative-text">{selectedStory.fullStory}</p>
                </div>

                {/* Impact Milestones */}
                {selectedStory.milestones && selectedStory.milestones.length > 0 && (
                  <div className="story-modal-milestones">
                    <h4 className="milestones-heading">
                      <Award size={15} color="#10B981" />
                      <span>Key Verified Milestones</span>
                    </h4>
                    <div className="milestones-list">
                      {selectedStory.milestones.map((m, i) => (
                        <div key={i} className="milestone-item">
                          <CheckCircle2 size={14} className="milestone-check" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="story-modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-primary story-action-btn"
                    onClick={() => {
                      handleCloseStory();
                      if (onExploreRoles) {
                        onExploreRoles();
                      } else {
                        const el = document.getElementById('opportunities');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <HeartHandshake size={16} />
                    <span>Join Initiatives Like This</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline story-dismiss-btn"
                    onClick={handleCloseStory}
                  >
                    Close Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Component Styles Scoped */}
      <style>{`
        /* Volunteer Stories Section Layout */
        .volunteer-stories-section {
          padding: 4.5rem 0 3.5rem 0;
          background: #0B1914;
          color: #FFFFFF;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid rgba(16, 185, 129, 0.15);
        }

        .stories-section-header {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 3rem auto;
          position: relative;
          z-index: 2;
        }

        .stories-badge {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #34D399 !important;
          border: 1px solid rgba(52, 211, 153, 0.3) !important;
          margin-bottom: 0.85rem;
        }

        .badge-sparkle {
          color: #34D399;
        }

        .stories-section-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 0.85rem;
          letter-spacing: -0.02em;
        }

        @media (min-width: 768px) {
          .stories-section-title {
            font-size: 2.75rem;
          }
        }

        .stories-section-subtitle {
          font-size: 1.05rem;
          color: #94A3B8;
          line-height: 1.65;
          margin: 0 auto;
        }

        /* Viewport & Vignette Blend */
        .photo-strip-viewport {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 1.5rem 0 2rem 0;
          /* GPU containment */
          contain: layout paint;
        }

        .vignette-edge {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 90px;
          z-index: 10;
          pointer-events: none;
        }

        @media (min-width: 768px) {
          .vignette-edge {
            width: 140px;
          }
        }

        .vignette-left {
          left: 0;
          background: linear-gradient(to right, #0B1914 0%, rgba(11, 25, 20, 0) 100%);
        }

        .vignette-right {
          right: 0;
          background: linear-gradient(to left, #0B1914 0%, rgba(11, 25, 20, 0) 100%);
        }

        /* Infinite Seamless Track */
        .photo-strip-track {
          display: flex;
          align-items: center;
          width: max-content;
          gap: 1.5rem;
          animation: infinitePhotoScroll 42s linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }

        @media (min-width: 1024px) {
          .photo-strip-track {
            gap: 1.85rem;
            animation-duration: 46s;
          }
        }

        @keyframes infinitePhotoScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        /* Card Container & Offset Variations */
        .photo-card-wrapper {
          flex-shrink: 0;
          width: var(--card-w, 290px);
          transform: translateY(var(--v-offset, 0px)) rotate(var(--rot, 0deg)) translate3d(0, 0, 0);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), z-index 0.35s ease;
          position: relative;
          z-index: 1;
        }

        .photo-card-wrapper:hover {
          transform: translateY(calc(var(--v-offset, 0px) - 10px)) rotate(0deg) scale(1.04) translate3d(0, 0, 0);
          z-index: 8;
        }

        /* Card Button Wrapper */
        .photo-card-btn {
          width: 100%;
          display: block;
          padding: 0;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          border-radius: 20px;
          outline: none;
        }

        .photo-card-btn:focus-visible {
          box-shadow: 0 0 0 3px #10B981, 0 0 0 6px rgba(16, 185, 129, 0.4);
        }

        /* Card Inner Box */
        .photo-card-inner {
          position: relative;
          width: 100%;
          height: 380px;
          border-radius: 20px;
          overflow: hidden;
          background: #162620;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        @media (max-width: 640px) {
          .photo-card-inner {
            height: 340px;
          }
        }

        .photo-card-wrapper:hover .photo-card-inner {
          border-color: rgba(52, 211, 153, 0.5);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.55), 0 0 25px rgba(16, 185, 129, 0.2);
        }

        /* Card Image */
        .photo-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
          filter: brightness(0.92) contrast(1.04);
        }

        .photo-card-wrapper:hover .photo-card-img {
          transform: scale(1.08);
          filter: brightness(1) contrast(1.06);
        }

        /* Card Overlay */
        .photo-card-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.25rem;
          background: linear-gradient(
            180deg, 
            rgba(9, 23, 18, 0.25) 0%, 
            rgba(9, 23, 18, 0.1) 40%, 
            rgba(9, 23, 18, 0.75) 75%, 
            rgba(9, 23, 18, 0.96) 100%
          );
          transition: background 0.3s ease;
        }

        .overlay-top {
          display: flex;
          justify-content: flex-start;
        }

        .focus-pill {
          color: #FFFFFF;
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
          letter-spacing: 0.03em;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }

        .overlay-bottom {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .card-volunteer-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          line-height: 1.25;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
        }

        .card-volunteer-role {
          font-size: 0.8rem;
          font-weight: 600;
          color: #34D399;
          margin: 0 0 0.25rem 0;
        }

        .card-quote-preview {
          display: flex;
          align-items: flex-start;
          gap: 0.35rem;
          font-size: 0.775rem;
          color: #CBD5E1;
          font-style: italic;
          line-height: 1.35;
          margin-bottom: 0.4rem;
        }

        .quote-preview-icon {
          color: #10B981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .card-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.75rem;
        }

        .card-location {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #94A3B8;
        }

        .card-read-hint {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #34D399;
          font-weight: 600;
        }

        /* ----------------------------------------------------
           Story Lightbox Modal (Appears ABOVE moving strip)
           Background photo strip CONTINUES MOVING behind it
        ----------------------------------------------------- */
        .story-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(6, 17, 13, 0.78);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          animation: storyBackdropFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes storyBackdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .story-modal-card {
          background: #FFFFFF;
          color: var(--slate-900);
          width: 100%;
          max-width: 860px;
          max-height: 90vh;
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.8);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: storyCardScaleIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes storyCardScaleIn {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(18px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .story-modal-close {
          position: absolute;
          top: 1.15rem;
          right: 1.15rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(15, 23, 42, 0.65);
          color: #FFFFFF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .story-modal-close:hover {
          background: #0F172A;
          transform: rotate(90deg);
        }

        .story-modal-grid {
          display: grid;
          grid-template-columns: 1fr;
          overflow-y: auto;
          max-height: 90vh;
        }

        @media (min-width: 768px) {
          .story-modal-grid {
            grid-template-columns: 340px 1fr;
          }
        }

        /* Media Column */
        .story-modal-media-col {
          position: relative;
          height: 280px;
          background: #0F172A;
        }

        @media (min-width: 768px) {
          .story-modal-media-col {
            height: auto;
            min-height: 100%;
          }
        }

        .story-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }

        .media-overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
        }

        .story-media-badges {
          position: absolute;
          bottom: 1.25rem;
          left: 1.25rem;
          right: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 2;
        }

        .media-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 700;
          width: max-content;
        }

        .media-badge.verified {
          background: rgba(16, 185, 129, 0.9);
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .media-badge.hours {
          background: rgba(15, 23, 42, 0.8);
          color: #F8FAFC;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Body Column */
        .story-modal-body-col {
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        @media (max-width: 640px) {
          .story-modal-body-col {
            padding: 1.5rem;
          }
        }

        .story-modal-meta-top {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .story-modal-focus-pill {
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-pill);
        }

        .story-modal-location {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: var(--slate-600);
          font-weight: 500;
        }

        .story-modal-name {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.2rem;
          letter-spacing: -0.01em;
        }

        .story-modal-role {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--primary-700);
          margin-bottom: 1.25rem;
        }

        .story-modal-quote-box {
          background: var(--primary-50);
          border-left: 4px solid var(--primary-600);
          padding: 1.15rem 1.25rem;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          margin-bottom: 1.5rem;
          display: flex;
          gap: 0.75rem;
        }

        .modal-quote-icon {
          color: var(--primary-600);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .modal-quote-text {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--primary-900);
          font-style: italic;
          line-height: 1.55;
          margin: 0;
        }

        .story-modal-narrative {
          margin-bottom: 1.5rem;
        }

        .narrative-heading {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--slate-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .narrative-text {
          font-size: 0.925rem;
          color: var(--slate-700);
          line-height: 1.65;
        }

        .story-modal-milestones {
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-lg);
          padding: 1rem 1.25rem;
          margin-bottom: 1.75rem;
        }

        .milestones-heading {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--slate-700);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.65rem;
        }

        .milestones-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .milestone-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--slate-800);
          font-weight: 500;
        }

        .milestone-check {
          color: #10B981;
          flex-shrink: 0;
        }

        .story-modal-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.85rem;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--slate-100);
        }

        .story-action-btn {
          flex: 1;
          min-width: 200px;
        }

        .story-dismiss-btn {
          padding: 0.75rem 1.25rem;
          color: var(--slate-600);
          border-color: var(--slate-300);
        }

        .story-dismiss-btn:hover {
          background: var(--slate-100);
          color: var(--slate-900);
        }

        /* ----------------------------------------------------
           Accessibility & Prefers Reduced Motion
        ----------------------------------------------------- */
        @media (prefers-reduced-motion: reduce) {
          .photo-strip-track {
            animation: none !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 1rem;
            width: 100%;
          }

          .photo-card-wrapper {
            scroll-snap-align: start;
            transform: none !important;
          }

          .photo-card-wrapper:hover {
            transform: none !important;
          }

          .story-modal-backdrop,
          .story-modal-card {
            animation: none !important;
          }

          .photo-card-img {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
