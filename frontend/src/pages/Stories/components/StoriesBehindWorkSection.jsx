import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Compass, ShieldCheck, HeartHandshake, Users, Calendar, Award, Sparkles } from 'lucide-react';
import StoriesAnimatedCounter from './StoriesAnimatedCounter';
import StoriesMagneticButton from './StoriesMagneticButton';

export default function StoriesBehindWorkSection() {
  // Statistics drawn strictly from the existing demo stories data
  const storyStats = [
    {
      id: 'stat-volunteers',
      number: 82,
      suffix: '+',
      label: 'Resident Volunteers',
      desc: 'Local community members uniting generational knowledge in field action',
      icon: Users,
      color: '#10B981'
    },
    {
      id: 'stat-drives',
      number: 4,
      suffix: '',
      label: 'Watershed Drives',
      desc: 'Consecutive community weekends desilting check structures & bunds',
      icon: Calendar,
      color: '#2563EB'
    },
    {
      id: 'stat-maintenance',
      number: 100,
      suffix: '%',
      label: 'Community Maintenance',
      desc: 'Local stewardship teams ensuring longevity beyond funding cycles',
      icon: Award,
      color: '#F59E0B'
    }
  ];

  const qualitativePillars = [
    {
      icon: Compass,
      color: '#10B981',
      bg: '#ECFDF5',
      title: 'Community-Led Priorities',
      desc: 'Interventions originate from participatory community mapping rather than top-down assumptions.'
    },
    {
      icon: ShieldCheck,
      color: '#2563EB',
      bg: '#EFF6FF',
      title: 'Scientific Accountability',
      desc: 'Every ecological and educational milestone is documented with transparent baseline benchmarks.'
    },
    {
      icon: HeartHandshake,
      color: '#F59E0B',
      bg: '#FEF3C7',
      title: 'Enduring Stewardship',
      desc: 'Local committees take over continuous maintenance to ensure outcomes outlast external funding cycles.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="stories-behind-section stories-animated-behind-section" aria-label="Stories Behind the Work">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="stories-behind-header"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-badge">
            <Sparkles size={13} />
            <span>Humanity Behind Metrics</span>
          </span>
          <h2 className="stories-behind-title">Every Number Has a Story.</h2>
          <p className="stories-behind-subtitle">
            Behind every project are people, communities and moments that make change possible.
          </p>
        </motion.div>

        {/* Animated Statistics Counters */}
        <motion.div
          className="stories-stats-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {storyStats.map((stat) => {
            const IconComp = stat.icon;
            return (
              <motion.div
                key={stat.id}
                className="stories-stat-card"
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className="stat-card-icon-wrap" style={{ color: stat.color }}>
                  <IconComp size={24} />
                </div>
                <div className="stat-number-display">
                  <StoriesAnimatedCounter target={stat.number} suffix={stat.suffix} />
                </div>
                <div className="stat-card-label">{stat.label}</div>
                <p className="stat-card-desc">{stat.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Qualitative Pillars */}
        <motion.div
          className="impact-pillars-row"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {qualitativePillars.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <motion.div
                key={idx}
                className="impact-pillar-card stories-pillar-hover"
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.25 }
                }}
              >
                <motion.div 
                  className="pillar-icon-box" 
                  style={{ backgroundColor: pillar.bg, color: pillar.color }}
                  whileHover={{ rotate: [-2, 3, 0], scale: 1.08 }}
                  transition={{ duration: 0.4 }}
                >
                  <IconComp size={26} />
                </motion.div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="impact-bridge-action"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StoriesMagneticButton strength={0.3}>
            <Link to="/impact" className="btn btn-primary btn-lg stories-cta-hover-effect">
              <span>Explore Our Impact</span>
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
    </section>
  );
}
