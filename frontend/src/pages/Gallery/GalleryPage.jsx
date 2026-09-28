import React, { useState, useEffect, useRef } from 'react';
import { galleryService } from '../../services/api';
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from './GalleryData';
import GalleryCard from './GalleryCard';
import GalleryLightbox from './GalleryLightbox';
import stockVideo from '../../assets/stock.mp4';
import { Camera, Leaf, Sparkles } from 'lucide-react';
import './GalleryPage.css';

export default function GalleryPage() {
  const [items, setItems] = useState(GALLERY_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleCardIds, setVisibleCardIds] = useState(() => {
    const initialMap = {};
    GALLERY_ITEMS.forEach((item) => {
      initialMap[item.id] = true;
    });
    return initialMap;
  });

  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const gridRef = useRef(null);

  // Parallax scroll listener for background
  useEffect(() => {
    function handleScroll() {
      setScrollOffsetY(window.scrollY);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadBackendItems() {
      try {
        const apiData = await galleryService.getItems();
        if (isMounted && apiData && Array.isArray(apiData) && apiData.length > 0) {
          const merged = GALLERY_ITEMS.map((item, idx) => {
            const match = apiData[idx];
            return match && match.title ? { ...item, ...match } : item;
          });
          setItems(merged);
        }
      } catch (err) {
        // Silently preserve GALLERY_ITEMS when API is offline / returns ECONNREFUSED
      }
    }
    loadBackendItems();
    return () => {
      isMounted = false;
    };
  }, []);

  // IntersectionObserver to reveal cards gracefully on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-card-id');
            if (id) {
              setVisibleCardIds((prev) => ({ ...prev, [id]: true }));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    const cards = document.querySelectorAll('.gallery-card');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [selectedCategory, items]);

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const getCategoryCount = (category) => {
    if (category === 'All') return items.length;
    return items.filter((item) => item.category === category).length;
  };

  const handleCardClick = (item) => {
    const indexInFiltered = filteredItems.findIndex((i) => i.id === item.id);
    setLightboxIndex(indexInFiltered >= 0 ? indexInFiltered : 0);
    setLightboxOpen(true);
  };

  const handlePrevLightbox = () => {
    setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNextLightbox = () => {
    setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  // Generate 8 floating organic nature particles
  const particles = [
    { id: 1, top: '12%', left: '7%', size: 14, duration: '14s', delay: '0s', color: '#10B981' },
    { id: 2, top: '28%', left: '89%', size: 20, duration: '18s', delay: '2s', color: '#0D9488' },
    { id: 3, top: '48%', left: '4%', size: 16, duration: '16s', delay: '1s', color: '#059669' },
    { id: 4, top: '68%', left: '94%', size: 15, duration: '12s', delay: '3s', color: '#34D399' },
    { id: 5, top: '82%', left: '10%', size: 18, duration: '15s', delay: '0.5s', color: '#0D9488' },
    { id: 6, top: '38%', left: '46%', size: 12, duration: '20s', delay: '4s', color: '#10B981' },
  ];

  return (
    <div className="gallery-page-root">
      {/* HERO SECTION */}
      <section className="gallery-hero-wrapper">
        <img
          src="https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1920&q=85"
          alt="Environmental Nature Background"
          className="gallery-hero-bg-img"
          onError={(e) => {
            e.target.src = '/images/gallery/lake_restoration.svg';
          }}
        />
        <div className="gallery-hero-overlay" />

        {/* Decorative organic leaf watermark */}
        <svg className="gallery-hero-leaf-watermark" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 5C25 5 5 25 5 50s20 45 45 45 45-20 45-45S75 5 50 5zm0 80C30 85 15 70 15 50S30 15 50 15s35 15 35 35-15 35-35 35z"/>
          <path d="M50 20c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/>
        </svg>

        <div className="gallery-hero-content">
          <span className="gallery-hero-badge">
            <Leaf size={14} /> Visual Documentation
          </span>
          <h1 className="gallery-hero-title">On the Ground: Action in Photos</h1>
          <p className="gallery-hero-subtitle">
            Moments of citizen ownership, youth discovery, and environmental rejuvenation across our field locations.
          </p>
        </div>

        {/* Organic Bottom Curve Wave Divider */}
        <div className="gallery-hero-curve">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none">
            <path 
              fill="#F8FAFC" 
              d="M0,20 C240,36 480,40 720,20 C960,0 1200,8 1440,20 L1440,40 L0,40 Z"
            />
          </svg>
        </div>
      </section>

      {/* IMMERSIVE GALLERY SECTION */}
      <section className="gallery-section">
        {/* CINEMATIC BACKGROUND VIDEO */}
        <div className="gallery-bg-video-wrapper">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="gallery-bg-video"
            poster="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=85"
            style={{ transform: `scale(1.05) translateY(${scrollOffsetY * 0.04}px)` }}
          >
            <source src={stockVideo} type="video/mp4" />
          </video>
        </div>

        {/* SOFT TRANSLUCENT OVERLAY */}
        <div className="gallery-bg-overlay" />

        {/* SOFT LIGHT SPOTS */}
        <div className="gallery-glow-mint" />
        <div className="gallery-glow-sunlight" />

        {/* LIVING NATURE FLOATING PARTICLES */}
        <div className="gallery-particles-layer">
          {particles.map((p) => (
            <div
              key={p.id}
              className="gallery-particle"
              style={{
                top: p.top,
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: p.duration,
                animationDelay: p.delay,
              }}
            >
              <svg viewBox="0 0 24 24" fill={p.color}>
                <path d="M17,8C8,10 5,16 3,21C8,20 15,18 19,13C20,11.5 20,9 17,8Z" />
              </svg>
            </div>
          ))}
        </div>

        {/* COMPACT GLASS FILTER BAR */}
        <div className="gallery-filter-wrapper">
          <div className="gallery-filter-container" role="tablist" aria-label="Gallery categories">
            {GALLERY_CATEGORIES.map((cat) => {
              const count = getCategoryCount(cat);
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  className={`gallery-filter-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="gallery-filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* EDITORIAL SECTION HEADING */}
        <div className="gallery-section-header">
          <div className="gallery-header-badge-row">
            <span className="gallery-moment-count-pill">
              <Sparkles size={12} /> {filteredItems.length} {filteredItems.length === 1 ? 'MOMENT' : 'STORIES'}
            </span>
          </div>
          <h2 className="gallery-section-title">Stories From the Field</h2>
          <p className="gallery-section-subtitle">
            Real moments of people, place and positive change.
          </p>
        </div>

        {/* GALLERY GRID */}
        <div className="gallery-grid-container">
          {filteredItems.length > 0 ? (
            <div className="gallery-grid" ref={gridRef}>
              {filteredItems.map((item, idx) => (
                <div key={item.id} data-card-id={item.id}>
                  <GalleryCard
                    item={item}
                    index={idx}
                    onClick={handleCardClick}
                    isVisible={visibleCardIds[item.id] !== false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty-state">
              <Camera className="gallery-empty-icon" />
              <h3>No items found</h3>
              <p>There are currently no photos in the selected category.</p>
            </div>
          )}
        </div>

        {/* SECTION FOOTER DIVIDER */}
        <div className="gallery-section-footer-divider">
          <div className="gallery-footer-leaf-icon">
            <Leaf size={20} />
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      <GalleryLightbox
        isOpen={lightboxOpen}
        items={filteredItems}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrevLightbox}
        onNext={handleNextLightbox}
      />
    </div>
  );
}
