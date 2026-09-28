import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, MapPin, Clock, Droplets, Sparkles } from 'lucide-react';
import StoriesMagneticButton from './StoriesMagneticButton';

export default function FeaturedStorySection({ story }) {
  if (!story) return null;

  const featTitle = story.title || 'From Foul Silt to Blooming Wetland: How 300 Citizens Revived Varthur Inflow';
  const featSlug = story.slug || 'from-barren-silt-to-blooming-lake';
  const featCategory = story.category || story.focus_area_name || story.category_name || 'WATER & ENVIRONMENT';
  const featCategoryColor = story.categoryColor || story.focus_area_color || '#0D9488';
  const featDesc = story.description || story.excerpt || story.challenge || 'How 300 Bengaluru citizens united with hydrologists and municipal engineers to turn 4,200 tons of foul silt into a thriving bird haven.';
  const featCover = story.coverImage || story.cover_image || '/images/stories/varthur-blooming-wetland.jpg';
  const featLocation = story.location || 'Bengaluru East, Karnataka';
  const featReadTime = story.readTime || (story.read_time ? `${story.read_time} min read` : '5 min read');
  const featQuote = story.quote || "We proved that when individuals take ownership of their immediate environment with structured scientific backing, government authorities readily step up to partner.";

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
              src={featCover} 
              alt={featTitle}
              className="featured-image"
              loading="eager"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/stories/varthur-blooming-wetland.jpg';
              }}
            />
            {/* Subtle Gradient Veil */}
            <div className="featured-img-overlay-veil" aria-hidden="true" />

            <div className="featured-badge-float">
              <motion.span 
                className="story-category-pill stories-pill-glass"
                style={{ 
                  backgroundColor: featCategoryColor,
                  color: '#FFFFFF'
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Droplets size={12} />
                <span>{featCategory}</span>
              </motion.span>
            </div>
          </div>

          {/* Content Column */}
          <div className="featured-content-box">
            <motion.div className="featured-eyebrow-row" variants={itemVariants}>
              <div className="story-meta-row">
                <span className="story-meta-item">
                  <MapPin size={13} color="#10B981" />
                  <span>{featLocation}</span>
                </span>
                <span>•</span>
                <span className="story-meta-item">
                  <Clock size={13} />
                  <span>{featReadTime}</span>
                </span>
              </div>
              <span className="demo-tag">
                <Sparkles size={11} />
                <span>Featured Narrative</span>
              </span>
            </motion.div>

            <motion.h2 className="featured-title" variants={itemVariants}>
              <Link to={`/stories/${featSlug}`} className="stories-interactive-link">
                {featTitle}
              </Link>
            </motion.h2>

            <motion.p className="featured-desc" variants={itemVariants}>
              {featDesc}
            </motion.p>

            {featQuote && (
              <motion.div className="featured-quote-callout" variants={itemVariants}>
                "{featQuote}"
              </motion.div>
            )}

            <motion.div className="featured-actions" variants={itemVariants}>
              <StoriesMagneticButton strength={0.3}>
                <Link to={`/stories/${featSlug}`} className="featured-cta-link stories-cta-hover-effect">
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
