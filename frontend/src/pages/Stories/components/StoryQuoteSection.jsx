import React from 'react';
import { motion } from 'motion/react';
import { Quote, Sparkles } from 'lucide-react';
import { humanVoiceData } from '../../../data/storiesData';

export default function StoryQuoteSection({ data = humanVoiceData }) {
  const { quote, attribution, context, image, alt } = data;

  const quoteContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="story-quote-section stories-animated-quote-section" aria-label="Human Voice Narrative">
      {/* Background Ambient Glow */}
      <div className="quote-ambient-glow" aria-hidden="true" />

      <div className="container">
        <motion.div
          className="story-quote-container"
          variants={quoteContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Left / Portrait Column */}
          <motion.div
            className="quote-image-wrap stories-quote-portrait"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.img 
              src={image} 
              alt={alt || 'Community participant portrait'} 
              className="quote-image"
              loading="lazy"
              animate={{
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <div className="quote-image-badge stories-badge-glass">
              <span className="badge-pulse-dot" />
              <span>Grassroots Reflection</span>
            </div>
          </motion.div>

          {/* Right / Content Column */}
          <div className="quote-content-col">
            <motion.span className="quote-eyebrow" variants={itemVariants}>
              <Sparkles size={16} className="sparkle-spin-icon" />
              <span>One Story. One Voice.</span>
            </motion.span>

            <motion.div className="quote-block" variants={itemVariants}>
              <motion.div
                className="quote-icon-wrap"
                initial={{ scale: 0.8, rotate: -8, opacity: 0 }}
                whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Quote size={44} className="quote-icon-svg" />
              </motion.div>
              <blockquote className="quote-body-text">
                "{quote}"
              </blockquote>
            </motion.div>

            <motion.div className="quote-attribution-box" variants={itemVariants}>
              <span className="quote-author-name">— {attribution}</span>
              {context && <span className="quote-author-role">{context}</span>}
              <div style={{ marginTop: '0.75rem' }}>
                <span className="demo-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D' }}>
                  Demonstration Quote • Real voices will be published upon field collection
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
