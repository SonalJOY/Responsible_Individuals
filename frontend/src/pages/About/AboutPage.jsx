import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Users, HeartHandshake, ShieldCheck,
  Search, Lightbulb, TrendingUp, GraduationCap, Award,
  TreePine, HeartPulse, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight,
  X, Heart
} from 'lucide-react';
import useCountUp from '../../hooks/useCountUp';
import useScrollReveal from '../../hooks/useScrollReveal';

// Local authentic photographs
import areaHealthcareImg from '../../assets/area-healthcare.jpg';

import './AboutPage.css';

// Centralized media configurations
const HERO_VIDEO_SRC = '/videos/about-hero.mp4';
const HERO_POSTER_SRC = '/images/about-hero.jpg';

// Animation motion variants with subtle, coordinated motion system
const fadeUpVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      delay: custom * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

const heroHeadlineVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const heroLineVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Stage crossfade variant for methodology stepper
const stageCrossfadeVariant = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
};

// Sub-component for individual animated impact metric panel
function EditorialImpactMetric({ targetValue, label, note, isVisible, icon: Icon, showConnector = true, custom = 0 }) {
  const animatedDisplay = useCountUp(targetValue, isVisible, { duration: 1100 });

  return (
    <motion.div
      className="impact-metric-panel"
      variants={fadeUpVariant}
      custom={custom}
      aria-label={`${targetValue} ${label} - ${note}`}
    >
      {Icon && (
        <div className="impact-panel-icon-wrap" aria-hidden="true">
          <Icon size={22} className="impact-panel-icon" />
        </div>
      )}
      <div className="impact-panel-number" aria-hidden="true">
        {animatedDisplay}
      </div>
      <div className="impact-panel-label">{label}</div>
      <div className="impact-panel-note">{note}</div>
      {showConnector && <div className="impact-milestone-connector" aria-hidden="true" />}
    </motion.div>
  );
}

export default function AboutPage() {
  const heroVideoRef = useRef(null);
  const [heroParallax, setHeroParallax] = useState({ x: 0, y: 0 });

  // Real-time scroll progress indicator (0 to 1) & Story parallax offset
  const [scrollProgress, setScrollProgress] = useState(0);
  const [storyParallax, setStoryParallax] = useState(0);

  const [videoError, setVideoError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  ));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Autoplay hero video smoothly with clear playback when motion enabled
  useEffect(() => {
    if (heroVideoRef.current && !reducedMotion) {
      heroVideoRef.current.playbackRate = 0.85;
      heroVideoRef.current.play().catch(() => {});
    }
  }, [reducedMotion]);

  // Subtle background mouse parallax respecting reduced-motion preferences
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = ((e.clientX / innerWidth) - 0.5) * 14;
      const y = ((e.clientY / innerHeight) - 0.5) * 14;
      setHeroParallax({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll listener for top progress bar & subtle story image parallax (throttled with rAF)
  useEffect(() => {
    let ticking = false;
    const isReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight > 0) {
            const currentProgress = Math.min(Math.max(window.scrollY / docHeight, 0), 1);
            setScrollProgress(currentProgress);
          }

          if (!isReduced) {
            const storyEl = document.getElementById('story');
            if (storyEl) {
              const rect = storyEl.getBoundingClientRect();
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                // Subtle parallax factor (max ~18px shift)
                const offset = ((rect.top / window.innerHeight) - 0.5) * 24;
                setStoryParallax(offset);
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Methodology Stepper State (calm, user-directed progress)
  const [activeStep, setActiveStep] = useState(0);

  const handleNextStep = useCallback(() => {
    setActiveStep((prev) => (prev + 1) % 8);
  }, []);

  const handlePrevStep = useCallback(() => {
    setActiveStep((prev) => (prev - 1 + 8) % 8);
  }, []);

  // Keyboard navigation for stepper tabs
  const handleStepperKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1) % 8;
      setActiveStep(next);
      const nextTab = document.getElementById(`step-tab-${methodologySteps[next].num}`);
      if (nextTab) nextTab.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + 8) % 8;
      setActiveStep(prev);
      const prevTab = document.getElementById(`step-tab-${methodologySteps[prev].num}`);
      if (prevTab) prevTab.focus();
    }
  };

  // Section visibility hooks for triggering count-up
  const [impactRef, isImpactVisible] = useScrollReveal({
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
    triggerOnce: true,
  });

  // Sequential Metric Counter Activation (Animation C: 1,000ms–2,400ms sequential start)
  const [metricSeqActive, setMetricSeqActive] = useState([false, false, false, false]);

  useEffect(() => {
    if (isImpactVisible) {
      const isReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) {
        setMetricSeqActive([true, true, true, true]);
        return;
      }
      const t1 = setTimeout(() => setMetricSeqActive((prev) => [true, prev[1], prev[2], prev[3]]), 1000);
      const t2 = setTimeout(() => setMetricSeqActive((prev) => [prev[0], true, prev[2], prev[3]]), 1350);
      const t3 = setTimeout(() => setMetricSeqActive((prev) => [prev[0], prev[1], true, prev[3]]), 1700);
      const t4 = setTimeout(() => setMetricSeqActive((prev) => [prev[0], prev[1], prev[2], true]), 2050);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [isImpactVisible]);

  // Leadership Profile Modal State & Keyboard Navigation
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const cardRefs = useRef({});
  const lastFocusedCard = useRef(null);
  const modalCloseBtnRef = useRef(null);

  const openLeaderModal = (leader, idx) => {
    lastFocusedCard.current = cardRefs.current[idx];
    setSelectedLeader(leader);
    setIsModalClosing(false);
  };

  const closeLeaderModal = useCallback(() => {
    setIsModalClosing(true);
    setTimeout(() => {
      setSelectedLeader(null);
      setIsModalClosing(false);
      if (lastFocusedCard.current) {
        lastFocusedCard.current.focus();
      }
    }, 200);
  }, []);

  useEffect(() => {
    if (selectedLeader) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeLeaderModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      const timer = setTimeout(() => {
        if (modalCloseBtnRef.current) {
          modalCloseBtnRef.current.focus();
        }
      }, 50);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedLeader, closeLeaderModal]);
  const methodologySteps = [
    {
      num: '01',
      title: 'Identify Need',
      desc: 'Conducting on-the-ground baseline audits to evaluate classroom infrastructure and student learning gaps.',
      deliverable: 'Ground-truth mapping of learning deficits and water stress.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Build Trust',
      desc: 'Partnering closely with teachers, parents, and village committees before designing interventions.',
      deliverable: 'Panchayat consensus and community co-design agreements.',
      icon: HeartHandshake,
    },
    {
      num: '03',
      title: 'Plan Support',
      desc: 'Co-creating customized learning roadmaps and school upgrade blueprints with transparent milestones.',
      deliverable: 'Modular blueprints, equipment schedules, and budget plans.',
      icon: Lightbulb,
    },
    {
      num: '04',
      title: 'Bring Partners',
      desc: 'Mobilizing corporate CSR partners, citizen donors, and skilled volunteers for targeted clusters.',
      deliverable: 'Multi-stakeholder resource alignment with open accounting.',
      icon: Users,
    },
    {
      num: '05',
      title: 'Deliver Support',
      desc: 'Supplying smart classrooms, hands-on science kits, and safe drinking water amenities.',
      deliverable: 'Physical installation and field verification.',
      icon: BookOpen,
    },
    {
      num: '06',
      title: 'Measure Change',
      desc: 'Tracking student literacy gains, regular attendance, and ecological water telemetry.',
      deliverable: 'Quarterly verified impact metrics published openly.',
      icon: TrendingUp,
    },
    {
      num: '07',
      title: 'Sustain Impact',
      desc: 'Mentoring school leaders and local youth for enduring institutional ownership.',
      deliverable: 'School Management Committee capacity building and handover.',
      icon: GraduationCap,
    },
    {
      num: '08',
      title: 'Scale Success',
      desc: 'Replicating proven transformation models across neighboring school clusters and sub-basins.',
      deliverable: 'Cluster-level scaling blueprints and open-source documentation.',
      icon: Award,
    },
  ];

  // Authentic Leadership & Governance (Chetan, Manoj Pawar, Mansa, Praveen, Shabarish S)
  const leadershipTeam = [
    {
      id: 'chetan',
      name: 'Chetan',
      image: '/images/leadership/Chetan.jpeg',
      objectPosition: 'center 20%',
    },
    {
      id: 'manoj-pawar',
      name: 'Manoj Pawar',
      image: '/images/leadership/Manoj Pawar.jpeg',
      objectPosition: 'center 15%',
    },
    {
      id: 'mansa',
      name: 'Mansa',
      image: '/images/leadership/Mansa.jpeg',
      objectPosition: 'center 20%',
    },
    {
      id: 'praveen',
      name: 'Praveen',
      image: '/images/leadership/Praveen.jpeg',
      objectPosition: 'center 18%',
    },
    {
      id: 'shabarish-s',
      name: 'Shabarish S',
      image: '/images/leadership/Shabarish S.jpeg',
      objectPosition: 'center 20%',
    },
  ];

  const CurrentStepIcon = methodologySteps[activeStep].icon;

  return (
    <div className="about-editorial-root">
      {/* Real-time Saffron Scroll Progress Indicator */}
      <div
        className="about-scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />

      {/* ====================================================================
          A. REBUILT EDITORIAL HERO SECTION — ASYMMETRIC IMMERSIVE COMPOSITION
          ==================================================================== */}
      <section className="about-hero-rebuilt" aria-label="About Responsible Individuals Hero">
        {/* Ambient atmospheric backdrop with soft saffron glow and 3 slow organic morphing shapes */}
        <div className="hero-rebuilt-ambient-backdrop" aria-hidden="true">
          <div className="hero-rebuilt-ambient-glow" />
          <div className="hero-ambient-organic-layer">
            <svg className="hero-ambient-blob blob-1" viewBox="0 0 600 600" fill="none">
              <path
                d="M380,80 C480,140, 540,260, 500,380 C460,500, 340,540, 220,510 C100,480, 40,380, 60,260 C80,140, 280,20, 380,80 Z"
                fill="url(#blob-gradient-1)"
              />
              <defs>
                <radialGradient id="blob-gradient-1" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
                  <stop offset="60%" stopColor="#E8B85C" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#D99A2B" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
            <svg className="hero-ambient-blob blob-2" viewBox="0 0 600 600" fill="none">
              <path
                d="M440,160 C520,240, 510,390, 420,470 C330,550, 180,530, 110,430 C40,330, 70,180, 170,100 C270,20, 360,80, 440,160 Z"
                fill="url(#blob-gradient-2)"
              />
              <defs>
                <radialGradient id="blob-gradient-2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF4D9" stopOpacity="0.12" />
                  <stop offset="70%" stopColor="#E8B85C" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#C78B22" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
            <svg className="hero-ambient-blob blob-3" viewBox="0 0 600 600" fill="none">
              <path
                d="M320,60 C420,70, 510,160, 520,280 C530,400, 450,500, 330,520 C210,540, 110,460, 80,340 C50,220, 120,120, 220,70 C270,45, 320,60, 320,60 Z"
                fill="url(#blob-gradient-3)"
              />
              <defs>
                <radialGradient id="blob-gradient-3" cx="45%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.10" />
                  <stop offset="55%" stopColor="#E8B85C" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#D99A2B" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>
          <div className="hero-rebuilt-ambient-texture" />
        </div>

        {/* Signature Water-to-Roots Animated SVG: Water flows → Roots grow → Communities connect */}
        <div className="hero-water-roots-container" aria-hidden="true">
          <svg
            className="hero-water-roots-svg"
            viewBox="0 0 600 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Flowing Water Stream */}
            <path
              className="hero-svg-path hero-water-main"
              d="M 320 0 C 310 120, 260 220, 280 340 C 295 430, 260 520, 240 620 C 225 690, 210 750, 200 800"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Branch Tributaries */}
            <path
              className="hero-svg-path hero-branch-1"
              d="M 280 340 C 340 390, 420 440, 480 470 C 520 490, 560 510, 600 520"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              className="hero-svg-path hero-branch-2"
              d="M 260 520 C 210 570, 160 620, 110 650 C 70 675, 30 690, 0 700"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Root Capillaries */}
            <path
              className="hero-svg-path hero-root-1"
              d="M 240 620 C 265 670, 290 720, 310 780"
              stroke="rgba(255, 255, 255, 0.75)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              className="hero-svg-path hero-root-2"
              d="M 200 800 C 185 840, 170 870, 150 900"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              className="hero-svg-path hero-root-3"
              d="M 200 800 C 220 840, 245 875, 270 900"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Emerging Botanical Leaves & Nodes */}
            <path
              className="hero-botanical-leaf leaf-node-1"
              d="M 280 340 C 292 324, 316 326, 310 344 C 304 362, 280 340, 280 340 Z"
              fill="rgba(255, 255, 255, 0.75)"
            />
            <path
              className="hero-botanical-leaf leaf-node-2"
              d="M 480 470 C 496 458, 516 468, 508 486 C 498 502, 480 470, 480 470 Z"
              fill="rgba(255, 255, 255, 0.7)"
            />
            <path
              className="hero-botanical-leaf leaf-node-3"
              d="M 260 520 C 246 506, 230 518, 238 534 C 248 548, 260 520, 260 520 Z"
              fill="rgba(255, 255, 255, 0.7)"
            />
            <path
              className="hero-botanical-leaf leaf-node-4"
              d="M 110 650 C 96 638, 84 652, 94 666 C 104 678, 110 650, 110 650 Z"
              fill="rgba(255, 255, 255, 0.65)"
            />
          </svg>
        </div>

        <div className="about-editorial-container hero-rebuilt-container">
          {/* Main Asymmetric Grid: Left Editorial Typography & Right Cinematic Showcase */}
          <div className="hero-rebuilt-grid">
            {/* Left Column: Expressive Typography, Eyebrow, Narrative & Actions */}
            <div className="hero-rebuilt-content">
              {/* 1. Organisation Identifier Eyebrow */}
              <motion.div
                className="hero-rebuilt-eyebrow"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="hero-rebuilt-eyebrow-accent" aria-hidden="true" />
                <span className="hero-rebuilt-eyebrow-text">
                  RESPONSIBLE INDIVIDUALS FOUNDATION · EST. 2014
                </span>
              </motion.div>

              {/* 2. Main Dominant Headline */}
              <motion.h1
                className="hero-rebuilt-headline"
                variants={heroHeadlineVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span className="hero-headline-line" variants={heroLineVariants}>
                  Change Begins When
                </motion.span>
                <motion.span className="hero-headline-line" variants={heroLineVariants}>
                  We Take Responsibility.
                </motion.span>
              </motion.h1>

              {/* 3. Secondary Headline Accent */}
              <motion.div
                className="hero-rebuilt-subheadline"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.58, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="hero-subheadline-text">
                  Together, We <span className="hero-subheadline-emphasis">Transform</span> Communities.
                </span>
              </motion.div>

              {/* 4. Supporting Description with Controlled Line Length */}
              <motion.p
                className="hero-rebuilt-description"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                Empowering rural communities through open hydrology blueprints, modern classrooms, and enduring citizen ownership.
              </motion.p>

              {/* 5. Clearly Differentiated CTA Buttons */}
              <motion.div
                className="hero-rebuilt-actions"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
              >
                <a href="#story" className="btn-hero-primary btn-editorial-saffron">
                  <span>Our Story</span>
                  <ArrowRight size={16} className="btn-arrow-icon" />
                </a>
                <a href="#approach" className="btn-hero-secondary btn-editorial-outline">
                  <span>Explore Our Approach</span>
                  <ArrowRight size={16} className="btn-arrow-icon" />
                </a>
              </motion.div>
            </div>

            {/* Right Column: Layered Photographic Showcase with Organic Reveal & Botanical Accents */}
            <motion.div
              className="hero-rebuilt-visual-col"
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="hero-showcase-frame"
                style={{
                  transform: !reducedMotion ? `translate3d(${heroParallax.x * 0.7}px, ${heroParallax.y * 0.7}px, 0)` : 'none',
                }}
              >
                {/* Secondary Offset Frame / Depth Layer */}
                <div className="hero-showcase-depth-backdrop" aria-hidden="true" />

                {/* Botanical Decorative Frame Accents */}
                <div className="hero-frame-botanical-accent corner-top-right" aria-hidden="true">
                  <svg viewBox="0 0 54 54" fill="none">
                    <path
                      d="M8,46 C16,36 32,24 46,8 M46,8 C36,12 28,20 26,30 M46,8 C42,18 36,26 28,32"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="46" cy="8" r="2.5" fill="#FFFFFF" />
                  </svg>
                </div>
                <div className="hero-frame-botanical-accent corner-bottom-left" aria-hidden="true">
                  <svg viewBox="0 0 54 54" fill="none">
                    <path
                      d="M46,8 C36,18 20,30 8,46 M8,46 C18,42 26,34 28,24 M8,46 C12,36 18,28 26,22"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="8" cy="46" r="2.5" fill="#FFFFFF" />
                  </svg>
                </div>

                {/* Primary Community Image Window with Organic Mask Reveal */}
                <div className="hero-showcase-image-wrap hero-photo-organic-reveal">
                  <img
                    src="/images/about-hero-community.jpg"
                    alt="Responsible Individuals volunteers and community members participating in an on-ground grassroots drive"
                    className="hero-showcase-img"
                    loading="eager"
                  />
                  <div className="hero-showcase-overlay" aria-hidden="true" />

                  {/* Top Floating Field Badge */}
                  <div className="hero-showcase-badge">
                    <span className="hero-showcase-badge-dot" />
                    <span>Citizen Action & Verifiable Impact</span>
                  </div>

                  {/* Bottom Integrated Photographic Caption with Staggered Upward Glide */}
                  <div className="hero-showcase-caption hero-caption-animated">
                    <p className="hero-caption-title">Citizen Action & Community Stewardship</p>
                    <p className="hero-caption-sub">Field-tested models built alongside teachers, parents, and village committees</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 6. Redesigned Bottom Organisational Identity Strip (Education, Environment, Community) */}
          <motion.div
            className="hero-rebuilt-identity-strip"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-identity-card hero-identity-card-1">
              <div className="hero-identity-icon-box education">
                <BookOpen size={18} />
              </div>
              <div className="hero-identity-text">
                <span className="hero-identity-category">Education</span>
                <span className="hero-identity-desc">Smart digital classrooms and STEM mentorship</span>
              </div>
            </div>

            <div className="hero-identity-divider" aria-hidden="true" />

            <div className="hero-identity-card hero-identity-card-2">
              <div className="hero-identity-icon-box environment">
                <TreePine size={18} />
              </div>
              <div className="hero-identity-text">
                <span className="hero-identity-category">Environmental Responsibility</span>
                <span className="hero-identity-desc">Catchment revival and open hydrological telemetry</span>
              </div>
            </div>

            <div className="hero-identity-divider" aria-hidden="true" />

            <div className="hero-identity-card hero-identity-card-3">
              <div className="hero-identity-icon-box community">
                <Users size={18} />
              </div>
              <div className="hero-identity-text">
                <span className="hero-identity-category">Community Participation</span>
                <span className="hero-identity-desc">Grassroots leadership and local institutional ownership</span>
              </div>
            </div>
          </motion.div>

          {/* Interactive Scroll Indicator with Downward Story Transition Tendril */}
          <div className="hero-rebuilt-scroll-anchor">
            <motion.a
              href="#story"
              className="hero-scroll-indicator"
              aria-label="Scroll down to explore our story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <span className="scroll-indicator-mouse">
                <span className="scroll-indicator-dot" />
              </span>
              <span className="scroll-indicator-text">Scroll to explore</span>
            </motion.a>
            {/* Scroll-Triggered Story Transition Tendril Extending Toward #story */}
            <div className="hero-story-transition-tendril" aria-hidden="true">
              <svg viewBox="0 0 40 80" fill="none">
                <path
                  d="M20,0 C20,30 26,50 20,80"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          B. OUR STORY — ASYMMETRIC PHOTOGRAPHIC SPREAD & FLOATING ACCENT
          ==================================================================== */}
      <section id="story" className="about-story-editorial">
        <div className="about-editorial-container">
          <div className="story-editorial-layout">
            {/* Photographic Composition Side with Parallax Offset */}
            <motion.div
              className="story-visual-side"
              variants={fadeUpVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="story-lead-frame">
                <img
                  src="/images/Group_selfie.jpeg"
                  alt="Responsible Individuals volunteer community gathered together during field operations"
                  className="story-lead-image"
                  loading="lazy"
                />
                <div className="story-lead-tag">
                  <span className="story-tag-dot" />
                  <span>Volunteer Community &bull; Grassroots Movement</span>
                </div>
              </div>

              {/* Offset Image with Scroll-Driven Subtle Parallax */}
              <div
                className="story-offset-frame"
                style={{
                  transform: `translate3d(0, ${storyParallax}px, 0)`,
                }}
              >
                <img
                  src="/images/volunteer_interaction.jpeg"
                  alt="Volunteers interacting and mentoring young students during a community program"
                  className="story-offset-image"
                  loading="lazy"
                />
                <div className="story-offset-caption">
                  <span className="offset-caption-title">Community Engagement</span>
                  <span className="offset-caption-desc">Volunteer mentorship &amp; youth outreach</span>
                </div>
              </div>

              {/* Floating Decorative SVG Contour in Saffron Tone */}
              <svg className="story-botanical-vector" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                <path
                  d="M80 0 C100 40, 140 60, 160 80 C120 100, 100 140, 80 160 C60 120, 20 100, 0 80 C40 60, 60 20, 80 0 Z"
                  stroke="rgba(217, 119, 6, 0.2)"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>

            {/* Typography & Concise Narrative Side */}
            <motion.div
              className="story-content-side"
              variants={fadeUpVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="editorial-eyebrow">
                <span className="eyebrow-number">01</span>
                <motion.span
                  className="eyebrow-divider"
                  initial={{ width: 0 }}
                  whileInView={{ width: 28 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                />
                <span className="eyebrow-text">ORIGIN &amp; PURPOSE</span>
              </div>

              <h2 className="story-editorial-heading">
                Small, Deliberate Acts Spark Generational Change
              </h2>

              <p className="story-lead-paragraph">
                Enduring social progress does not arrive through distant mandates, but through dedicated citizens taking direct ownership of their local ecology, schools, and community health.
              </p>

              <p className="story-body-paragraph">
                Founded in 2014, Responsible Individuals unites scientists, educators, and grassroots volunteers to deliver science-backed watershed revival, digital classroom upgrades, and preventive wellness across southern India.
              </p>

              <blockquote className="story-editorial-quote">
                <p className="quote-text">
                  &ldquo;Change begins the moment an individual stops waiting for solutions and takes responsibility.&rdquo;
                </p>
                <cite className="quote-cite">&mdash; Responsible Individuals Founding Charter</cite>
              </blockquote>

              <div className="story-action-line">
                <a href="#focus-areas" className="editorial-arrow-link">
                  <span>Explore our three focus areas</span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          C. VISION, MISSION & VALUES — SPLIT CONTRAST COMPOSITION
          ==================================================================== */}
      <section id="vision" className="about-vmp-editorial">
        <div className="about-editorial-container">
          <div className="vmp-header-block">
            <div className="editorial-eyebrow">
              <span className="eyebrow-number">02</span>
              <motion.span
                className="eyebrow-divider"
                initial={{ width: 0 }}
                whileInView={{ width: 28 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              />
              <span className="eyebrow-text">OUR FOUNDATION</span>
            </div>
            <h2 className="editorial-section-title">Vision, Mission &amp; Guiding Pillars</h2>
          </div>

          {/* Split Vision & Mission Spread */}
          <div className="vmp-split-spread">
            {/* The Vision Block (Refined Charcoal Contrast Panel) */}
            <motion.div
              className="vmp-vision-panel"
              variants={fadeUpVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="vmp-panel-badge vision-badge">
                <BookOpen size={14} />
                <span>THE VISION</span>
              </div>
              <h3 className="vmp-statement-text">
                &ldquo;To create a world where every life we touch is empowered, nurtured, and inspired to thrive.&rdquo;
              </h3>
              <p className="vmp-support-text">
                We believe enduring change starts with compassion and sustained accountability, empowering rural communities to shape their own ecological and educational destiny.
              </p>
              <div className="vmp-watermark" aria-hidden="true">VISION</div>
            </motion.div>

            {/* The Mission Block (Warm White Panel with Saffron Accent) */}
            <motion.div
              className="vmp-mission-panel"
              variants={fadeUpVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="vmp-panel-badge mission-badge">
                <Users size={14} />
                <span>THE MISSION</span>
              </div>
              <h3 className="vmp-statement-text">
                &ldquo;Transforming every individual into a Responsible Individual.&rdquo;
              </h3>
              <p className="vmp-support-text">
                Building an open, verifiable platform uniting citizen volunteers, CSR partners, and rural committees in disciplined execution toward lasting community transformation.
              </p>
              <div className="vmp-watermark" aria-hidden="true">MISSION</div>
            </motion.div>
          </div>

          {/* Three Pillars Horizontal Strip */}
          <div className="values-editorial-strip">
            <div className="values-strip-header">
              <span className="strip-header-tag">THE THREE PILLARS WE LIVE BY</span>
            </div>

            <div className="values-three-columns">
              <motion.div
                className="value-editorial-column"
                variants={fadeUpVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="value-num-heading">
                  <span className="value-num">01</span>
                  <span className="value-name">Integrity</span>
                </div>
                <p className="value-description">
                  Uncompromising transparency, open ecological data, and unvarnished public accounting in every partnership.
                </p>
              </motion.div>

              <motion.div
                className="value-editorial-column"
                variants={fadeUpVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="value-num-heading">
                  <span className="value-num">02</span>
                  <span className="value-name">Empathy</span>
                </div>
                <p className="value-description">
                  Listening deeply and co-designing every intervention alongside local teachers, parents, and village committees.
                </p>
              </motion.div>

              <motion.div
                className="value-editorial-column"
                variants={fadeUpVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="value-num-heading">
                  <span className="value-num">03</span>
                  <span className="value-name">Action</span>
                </div>
                <p className="value-description">
                  Translating good intentions into disciplined, verifiable boots-on-the-ground execution that creates lasting change.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          D. IMPACT SECTION — EDITORIAL PANELS & ORGANIC ANIMATION SYSTEM
          Warm Ivory Canvas, Deep Charcoal Typography, Muted Saffron Accents
          ==================================================================== */}
      <section id="impact" className="about-impact-editorial" ref={impactRef}>
        {/* Animation B: Expanding Water Ripples near/behind the heading */}
        <div className="impact-water-ripples" aria-hidden="true">
          <div className={`impact-ripple-ring ring-1 ${isImpactVisible ? 'is-animated' : ''}`} />
          <div className={`impact-ripple-ring ring-2 ${isImpactVisible ? 'is-animated' : ''}`} />
          <div className={`impact-ripple-ring ring-3 ${isImpactVisible ? 'is-animated' : ''}`} />
        </div>

        {/* Animation D: Floating Organic Elements (leaves/petals) */}
        <div className="impact-floating-elements" aria-hidden="true">
          <div className="impact-floating-leaf leaf-pos-1" />
          <div className="impact-floating-leaf leaf-pos-2" />
          <div className="impact-floating-leaf leaf-pos-3" />
        </div>

        <div className="about-editorial-container">
          <div className="impact-editorial-header">
            <div className="editorial-eyebrow">
              <span className="eyebrow-number">03</span>
              <motion.span
                className="eyebrow-divider"
                initial={{ width: 0 }}
                whileInView={{ width: 28 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              />
              <span className="eyebrow-text">VERIFIED FIELD REACH</span>
            </div>
            <h2 className="impact-headline">Measurable Impact, Grounded in Field Data</h2>
            <p className="impact-subheading">
              Verifiable milestones achieved through citizen mobilization and disciplined grassroots stewardship.
            </p>
          </div>

          <div className="impact-ribbon-wrapper">
            {/* Animation A: Organic Growth Line with branching leaves */}
            <div className="impact-growth-line-container" aria-hidden="true">
              <svg className="impact-growth-svg" viewBox="0 0 1200 120" fill="none" preserveAspectRatio="none">
                <path
                  className={`impact-growth-path ${isImpactVisible ? 'is-animated' : ''}`}
                  d="M 0,60 C 200,25 400,95 600,60 C 800,25 1000,95 1200,60"
                  stroke="#D99A2B"
                  strokeWidth="1.5"
                />
                <path
                  className={`impact-growth-leaf leaf-1 ${isImpactVisible ? 'is-animated' : ''}`}
                  d="M 300,50 C 310,35 325,40 320,55 C 315,65 300,50 300,50 Z"
                  fill="rgba(217, 154, 43, 0.45)"
                />
                <path
                  className={`impact-growth-leaf leaf-2 ${isImpactVisible ? 'is-animated' : ''}`}
                  d="M 600,60 C 612,45 628,50 622,65 C 615,75 600,60 600,60 Z"
                  fill="rgba(217, 154, 43, 0.45)"
                />
                <path
                  className={`impact-growth-leaf leaf-3 ${isImpactVisible ? 'is-animated' : ''}`}
                  d="M 900,50 C 910,35 925,40 920,55 C 915,65 900,50 900,50 Z"
                  fill="rgba(217, 154, 43, 0.45)"
                />
              </svg>
            </div>

            {/* Animation E, C, F: 4 White Statistic Panels with Sequential Counters & Milestone Connectors */}
            <motion.div
              className={`impact-panels-grid ${isImpactVisible ? 'is-visible' : ''}`}
              variants={staggerContainerVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <EditorialImpactMetric
                targetValue="50,000+"
                label="LIVES TRANSFORMED"
                note="Direct Field Beneficiaries"
                isVisible={metricSeqActive[0]}
                icon={HeartPulse}
                showConnector={true}
                custom={0}
              />
              <EditorialImpactMetric
                targetValue="120+"
                label="COMMUNITIES REACHED"
                note="Gram Panchayats &amp; Clusters"
                isVisible={metricSeqActive[1]}
                icon={TreePine}
                showConnector={true}
                custom={1}
              />
              <EditorialImpactMetric
                targetValue="50+"
                label="PROJECTS COMPLETED"
                note="Classroom &amp; Wetland Units"
                isVisible={metricSeqActive[2]}
                icon={CheckCircle2}
                showConnector={true}
                custom={2}
              />
              <EditorialImpactMetric
                targetValue="2,500+"
                label="ACTIVE VOLUNTEERS"
                note="Citizen Stewards Mobilized"
                isVisible={metricSeqActive[3]}
                icon={HeartHandshake}
                showConnector={false}
                custom={3}
              />
            </motion.div>
          </div>

          {/* Animated Saffron Progress Underline Beneath Metrics */}
          <motion.div
            className="impact-saffron-progress-line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />

          <div className="impact-audit-footnote">
            <CheckCircle2 size={16} className="audit-check-icon" />
            <span>All figures reconciled against quarterly field operational ledgers and audited project records.</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          E. FOCUS AREAS — MASK REVEAL & SAFFRON ACCENTS
          ==================================================================== */}
      <section id="focus-areas" className="about-focus-editorial">
        <div className="about-editorial-container">
          <div className="focus-editorial-header">
            <div className="editorial-eyebrow">
              <span className="eyebrow-number">04</span>
              <motion.span
                className="eyebrow-divider"
                initial={{ width: 0 }}
                whileInView={{ width: 28 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              />
              <span className="eyebrow-text">PILLARS OF INTERVENTION</span>
            </div>
            <h2 className="editorial-section-title">Our Three Focus Areas</h2>
            <p className="editorial-section-lead">
              Targeted, community-led initiatives focused on lifelong educational opportunity, ecological health, and community wellness.
            </p>
          </div>

          {/* Differentiated Editorial Composition */}
          <div className="focus-editorial-composition">
            {/* 1. Hero Spotlight: Education Spread with Reveal Mask */}
            <motion.div
              className="focus-spotlight-item"
              variants={fadeUpVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="spotlight-media-frame">
                <img
                  src="/images/students_art.jpeg"
                  alt="Children showcasing creative artwork and participating in classroom learning activities"
                  className="spotlight-image"
                  loading="lazy"
                />
                <div className="spotlight-badge">
                  <GraduationCap size={15} />
                  <span>EDUCATION &amp; SKILL DEVELOPMENT</span>
                </div>
              </div>

              <div className="spotlight-content-frame">
                <span className="focus-kicker-tag">PILLAR 01 &bull; LIFELONG OPPORTUNITY</span>
                <h3 className="spotlight-title">Education, Youth Empowerment &amp; Skill Development</h3>
                <p className="spotlight-description">
                  Bridging rural learning gaps through smart digital classrooms, hands-on STEM education, and continuous teacher mentorship.
                </p>
                <div className="spotlight-key-bullets">
                  <div className="bullet-row">
                    <span className="bullet-dash">&mdash;</span>
                    <span>Interactive digital classrooms and library upgrades</span>
                  </div>
                  <div className="bullet-row">
                    <span className="bullet-dash">&mdash;</span>
                    <span>Experiential STEM and environmental sensor kits</span>
                  </div>
                  <div className="bullet-row">
                    <span className="bullet-dash">&mdash;</span>
                    <span>Continuous teacher training for foundational literacy</span>
                  </div>
                </div>
                <Link to="/projects" className="spotlight-action-link">
                  <span>Explore Education Initiatives</span>
                  <ArrowRight size={15} className="action-arrow-icon" />
                </Link>
              </div>
            </motion.div>

            {/* 2 & 3. Dual Panels (Environment & Health) */}
            <div className="focus-dual-panels">
              {/* Environment Panel */}
              <motion.div
                className="focus-half-panel"
                variants={fadeUpVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="half-panel-media">
                  <img
                    src="/images/environment_image.jpeg"
                    alt="Volunteers and community members participating in a tree-planting and environmental conservation drive"
                    className="half-panel-image"
                    loading="lazy"
                  />
                  <div className="half-panel-tag">
                    <TreePine size={14} />
                    <span>ECOLOGICAL STEWARDSHIP</span>
                  </div>
                </div>
                <div className="half-panel-content">
                  <span className="focus-kicker-tag">PILLAR 02 &bull; SUSTAINABILITY</span>
                  <h3 className="half-panel-title">Environment &amp; Watershed Sustainability</h3>
                  <p className="half-panel-description">
                    Reviving local catchments and ecosystems through rainwater harvesting, lake desilting, and participatory water telemetry.
                  </p>
                  <div className="focus-outcomes-list">
                    <div className="bullet-row">
                      <span className="bullet-dash">&mdash;</span>
                      <span>Community-led lake restoration and bioswale filtration</span>
                    </div>
                    <div className="bullet-row">
                      <span className="bullet-dash">&mdash;</span>
                      <span>Open hydrological data and groundwater monitoring</span>
                    </div>
                    <div className="bullet-row">
                      <span className="bullet-dash">&mdash;</span>
                      <span>Native afforestation and soil conservation drives</span>
                    </div>
                  </div>
                  <Link to="/projects" className="spotlight-action-link">
                    <span>Explore Environmental Action</span>
                    <ArrowRight size={15} className="action-arrow-icon" />
                  </Link>
                </div>
              </motion.div>

              {/* Health Panel */}
              <motion.div
                className="focus-half-panel"
                variants={fadeUpVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="half-panel-media">
                  <img
                    src={areaHealthcareImg}
                    alt="Community health and hygiene initiative"
                    className="half-panel-image"
                    loading="lazy"
                  />
                  <div className="half-panel-tag">
                    <HeartPulse size={14} />
                    <span>COMMUNITY WELLNESS</span>
                  </div>
                </div>
                <div className="half-panel-content">
                  <span className="focus-kicker-tag">PILLAR 03 &bull; HEALTHCARE</span>
                  <h3 className="half-panel-title">Health &amp; Holistic Well-Being</h3>
                  <p className="half-panel-description">
                    Securing foundational community health through safe drinking water access, clean sanitation units, and wellness awareness.
                  </p>
                  <div className="focus-outcomes-list">
                    <div className="bullet-row">
                      <span className="bullet-dash">&mdash;</span>
                      <span>School drinking water purification amenities</span>
                    </div>
                    <div className="bullet-row">
                      <span className="bullet-dash">&mdash;</span>
                      <span>Clean sanitation units and menstrual hygiene programs</span>
                    </div>
                    <div className="bullet-row">
                      <span className="bullet-dash">&mdash;</span>
                      <span>Preventive rural wellness and nutrition workshops</span>
                    </div>
                  </div>
                  <Link to="/projects" className="spotlight-action-link">
                    <span>Explore Health Initiatives</span>
                    <ArrowRight size={15} className="action-arrow-icon" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          F. METHODOLOGY — INTERACTIVE PROGRESS NARRATIVE WITH CROSSFADE
          ==================================================================== */}
      <section id="approach" className="about-methodology-editorial">
        <div className="about-editorial-container">
          <div className="methodology-header-block">
            <div className="editorial-eyebrow">
              <span className="eyebrow-number">05</span>
              <motion.span
                className="eyebrow-divider"
                initial={{ width: 0 }}
                whileInView={{ width: 28 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              />
              <span className="eyebrow-text">TRANSFORMATION METHODOLOGY</span>
            </div>
            <h2 className="editorial-section-title">Eight Steps from Need to Lasting Impact</h2>
            <p className="editorial-section-lead">
              A disciplined, interconnected transformation cycle designed to nurture self-sustaining community ownership.
            </p>
          </div>

          {/* Interactive Stepper Navigation Rail (Desktop & Tablet) */}
          <div className="methodology-stepper-rail" role="tablist" aria-label="Methodology Steps">
            <div
              className="stepper-progress-fill"
              style={{ width: `${((activeStep + 1) / 8) * 100}%` }}
              aria-hidden="true"
            />
            {methodologySteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.num}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`step-panel-${step.num}`}
                  id={`step-tab-${step.num}`}
                  tabIndex={isActive ? 0 : -1}
                  className={`stepper-node-btn ${isActive ? 'is-active-step' : ''}`}
                  onClick={() => setActiveStep(idx)}
                  onKeyDown={(e) => handleStepperKeyDown(e, idx)}
                >
                  <span className="node-num-pill">{step.num}</span>
                  <span className="node-label-text">{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Editorial Spotlight Showcase with AnimatePresence Crossfade & Animated Numeral */}
          <div
            className="methodology-showcase-panel"
            id={`step-panel-${methodologySteps[activeStep].num}`}
            role="tabpanel"
            aria-labelledby={`step-tab-${methodologySteps[activeStep].num}`}
          >
            {/* Subtle animated background numeral transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`watermark-${activeStep}`}
                className="showcase-watermark-num"
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden="true"
              >
                {methodologySteps[activeStep].num}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                className="showcase-content-grid"
                variants={stageCrossfadeVariant}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="showcase-badge-col">
                  <div className="showcase-icon-halo">
                    <CurrentStepIcon size={28} />
                  </div>
                  <div className="showcase-stage-pill">
                    STAGE {methodologySteps[activeStep].num} OF 08
                  </div>
                </div>

                <div className="showcase-text-col">
                  <h3 className="showcase-title">{methodologySteps[activeStep].title}</h3>
                  <p className="showcase-description">{methodologySteps[activeStep].desc}</p>
                  <div className="showcase-deliverable-line">
                    <span className="deliverable-label">Key Operational Milestone:</span>
                    <span className="deliverable-text">{methodologySteps[activeStep].deliverable}</span>
                  </div>
                </div>

                <div className="showcase-controls-col">
                  <div className="showcase-arrow-buttons">
                    <button
                      type="button"
                      className="btn-stepper-nav"
                      onClick={handlePrevStep}
                      aria-label="Previous methodology step"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      className="btn-stepper-nav"
                      onClick={handleNextStep}
                      aria-label="Next methodology step"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="stepper-counter-indicator">
                    Step {activeStep + 1} of 8
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Vertical Milestone Flow (<768px) */}
          <div className="methodology-mobile-vertical-flow">
            {methodologySteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.num}
                  className={`mobile-step-row ${isActive ? 'is-active-mobile-step' : ''}`}
                  onClick={() => setActiveStep(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveStep(idx);
                    }
                  }}
                  aria-label={`Step ${step.num}: ${step.title}`}
                >
                  <div className="mobile-step-indicator">
                    <span className="mobile-step-num">{step.num}</span>
                    <span className="mobile-step-line" />
                  </div>
                  <div className="mobile-step-details">
                    <div className="mobile-step-top">
                      <StepIcon size={16} className="mobile-step-icon" />
                      <h4>{step.title}</h4>
                    </div>
                    <p>{step.desc}</p>
                    <div className="mobile-step-deliverable">
                      <strong>Milestone:</strong> {step.deliverable}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          G. LEADERSHIP — REFINED PORTRAIT EDITORIAL GALLERY
          ==================================================================== */}
      <section id="leadership" className="about-leadership-editorial">
        <div className="about-editorial-container">
          <div className="leadership-header-block">
            <div className="editorial-eyebrow">
              <span className="eyebrow-number">06</span>
              <motion.span
                className="eyebrow-divider"
                initial={{ width: 0 }}
                whileInView={{ width: 28 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              />
              <span className="eyebrow-text">LEADERSHIP &amp; GOVERNANCE</span>
            </div>
            <h2 className="editorial-section-title">Guiding Minds &amp; Leadership</h2>
            <p className="editorial-section-lead">
              Dedicated stewards guiding our grassroots initiatives, environmental action, and community development.
            </p>
          </div>

          {/* Refined Portrait Editorial Grid */}
          <motion.div
            className="leadership-portrait-grid"
            variants={staggerContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {leadershipTeam.map((member, idx) => {
              const hasProfileInfo = Boolean(member.bio || member.role || member.profileUrl);

              return (
                <motion.div
                  key={member.id}
                  variants={fadeUpVariant}
                  custom={idx}
                  className={`leadership-portrait-card ${hasProfileInfo ? 'has-profile' : ''}`}
                  {...(hasProfileInfo
                    ? {
                        role: 'button',
                        tabIndex: 0,
                        'aria-haspopup': 'dialog',
                        'aria-label': `View full profile of ${member.name}`,
                        onClick: () => openLeaderModal(member, idx),
                        onKeyDown: (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openLeaderModal(member, idx);
                          }
                        },
                        ref: (el) => {
                          cardRefs.current[idx] = el;
                        },
                      }
                    : {})}
                >
                  <div className="portrait-image-frame">
                    <img
                      src={member.image}
                      alt={member.name}
                      className={`portrait-image leader-${member.id}`}
                      style={{ objectPosition: member.objectPosition || 'center 20%' }}
                      loading="lazy"
                    />
                    <div className="portrait-overlay" />
                  </div>

                  <div className="portrait-caption-wrap">
                    <h3 className="portrait-name">{member.name}</h3>
                    {member.role && <div className="portrait-role-tag">{member.role}</div>}
                    {hasProfileInfo && (
                      <div className="portrait-view-action">
                        <span>View Profile</span>
                        <ArrowRight size={14} className="action-arrow-icon" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Accessible Profile Modal Dialog */}
        <AnimatePresence>
          {selectedLeader && (
            <motion.div
              className="leadership-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeLeaderModal();
                }
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="leader-modal-name"
              aria-describedby="leader-modal-desc"
            >
              <motion.div
                className={`leadership-modal-card ${isModalClosing ? 'is-closing' : ''}`}
                initial={{ opacity: 0, scale: 0.96, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 14 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  ref={modalCloseBtnRef}
                  type="button"
                  className="modal-close-button"
                  onClick={closeLeaderModal}
                  aria-label="Close profile modal"
                >
                  <X size={20} />
                </button>

                <div className="modal-inner-grid">
                  <div className="modal-photo-col">
                    <div className="modal-photo-frame">
                      <img
                        src={selectedLeader.image}
                        alt={selectedLeader.name}
                        className={`modal-photo-img leader-${selectedLeader.id}`}
                        style={{ objectPosition: selectedLeader.objectPosition || 'center 15%' }}
                      />
                    </div>
                  </div>

                  <div className="modal-info-col">
                    <div className="modal-role-badge">
                      {selectedLeader.role || 'Role to be updated'}
                    </div>

                    <h3 id="leader-modal-name" className="modal-name">
                      {selectedLeader.name}
                    </h3>

                    <div className="modal-divider" />

                    <div className="modal-desc-section">
                      <span className="modal-section-label">ABOUT</span>
                      <p id="leader-modal-desc" className="modal-desc-text">
                        {selectedLeader.bio || 'Profile description will be updated soon.'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ====================================================================
          H. CLOSING CTA SECTION — POLISHED FINISH TO SHARED FOOTER
          ==================================================================== */}
      <section className="about-closing-editorial">
        <div className="closing-editorial-bg" aria-hidden="true" />
        <div className="closing-editorial-overlay" aria-hidden="true" />

        <div className="about-editorial-container closing-editorial-inner">
          <motion.div
            className="closing-editorial-content"
            variants={fadeUpVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="editorial-eyebrow eyebrow-light center-eyebrow">
              <span className="eyebrow-accent-dot" />
              <span className="eyebrow-text">BE THE CHANGE</span>
            </div>

            <h2 className="closing-editorial-headline">
              Individual responsibility is the quiet catalyst behind every transformed village.
            </h2>

            <p className="closing-editorial-sub">
              Join citizen volunteers, mentors, and partners working on the frontlines of rural education and watershed conservation.
            </p>

            <div className="closing-editorial-actions">
              <Link to="/volunteer" className="btn-editorial-saffron">
                <span>Volunteer With Us</span>
                <ArrowRight size={16} className="btn-arrow-icon" />
              </Link>
              <Link to="/donate" className="btn-editorial-outline">
                <Heart size={16} />
                <span>Support Our Work</span>
              </Link>
            </div>

            <div className="closing-tax-badge">
              <ShieldCheck size={16} className="tax-shield-icon" />
              <span>All donations eligible for 50% deduction under Section 80G of the Indian Income Tax Act.</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
