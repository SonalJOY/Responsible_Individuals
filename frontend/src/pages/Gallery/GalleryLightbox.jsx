import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Sparkles } from 'lucide-react';

export default function GalleryLightbox({ isOpen, items, currentIndex, onClose, onPrev, onNext }) {
  const currentItem = items && items.length > 0 ? (items[currentIndex] || items[0]) : null;
  const [imgSrc, setImgSrc] = useState(currentItem?.image);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (currentItem) {
      setImgSrc(currentItem.image);
      setFallbackAttempted(false);
      setImgFailed(false);
    }
  }, [currentIndex, currentItem]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !currentItem) return null;

  const handleImgError = () => {
    if (!fallbackAttempted && currentItem.localFallback) {
      setFallbackAttempted(true);
      setImgSrc(currentItem.localFallback);
    } else {
      setImgFailed(true);
    }
  };

  return (
    <div 
      className="gallery-lightbox-backdrop" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.title}
    >
      <div 
        className="gallery-lightbox-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="gallery-lightbox-close-btn" 
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X size={20} />
        </button>

        <div className="gallery-lightbox-img-area">
          {!imgFailed ? (
            <img 
              src={imgSrc} 
              alt={currentItem.title} 
              className="gallery-lightbox-img"
              onError={handleImgError}
            />
          ) : (
            <div 
              style={{ 
                width: '100%', 
                height: '100%', 
                background: currentItem.fallbackGradient || 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '2rem',
                color: '#FFFFFF',
                textAlign: 'center'
              }}
            >
              <Sparkles size={48} style={{ opacity: 0.7, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{currentItem.title}</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{currentItem.location}</p>
            </div>
          )}

          {items.length > 1 && (
            <>
              <button 
                className="gallery-lightbox-nav-btn prev" 
                onClick={onPrev}
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                className="gallery-lightbox-nav-btn next" 
                onClick={onNext}
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        <div className="gallery-lightbox-info-area">
          <div className="gallery-lightbox-header">
            <span 
              className="gallery-lightbox-tag"
              style={{ backgroundColor: currentItem.themeColor || '#0D9488' }}
            >
              {currentItem.category}
            </span>
            <span className="gallery-lightbox-counter">
              {currentIndex + 1} of {items.length}
            </span>
          </div>

          <h2 className="gallery-lightbox-title">{currentItem.title}</h2>

          <div className="gallery-lightbox-meta-strip">
            <div className="gallery-lightbox-meta-item">
              <MapPin size={15} style={{ color: currentItem.themeColor }} />
              <span>{currentItem.location}</span>
            </div>
            {currentItem.date && (
              <div className="gallery-lightbox-meta-item">
                <Calendar size={15} />
                <span>{currentItem.date}</span>
              </div>
            )}
          </div>

          {currentItem.impact && (
            <div className="gallery-lightbox-impact-pill">
              <Sparkles size={16} />
              <span>{currentItem.impact}</span>
            </div>
          )}

          <p className="gallery-lightbox-desc">
            {currentItem.description}
          </p>

          <div className="gallery-lightbox-footer">
            <div className="gallery-lightbox-keyboard-hint">
              <span>Use</span>
              <kbd>←</kbd>
              <kbd>→</kbd>
              <span>to navigate,</span>
              <kbd>ESC</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
