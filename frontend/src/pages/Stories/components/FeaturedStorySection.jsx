import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, MapPin, Clock, Droplets, Sparkles } from 'lucide-react';
import StoriesMagneticButton from './StoriesMagneticButton';

export default function FeaturedStorySection({ story }) {
  if (!story) return null;

  const {
    slug,
    category,
    categoryColor,
    title,
    description,
    coverImage,
    location,
    readTime,
    quote
  } = story;

  // Staggered variants for content elements
  const containerVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="featured-story-section" aria-label="Featured Story">
      <div className="container">
        <motion.div
          className="featured-story-card stories-animated-featured-card"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Image Column */}
          <div className="featured-image-box">
            <motion.img 
              src={coverImage} 
              alt={title}
              className="featured-image"
              loading="eager"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            {/* Subtle Gradient Veil */}
            <div className="featured-img-overlay-veil" aria-hidden="true" />

            <div className="featured-badge-float">
              <motion.span 
                className="story-category-pill stories-pill-glass"
                style={{ 
                  backgroundColor: categoryColor || '#0D9488',
                  color: '#FFFFFF'
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Droplets size={12} />
                <span>{category}</span>
              </motion.span>
            </div>
          </div>

          {/* Content Column */}
          <div className="featured-content-box">
            <motion.div className="featured-eyebrow-row" variants={itemVariants}>
              <div className="story-meta-row">
                <span className="story-meta-item">
                  <MapPin size={13} color="#10B981" />
                  <span>{location}</span>
                </span>
                <span>•</span>
                <span className="story-meta-item">
                  <Clock size={13} />
                  <span>{readTime}</span>
                </span>
              </div>
              <span className="demo-tag">
                <Sparkles size={11} />
                <span>Featured Narrative</span>
              </span>
            </motion.div>

            <motion.h2 className="featured-title" variants={itemVariants}>
              <Link to={`/stories/${slug}`} className="stories-interactive-link">
                {title}
              </Link>
            </motion.h2>

            <motion.p className="featured-desc" variants={itemVariants}>
              {description}
            </motion.p>

            {quote && (
              <motion.div className="featured-quote-callout" variants={itemVariants}>
                "{quote}"
              </motion.div>
            )}

            <motion.div className="featured-actions" variants={itemVariants}>
              <StoriesMagneticButton strength={0.3}>
                <Link to={`/stories/${slug}`} className="featured-cta-link stories-cta-hover-effect">
                  <span>Read the Story</span>
                  <motion.span
                    className="cta-arrow-icon"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <ArrowRight size={16} />
                  </motion.span>
                </Link>
              </StoriesMagneticButton>
              <span className="story-meta-item" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Field Initiative
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
