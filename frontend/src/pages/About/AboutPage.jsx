import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Users, Sparkles, CheckCircle2,
  Search, HeartHandshake, Lightbulb, Building2, TrendingUp, GraduationCap, Award,
  X, Mail, Phone, MapPin, ArrowRight, ExternalLink
} from 'lucide-react';
import Reveal from '../../components/common/Reveal';
import { StaggerContainer, StaggerItem } from '../../components/common/StaggerContainer';
import useScrollReveal from '../../hooks/useScrollReveal';
import WarpText from '../../components/common/WarpText';

// Centralized media configurations — easily replaceable in one location
const HERO_VIDEO_SRC = '/videos/about-hero.mp4';
const HERO_POSTER_SRC = '/images/about-hero.jpg';

const VISION_IMAGE_SRC = '/images/about-vision.jpg';
const VISION_IMAGE_ALT = 'Rural government school students reading books together in an improved classroom with their teacher';

const MISSION_IMAGE_SRC = '/images/about-mission.jpg';
const MISSION_IMAGE_ALT = 'Volunteers and teachers collaborating in a rural school classroom to provide educational materials and digital learning resources';

const RURAL_ED_IMAGE_SRC = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80';
const COMMUNITY_ACTION_IMAGE_SRC = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80';

export default function AboutPage() {
  const heroVideoRef = useRef(null);
  const [hoveredSticky, setHoveredSticky] = useState(null);
  const [visionMouse, setVisionMouse] = useState({ x: 0, y: 0 });
  const [missionMouse, setMissionMouse] = useState({ x: 0, y: 0 });

  // Subtle Parallax Cursor Refs for Editorial Flank Visuals
  const leftFlankRef = useRef(null);
  const leftFlankRaf = useRef(null);
  const rightFlankRef = useRef(null);
  const rightFlankRaf = useRef(null);

  // Ensure hero video autoplays smoothly
  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.play().catch(() => {});
    }
  }, []);

  // Interactive 8-Step Impact Orbit State
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  const orbit3DRef = useRef(null);
  const hubRef = useRef(null);
  const orbitRaf = useRef(null);

  const [stickySectionRef, isStickySectionVisible] = useScrollReveal({
    threshold: 0.12,
    rootMargin: '0px 0px -30px 0px',
    triggerOnce: true,
  });

  // LIVING IMPACT FLOW — State & Smooth RAF Cursor Parallax
  const [activeFlowIdx, setActiveFlowIdx] = useState(0);
  const [hoveredFlowIdx, setHoveredFlowIdx] = useState(null);
  const impactFlowRef = useRef(null);
  const impactFlowRaf = useRef(null);
  const [impactSectionRef, isImpactSectionVisible] = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px',
    triggerOnce: true,
  });

  // Automatic Living Impact Flow Active Step Cycle (every 3.0s continuously)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFlowIdx((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleFlowMouseMove = (e) => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    if (impactFlowRaf.current) cancelAnimationFrame(impactFlowRaf.current);
    impactFlowRaf.current = requestAnimationFrame(() => {
      if (impactFlowRef.current) {
        impactFlowRef.current.style.setProperty('--flow-cpx', `${(relX * 8).toFixed(2)}px`);
        impactFlowRef.current.style.setProperty('--flow-cpy', `${(relY * 8).toFixed(2)}px`);
        impactFlowRef.current.style.setProperty('--flow-crotx', `${(-relY * 2.0).toFixed(2)}deg`);
        impactFlowRef.current.style.setProperty('--flow-croty', `${(relX * 2.5).toFixed(2)}deg`);
      }
    });
  };

  const handleFlowMouseLeave = () => {
    if (impactFlowRaf.current) cancelAnimationFrame(impactFlowRaf.current);
    if (impactFlowRef.current) {
      impactFlowRef.current.style.setProperty('--flow-cpx', '0px');
      impactFlowRef.current.style.setProperty('--flow-cpy', '0px');
      impactFlowRef.current.style.setProperty('--flow-crotx', '0deg');
      impactFlowRef.current.style.setProperty('--flow-croty', '0deg');
    }
  };

  const [approachRef, isApproachVisible] = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
    triggerOnce: true,
  });



  const handleLeftFlankMouseMove = (e) => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    if (leftFlankRaf.current) cancelAnimationFrame(leftFlankRaf.current);
    leftFlankRaf.current = requestAnimationFrame(() => {
      if (leftFlankRef.current) {
        leftFlankRef.current.style.setProperty('--flank-x', `${(relX * 5).toFixed(2)}px`);
        leftFlankRef.current.style.setProperty('--flank-y', `${(relY * 5).toFixed(2)}px`);
        leftFlankRef.current.style.setProperty('--flank-scale', '1.025');
      }
    });
  };

  const handleLeftFlankMouseLeave = () => {
    if (leftFlankRaf.current) cancelAnimationFrame(leftFlankRaf.current);
    if (leftFlankRef.current) {
      leftFlankRef.current.style.setProperty('--flank-x', '0px');
      leftFlankRef.current.style.setProperty('--flank-y', '0px');
      leftFlankRef.current.style.setProperty('--flank-scale', '1');
    }
  };

  const handleRightFlankMouseMove = (e) => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    if (rightFlankRaf.current) cancelAnimationFrame(rightFlankRaf.current);
    rightFlankRaf.current = requestAnimationFrame(() => {
      if (rightFlankRef.current) {
        rightFlankRef.current.style.setProperty('--flank-x', `${(relX * 5).toFixed(2)}px`);
        rightFlankRef.current.style.setProperty('--flank-y', `${(relY * 5).toFixed(2)}px`);
        rightFlankRef.current.style.setProperty('--flank-scale', '1.025');
      }
    });
  };

  const handleRightFlankMouseLeave = () => {
    if (rightFlankRaf.current) cancelAnimationFrame(rightFlankRaf.current);
    if (rightFlankRef.current) {
      rightFlankRef.current.style.setProperty('--flank-x', '0px');
      rightFlankRef.current.style.setProperty('--flank-y', '0px');
      rightFlankRef.current.style.setProperty('--flank-scale', '1');
    }
  };

  const handleVisionMouseMove = (e) => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6; // 3px max
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    setVisionMouse({ x, y });
  };

  const handleMissionMouseMove = (e) => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6; // 3px max
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    setMissionMouse({ x, y });
  };

  // 3D Orbit Cursor Parallax with requestAnimationFrame (zero React re-renders on mousemove)
  const handleSectionMouseMove = (e) => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    if (orbitRaf.current) cancelAnimationFrame(orbitRaf.current);
    orbitRaf.current = requestAnimationFrame(() => {
      if (orbit3DRef.current) {
        const rotX = -relY * 2.2;
        const rotY = relX * 2.8;
        const transX = relX * 6;
        const transY = relY * 6;
        orbit3DRef.current.style.transform = `perspective(1200px) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      }
      if (hubRef.current) {
        const hubTransX = -relX * 3.5;
        const hubTransY = -relY * 3.5;
        hubRef.current.style.transform = `translate(-50%, -50%) translate3d(${hubTransX.toFixed(1)}px, ${hubTransY.toFixed(1)}px, 10px)`;
      }
    });
  };

  const handleSectionMouseLeave = () => {
    if (orbitRaf.current) cancelAnimationFrame(orbitRaf.current);
    if (orbit3DRef.current) {
      orbit3DRef.current.style.transform = 'perspective(1200px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
      orbit3DRef.current.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    }
    if (hubRef.current) {
      hubRef.current.style.transform = 'translate(-50%, -50%) translate3d(0, 0, 0)';
      hubRef.current.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    }
  };

  // Automatic active stage cycle (every 3.5s unless user is hovering a card)
  useEffect(() => {
    if (isHoveringCard) return;
    const timer = setInterval(() => {
      setActiveStageIdx((prev) => (prev + 1) % 8);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHoveringCard]);

  useEffect(() => {
    return () => {
      if (orbitRaf.current) cancelAnimationFrame(orbitRaf.current);
      if (impactFlowRaf.current) cancelAnimationFrame(impactFlowRaf.current);
    };
  }, []);

  // Four Core Transformation Focus Areas ("Living Impact Flow")
  const impactFlowSteps = [
    {
      num: '01',
      title: 'Better Schools',
      category: 'CLASSROOMS & FACILITIES',
      desc: 'Upgrading rural classrooms, clean sanitation, solar lighting, and dignified spaces.',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
      icon: Building2,
      posClass: 'flow-pos-0',
    },
    {
      num: '02',
      title: 'Learning Resources',
      category: 'BOOKS & DIGITAL TOOLS',
      desc: 'Supplying libraries with regional books, STEM kits, stationery, and digital tablets.',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
      icon: BookOpen,
      posClass: 'flow-pos-1',
    },
    {
      num: '03',
      title: 'Teacher Support',
      category: 'EDUCATOR EMPOWERMENT',
      desc: 'Empowering teachers with dedicated volunteer assistants, workshops, and teaching aids.',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
      icon: GraduationCap,
      posClass: 'flow-pos-2',
    },
    {
      num: '04',
      title: 'Community Action',
      category: 'PARENTS & VOLUNTEERS',
      desc: 'Mobilizing parent-teacher councils, local youth, and volunteer networks for stewardship.',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80',
      icon: HeartHandshake,
      posClass: 'flow-pos-3',
    },
  ];

  const methodologySteps = [
    {
      num: '01',
      title: 'Identify Need',
      desc: 'Assessing classroom infrastructure & student learning gaps on the ground.',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
      icon: Search,
    },
    {
      num: '02',
      title: 'Build Trust',
      desc: 'Partnering closely with teachers, parents & village education committees.',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
      icon: HeartHandshake,
    },
    {
      num: '03',
      title: 'Plan Support',
      desc: 'Co-creating customized learning roadmaps & school upgrade blueprints.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
      icon: Lightbulb,
    },
    {
      num: '04',
      title: 'Bring Partners',
      desc: 'Mobilizing corporate CSR sponsors, citizen donors & skilled volunteers.',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
      icon: Users,
    },
    {
      num: '05',
      title: 'Deliver Support',
      desc: 'Supplying smart classrooms, library books & clean sanitation amenities.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
      icon: BookOpen,
    },
    {
      num: '06',
      title: 'Measure Change',
      desc: 'Evaluating student literacy gains, regular attendance & holistic growth.',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80',
      icon: TrendingUp,
    },
    {
      num: '07',
      title: 'Sustain Impact',
      desc: 'Empowering school leaders & teachers for enduring local institutional ownership.',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
      icon: GraduationCap,
    },
    {
      num: '08',
      title: 'Scale Success',
      desc: 'Replicating proven transformation models across neighboring school clusters.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
      icon: Award,
    },
  ];

  // Leadership & Profile Modal State
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

  const closeLeaderModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setSelectedLeader(null);
      setIsModalClosing(false);
      if (lastFocusedCard.current) {
        lastFocusedCard.current.focus();
      }
    }, 280);
  };

  // Modal accessibility, scroll lock & escape listener
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
  }, [selectedLeader]);

  const team = [
    {
      id: 'aruna-natarajan',
      name: 'Dr. Aruna Natarajan',
      role: 'Executive Chairperson',
      shortDesc: 'Urban wetland conservation, watershed science, and citizen-backed hydrology policy.',
      bio: 'Former environmental scientist with 22 years of experience leading urban wetland conservation and hydrology policy across southern India. She champions open ecological data and participatory governance.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      email: 'aruna.natarajan@responsibleindividuals.org',
      linkedin: 'https://linkedin.com',
      location: 'Bengaluru, India',
      focusAreas: ['Wetland Hydrology', 'Citizen Governance', 'Hydrology Policy'],
    },
    {
      id: 'karthik-raman',
      name: 'Karthik Raman',
      role: 'Head of Grassroots Programs',
      shortDesc: 'Spearheading digital education access and classroom upgrades in over 400 rural government schools.',
      bio: 'Social development veteran who has spearheaded digital education access in over 400 rural government schools across underserved educational clusters.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
      email: 'karthik.raman@responsibleindividuals.org',
      linkedin: 'https://linkedin.com',
      location: 'Mysuru, India',
      focusAreas: ['Rural Education', 'Digital Access', 'Grassroots Stewardship'],
    },
    {
      id: 'meera-deshmukh',
      name: 'Meera Deshmukh',
      role: 'Director of Impact & Governance',
      shortDesc: 'Specialist in CSR compliance, social return on investment (SROI), and beneficiary protection.',
      bio: 'Certified auditor specializing in CSR compliance, social return on investment (SROI), and beneficiary protection frameworks.',
      image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=800&q=80',
      email: 'meera.deshmukh@responsibleindividuals.org',
      linkedin: 'https://linkedin.com',
      location: 'Bengaluru, India',
      focusAreas: ['CSR Compliance', 'SROI Impact', 'Audited Governance'],
    },
    {
      id: 'vikas-chenna',
      name: 'Vikas Chenna',
      role: 'Lead Ecologist & Field Hydrologist',
      shortDesc: 'Expert in native flora, constructed wetland bioswales, and biodiversity documentation.',
      bio: 'Expert in native Karnataka flora, constructed wetland bioswales, and community biodiversity documentation with extensive field experience across Western Ghats catchments.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      email: 'vikas.chenna@responsibleindividuals.org',
      linkedin: 'https://linkedin.com',
      location: 'Shivamogga, India',
      focusAreas: ['Constructed Wetlands', 'Flora Taxonomies', 'Field Hydrology'],
    },
  ];

  return (
    <div className="about-page-root">
      {/* Full-Bleed Continuous Video Background About Hero Section */}
      <section className="about-hero">
        {/* Layer 1: Background Video */}
        <video
          ref={heroVideoRef}
          className="hero-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_POSTER_SRC}
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
          <source src={HERO_VIDEO_SRC} type="video/webm" />
        </video>

        {/* Layer 2: Dark Green Cinematic Translucent Overlay & Ambient Glow */}
        <div className="hero-dark-overlay" aria-hidden="true" />
        <div className="hero-ambient-glow" aria-hidden="true" />

        {/* Layer 3: High-Contrast Hero Content */}
        <div className="container hero-content-relative">
          <div className="about-hero-content-box">
            <div className="section-badge animate-hero-badge">
              <Sparkles size={14} className="badge-sparkle-icon" />
              <span>Who We Are</span>
            </div>
            
            <h1 className="about-hero-title animate-hero-title">
              <span className="sr-only">A Foundation Built on Accountable Citizen Action</span>
              <span className="about-hero-line about-hero-line-1" aria-hidden="true">
                <span className="about-hero-text-static">A Foundation Built on</span>
                <WarpText
                  text="A Foundation Built on"
                  color="#FFFFFF"
                  warpStrength={0.055}
                  warpScale={1.6}
                  speed={0.32}
                  pointerInfluence={0.40}
                  pointerStrength={0.28}
                  refraction={0.012}
                  ripple={true}
                  className="about-hero-warp-layer"
                />
              </span>
              <span className="about-hero-line about-hero-line-2" aria-hidden="true">
                <span className="about-hero-text-static hero-highlight-text">Accountable Citizen Action</span>
                <WarpText
                  text="Accountable Citizen Action"
                  color="#39D98A"
                  warpStrength={0.055}
                  warpScale={1.6}
                  speed={0.32}
                  pointerInfluence={0.40}
                  pointerStrength={0.28}
                  refraction={0.012}
                  ripple={true}
                  className="about-hero-warp-layer"
                />
              </span>
            </h1>
            
            <p className="about-hero-subtitle animate-hero-subtitle">
              We empower citizen committees, institutions, and CSR partners with scientific blueprints, open data governance, and sustained community co-ownership.
            </p>

            <div className="hero-meta-pills animate-hero-detail">
              <div className="hero-meta-pill">
                <div className="meta-pill-dot" />
                <span>Grassroots Stewardship</span>
              </div>
              <div className="hero-meta-pill">
                <div className="meta-pill-dot" />
                <span>100% Verifiable Field Impact</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Sticky Notes Section */}
      <section id="vision" className="section sticky-notes-section" ref={stickySectionRef}>
        <div className="container sticky-section-container">
          {/* Section Introduction */}
          <Reveal animation="fade-up" className="section-header sticky-section-header">
            <span className="section-badge">Our Purpose</span>
            <h2 className="section-title">Vision &amp; Mission</h2>
          </Reveal>

          {/* Large Editorial Visual Storytelling Composition Stage */}
          <div className="vision-mission-stage">
            {/* LEFT SIDE — RURAL EDUCATION Large Editorial Photo Panel */}
            <div 
              className={`editorial-visual-flank flank-left ${isStickySectionVisible ? 'flank-revealed' : ''}`}
              onMouseMove={handleLeftFlankMouseMove}
              onMouseLeave={handleLeftFlankMouseLeave}
            >
              <div className="editorial-float-layer">
                <div 
                  className="editorial-photo-card editorial-photo-left"
                  ref={leftFlankRef}
                >
                  <div className="editorial-photo-frame">
                    <img
                      src={RURAL_ED_IMAGE_SRC}
                      alt="Rural classroom students and teacher learning together"
                      className="editorial-img"
                      loading="lazy"
                    />
                    <div className="editorial-img-gloss" />
                    <div className="editorial-pin-badge pin-emerald" aria-hidden="true" />
                  </div>
                  <div className="editorial-meta">
                    <span className="editorial-badge badge-emerald">RURAL EDUCATION</span>
                    <p className="editorial-subline">Learning &bull; Opportunity &bull; Growth</p>
                  </div>
                </div>
              </div>
            </div>

            {/* UNCHANGED: Central Vision & Mission Cards */}
            <div className="sticky-notes-container">
              {/* Vision Sticky Note */}
              <div
                className={`sticky-note-wrapper sticky-vision-wrapper ${
                  isStickySectionVisible ? 'sticky-revealed' : ''
                } ${hoveredSticky === 'vision' ? 'is-focused' : ''} ${
                  hoveredSticky === 'mission' ? 'is-dimmed' : ''
                }`}
                onMouseEnter={() => setHoveredSticky('vision')}
                onMouseLeave={() => {
                  setHoveredSticky(null);
                  setVisionMouse({ x: 0, y: 0 });
                }}
                onMouseMove={handleVisionMouseMove}
              >
                <div
                  className="sticky-note-card sticky-card-vision"
                  style={{
                    transform: hoveredSticky === 'vision'
                      ? `rotate(-0.5deg) scale(1.03) translateY(-8px) translate3d(${visionMouse.x}px, ${visionMouse.y}px, 0)`
                      : undefined,
                  }}
                >
                  {/* Semi-transparent Washi Tape Accent */}
                  <div className="washi-tape washi-tape-emerald" aria-hidden="true" />

                  {/* Subtle corner fold accent */}
                  <div className="sticky-corner-fold" aria-hidden="true" />

                  {/* Card Image Container (~35-40% height) */}
                  <div className="sticky-image-frame">
                    <img
                      src={VISION_IMAGE_SRC}
                      alt={VISION_IMAGE_ALT}
                      className="sticky-card-img"
                      loading="lazy"
                    />
                    <div className="sticky-image-overlay" />
                  </div>

                  {/* Card Content */}
                  <div className="sticky-content-body">
                    <div className="sticky-tag-wrapper">
                      <span className="sticky-tag tag-emerald">
                        <BookOpen size={14} className="sticky-tag-icon" />
                        <span>OUR VISION</span>
                      </span>
                    </div>

                    <h3 className="sticky-statement">
                      &ldquo;Every child deserves the opportunity to learn, grow, and thrive.&rdquo;
                    </h3>

                    <p className="sticky-desc">
                      Building stronger rural schools and creating supportive learning environments where every student can reach their full potential.
                    </p>

                    <div className="sticky-footer">
                      <span className="sticky-pillar-tag pillar-emerald">
                        Equal Opportunity &amp; Quality Learning
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mission Sticky Note */}
              <div
                className={`sticky-note-wrapper sticky-mission-wrapper ${
                  isStickySectionVisible ? 'sticky-revealed' : ''
                } ${hoveredSticky === 'mission' ? 'is-focused' : ''} ${
                  hoveredSticky === 'vision' ? 'is-dimmed' : ''
                }`}
                onMouseEnter={() => setHoveredSticky('mission')}
                onMouseLeave={() => {
                  setHoveredSticky(null);
                  setMissionMouse({ x: 0, y: 0 });
                }}
                onMouseMove={handleMissionMouseMove}
              >
                <div
                  className="sticky-note-card sticky-card-blue"
                  style={{
                    transform: hoveredSticky === 'mission'
                      ? `rotate(0.5deg) scale(1.03) translateY(-8px) translate3d(${missionMouse.x}px, ${missionMouse.y}px, 0)`
                      : undefined,
                  }}
                >
                  {/* Semi-transparent Washi Tape Accent */}
                  <div className="washi-tape washi-tape-blue" aria-hidden="true" />

                  {/* Subtle corner fold accent */}
                  <div className="sticky-corner-fold" aria-hidden="true" />

                  {/* Card Image Container (~35-40% height) */}
                  <div className="sticky-image-frame">
                    <img
                      src={MISSION_IMAGE_SRC}
                      alt={MISSION_IMAGE_ALT}
                      className="sticky-card-img"
                      loading="lazy"
                    />
                    <div className="sticky-image-overlay" />
                  </div>

                  {/* Card Content */}
                  <div className="sticky-content-body">
                    <div className="sticky-tag-wrapper">
                      <span className="sticky-tag tag-blue">
                        <Users size={14} className="sticky-tag-icon" />
                        <span>OUR MISSION</span>
                      </span>
                    </div>

                    <h3 className="sticky-statement">
                      &ldquo;Strengthening rural government schools through resources, people, and opportunity.&rdquo;
                    </h3>

                    <p className="sticky-desc">
                      Working with teachers, communities, volunteers, and partners to create measurable, generational improvements in education.
                    </p>

                    <div className="sticky-footer">
                      <span className="sticky-pillar-tag pillar-blue">
                        Community Action &amp; School Support
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE — COMMUNITY ACTION Large Editorial Photo Panel */}
            <div 
              className={`editorial-visual-flank flank-right ${isStickySectionVisible ? 'flank-revealed' : ''}`}
              onMouseMove={handleRightFlankMouseMove}
              onMouseLeave={handleRightFlankMouseLeave}
            >
              <div className="editorial-float-layer">
                <div 
                  className="editorial-photo-card editorial-photo-right"
                  ref={rightFlankRef}
                >
                  <div className="editorial-photo-frame">
                    <img
                      src={COMMUNITY_ACTION_IMAGE_SRC}
                      alt="Community volunteers providing educational support and resources"
                      className="editorial-img"
                      loading="lazy"
                    />
                    <div className="editorial-img-gloss" />
                    <div className="editorial-pin-badge pin-blue" aria-hidden="true" />
                  </div>
                  <div className="editorial-meta">
                    <span className="editorial-badge badge-blue">COMMUNITY ACTION</span>
                    <p className="editorial-subline">People &bull; Resources &bull; Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact Section — Clean Card-based Presentation */}
      <section 
        id="csr-partners" 
        className="section living-flow-section bg-white"
        ref={impactSectionRef}
        onMouseMove={handleFlowMouseMove}
        onMouseLeave={handleFlowMouseLeave}
      >
        <div id="impact-in-action" style={{ position: 'absolute', top: 0 }} aria-hidden="true" />

        <div className="container relative-z-2">
          <Reveal animation="fade-up" className="section-header living-flow-header">
            <span className="section-badge">Our Impact</span>
            <h2 className="section-title">Turning Support Into Opportunity</h2>
            <p className="section-subtitle">
              Creating stronger learning environments through people, resources, and community action.
            </p>
          </Reveal>

          {/* Desktop & Tablet Living Flow Stage */}
          <div className="living-flow-viewport" ref={impactFlowRef}>
            <div className="living-flow-stage">
              {/* 4 Large Flow Cards (Matching Vision/Mission Visual Scale & Dimensions) */}
              {impactFlowSteps.map((step, idx) => {
                const IconComp = step.icon;
                const isActive = activeFlowIdx === idx;
                const isHovered = hoveredFlowIdx === idx;
                return (
                  <div
                    key={step.num}
                    className={`flow-card-node flow-float-${idx} ${step.posClass}`}
                    onMouseEnter={() => setHoveredFlowIdx(idx)}
                    onMouseLeave={() => setHoveredFlowIdx(null)}
                    onClick={() => setActiveFlowIdx(idx)}
                  >
                    <div className="flow-card-parallax-wrap">
                      <div className={`flow-card-inner ${isActive ? 'is-active-flow-card' : ''} ${isHovered ? 'is-hovered-flow-card' : ''}`}>
                        {/* Prominent Image Frame (215px height, matching Vision/Mission cards) */}
                        <div className="flow-card-img-wrap">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="flow-card-img"
                            loading="lazy"
                          />
                          <div className="flow-card-img-overlay" />

                          {/* Stage Number Badge */}
                          <div className="flow-card-num-badge">
                            <span>{step.num}</span>
                          </div>

                          {/* Icon Badge */}
                          <div className="flow-card-icon-badge">
                            <IconComp size={16} />
                          </div>
                        </div>

                        {/* Card Content Body (Matching Vision/Mission typography and visual weight) */}
                        <div className="flow-card-content-body">
                          <div className="flow-card-tag-wrapper">
                            <span className="flow-card-tag">
                              <IconComp size={13} className="flow-tag-icon" />
                              <span>{step.category}</span>
                            </span>
                          </div>

                          <h3 className="flow-card-title">{step.title}</h3>

                          <p className="flow-card-desc">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Flow Journey (<768px) */}
          <div className="living-flow-mobile">
            <div className="flow-mobile-track">
              <div className="flow-mobile-list">
                {impactFlowSteps.map((step, idx) => {
                  const IconComp = step.icon;
                  const isActive = activeFlowIdx === idx;
                  return (
                    <div
                      key={step.num}
                      className={`flow-mobile-item flow-mobile-float-${idx} ${isActive ? 'flow-mobile-item-active' : ''}`}
                      onClick={() => setActiveFlowIdx(idx)}
                    >
                      <div className="flow-mobile-dot">
                        <span>{step.num}</span>
                      </div>
                      <div className="flow-mobile-card">
                        <div className="flow-mobile-img-wrap">
                          <img src={step.image} alt={step.title} className="flow-mobile-img" loading="lazy" />
                          <div className="flow-mobile-icon-badge">
                            <IconComp size={14} />
                          </div>
                        </div>
                        <div className="flow-mobile-card-body">
                          <div className="flow-mobile-tag-wrap">
                            <span className="flow-mobile-category">{step.category}</span>
                          </div>
                          <h4 className="flow-mobile-title">{step.title}</h4>
                          <p className="flow-mobile-desc">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 8-Step Impact Orbit Section */}
      <section 
        id="approach" 
        className="section methodology-section bg-light-alt" 
        ref={approachRef}
        onMouseMove={handleSectionMouseMove}
        onMouseLeave={handleSectionMouseLeave}
      >
        {/* Living Ambient Background Glow Accents */}
        <div className="methodology-ambient-aura methodology-ambient-aura-1" aria-hidden="true" />
        <div className="methodology-ambient-aura methodology-ambient-aura-2" aria-hidden="true" />

        <div className="container relative-z-2">
          <Reveal animation="fade-up" className="section-header methodology-header">
            <span className="section-badge">Our Approach</span>
            <h2 className="section-title">From Need to Lasting Impact</h2>
            <p className="section-subtitle">
              An interconnected 8-stage transformation ecosystem orbiting around sustainable rural school empowerment.
            </p>
          </Reveal>

          {/* Desktop & Tablet 3D Interactive Orbit Viewport */}
          <div className="orbit-system-viewport">
            <div 
              className={`orbit-3d-stage ${isHoveringCard ? 'orbit-is-paused' : ''}`} 
              ref={orbit3DRef}
            >
              {/* SVG Elliptical Orbit Track with Traveling Light Particle */}
              <svg className="orbit-svg-track" viewBox="0 0 1040 580" aria-hidden="true">
                <ellipse cx="520" cy="290" rx="400" ry="215" className="orbit-ellipse-line" />
                <ellipse cx="520" cy="290" rx="400" ry="215" className="orbit-ellipse-dashed" />
              </svg>

              {/* Central Impact Hub Focal Point */}
              <div className="impact-hub-center" ref={hubRef}>
                <div className="hub-outer-ring hub-outer-ring-1" aria-hidden="true" />
                <div className="hub-outer-ring hub-outer-ring-2" aria-hidden="true" />
                
                <div className="hub-core-card">
                  <img 
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80" 
                    alt="Rural School Impact Hub" 
                    className="hub-core-img"
                    loading="lazy"
                  />
                  <div className="hub-core-overlay" />
                  
                  <div className="hub-core-content">
                    <div className="hub-core-badge">
                      <Sparkles size={12} className="hub-sparkle-icon" />
                      <span>IMPACT HUB</span>
                    </div>
                    <h3 className="hub-core-title">Rural School</h3>
                    <p className="hub-core-subtitle">Education &amp; Community Impact</p>
                  </div>
                </div>
              </div>

              {/* 8 Continuously Orbiting Stage Cards */}
              <div className="orbit-cards-container">
                {methodologySteps.map((step, idx) => {
                  const IconComp = step.icon;
                  const isCardActive = activeStageIdx === idx;
                  const isCardHovered = hoveredStep === step.num;
                  const isOtherCardHovered = hoveredStep !== null && !isCardHovered;
                  
                  return (
                    <div
                      key={step.num}
                      className={`orbit-card-node orbit-card-pos-${idx} ${
                        isCardActive ? 'is-active-orbit-stage' : ''
                      } ${isCardHovered ? 'is-hovered-orbit-stage' : ''} ${
                        isOtherCardHovered ? 'is-dimmed-orbit-stage' : ''
                      }`}
                      onMouseEnter={() => {
                        setHoveredStep(step.num);
                        setIsHoveringCard(true);
                      }}
                      onMouseLeave={() => {
                        setHoveredStep(null);
                        setIsHoveringCard(false);
                      }}
                      onClick={() => setActiveStageIdx(idx)}
                    >
                      <div className="orbit-card-inner">
                        {/* Card Image Frame */}
                        <div className="orbit-card-img-wrap">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="orbit-card-img"
                            loading="lazy"
                          />
                          <div className="orbit-card-img-overlay" />

                          {/* Stage Number Tag */}
                          <div className="orbit-card-num-badge">
                            <span>{step.num}</span>
                          </div>

                          {/* Stage Icon Badge */}
                          <div className="orbit-card-icon-badge">
                            <IconComp size={13} />
                          </div>
                        </div>

                        {/* Title Box */}
                        <div className="orbit-card-label-box">
                          <span className="orbit-card-title">{step.title}</span>
                        </div>

                        {/* Hover Description Tooltip */}
                        <div className="orbit-card-tooltip">
                          <span className="tooltip-step-num">STAGE {step.num}</span>
                          <p className="orbit-card-tooltip-desc">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Orbit Active Stage Controller / Step Indicator Bar */}
            <div className="orbit-timeline-nav">
              <div className="orbit-timeline-pills">
                {methodologySteps.map((step, idx) => (
                  <button
                    key={step.num}
                    type="button"
                    className={`orbit-nav-pill ${activeStageIdx === idx ? 'is-active-pill' : ''}`}
                    onClick={() => setActiveStageIdx(idx)}
                    aria-label={`Jump to stage ${step.num}: ${step.title}`}
                  >
                    <span className="pill-num">{step.num}</span>
                    <span className="pill-title">{step.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Vertical Flowing Impact Journey (<768px) */}
          <div className="orbit-mobile-journey">
            {/* Mobile Impact Hub Banner */}
            <div className="mobile-hub-banner">
              <div className="mobile-hub-img-wrap">
                <img 
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80" 
                  alt="Rural School Impact Hub" 
                  className="mobile-hub-img"
                  loading="lazy"
                />
                <div className="mobile-hub-overlay" />
                <div className="mobile-hub-text">
                  <span className="mobile-hub-badge">IMPACT HUB</span>
                  <h3>Rural School Education</h3>
                  <p>Sustained Community Transformation</p>
                </div>
              </div>
            </div>

            {/* Vertical Connected Timeline Track */}
            <div className="mobile-journey-track">
              <div className="mobile-journey-line" />
              <div className="mobile-journey-list">
                {methodologySteps.map((step, idx) => {
                  const IconComp = step.icon;
                  const isItemActive = activeStageIdx === idx;
                  return (
                    <div 
                      key={step.num} 
                      className={`mobile-journey-item mobile-item-${idx} ${
                        isItemActive ? 'mobile-item-active' : ''
                      }`}
                      onClick={() => setActiveStageIdx(idx)}
                    >
                      <div className="mobile-node-dot">
                        <span className="mobile-node-num">{step.num}</span>
                      </div>
                      <div className="mobile-card-box">
                        <div className="mobile-card-img-wrap">
                          <img src={step.image} alt={step.title} className="mobile-card-img" loading="lazy" />
                          <div className="mobile-card-icon">
                            <IconComp size={16} />
                          </div>
                        </div>
                        <div className="mobile-card-content">
                          <h4 className="mobile-card-title">{step.title}</h4>
                          <p className="mobile-card-desc">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subtle Bottom Sequence Summary */}
          <div className="journey-footer-badge-wrap">
            <div className="journey-footer-badge">
              <span className="footer-badge-dot" />
              <span>Continuous 8-Stage Orbit • Need → Trust → Plan → Partners → Support → Measurement → Sustainability → Scale</span>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Practitioners with Visual Profile Cards & Centered Modal */}
      <section id="leadership" className="section leadership-section bg-white">
        <div className="container">
          <Reveal animation="fade-up" className="section-header">
            <span className="section-badge">Leadership</span>
            <h2 className="section-title">Guiding Minds &amp; Practitioners</h2>
            <p className="section-subtitle">
              Our multidisciplinary team brings together grassroots activists, environmental engineers, and public policy practitioners.
            </p>
          </Reveal>

          <StaggerContainer staggerDelay={120} initialDelay={100} className="leadership-grid">
            {team.map((member, idx) => (
              <StaggerItem key={member.id || idx} index={idx} className="leadership-grid-item">
                <div
                  ref={(el) => { cardRefs.current[idx] = el; }}
                  className="leadership-card"
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-label={`View full profile of ${member.name}, ${member.role}`}
                  onClick={() => openLeaderModal(member, idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLeaderModal(member, idx);
                    }
                  }}
                >
                  {/* Card Photo Frame */}
                  <div className="leadership-photo-frame">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="leadership-photo-img"
                      loading="lazy"
                    />
                    <div className="leadership-photo-overlay" />
                    <div className="leadership-photo-badge">
                      <span className="photo-badge-dot" />
                      <span>Practitioner</span>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="leadership-card-body">
                    <div className="leadership-role-wrap">
                      <span className="leadership-role-tag">{member.role}</span>
                    </div>
                    <h3 className="leadership-member-name">{member.name}</h3>
                    <p className="leadership-member-desc">{member.shortDesc || member.bio}</p>

                    {/* View Profile Affordance */}
                    <div className="leadership-card-footer">
                      <span className="leadership-view-btn">
                        <span>View Profile</span>
                        <ArrowRight size={15} className="view-btn-arrow" />
                      </span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Centered Profile Modal with Fullpage Blur & Dimming */}
        {selectedLeader && (
          <div
            className={`leadership-modal-overlay ${isModalClosing ? 'is-closing' : 'is-open'}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeLeaderModal();
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="leader-modal-title"
            aria-describedby="leader-modal-desc"
          >
            <div
              className={`leadership-modal-dialog ${isModalClosing ? 'dialog-exit' : 'dialog-enter'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top-Right Close Button */}
              <button
                ref={modalCloseBtnRef}
                type="button"
                className="leadership-modal-close"
                onClick={closeLeaderModal}
                aria-label="Close profile modal"
              >
                <X size={20} />
              </button>

              {/* Two-Column Responsive Grid */}
              <div className="leadership-modal-grid">
                {/* Left Column: Large Photo & Summary */}
                <div className="modal-left-col">
                  <div className="modal-photo-wrapper">
                    <img
                      src={selectedLeader.image}
                      alt={selectedLeader.name}
                      className="modal-photo-img"
                    />
                    <div className="modal-photo-glow" />
                  </div>

                  <div className="modal-left-info">
                    <h3 id="leader-modal-title" className="modal-member-name">
                      {selectedLeader.name}
                    </h3>
                    <span className="modal-role-badge">{selectedLeader.role}</span>
                    {selectedLeader.location && (
                      <div className="modal-location-line">
                        <MapPin size={14} className="modal-loc-icon" />
                        <span>{selectedLeader.location}</span>
                      </div>
                    )}
                    {selectedLeader.focusAreas && (
                      <div className="modal-focus-pills">
                        {selectedLeader.focusAreas.map((focus, fIdx) => (
                          <span key={fIdx} className="modal-focus-pill">
                            {focus}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: About, Bio & Contact Information */}
                <div className="modal-right-col">
                  <div className="modal-section-block">
                    <div className="modal-section-label">
                      <span>ABOUT</span>
                    </div>
                    <p id="leader-modal-desc" className="modal-bio-text">
                      {selectedLeader.bio}
                    </p>
                  </div>

                  <div className="modal-divider" />

                  <div className="modal-section-block">
                    <div className="modal-section-label">
                      <span>CONTACT INFORMATION</span>
                    </div>
                    <div className="modal-contacts-list">
                      {selectedLeader.email && (
                        <a
                          href={`mailto:${selectedLeader.email}`}
                          className="modal-contact-item"
                          aria-label={`Send email to ${selectedLeader.name}`}
                        >
                          <div className="contact-icon-box">
                            <Mail size={16} />
                          </div>
                          <div className="contact-text-wrap">
                            <span className="contact-label">Email</span>
                            <span className="contact-value">{selectedLeader.email}</span>
                          </div>
                        </a>
                      )}

                      {selectedLeader.phone && (
                        <a
                          href={`tel:${selectedLeader.phone}`}
                          className="modal-contact-item"
                          aria-label={`Call ${selectedLeader.name}`}
                        >
                          <div className="contact-icon-box">
                            <Phone size={16} />
                          </div>
                          <div className="contact-text-wrap">
                            <span className="contact-label">Phone</span>
                            <span className="contact-value">{selectedLeader.phone}</span>
                          </div>
                        </a>
                      )}

                      {selectedLeader.linkedin && (
                        <a
                          href={selectedLeader.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="modal-contact-item"
                          aria-label={`Visit LinkedIn profile of ${selectedLeader.name}`}
                        >
                          <div className="contact-icon-box contact-icon-linkedin">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                              <rect x="2" y="9" width="4" height="12" />
                              <circle cx="4" cy="4" r="2" />
                            </svg>
                          </div>
                          <div className="contact-text-wrap">
                            <span className="contact-label">LinkedIn</span>
                            <span className="contact-value">Connect on LinkedIn</span>
                          </div>
                          <ExternalLink size={13} className="contact-ext-icon" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .about-page-root {
          position: relative;
          overflow-x: hidden;
        }
        #vision,
        #approach,
        #leadership,
        #impact-in-action,
        .sticky-notes-section,
        .living-flow-section,
        .methodology-section,
        .leadership-section {
          scroll-margin-top: 84px;
        }
        .about-hero {
          position: relative;
          overflow: hidden;
          min-height: 640px;
          height: 75vh;
          max-height: 780px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          background-color: #071D16;
          background-image: url('/images/about-hero.jpg');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 6.5rem 0 5.5rem 0;
        }
        .hero-background-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 0;
          pointer-events: none;
        }
        .hero-dark-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg, 
            rgba(0, 35, 28, 0.62) 0%, 
            rgba(8, 41, 31, 0.56) 50%, 
            rgba(0, 35, 28, 0.72) 100%
          );
          z-index: 1;
          pointer-events: none;
        }
        .hero-ambient-glow {
          position: absolute;
          top: -20%;
          left: 30%;
          width: 900px;
          height: 550px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(15, 76, 58, 0.08) 55%, transparent 80%);
          pointer-events: none;
          z-index: 1;
        }
        .hero-content-relative {
          position: relative;
          z-index: 2;
          width: 100%;
        }
        .about-hero-content-box {
          max-width: 780px;
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .about-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border: 1px solid rgba(52, 211, 153, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.15rem;
          border-radius: var(--radius-pill);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        }
        .badge-sparkle-icon {
          color: #34D399;
        }
        .about-hero-title {
          color: #FFFFFF;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.35rem;
          letter-spacing: -0.025em;
          line-height: 1.16;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
          font-family: var(--font-heading);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
        @media (min-width: 768px) {
          .about-hero-title {
            font-size: 3.35rem;
          }
        }
        @media (min-width: 1200px) {
          .about-hero-title {
            font-size: 3.75rem;
          }
        }
        .about-hero-line {
          display: block;
          position: relative;
          width: 100%;
          line-height: inherit;
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
          font-family: inherit;
        }
        .about-hero-text-static {
          display: inline-block;
          visibility: hidden;
          user-select: none;
          pointer-events: none;
          line-height: inherit;
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
          font-family: inherit;
          white-space: nowrap;
        }
        .about-hero-warp-layer.warp-text {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          min-height: 0;
          margin: 0;
          padding: 0;
          overflow: visible;
          filter: drop-shadow(0 2px 14px rgba(0, 0, 0, 0.45));
        }
        .about-hero-line-2 .about-hero-warp-layer.warp-text {
          filter: drop-shadow(0 2px 14px rgba(57, 217, 138, 0.35));
        }
        .warp-text-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: inline-block;
          white-space: nowrap;
          line-height: inherit;
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
          font-family: inherit;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        .hero-highlight-text {
          color: #39D98A;
          background: linear-gradient(135deg, #6EE7B7 0%, #39D98A 50%, #10B981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          filter: drop-shadow(0 2px 12px rgba(16, 185, 129, 0.35));
        }
        .about-hero-subtitle {
          font-size: 1.18rem;
          color: #E2E8F0;
          max-width: 650px;
          line-height: 1.7;
          font-weight: 400;
          margin-bottom: 2rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        .hero-meta-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .hero-meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: var(--radius-pill);
          padding: 0.5rem 1.15rem;
          font-size: 0.84rem;
          font-weight: 600;
          color: #F8FAFC;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        }
        .meta-pill-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }
        @media (max-width: 768px) {
          .about-hero {
            min-height: 520px;
            height: auto;
            padding: 5.5rem 0 4.5rem 0;
          }
          .about-hero-title {
            font-size: 2.25rem;
          }
          .about-hero-subtitle {
            font-size: 1.05rem;
          }
          .hero-meta-pills {
            gap: 0.65rem;
          }
          .hero-meta-pill {
            font-size: 0.78rem;
            padding: 0.4rem 0.9rem;
          }
        }
        .sticky-notes-section {
          background-color: #FAFCFB;
          position: relative;
          overflow: hidden;
          padding: 5.5rem 0 6.5rem 0;
        }
        .sticky-section-container {
          max-width: 1520px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1.25rem;
        }
        .sticky-section-header {
          margin-bottom: 3.5rem;
        }

        /* Large Editorial Visual Storytelling Composition Stage */
        .vision-mission-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2.25rem;
          width: 100%;
          max-width: 1520px;
          margin: 0 auto;
        }

        /* Large Editorial Flank Photography Panels (Desktop target: 240-300px width, 280-360px height) */
        .editorial-visual-flank {
          flex: 0 0 270px;
          width: 270px;
          position: relative;
          z-index: 2;
          opacity: 0;
          transition: opacity 0.8s var(--ease-out-expo);
          will-change: transform, opacity;
        }
        .flank-left {
          align-self: center;
          margin-top: -1.5rem;
          transform: translateY(28px);
        }
        .flank-right {
          align-self: center;
          margin-top: 1.5rem;
          transform: translateY(28px);
        }
        .flank-left.flank-revealed {
          opacity: 1;
          transform: translateY(0);
          transition: transform 0.85s var(--ease-out-expo) 120ms, opacity 0.75s ease 120ms;
        }
        .flank-right.flank-revealed {
          opacity: 1;
          transform: translateY(0);
          transition: transform 0.85s var(--ease-out-expo) 260ms, opacity 0.75s ease 260ms;
        }

        /* Continuous Slow Floating Layer (7-10s duration, subtle rotation, ease-in-out) */
        .editorial-float-layer {
          width: 100%;
          will-change: transform;
        }
        .flank-left .editorial-float-layer {
          animation: editorialFloatLeft 8.5s ease-in-out infinite;
        }
        .flank-right .editorial-float-layer {
          animation: editorialFloatRight 9.5s ease-in-out infinite;
        }

        @keyframes editorialFloatLeft {
          0%, 100% {
            transform: translateY(-6px) rotate(-3.3deg);
          }
          50% {
            transform: translateY(6px) rotate(-2.7deg);
          }
        }

        @keyframes editorialFloatRight {
          0%, 100% {
            transform: translateY(6px) rotate(3.3deg);
          }
          50% {
            transform: translateY(-6px) rotate(2.7deg);
          }
        }

        /* Editorial Photo Card (Inner Parallax & Hover State) */
        .editorial-photo-card {
          position: relative;
          width: 100%;
          background: #FFFFFF;
          border-radius: 20px;
          padding: 8px 8px 14px 8px;
          box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08), 
                      0 2px 8px -1px rgba(0, 0, 0, 0.03),
                      0 0 0 1px rgba(226, 232, 240, 0.85);
          transform: translate3d(var(--flank-x, 0px), var(--flank-y, 0px), 0) scale(var(--flank-scale, 1));
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.35s ease, 
                      border-color 0.35s ease;
          cursor: default;
        }
        .editorial-photo-left {
          border: 1px solid rgba(16, 185, 129, 0.22);
        }
        .editorial-photo-left:hover {
          box-shadow: 0 16px 36px -6px rgba(15, 23, 42, 0.12),
                      0 0 24px rgba(16, 185, 129, 0.16);
          border-color: rgba(16, 185, 129, 0.45);
        }
        .editorial-photo-right {
          border: 1px solid rgba(37, 99, 235, 0.22);
        }
        .editorial-photo-right:hover {
          box-shadow: 0 16px 36px -6px rgba(15, 23, 42, 0.12),
                      0 0 24px rgba(37, 99, 235, 0.16);
          border-color: rgba(37, 99, 235, 0.45);
        }

        /* Photo Frame — Dominant Editorial Portrait Photography Panel (~3:4 Aspect Ratio) */
        .editorial-photo-frame {
          position: relative;
          width: 100%;
          height: 295px;
          border-radius: 14px;
          overflow: hidden;
          background: #E2E8F0;
        }
        .editorial-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s var(--ease-out-expo);
        }
        .editorial-photo-card:hover .editorial-img {
          transform: scale(1.035);
        }
        .editorial-img-gloss {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
          pointer-events: none;
        }

        /* Corner Pin Accent */
        .editorial-pin-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          pointer-events: none;
        }
        .pin-emerald {
          background: #10B981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
        }
        .pin-blue {
          background: #3B82F6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.7);
        }

        /* Text Meta under Image */
        .editorial-meta {
          margin-top: 0.8rem;
          padding: 0 0.35rem 0.2rem 0.35rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .editorial-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.22rem 0.65rem;
          border-radius: var(--radius-pill);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .badge-emerald {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.24);
        }
        .badge-blue {
          background: rgba(37, 99, 235, 0.1);
          color: #1D4ED8;
          border: 1px solid rgba(37, 99, 235, 0.22);
        }
        .editorial-subline {
          font-size: 0.72rem;
          font-weight: 500;
          color: #64748B;
          margin-top: 0.35rem;
          line-height: 1.35;
          letter-spacing: 0.015em;
          white-space: nowrap;
        }

        /* Central Sticky Notes Container — Unchanged Layout & Proportions */
        .sticky-notes-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3.5rem;
          max-width: 960px;
          flex: 1 1 auto;
          margin: 0 auto;
          padding: 0 0.5rem;
        }
        @media (min-width: 860px) {
          .sticky-notes-container {
            grid-template-columns: 1fr 1fr;
            gap: 3.25rem;
          }
        }
        .sticky-note-wrapper {
          position: relative;
          opacity: 0;
          transition: opacity 0.35s ease, filter 0.35s ease;
          will-change: transform, opacity;
        }
        /* Entrance animation states */
        .sticky-vision-wrapper {
          transform: translateY(40px) rotate(-4deg);
        }
        .sticky-mission-wrapper {
          transform: translateY(40px) rotate(4deg);
        }
        .sticky-vision-wrapper.sticky-revealed {
          opacity: 1;
          transform: translateY(0) rotate(0deg);
          transition: transform 0.8s var(--ease-out-expo) 100ms, opacity 0.75s var(--ease-out-expo) 100ms;
        }
        .sticky-mission-wrapper.sticky-revealed {
          opacity: 1;
          transform: translateY(0) rotate(0deg);
          transition: transform 0.8s var(--ease-out-expo) 250ms, opacity 0.75s var(--ease-out-expo) 250ms;
        }
        /* Card focus / dimming interaction */
        .sticky-note-wrapper.is-dimmed {
          opacity: 0.92;
          filter: contrast(0.98);
        }
        .sticky-note-wrapper.is-focused {
          opacity: 1;
          z-index: 10;
        }
        /* Sticky Note Card Base */
        .sticky-note-card {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1.65rem 1.65rem 1.85rem 1.65rem;
          border-radius: 18px 24px 18px 22px;
          box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.04), 
                      0 16px 36px -8px rgba(15, 23, 42, 0.09), 
                      0 1px 3px rgba(0, 0, 0, 0.02);
          transition: transform 0.45s var(--ease-out-expo), 
                      box-shadow 0.45s var(--ease-out-expo), 
                      border-color 0.45s var(--ease-out-expo),
                      background-color 0.45s ease;
          cursor: pointer;
          will-change: transform, box-shadow;
        }
        /* Vision Card specifics */
        .sticky-card-vision {
          background: linear-gradient(175deg, #FEFDFB 0%, #F5FBF7 48%, #ECF6F0 100%);
          border: 1px solid rgba(16, 185, 129, 0.22);
          transform: rotate(-1.5deg);
        }
        .sticky-vision-wrapper:hover .sticky-card-vision {
          box-shadow: 0 12px 24px -4px rgba(15, 23, 42, 0.08), 
                      0 32px 64px -12px rgba(15, 23, 42, 0.18), 
                      0 0 35px rgba(16, 185, 129, 0.16);
          border-color: rgba(16, 185, 129, 0.45);
        }
        /* Mission Card specifics */
        .sticky-card-blue {
          background: linear-gradient(175deg, #FEFDFB 0%, #F4F8FD 48%, #E9F2FB 100%);
          border: 1px solid rgba(37, 99, 235, 0.22);
          transform: rotate(1.5deg);
          border-radius: 24px 18px 22px 18px;
        }
        .sticky-mission-wrapper:hover .sticky-card-blue {
          box-shadow: 0 12px 24px -4px rgba(15, 23, 42, 0.08), 
                      0 32px 64px -12px rgba(15, 23, 42, 0.18), 
                      0 0 35px rgba(37, 99, 235, 0.16);
          border-color: rgba(37, 99, 235, 0.45);
        }
        /* Washi Tape Accent */
        .washi-tape {
          position: absolute;
          top: -14px;
          left: 50%;
          width: 130px;
          height: 30px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border-radius: 2px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
          pointer-events: none;
          z-index: 5;
        }
        .washi-tape-emerald {
          transform: translateX(-50%) rotate(-1.5deg);
          background: rgba(16, 185, 129, 0.28);
          border-left: 2px dashed rgba(5, 150, 105, 0.38);
          border-right: 2px dashed rgba(5, 150, 105, 0.38);
        }
        .washi-tape-blue {
          transform: translateX(-50%) rotate(2deg);
          background: rgba(37, 99, 235, 0.25);
          border-left: 2px dashed rgba(29, 78, 216, 0.38);
          border-right: 2px dashed rgba(29, 78, 216, 0.38);
        }
        /* Subtle corner fold accent */
        .sticky-corner-fold {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, transparent 50%, rgba(15, 23, 42, 0.05) 50%, rgba(15, 23, 42, 0.02) 100%);
          border-bottom-right-radius: 18px;
          pointer-events: none;
        }
        /* Sticky Image Frame */
        .sticky-image-frame {
          position: relative;
          width: 100%;
          height: 215px;
          border-radius: 13px;
          overflow: hidden;
          margin-bottom: 1.4rem;
          background: #E2E8F0;
        }
        .sticky-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s var(--ease-out-expo), filter 0.5s ease;
        }
        .sticky-note-wrapper:hover .sticky-card-img {
          transform: scale(1.04);
          filter: brightness(1.03);
        }
        .sticky-image-overlay {
          position: absolute;
          inset: 0;
          border-radius: 13px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
          pointer-events: none;
        }
        /* Sticky Content */
        .sticky-content-body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .sticky-tag-wrapper {
          margin-bottom: 0.85rem;
        }
        .sticky-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-pill);
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .tag-emerald {
          background: rgba(16, 185, 129, 0.14);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.28);
        }
        .tag-blue {
          background: rgba(37, 99, 235, 0.12);
          color: #1D4ED8;
          border: 1px solid rgba(37, 99, 235, 0.25);
        }
        .sticky-tag-icon {
          flex-shrink: 0;
        }
        .sticky-statement {
          font-size: 1.32rem;
          font-weight: 800;
          color: var(--slate-900);
          line-height: 1.38;
          margin-bottom: 0.75rem;
          letter-spacing: -0.015em;
          font-family: var(--font-heading);
        }
        .sticky-desc {
          font-size: 0.94rem;
          color: #475569;
          line-height: 1.65;
          margin-bottom: 1.35rem;
          flex: 1;
        }
        .sticky-footer {
          padding-top: 1rem;
          border-top: 1px dashed rgba(203, 213, 225, 0.75);
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
        .sticky-pillar-tag {
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.25rem 0.7rem;
          border-radius: var(--radius-pill);
        }
        .pillar-emerald {
          background: rgba(16, 185, 129, 0.1);
          color: #065F46;
        }
        .pillar-blue {
          background: rgba(37, 99, 235, 0.1);
          color: #1E40AF;
        }
        @media (max-width: 1360px) and (min-width: 1080px) {
          .vision-mission-stage {
            gap: 1.5rem;
          }
          .editorial-visual-flank {
            flex: 0 0 220px;
            width: 220px;
          }
          .editorial-photo-frame {
            height: 250px;
          }
          .sticky-notes-container {
            max-width: 820px;
            gap: 2.25rem;
          }
        }
        @media (max-width: 1079px) and (min-width: 768px) {
          .vision-mission-stage {
            flex-direction: column;
            align-items: center;
            gap: 2.5rem;
          }
          .editorial-visual-flank {
            flex: 0 0 auto;
            width: 260px;
          }
          .editorial-photo-frame {
            height: 280px;
          }
          .flank-left {
            align-self: flex-start;
            margin: 0 0 0 1.5rem;
          }
          .flank-right {
            align-self: flex-end;
            margin: 0 1.5rem 0 0;
          }
          .sticky-notes-container {
            width: 100%;
            max-width: 760px;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }
        @media (max-width: 767px) {
          .vision-mission-stage {
            flex-direction: column;
            align-items: center;
            gap: 2.25rem;
          }
          .editorial-visual-flank {
            flex: 0 0 auto;
            width: 100%;
            max-width: 280px;
            align-self: center;
            margin: 0 auto;
          }
          .editorial-photo-frame {
            height: 280px;
          }
          .flank-left {
            margin-bottom: 0.25rem;
          }
          .flank-right {
            margin-top: 0.25rem;
          }
          .sticky-notes-container {
            width: 100%;
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .sticky-card-vision {
            transform: rotate(-0.75deg);
          }
          .sticky-card-blue {
            transform: rotate(0.75deg);
          }
          .sticky-image-frame {
            height: 200px;
          }
        }

        /* ================================================================ */
        /* LIVING IMPACT FLOW — Continuous Dynamic Transition Section       */
        /* ================================================================ */
        .living-flow-section {
          padding: 4.5rem 0 3.5rem 0;
          position: relative;
          background: #FFFFFF;
          overflow: hidden;
        }
        .living-flow-header {
          margin-bottom: 3.25rem;
        }

        /* Desktop Living Flow Stage Viewport (85-90% width of desktop screen) */
        .living-flow-viewport {
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          --flow-cpx: 0px;
          --flow-cpy: 0px;
          --flow-crotx: 0deg;
          --flow-croty: 0deg;
        }
        .living-flow-stage {
          position: relative;
          width: 1160px;
          height: 1040px;
          margin: 0 auto;
        }

        /* 4 Large Flow Cards (Matching Vision & Mission Dimensions: ~465px wide × ~435px high) */
        .flow-card-node {
          position: absolute;
          width: 465px;
          height: 435px;
          z-index: 5;
          cursor: pointer;
          will-change: transform;
        }
        .flow-pos-0 {
          left: 25px;
          top: 15px;
        }
        .flow-pos-1 {
          left: 670px;
          top: 105px;
        }
        .flow-pos-2 {
          left: 25px;
          top: 520px;
        }
        .flow-pos-3 {
          left: 670px;
          top: 610px;
        }

        /* Independent Continuous Floating Motion Keyframes (Unsynchronized) */
        .flow-float-0 {
          animation: floatFlow0 6.0s ease-in-out infinite;
        }
        .flow-float-1 {
          animation: floatFlow1 7.0s ease-in-out infinite 0.7s;
        }
        .flow-float-2 {
          animation: floatFlow2 7.5s ease-in-out infinite 1.4s;
        }
        .flow-float-3 {
          animation: floatFlow3 6.5s ease-in-out infinite 0.5s;
        }

        @keyframes floatFlow0 {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes floatFlow1 {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(7px);
          }
        }
        @keyframes floatFlow2 {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes floatFlow3 {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(7px);
          }
        }

        /* Parallax Layer (Receives cursor transform via CSS variables) */
        .flow-card-parallax-wrap {
          width: 100%;
          height: 100%;
          transform: translate3d(var(--flow-cpx, 0px), var(--flow-cpy, 0px), 0)
                     rotateX(var(--flow-crotx, 0deg))
                     rotateY(var(--flow-croty, 0deg));
          transition: transform 0.2s ease-out;
          will-change: transform;
        }

        /* Card Inner Component (Matching Vision/Mission Card Styling & Proportions) */
        .flow-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(175deg, #FEFDFB 0%, #F5FBF7 48%, #ECF6F0 100%);
          border: 1px solid rgba(16, 185, 129, 0.22);
          border-radius: 18px 24px 18px 22px;
          box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.04), 
                      0 16px 36px -8px rgba(15, 23, 42, 0.09), 
                      0 1px 3px rgba(0, 0, 0, 0.02);
          padding: 1.5rem 1.5rem 1.65rem 1.5rem;
          display: flex;
          flex-direction: column;
          overflow: visible;
          transform: translateY(0) scale(1);
          transition: transform 0.4s var(--ease-out-expo),
                      box-shadow 0.4s var(--ease-out-expo),
                      border-color 0.4s var(--ease-out-expo);
          will-change: transform, box-shadow;
        }

        /* Automatic Active Stage Emphasis (Subtle scale 1.03, rich emerald glow) */
        .flow-card-inner.is-active-flow-card {
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 12px 28px -4px rgba(16, 185, 129, 0.22), 
                      0 24px 50px -10px rgba(15, 23, 42, 0.12), 
                      0 0 25px rgba(16, 185, 129, 0.15);
          transform: translateY(-4px) scale(1.03);
        }
        .flow-card-inner.is-active-flow-card .flow-card-num-badge {
          background: #10B981;
          color: white;
          transform: scale(1.06);
        }
        .flow-card-inner.is-active-flow-card .flow-card-icon-badge {
          background: #10B981;
          color: white;
          transform: scale(1.08) rotate(4deg);
        }

        /* Hover Interaction (Subtle 1.035 max) */
        .flow-card-node:hover .flow-card-inner,
        .flow-card-inner.is-hovered-flow-card {
          transform: translateY(-6px) scale(1.035);
          border-color: rgba(16, 185, 129, 0.65);
          box-shadow: 0 16px 32px -4px rgba(15, 23, 42, 0.12), 
                      0 32px 64px -12px rgba(15, 23, 42, 0.18), 
                      0 0 30px rgba(16, 185, 129, 0.2);
          z-index: 10;
        }

        /* Prominent Large Image Frame (215px high, identical to Vision/Mission .sticky-image-frame) */
        .flow-card-img-wrap {
          position: relative;
          width: 100%;
          height: 215px;
          border-radius: 13px;
          overflow: hidden;
          margin-bottom: 1.2rem;
          background: #E2E8F0;
        }
        .flow-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          animation: flowImgBreathe 8s ease-in-out infinite alternate;
          transition: transform 0.5s var(--ease-out-expo), filter 0.5s ease;
        }
        @keyframes flowImgBreathe {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.03);
          }
        }
        .flow-card-node:hover .flow-card-img {
          transform: scale(1.04);
          filter: brightness(1.04);
        }
        .flow-card-img-overlay {
          position: absolute;
          inset: 0;
          border-radius: 13px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
          pointer-events: none;
        }
        .flow-card-num-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(15, 23, 42, 0.88);
          color: #34D399;
          font-family: var(--font-heading);
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.22rem 0.6rem;
          border-radius: 7px;
          border: 1px solid rgba(52, 211, 153, 0.4);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
          z-index: 2;
        }
        .flow-card-icon-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0F4C3A;
          color: #34D399;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FFFFFF;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          z-index: 2;
        }

        /* Card Content Body (Matching Vision/Mission typography) */
        .flow-card-content-body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .flow-card-tag-wrapper {
          margin-bottom: 0.65rem;
        }
        .flow-card-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.28rem 0.75rem;
          border-radius: var(--radius-pill);
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: rgba(16, 185, 129, 0.14);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.28);
          font-family: var(--font-heading);
        }
        .flow-tag-icon {
          flex-shrink: 0;
        }
        .flow-card-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--slate-900);
          line-height: 1.35;
          margin-bottom: 0.45rem;
          letter-spacing: -0.015em;
          font-family: var(--font-heading);
        }
        .flow-card-desc {
          font-size: 0.92rem;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        /* Mobile Living Flow (<768px) */
        .living-flow-mobile {
          display: none;
        }

        @media (max-width: 1240px) and (min-width: 1024px) {
          .living-flow-stage {
            width: 980px;
            height: 980px;
          }
          .flow-card-node {
            width: 415px;
            height: 405px;
          }
          .flow-card-img-wrap {
            height: 195px;
          }
          .flow-card-title {
            font-size: 1.15rem;
          }
          .flow-card-desc {
            font-size: 0.88rem;
          }
          .flow-pos-0 { left: 15px; top: 15px; }
          .flow-pos-1 { left: 550px; top: 95px; }
          .flow-pos-2 { left: 15px; top: 485px; }
          .flow-pos-3 { left: 550px; top: 565px; }
        }

        @media (max-width: 1023px) and (min-width: 768px) {
          .living-flow-stage {
            width: 720px;
            height: 900px;
          }
          .flow-card-node {
            width: 325px;
            height: 375px;
          }
          .flow-card-inner {
            padding: 1.2rem 1.2rem 1.35rem 1.2rem;
          }
          .flow-card-img-wrap {
            height: 170px;
            margin-bottom: 0.9rem;
          }
          .flow-card-title {
            font-size: 1.05rem;
          }
          .flow-card-desc {
            font-size: 0.82rem;
            line-height: 1.5;
          }
          .flow-pos-0 {
            left: 10px;
            top: 10px;
          }
          .flow-pos-1 {
            left: 385px;
            top: 80px;
          }
          .flow-pos-2 {
            left: 10px;
            top: 445px;
          }
          .flow-pos-3 {
            left: 385px;
            top: 515px;
          }
        }

        @media (max-width: 767px) {
          .living-flow-viewport {
            display: none;
          }
          .living-flow-mobile {
            display: block;
            width: 100%;
          }
          .flow-mobile-track {
            position: relative;
            padding-left: 2.25rem;
          }
          .flow-mobile-line {
            position: absolute;
            top: 15px;
            bottom: 15px;
            left: 15px;
            width: 2px;
            background: rgba(16, 185, 129, 0.25);
            border-radius: 2px;
          }
          .flow-mobile-pulse {
            position: absolute;
            top: 15px;
            left: 14px;
            width: 4px;
            height: 24px;
            border-radius: 4px;
            background: #10B981;
            box-shadow: 0 0 10px #10B981;
            animation: flowMobileLineTravel 4s ease-in-out infinite;
          }
          @keyframes flowMobileLineTravel {
            0% {
              top: 15px;
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
            100% {
              top: calc(100% - 39px);
              opacity: 0.3;
            }
          }
          .flow-mobile-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .flow-mobile-item {
            position: relative;
            display: flex;
            align-items: flex-start;
            cursor: pointer;
          }
          .flow-mobile-float-0 { animation: floatFlow0 5.5s ease-in-out infinite; }
          .flow-mobile-float-1 { animation: floatFlow1 6.5s ease-in-out infinite; }
          .flow-mobile-float-2 { animation: floatFlow2 7.0s ease-in-out infinite; }
          .flow-mobile-float-3 { animation: floatFlow3 6.0s ease-in-out infinite; }
          
          .flow-mobile-dot {
            position: absolute;
            left: -2.25rem;
            top: 14px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #FFFFFF;
            border: 2px solid #10B981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            transition: all 0.3s ease;
          }
          .flow-mobile-dot span {
            font-size: 0.72rem;
            font-weight: 800;
            color: #047857;
            font-family: var(--font-heading);
          }
          .flow-mobile-item-active .flow-mobile-dot {
            background: #10B981;
            transform: scale(1.15);
            box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.35);
          }
          .flow-mobile-item-active .flow-mobile-dot span {
            color: white;
          }
          .flow-mobile-card {
            flex: 1;
            background: linear-gradient(175deg, #FEFDFB 0%, #F5FBF7 48%, #ECF6F0 100%);
            border-radius: 18px;
            border: 1px solid rgba(16, 185, 129, 0.22);
            box-shadow: var(--shadow-sm);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
          }
          .flow-mobile-item-active .flow-mobile-card {
            border-color: rgba(16, 185, 129, 0.7);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
          }
          .flow-mobile-img-wrap {
            position: relative;
            width: 100%;
            height: 180px;
            background: #E2E8F0;
          }
          .flow-mobile-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .flow-mobile-icon-badge {
            position: absolute;
            bottom: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #0F4C3A;
            color: #34D399;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #FFFFFF;
          }
          .flow-mobile-card-body {
            padding: 1.1rem 1.15rem 1.25rem 1.15rem;
            display: flex;
            flex-direction: column;
          }
          .flow-mobile-tag-wrap {
            margin-bottom: 0.5rem;
          }
          .flow-mobile-category {
            display: inline-flex;
            font-size: 0.68rem;
            color: #047857;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            background: rgba(16, 185, 129, 0.12);
            padding: 0.2rem 0.6rem;
            border-radius: var(--radius-pill);
            border: 1px solid rgba(16, 185, 129, 0.25);
            font-family: var(--font-heading);
          }
          .flow-mobile-title {
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--slate-900);
            margin: 0 0 0.35rem 0;
            font-family: var(--font-heading);
          }
          .flow-mobile-desc {
            font-size: 0.85rem;
            color: #475569;
            margin: 0;
            line-height: 1.55;
          }
        }

        .methodology-section {
          padding: 5.5rem 0 6.5rem 0;
          position: relative;
          overflow: hidden;
          background: #FAFCFB;
        }
        .methodology-ambient-aura {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.75;
          will-change: transform;
        }
        .methodology-ambient-aura-1 {
          top: 10%;
          left: 2%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.02) 70%, transparent 100%);
          animation: auraDrift1 14s ease-in-out infinite alternate;
        }
        .methodology-ambient-aura-2 {
          bottom: 8%;
          right: 2%;
          width: 540px;
          height: 540px;
          background: radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, rgba(16, 185, 129, 0.02) 70%, transparent 100%);
          animation: auraDrift2 18s ease-in-out infinite alternate;
        }
        @keyframes auraDrift1 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(35px, 25px) scale(1.08);
          }
        }
        @keyframes auraDrift2 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(-30px, -25px) scale(1.1);
          }
        }
        .relative-z-2 {
          position: relative;
          z-index: 2;
        }
        .methodology-header {
          margin-bottom: 3.5rem;
        }

        /* 3D Orbit Viewport & Stage */
        .orbit-system-viewport {
          position: relative;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .orbit-3d-stage {
          position: relative;
          width: 1040px;
          height: 580px;
          transform-style: preserve-3d;
          will-change: transform;
          transition: transform 0.15s ease-out;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* SVG Elliptical Track */
        .orbit-svg-track {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          overflow: visible;
        }
        .orbit-ellipse-line {
          fill: none;
          stroke: rgba(16, 185, 129, 0.18);
          stroke-width: 2px;
        }
        .orbit-ellipse-dashed {
          fill: none;
          stroke: rgba(16, 185, 129, 0.45);
          stroke-width: 2px;
          stroke-dasharray: 8 12;
          stroke-linecap: round;
          animation: orbitDashMove 30s linear infinite;
        }
        @keyframes orbitDashMove {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -400;
          }
        }

        /* Central Impact Hub Focal Point */
        .impact-hub-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 180px;
          height: 180px;
          z-index: 10;
          transform-style: preserve-3d;
          pointer-events: auto;
          will-change: transform;
        }
        .hub-outer-ring {
          border-radius: 50%;
          pointer-events: none;
        }
        .hub-outer-ring-1 {
          position: absolute;
          inset: -24px;
          border: 1.5px dashed rgba(16, 185, 129, 0.38);
          animation: hubRingRotateCW 35s linear infinite;
        }
        .hub-outer-ring-2 {
          position: absolute;
          inset: -48px;
          border: 1px dotted rgba(52, 211, 153, 0.25);
          animation: hubRingRotateCCW 45s linear infinite;
        }
        @keyframes hubRingRotateCW {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes hubRingRotateCCW {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .hub-core-card {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #10B981;
          box-shadow: 0 0 32px rgba(16, 185, 129, 0.28), 0 16px 36px rgba(0, 0, 0, 0.22);
          animation: hubBreathe 6s ease-in-out infinite alternate;
          background: #08291F;
        }
        @keyframes hubBreathe {
          0% {
            transform: scale(1);
            box-shadow: 0 0 24px rgba(16, 185, 129, 0.22), 0 14px 28px rgba(0, 0, 0, 0.18);
          }
          100% {
            transform: scale(1.02);
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.38), 0 20px 40px rgba(0, 0, 0, 0.26);
          }
        }
        .hub-core-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hub-core-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(7, 29, 22, 0.45) 0%, rgba(7, 29, 22, 0.88) 100%);
        }
        .hub-core-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0.9rem;
          color: white;
          z-index: 2;
        }
        .hub-core-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(16, 185, 129, 0.32);
          border: 1px solid rgba(52, 211, 153, 0.55);
          padding: 0.18rem 0.55rem;
          border-radius: var(--radius-pill);
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #34D399;
          margin-bottom: 0.25rem;
        }
        .hub-sparkle-icon {
          color: #34D399;
        }
        .hub-core-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.15;
          margin: 0 0 0.15rem 0;
          font-family: var(--font-heading);
          letter-spacing: -0.01em;
        }
        .hub-core-subtitle {
          font-size: 0.68rem;
          color: #CBD5E1;
          line-height: 1.25;
          max-width: 130px;
          font-weight: 500;
          margin: 0;
        }

        /* 8 Orbiting Stage Cards System */
        .orbit-cards-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .orbit-card-node {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 160px;
          height: 132px;
          margin-top: -66px;
          margin-left: -80px;
          transform-style: preserve-3d;
          will-change: transform, opacity;
          pointer-events: auto;
          cursor: pointer;
          transition: opacity 0.35s ease;
        }

        /* 8 Continuous 3D Elliptical Orbit Keyframes (28s loop, Rx=400px, Ry=215px) */
        @keyframes orbitLoop_0 {
          0%    { transform: translate3d(400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          12.5% { transform: translate3d(283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          25%   { transform: translate3d(0px, 215px, 28px) scale(1.04); z-index: 16; opacity: 1; }
          37.5% { transform: translate3d(-283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          50%   { transform: translate3d(-400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          62.5% { transform: translate3d(-283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          75%   { transform: translate3d(0px, -215px, -26px) scale(0.90); z-index: 2; opacity: 0.84; }
          87.5% { transform: translate3d(283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          100%  { transform: translate3d(400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
        }
        @keyframes orbitLoop_1 {
          0%    { transform: translate3d(283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          12.5% { transform: translate3d(0px, 215px, 28px) scale(1.04); z-index: 16; opacity: 1; }
          25%   { transform: translate3d(-283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          37.5% { transform: translate3d(-400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          50%   { transform: translate3d(-283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          62.5% { transform: translate3d(0px, -215px, -26px) scale(0.90); z-index: 2; opacity: 0.84; }
          75%   { transform: translate3d(283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          87.5% { transform: translate3d(400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          100%  { transform: translate3d(283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
        }
        @keyframes orbitLoop_2 {
          0%    { transform: translate3d(0px, 215px, 28px) scale(1.04); z-index: 16; opacity: 1; }
          12.5% { transform: translate3d(-283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          25%   { transform: translate3d(-400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          37.5% { transform: translate3d(-283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          50%   { transform: translate3d(0px, -215px, -26px) scale(0.90); z-index: 2; opacity: 0.84; }
          62.5% { transform: translate3d(283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          75%   { transform: translate3d(400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          87.5% { transform: translate3d(283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          100%  { transform: translate3d(0px, 215px, 28px) scale(1.04); z-index: 16; opacity: 1; }
        }
        @keyframes orbitLoop_3 {
          0%    { transform: translate3d(-283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          12.5% { transform: translate3d(-400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          25%   { transform: translate3d(-283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          37.5% { transform: translate3d(0px, -215px, -26px) scale(0.90); z-index: 2; opacity: 0.84; }
          50%   { transform: translate3d(283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          62.5% { transform: translate3d(400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          75%   { transform: translate3d(283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          87.5% { transform: translate3d(0px, 215px, 28px) scale(1.04); z-index: 16; opacity: 1; }
          100%  { transform: translate3d(-283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
        }
        @keyframes orbitLoop_4 {
          0%    { transform: translate3d(-400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          12.5% { transform: translate3d(-283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          25%   { transform: translate3d(0px, -215px, -26px) scale(0.90); z-index: 2; opacity: 0.84; }
          37.5% { transform: translate3d(283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          50%   { transform: translate3d(400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          62.5% { transform: translate3d(283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          75%   { transform: translate3d(0px, 215px, 28px) scale(1.04); z-index: 16; opacity: 1; }
          87.5% { transform: translate3d(-283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          100%  { transform: translate3d(-400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
        }
        @keyframes orbitLoop_5 {
          0%    { transform: translate3d(-283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          12.5% { transform: translate3d(0px, -215px, -26px) scale(0.90); z-index: 2; opacity: 0.84; }
          25%   { transform: translate3d(283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          37.5% { transform: translate3d(400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          50%   { transform: translate3d(283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          62.5% { transform: translate3d(0px, 215px, 28px) scale(1.04); z-index: 16; opacity: 1; }
          75%   { transform: translate3d(-283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          87.5% { transform: translate3d(-400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          100%  { transform: translate3d(-283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
        }
        @keyframes orbitLoop_6 {
          0%    { transform: translate3d(0px, -215px, -26px) scale(0.90); z-index: 2; opacity: 0.84; }
          12.5% { transform: translate3d(283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          25%   { transform: translate3d(400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          37.5% { transform: translate3d(283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          50%   { transform: translate3d(0px, 215px, 28px) scale(1.04); z-index: 16; opacity: 1; }
          62.5% { transform: translate3d(-283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          75%   { transform: translate3d(-400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          87.5% { transform: translate3d(-283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          100%  { transform: translate3d(0px, -215px, -26px) scale(0.90); z-index: 2; opacity: 0.84; }
        }
        @keyframes orbitLoop_7 {
          0%    { transform: translate3d(283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          12.5% { transform: translate3d(400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          25%   { transform: translate3d(283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          37.5% { transform: translate3d(0px, 215px, 28px) scale(1.04); z-index: 16; opacity: 1; }
          50%   { transform: translate3d(-283px, 152px, 18px) scale(1.02); z-index: 12; opacity: 1; }
          62.5% { transform: translate3d(-400px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          75%   { transform: translate3d(-283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
          87.5% { transform: translate3d(0px, -215px, -26px) scale(0.90); z-index: 2; opacity: 0.84; }
          100%  { transform: translate3d(283px, -152px, -18px) scale(0.92); z-index: 4; opacity: 0.88; }
        }

        .orbit-card-pos-0 { animation: orbitLoop_0 28s linear infinite; }
        .orbit-card-pos-1 { animation: orbitLoop_1 28s linear infinite; }
        .orbit-card-pos-2 { animation: orbitLoop_2 28s linear infinite; }
        .orbit-card-pos-3 { animation: orbitLoop_3 28s linear infinite; }
        .orbit-card-pos-4 { animation: orbitLoop_4 28s linear infinite; }
        .orbit-card-pos-5 { animation: orbitLoop_5 28s linear infinite; }
        .orbit-card-pos-6 { animation: orbitLoop_6 28s linear infinite; }
        .orbit-card-pos-7 { animation: orbitLoop_7 28s linear infinite; }

        /* Orbit Pause on Hover */
        .orbit-3d-stage.orbit-is-paused .orbit-card-node {
          animation-play-state: paused !important;
        }

        /* Layered Hover and Active State Architecture (NO transform overrides on .orbit-card-node) */
        .orbit-card-node:hover,
        .orbit-card-node.is-hovered-orbit-stage {
          z-index: 50 !important;
        }
        .orbit-card-node.is-dimmed-orbit-stage {
          opacity: 0.72;
        }

        /* Card Inner Elements (All hover/active transforms applied HERE exclusively) */
        .orbit-card-inner {
          width: 100%;
          height: 100%;
          border-radius: 15px;
          background: #FFFFFF;
          border: 1.5px solid rgba(226, 232, 240, 0.95);
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.09);
          overflow: visible;
          display: flex;
          flex-direction: column;
          transform: translateY(0) scale(1);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.3s ease, 
                      border-color 0.3s ease;
          will-change: transform, box-shadow;
        }

        /* Active stage styling on inner card (subtle scale ~1.05 max) */
        .orbit-card-node.is-active-orbit-stage .orbit-card-inner {
          border-color: rgba(52, 211, 153, 0.95);
          box-shadow: 0 12px 28px -4px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.2);
          transform: scale(1.05);
        }
        .orbit-card-node.is-active-orbit-stage .orbit-card-num-badge {
          background: #10B981;
          color: white;
          transform: scale(1.04);
        }
        .orbit-card-node.is-active-orbit-stage .orbit-card-icon-badge {
          background: #10B981;
          color: white;
          transform: scale(1.08) rotate(4deg);
        }

        /* Hover elevation on inner card (subtle lift + max scale 1.04) */
        .orbit-card-node:hover .orbit-card-inner,
        .orbit-card-node.is-hovered-orbit-stage .orbit-card-inner {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 18px 36px -6px rgba(16, 185, 129, 0.35), 0 0 22px rgba(16, 185, 129, 0.25);
          border-color: #34D399;
        }
        .orbit-card-node.is-active-orbit-stage:hover .orbit-card-inner {
          transform: translateY(-4px) scale(1.05);
        }

        .orbit-card-img-wrap {
          position: relative;
          width: 100%;
          height: 98px;
          border-radius: 13px 13px 0 0;
          overflow: hidden;
          background: #08291F;
        }
        .orbit-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease, filter 0.3s ease;
        }
        .orbit-card-node:hover .orbit-card-img {
          filter: brightness(1.06);
        }
        .orbit-card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(7, 29, 22, 0.45) 100%);
        }
        .orbit-card-num-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: rgba(15, 23, 42, 0.85);
          color: #34D399;
          font-family: var(--font-heading);
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
          border: 1px solid rgba(52, 211, 153, 0.3);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
          z-index: 2;
        }
        .orbit-card-icon-badge {
          position: absolute;
          bottom: -7px;
          right: 7px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0F4C3A;
          color: #34D399;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          z-index: 3;
        }
        .orbit-card-label-box {
          padding: 0.45rem 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #FFFFFF;
          border-radius: 0 0 13px 13px;
        }
        .orbit-card-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--slate-900);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        /* Hover Tooltip Popover */
        .orbit-card-tooltip {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          opacity: 0;
          pointer-events: none;
          width: 210px;
          background: rgba(7, 29, 22, 0.95);
          color: white;
          padding: 0.55rem 0.8rem;
          border-radius: 10px;
          font-size: 0.74rem;
          line-height: 1.35;
          text-align: center;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.32);
          border: 1px solid rgba(16, 185, 129, 0.5);
          backdrop-filter: blur(8px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          z-index: 100;
        }
        .tooltip-step-num {
          display: block;
          font-size: 0.64rem;
          font-weight: 800;
          color: #34D399;
          letter-spacing: 0.08em;
          margin-bottom: 0.15rem;
        }
        .orbit-card-tooltip-desc {
          margin: 0;
          color: #E2E8F0;
        }
        .orbit-card-node:hover .orbit-card-tooltip,
        .orbit-card-node.is-hovered-orbit-stage .orbit-card-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          pointer-events: auto;
        }

        /* Active Timeline Navigation Pills */
        .orbit-timeline-nav {
          width: 100%;
          margin-top: 2rem;
          display: flex;
          justify-content: center;
        }
        .orbit-timeline-pills {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
        }
        .orbit-nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.9rem;
          border-radius: var(--radius-pill);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--slate-700);
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: var(--shadow-sm);
        }
        .orbit-nav-pill:hover,
        .orbit-nav-pill.is-active-pill {
          background: #0F4C3A;
          color: #FFFFFF;
          border-color: #10B981;
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(16, 185, 129, 0.25);
        }
        .pill-num {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          font-weight: 800;
          background: rgba(16, 185, 129, 0.15);
          color: #047857;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }
        .orbit-nav-pill.is-active-pill .pill-num {
          background: #10B981;
          color: white;
        }
        .pill-title {
          font-weight: 600;
        }

        /* Bottom Journey Summary Badge */
        .journey-footer-badge-wrap {
          display: flex;
          justify-content: center;
          margin-top: 3rem;
        }
        .journey-footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.55rem 1.35rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-pill);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--slate-700);
          box-shadow: var(--shadow-sm);
        }
        .footer-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-pill);
          background: #10B981;
        }

        /* Mobile Flowing Journey (<768px) */
        .orbit-mobile-journey {
          display: none;
        }

        @media (max-width: 1023px) and (min-width: 768px) {
          .orbit-3d-stage {
            width: 760px;
            height: 460px;
          }
          .orbit-card-node {
            width: 130px;
            height: 108px;
            margin-top: -54px;
            margin-left: -65px;
          }
          .orbit-card-img-wrap {
            height: 78px;
          }
          .orbit-card-title {
            font-size: 0.74rem;
          }
          .impact-hub-center {
            width: 155px;
            height: 155px;
          }
          .hub-core-title {
            font-size: 0.98rem;
          }
          .hub-core-subtitle {
            font-size: 0.64rem;
            max-width: 115px;
          }

          /* Tablet Keyframe scaling (Rx=300px, Ry=160px) */
          @keyframes orbitLoop_0 {
            0%    { transform: translate3d(300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            12.5% { transform: translate3d(212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            25%   { transform: translate3d(0px, 160px, 22px) scale(1.04); z-index: 16; opacity: 1; }
            37.5% { transform: translate3d(-212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            50%   { transform: translate3d(-300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            62.5% { transform: translate3d(-212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            75%   { transform: translate3d(0px, -160px, -20px) scale(0.90); z-index: 2; opacity: 0.84; }
            87.5% { transform: translate3d(212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            100%  { transform: translate3d(300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          }
          @keyframes orbitLoop_1 {
            0%    { transform: translate3d(212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            12.5% { transform: translate3d(0px, 160px, 22px) scale(1.04); z-index: 16; opacity: 1; }
            25%   { transform: translate3d(-212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            37.5% { transform: translate3d(-300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            50%   { transform: translate3d(-212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            62.5% { transform: translate3d(0px, -160px, -20px) scale(0.90); z-index: 2; opacity: 0.84; }
            75%   { transform: translate3d(212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            87.5% { transform: translate3d(300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            100%  { transform: translate3d(212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
          }
          @keyframes orbitLoop_2 {
            0%    { transform: translate3d(0px, 160px, 22px) scale(1.04); z-index: 16; opacity: 1; }
            12.5% { transform: translate3d(-212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            25%   { transform: translate3d(-300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            37.5% { transform: translate3d(-212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            50%   { transform: translate3d(0px, -160px, -20px) scale(0.90); z-index: 2; opacity: 0.84; }
            62.5% { transform: translate3d(212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            75%   { transform: translate3d(300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            87.5% { transform: translate3d(212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            100%  { transform: translate3d(0px, 160px, 22px) scale(1.04); z-index: 16; opacity: 1; }
          }
          @keyframes orbitLoop_3 {
            0%    { transform: translate3d(-212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            12.5% { transform: translate3d(-300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            25%   { transform: translate3d(-212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            37.5% { transform: translate3d(0px, -160px, -20px) scale(0.90); z-index: 2; opacity: 0.84; }
            50%   { transform: translate3d(212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            62.5% { transform: translate3d(300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            75%   { transform: translate3d(212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            87.5% { transform: translate3d(0px, 160px, 22px) scale(1.04); z-index: 16; opacity: 1; }
            100%  { transform: translate3d(-212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
          }
          @keyframes orbitLoop_4 {
            0%    { transform: translate3d(-300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            12.5% { transform: translate3d(-212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            25%   { transform: translate3d(0px, -160px, -20px) scale(0.90); z-index: 2; opacity: 0.84; }
            37.5% { transform: translate3d(212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            50%   { transform: translate3d(300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            62.5% { transform: translate3d(212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            75%   { transform: translate3d(0px, 160px, 22px) scale(1.04); z-index: 16; opacity: 1; }
            87.5% { transform: translate3d(-212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            100%  { transform: translate3d(-300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
          }
          @keyframes orbitLoop_5 {
            0%    { transform: translate3d(-212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            12.5% { transform: translate3d(0px, -160px, -20px) scale(0.90); z-index: 2; opacity: 0.84; }
            25%   { transform: translate3d(212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            37.5% { transform: translate3d(300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            50%   { transform: translate3d(212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            62.5% { transform: translate3d(0px, 160px, 22px) scale(1.04); z-index: 16; opacity: 1; }
            75%   { transform: translate3d(-212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            87.5% { transform: translate3d(-300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            100%  { transform: translate3d(-212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
          }
          @keyframes orbitLoop_6 {
            0%    { transform: translate3d(0px, -160px, -20px) scale(0.90); z-index: 2; opacity: 0.84; }
            12.5% { transform: translate3d(212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            25%   { transform: translate3d(300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            37.5% { transform: translate3d(212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            50%   { transform: translate3d(0px, 160px, 22px) scale(1.04); z-index: 16; opacity: 1; }
            62.5% { transform: translate3d(-212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            75%   { transform: translate3d(-300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            87.5% { transform: translate3d(-212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            100%  { transform: translate3d(0px, -160px, -20px) scale(0.90); z-index: 2; opacity: 0.84; }
          }
          @keyframes orbitLoop_7 {
            0%    { transform: translate3d(212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            12.5% { transform: translate3d(300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            25%   { transform: translate3d(212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            37.5% { transform: translate3d(0px, 160px, 22px) scale(1.04); z-index: 16; opacity: 1; }
            50%   { transform: translate3d(-212px, 113px, 14px) scale(1.02); z-index: 12; opacity: 1; }
            62.5% { transform: translate3d(-300px, 0px, 0px) scale(0.98); z-index: 8; opacity: 0.96; }
            75%   { transform: translate3d(-212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
            87.5% { transform: translate3d(0px, -160px, -20px) scale(0.90); z-index: 2; opacity: 0.84; }
            100%  { transform: translate3d(212px, -113px, -14px) scale(0.92); z-index: 4; opacity: 0.88; }
          }
        }

        @media (max-width: 767px) {
          .orbit-system-viewport {
            display: none;
          }
          .orbit-mobile-journey {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            width: 100%;
          }
          .mobile-hub-banner {
            width: 100%;
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          .mobile-hub-img-wrap {
            position: relative;
            width: 100%;
            height: 180px;
            background: #08291F;
          }
          .mobile-hub-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .mobile-hub-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(7, 29, 22, 0.4) 0%, rgba(7, 29, 22, 0.9) 100%);
          }
          .mobile-hub-text {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1rem;
            color: white;
          }
          .mobile-hub-badge {
            background: rgba(16, 185, 129, 0.3);
            border: 1px solid rgba(52, 211, 153, 0.5);
            padding: 0.2rem 0.65rem;
            border-radius: var(--radius-pill);
            font-size: 0.7rem;
            font-weight: 800;
            color: #34D399;
            margin-bottom: 0.4rem;
          }
          .mobile-hub-text h3 {
            font-size: 1.35rem;
            font-weight: 800;
            color: #FFFFFF;
            margin: 0 0 0.25rem 0;
          }
          .mobile-hub-text p {
            font-size: 0.8rem;
            color: #CBD5E1;
            margin: 0;
          }

          /* Mobile Connected Track */
          .mobile-journey-track {
            position: relative;
            padding-left: 2.25rem;
          }
          .mobile-journey-line {
            position: absolute;
            top: 20px;
            bottom: 20px;
            left: 17px;
            width: 3px;
            background: linear-gradient(180deg, #10B981 0%, #059669 100%);
            border-radius: 4px;
          }
          .mobile-journey-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .mobile-journey-item {
            position: relative;
            display: flex;
            align-items: flex-start;
            cursor: pointer;
          }
          .mobile-node-dot {
            position: absolute;
            left: -2.25rem;
            top: 12px;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #FFFFFF;
            border: 2px solid #10B981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            transition: all 0.3s ease;
          }
          .mobile-node-num {
            font-size: 0.68rem;
            font-weight: 800;
            color: #047857;
            font-family: var(--font-heading);
          }
          .mobile-item-active .mobile-node-dot {
            background: #10B981;
            transform: scale(1.15);
            box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.35);
          }
          .mobile-item-active .mobile-node-num {
            color: white;
          }
          .mobile-card-box {
            flex: 1;
            background: #FFFFFF;
            border-radius: 14px;
            border: 1px solid var(--border-subtle);
            box-shadow: var(--shadow-sm);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
          }
          .mobile-item-active .mobile-card-box {
            border-color: rgba(16, 185, 129, 0.5);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
          }
          .mobile-card-img-wrap {
            position: relative;
            width: 100%;
            height: 120px;
            overflow: hidden;
          }
          .mobile-card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .mobile-card-icon {
            position: absolute;
            bottom: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #0F4C3A;
            color: #34D399;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #FFFFFF;
          }
          .mobile-card-content {
            padding: 0.85rem;
          }
          .mobile-card-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--slate-900);
            margin: 0 0 0.3rem 0;
          }
          .mobile-card-desc {
            font-size: 0.82rem;
            color: #64748B;
            line-height: 1.45;
            margin: 0;
          }
          .journey-footer-badge-wrap {
            display: none;
          }
        }

        /* LEADERSHIP REDESIGN STYLES */
        .leadership-section {
          position: relative;
        }
        .leadership-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 640px) {
          .leadership-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .leadership-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .leadership-grid-item {
          display: flex;
          height: 100%;
        }
        .leadership-card {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 18px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
          cursor: pointer;
          transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.38s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.38s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
          position: relative;
        }
        .leadership-card:focus-visible {
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4), 0 16px 36px -6px rgba(15, 23, 42, 0.12);
          border-color: #10B981;
        }
        .leadership-card:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(16, 185, 129, 0.38);
          box-shadow: 0 18px 40px -8px rgba(15, 23, 42, 0.12), 0 0 25px rgba(16, 185, 129, 0.1);
        }
        .leadership-photo-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3.4;
          overflow: hidden;
          background: #08291F;
        }
        .leadership-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .leadership-card:hover .leadership-photo-img {
          transform: scale(1.04);
        }
        .leadership-photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(8, 41, 31, 0) 40%, rgba(8, 41, 31, 0.5) 100%);
          pointer-events: none;
        }
        .leadership-photo-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: var(--radius-pill);
          padding: 0.22rem 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: #D1FAE5;
          letter-spacing: 0.03em;
        }
        .photo-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 6px #10B981;
        }
        .leadership-card-body {
          padding: 1.35rem 1.25rem 1.25rem 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          text-align: left;
        }
        .leadership-role-wrap {
          margin-bottom: 0.5rem;
        }
        .leadership-role-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary-700);
          background: var(--primary-50);
          border: 1px solid rgba(16, 185, 129, 0.22);
          padding: 0.2rem 0.65rem;
          border-radius: var(--radius-pill);
          letter-spacing: 0.02em;
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .leadership-card:hover .leadership-role-tag {
          background: #D1FAE5;
          border-color: rgba(16, 185, 129, 0.4);
        }
        .leadership-member-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.45rem;
          line-height: 1.3;
          font-family: var(--font-heading);
          letter-spacing: -0.01em;
        }
        .leadership-member-desc {
          font-size: 0.835rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 1.15rem;
          flex: 1;
        }
        .leadership-card-footer {
          margin-top: auto;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle);
        }
        .leadership-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.835rem;
          font-weight: 700;
          color: var(--primary-700);
          transition: color 0.2s ease;
        }
        .view-btn-arrow {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .leadership-card:hover .leadership-view-btn {
          color: var(--primary-600);
        }
        .leadership-card:hover .view-btn-arrow {
          transform: translateX(4px);
        }

        /* FULLSCREEN MODAL BACKDROP & DIALOG */
        .leadership-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(7, 29, 22, 0.62);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          transition: opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .leadership-modal-overlay.is-open {
          opacity: 1;
          animation: modalOverlayFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .leadership-modal-overlay.is-closing {
          opacity: 0;
          animation: modalOverlayFadeOut 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes modalOverlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalOverlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .leadership-modal-dialog {
          position: relative;
          width: 100%;
          max-width: 820px;
          background: #FFFFFF;
          border-radius: 24px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 40px rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.2);
          max-height: 90vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(16, 185, 129, 0.3) transparent;
        }
        .leadership-modal-dialog.dialog-enter {
          animation: modalDialogZoomIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .leadership-modal-dialog.dialog-exit {
          animation: modalDialogZoomOut 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes modalDialogZoomIn {
          0% {
            opacity: 0;
            transform: scale(0.94) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes modalDialogZoomOut {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(0.95) translateY(15px);
          }
        }

        .leadership-modal-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--slate-100);
          border: 1px solid var(--border-subtle);
          color: var(--slate-600);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
        }
        .leadership-modal-close:hover {
          background: #D1FAE5;
          color: var(--primary-800);
          border-color: rgba(16, 185, 129, 0.35);
          transform: rotate(90deg);
        }
        .leadership-modal-close:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4);
        }

        .leadership-modal-grid {
          display: grid;
          grid-template-columns: 1fr;
          padding: 2.25rem;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .leadership-modal-grid {
            grid-template-columns: 300px 1fr;
            padding: 2.5rem;
            gap: 2.5rem;
            align-items: start;
          }
        }

        .modal-left-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        @media (min-width: 768px) {
          .modal-left-col {
            align-items: flex-start;
            text-align: left;
          }
        }

        .modal-photo-wrapper {
          position: relative;
          width: 100%;
          max-width: 260px;
          aspect-ratio: 1 / 1.08;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 1.25rem;
          box-shadow: 0 12px 30px -6px rgba(15, 23, 42, 0.18), 0 0 20px rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          background: #08291F;
        }
        .modal-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .modal-left-info {
          width: 100%;
        }
        .modal-member-name {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.35rem;
          line-height: 1.25;
          font-family: var(--font-heading);
        }
        .modal-role-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--primary-700);
          background: var(--primary-50);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-pill);
          margin-bottom: 0.85rem;
        }
        .modal-location-line {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          color: var(--slate-500);
          margin-bottom: 1rem;
        }
        @media (max-width: 767px) {
          .modal-location-line {
            justify-content: center;
          }
        }
        .modal-loc-icon {
          color: var(--primary-600);
        }
        .modal-focus-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.25rem;
        }
        @media (max-width: 767px) {
          .modal-focus-pills {
            justify-content: center;
          }
        }
        .modal-focus-pill {
          font-size: 0.72rem;
          font-weight: 600;
          color: #0F4C3A;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
        }

        .modal-right-col {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .modal-section-block {
          width: 100%;
        }
        .modal-section-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--primary-700);
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .modal-bio-text {
          font-size: 0.95rem;
          color: var(--slate-700);
          line-height: 1.7;
          margin: 0;
        }
        .modal-divider {
          width: 100%;
          height: 1px;
          background: var(--border-subtle);
          margin: 1.75rem 0;
        }
        .modal-contacts-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .modal-contact-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          background: var(--slate-50);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.22s ease;
        }
        .modal-contact-item:hover {
          background: #F0FDF4;
          border-color: rgba(16, 185, 129, 0.35);
          transform: translateX(4px);
        }
        .contact-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #D1FAE5;
          color: var(--primary-800);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }
        .modal-contact-item:hover .contact-icon-box {
          background: #10B981;
          color: white;
        }
        .contact-icon-linkedin {
          background: #E0F2FE;
          color: #0369A1;
        }
        .modal-contact-item:hover .contact-icon-linkedin {
          background: #0284C7;
          color: white;
        }
        .contact-text-wrap {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .contact-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--slate-400);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .contact-value {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--slate-800);
          word-break: break-all;
        }
        .modal-contact-item:hover .contact-value {
          color: var(--primary-800);
        }
        .contact-ext-icon {
          color: var(--slate-400);
          margin-left: auto;
          flex-shrink: 0;
        }
        .modal-contact-item:hover .contact-ext-icon {
          color: var(--primary-600);
        }

        @media (prefers-reduced-motion: reduce) {
          .sticky-note-wrapper,
          .sticky-vision-wrapper,
          .sticky-mission-wrapper,
          .editorial-visual-flank,
          .editorial-float-layer,
          .editorial-photo-card,
          .sticky-note-card,
          .sticky-card-vision,
          .sticky-card-blue {
            opacity: 1 !important;
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
          .orbit-3d-stage,
          .impact-hub-center,
          .hub-core-card,
          .hub-outer-ring-1,
          .hub-outer-ring-2,
          .orbit-ellipse-dashed,
          .orbit-card-node,
          .orbit-card-pos-0,
          .orbit-card-pos-1,
          .orbit-card-pos-2,
          .orbit-card-pos-3,
          .orbit-card-pos-4,
          .orbit-card-pos-5,
          .orbit-card-pos-6,
          .orbit-card-pos-7,
          .methodology-ambient-aura,
          .hero-background-video {
            display: none !important;
          }
          .about-hero {
            background-image: url('/images/about-hero.jpg') !important;
            background-size: cover !important;
            background-position: center !important;
          }
          .leadership-card,
          .leadership-card:hover,
          .leadership-photo-img,
          .view-btn-arrow,
          .modal-contact-item,
          .leadership-modal-dialog,
          .leadership-modal-dialog.dialog-enter,
          .leadership-modal-dialog.dialog-exit,
          .leadership-modal-overlay.is-open,
          .leadership-modal-overlay.is-closing {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
          .sticky-note-wrapper:hover .sticky-card-img,
          .editorial-photo-card:hover .editorial-img {
            transform: none !important;
          }
          .flow-float-0,
          .flow-float-1,
          .flow-float-2,
          .flow-float-3,
          .flow-mobile-float-0,
          .flow-mobile-float-1,
          .flow-mobile-float-2,
          .flow-mobile-float-3,
          .flow-card-img,
          .flow-mobile-pulse {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
