import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useSpring } from 'motion/react';
import { ArrowRight, MapPin, Clock } from 'lucide-react';

export default function StoryEditorialCard({ story, index = 0 }) {
  if (!story) return null;

  const cardTitle = story.title || 'Community Impact Narrative';
  const cardSlug = story.slug || '';
  const cardCategory = story.category || story.focus_area_name || story.category_name || 'Water & Environment';
  const cardCategoryColor = story.categoryColor || story.focus_area_color || '#10B981';
  const cardDesc = story.description || story.excerpt || story.challenge || 'Transforming local challenges into sustainable community solutions.';
  const cardCover = story.coverImage || story.cover_image || '/images/stories/varthur-blooming-wetland.jpg';
  const cardLocation = story.location || 'Bengaluru, Karnataka';
  const cardReadTime = story.readTime || (story.read_time ? `${story.read_time} min read` : '4 min read');

  const cardRef = useRef(null);
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setCanTilt(mediaQuery.matches && !motionQuery.matches);
  }, []);

  // Subtle 3D tilt springs (max 1.5 - 2 degrees)
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    if (!canTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Subtle tilt: max 2 degrees
    const rX = -(y / (rect.height / 2)) * 1.5;
    const rY = (x / (rect.width / 2)) * 1.5;

    rotateX.set(rX);
    rotateY.set(rY);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      ref={cardRef}
      className="story-editorial-card stories-interactive-card"
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.65,
        delay: Math.min((index % 6) * 0.08, 0.4),
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ y: -7 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000
      }}
    >
      {/* Image Thumbnail with Overlay */}
      <div className="story-card-img-box">
        <motion.img 
          src={cardCover} 
          alt={cardTitle} 
          className="story-card-img"
          loading="lazy"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/stories/varthur-blooming-wetland.jpg';
          }}
        />
        {/* Subtle Shimmer Gradient Veil */}
        <div className="story-card-img-veil" aria-hidden="true" />

        <div className="story-card-category-overlay">
          <motion.span 
            className="story-category-pill stories-pill-glass"
            style={{ 
              backgroundColor: cardCategoryColor,
              color: '#FFFFFF'
            }}
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 350 }}
          >
            {cardCategory}
          </motion.span>
        </div>
      </div>

      <div className="story-card-body">
        <div className="story-card-meta">
          <div className="story-meta-row">
            {cardLocation && (
              <span className="story-meta-item">
                <MapPin size={12} color="#10B981" />
                <span>{cardLocation}</span>
              </span>
            )}
            {cardLocation && cardReadTime && <span>•</span>}
            {cardReadTime && (
              <span className="story-meta-item">
                <Clock size={12} />
                <span>{cardReadTime}</span>
              </span>
            )}
          </div>
        </div>

        <h3 className="story-card-title">
          <Link to={`/stories/${cardSlug}`} className="stories-interactive-link">
            {cardTitle}
          </Link>
        </h3>

        <p className="story-card-desc">
          {cardDesc}
        </p>
      </div>

      <div className="story-card-footer">
        <span className="demo-tag">Impact Narrative</span>
        <Link 
          to={`/stories/${cardSlug}`} 
          className="story-card-read-link stories-read-btn-effect" 
          aria-label={`Read story: ${cardTitle}`}
        >
          <span>Read Story</span>
          <motion.span
            className="read-link-arrow"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <ArrowRight size={14} />
          </motion.span>
        </Link>
      </div>
    </motion.article>
  );
}
