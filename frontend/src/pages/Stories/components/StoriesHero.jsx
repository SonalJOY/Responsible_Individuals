import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, ChevronDown, Sparkles } from 'lucide-react';
import stockVideo from '../../../assets/stock.mp4';

export default function StoriesHero() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const scrollToContent = () => {
    const featuredElem = document.querySelector('.featured-story-section');
    if (featuredElem) {
      featuredElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Stagger animation variants for initial page load
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.16,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 36, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="stories-hero stories-hero-with-video" aria-label="Stories Hero">
      {/* Background Video Layer */}
      <div className="stories-hero-video-container" aria-hidden="true">
        <video
          ref={videoRef}
          className="stories-hero-video"
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1600&q=80"
        >
          <source src={stockVideo} type="video/mp4" />
          <source src="/videos/hero-impact.webm" type="video/webm" />
        </video>
        {/* Multi-tier Cinematic Overlays */}
        <div className="stories-hero-overlay-dark" />
        <div className="stories-hero-overlay-gradient" />
        <div className="stories-hero-mesh-glow" />
      </div>

      {/* Floating Ambient Light Orbs */}
      <div className="stories-ambient-lights" aria-hidden="true">
        <motion.div
          className="stories-light-orb orb-1"
          animate={{
            x: [0, 25, -20, 0],
            y: [0, -30, 15, 0],
            scale: [1, 1.12, 0.95, 1],
            opacity: [0.35, 0.5, 0.3, 0.35]
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="stories-light-orb orb-2"
          animate={{
            x: [0, -35, 20, 0],
            y: [0, 20, -25, 0],
            scale: [1, 0.92, 1.08, 1],
            opacity: [0.25, 0.45, 0.2, 0.25]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className="container stories-hero-content-wrapper">
        <motion.div
          className="stories-hero-inner"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow Badge */}
          <motion.div variants={itemVariants} className="stories-badge-wrap">
            <span className="section-badge stories-hero-badge">
              <Sparkles size={14} className="badge-sparkle-icon" />
              <span>Voices of Transformation</span>
            </span>
          </motion.div>

          {/* Main Heading with Masked Upward Reveal */}
          <div className="stories-title-mask">
            <motion.h1 className="stories-hero-title" variants={titleVariants}>
              Stories of Change
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p className="stories-hero-subtitle" variants={itemVariants}>
            Explore first-person accounts of students, dryland farmers, resident stewards, and youth whose lives have been impacted by our projects.
          </motion.p>

          {/* Scroll Prompt */}
          <motion.div variants={itemVariants} className="stories-hero-scroll-prompt">
            <button
              onClick={scrollToContent}
              className="stories-scroll-indicator"
              aria-label="Scroll to featured story"
            >
              <span className="scroll-indicator-text">Explore Stories</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Video Ambient Control Toggle (Bottom-Right) */}
      <div className="stories-video-control-wrap">
        <button
          onClick={toggleVideo}
          className="stories-video-toggle-btn"
          aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
          title={isPlaying ? 'Pause background video' : 'Play background video'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          <span className="video-toggle-label">{isPlaying ? 'Pause Video' : 'Play Video'}</span>
        </button>
      </div>
    </section>
  );
}
