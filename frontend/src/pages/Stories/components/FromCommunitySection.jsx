import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, MapPin, Camera, FileText, Eye } from 'lucide-react';
import { communityMoments } from '../../../data/storiesData';
import StoriesMagneticButton from './StoriesMagneticButton';
import Modal from '../../../components/common/Modal';

export default function FromCommunitySection({ moments = communityMoments }) {
  const [selectedAbstract, setSelectedAbstract] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="from-community-section stories-animated-community-section" aria-label="From the Community Gallery">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-badge">
            <Camera size={14} />
            <span>Field Moments</span>
          </span>
          <h2 className="section-title">From the Community</h2>
          <p className="section-subtitle">
            Moments of learning, collaboration and action from the field.
          </p>
        </motion.div>

        {/* Gallery Cards Grid with Morphing Card Animation */}
        <motion.div
          className="community-gallery-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {moments.slice(0, 6).map((moment) => {
            const badge = moment.badge || moment.tag || 'Community Moment';
            const themeColor = moment.themeColor || '#059669';
            const typeTag = moment.typeTag || 'Field Note';
            const meta = moment.meta || `${moment.location} • Grassroots Stewardship`;
            const description = moment.description || `Participatory community learning and collective action in ${moment.location}.`;
            const stats = moment.stats || [
              { label: 'Community', value: '100% Grassroots' },
              { label: 'Status', value: 'Active Field' },
              { label: 'Location', value: moment.location }
            ];

            return (
              <motion.div
                key={moment.id}
                className="morphing-report-card community-morph-card"
                variants={itemVariants}
                tabIndex={0}
                role="article"
                aria-label={moment.title}
              >
                {/* Initially presents large immersive portrait, morphs to square on interaction */}
                <div className="report-morph-frame">
                  <img 
                    src={moment.image} 
                    alt={moment.title} 
                    className="report-morph-img" 
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  {/* Resting state overlay with immersive portrait */}
                  <div className="report-morph-overlay">
                    <span 
                      className="report-morph-badge"
                      style={{ 
                        color: '#34D399', 
                        backgroundColor: 'rgba(16, 185, 129, 0.25)', 
                        borderColor: 'rgba(52, 211, 153, 0.4)' 
                      }}
                    >
                      {badge}
                    </span>
                    <h3 className="report-morph-resting-title">{moment.title}</h3>
                    <p className="report-morph-resting-meta">
                      <MapPin size={13} color="#34D399" />
                      <span>{moment.location}</span>
                    </p>
                    <div className="report-morph-hint">
                      <span>Hover or focus to discover details</span>
                      <span className="report-morph-hint-dot" />
                    </div>
                  </div>
                </div>

                {/* Hidden detailed report information and action buttons revealed below as image morphs to square */}
                <div className="report-morph-drawer">
                  <div className="report-drawer-top">
                    <div className="report-drawer-tagline-row">
                      <span className="report-drawer-badge" style={{ color: themeColor }}>
                        {badge}
                      </span>
                      <span className="report-drawer-filetype">{typeTag}</span>
                    </div>

                    <h3 className="report-drawer-title">{moment.title}</h3>
                    <p className="report-drawer-desc">{description}</p>
                    <div className="report-drawer-meta">
                      <MapPin size={12} />
                      <span>{meta}</span>
                    </div>
                  </div>

                  <div className="report-drawer-bottom">
                    {/* Key outcome indicators */}
                    <div className="report-stats-grid">
                      {stats.map((st, i) => (
                        <div key={i} className="report-stat-chip">
                          <span className="report-stat-val">{st.value}</span>
                          <span className="report-stat-lbl">{st.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="report-actions-row">
                      <Link 
                        to="/gallery" 
                        className="btn btn-primary report-primary-dl-btn"
                        title="View in Community Gallery"
                      >
                        <Eye size={15} />
                        <span>View Gallery</span>
                      </Link>
                      <button 
                        type="button" 
                        className="btn btn-secondary report-secondary-btn" 
                        title="View Document Abstract"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAbstract(moment);
                        }}
                      >
                        <FileText size={15} />
                        <span>Abstract</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Action Button */}
        <motion.div
          className="from-community-actions"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StoriesMagneticButton strength={0.3}>
            <Link to="/gallery" className="btn btn-secondary btn-lg stories-cta-hover-effect">
              <span>Explore Community Gallery</span>
              <motion.span
                className="cta-arrow-icon"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <ArrowRight size={18} />
              </motion.span>
            </Link>
          </StoriesMagneticButton>
        </motion.div>
      </div>

      {/* Abstract Modal */}
      {selectedAbstract && (
        <Modal
          isOpen={Boolean(selectedAbstract)}
          onClose={() => setSelectedAbstract(null)}
          title={selectedAbstract.title}
          maxWidth="620px"
        >
          <div className="community-abstract-modal-body">
            <div className="community-abstract-media">
              <img 
                src={selectedAbstract.image} 
                alt={selectedAbstract.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="community-abstract-badge-row">
                <span 
                  className="report-drawer-badge" 
                  style={{ 
                    color: '#FFFFFF', 
                    backgroundColor: selectedAbstract.themeColor || '#059669', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px',
                    fontSize: '0.75rem'
                  }}
                >
                  {selectedAbstract.badge || selectedAbstract.tag}
                </span>
                <span className="community-abstract-loc">
                  <MapPin size={13} />
                  <span>{selectedAbstract.location}</span>
                </span>
              </div>
            </div>

            <div className="community-abstract-content">
              <h4 className="community-abstract-heading">Field Action Overview</h4>
              <p className="community-abstract-text">{selectedAbstract.abstract || selectedAbstract.description}</p>

              <h4 className="community-abstract-heading" style={{ marginTop: '1.25rem' }}>Verified Impact Indicators</h4>
              <div className="report-stats-grid" style={{ marginTop: '0.5rem' }}>
                {(selectedAbstract.stats || []).map((st, idx) => (
                  <div key={idx} className="report-stat-chip" style={{ padding: '0.75rem 0.5rem' }}>
                    <span className="report-stat-val" style={{ fontSize: '1rem', color: selectedAbstract.themeColor || '#059669' }}>
                      {st.value}
                    </span>
                    <span className="report-stat-lbl">{st.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="community-abstract-actions">
              <Link 
                to="/gallery" 
                className="btn btn-primary"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  width: '100%', 
                  justifyContent: 'center',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '9999px',
                  textDecoration: 'none'
                }}
                onClick={() => setSelectedAbstract(null)}
              >
                <span>View Full Photo Archive in Gallery</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
