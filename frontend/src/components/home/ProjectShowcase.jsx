import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Sparkles } from 'lucide-react';
import CircularCarousel from '../common/CircularCarousel';

// Authentic project photo assets
import lakeImg from '../../assets/varthur-blooming-wetland.jpg';
import stemImg from '../../assets/rural-stem-sensor-lab.jpg';
import forestImg from '../../assets/area-environment.jpg';
import wasteImg from '../../assets/area-community.jpg';
import waterMonitoringImg from '../../assets/citizen-water-monitoring.jpg';
import desiltingImg from '../../assets/varthur-volunteers-desilting.jpg';
import washImg1 from '../../assets/hosa-byrohalli-wash-1.jpg';

export default function ProjectShowcase({ projects = [] }) {
  // Responsive cardWidth for different screen sizes (enlarged: 440px desktop)
  const [cardWidth, setCardWidth] = useState(440);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const w = window.innerWidth;
        if (w < 480) {
          setCardWidth(230);
        } else if (w < 768) {
          setCardWidth(285);
        } else if (w < 1024) {
          setCardWidth(340);
        } else {
          setCardWidth(440);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Authentic project dataset with descriptions and internal routing links
  const defaultItems = [
    {
      id: 'lake-rejuvenation',
      src: lakeImg,
      alt: 'Restored Kaikondrahalli-Varthur feeder wetland with blooming shoreline flora and clean open water',
      title: 'Kaikondrahalli-Varthur Lake Rejuvenation',
      subtitle: 'Environment & Water',
      description: 'Transforming a silted 14-acre feeder wetland into a thriving biodiversity sanctuary and community park.',
      link: '/projects/lake-rejuvenation-bengaluru-east',
    },
    {
      id: 'stem-labs',
      src: stemImg,
      alt: 'Rural government school students learning robotics and electronics in a STEM smart lab',
      title: 'Rural STEM Labs & Digital Classrooms',
      subtitle: 'Education & Digital Access',
      description: 'Equipping rural government schools with interactive STEM labs, digital tablets, and hands-on robotics kits.',
      link: '/projects/rural-digital-classrooms-stem-hub',
    },
    {
      id: 'urban-forests',
      src: forestImg,
      alt: 'Dense multi-tier native Miyawaki micro-forest canopy planted by volunteers in Bengaluru',
      title: 'Urban Micro-Forests Initiative',
      subtitle: 'Afforestation & Ecology',
      description: 'Planting fast-growing native biodiverse micro-forests across degraded peri-urban plots.',
      link: '/projects/urban-miyawaki-micro-forests',
    },
    {
      id: 'neighborhood-composting',
      src: wasteImg,
      alt: 'Community aerobic composting and residential waste segregation hub',
      title: 'Zero-Waste Neighborhood Composting',
      subtitle: 'Community Waste & Ecology',
      description: 'Decentralized aerobic composting hubs and community segregation drives diverting organic waste from landfills.',
      link: '/projects/community-waste-circular-hub',
    },
    {
      id: 'water-monitoring',
      src: waterMonitoringImg,
      alt: 'Citizen volunteers collecting water samples for dissolved oxygen and wetland health monitoring',
      title: 'Citizen Water Quality Monitoring',
      subtitle: 'Water & Environmental Health',
      description: 'Community-led sensor water testing empowering local lake wardens with real-time biological health data.',
      link: '/projects/lake-rejuvenation-bengaluru-east',
    },
    {
      id: 'wetland-desilting',
      src: desiltingImg,
      alt: 'Community volunteers removing debris and clearing silt channels at the feeder lake',
      title: 'Community Wetland Desilting Drive',
      subtitle: 'Citizen Volunteer Drives',
      description: 'Hands-on weekend citizen volunteering restoring feeder channels and clearing invasive weeds.',
      link: '/projects/lake-rejuvenation-bengaluru-east',
    },
    {
      src: washImg1,
      alt: 'Students at Hosa Byrohalli Government School attending the WASH health, hygiene and sanitation programme',
      title: 'School WASH & Hygiene Initiative',
      subtitle: 'Health & Water Sanitation',
      link: '/projects/hosa-byrohalli-wash-programme',
    },
  ];

  // Merge live projects from API with authentic fallback assets if available
  const carouselItems = useMemo(() => {
    if (!projects || projects.length === 0) return defaultItems;
    return projects.map((p, idx) => {
      const fallback = defaultItems[idx % defaultItems.length];
      return {
        id: p.id || p.slug || fallback.id,
        src: p.image_url || p.cover_image || fallback.src,
        alt: p.title || fallback.alt,
        title: p.title || fallback.title,
        subtitle: p.focus_area_name || p.category || fallback.subtitle,
        description: p.summary || p.description || fallback.description,
        link: `/projects/${p.slug || p.id || fallback.id}`,
      };
    });
  }, [projects]);

  return (
    <section className="project-editorial-root" aria-label="Active Projects on the Ground">
      <div className="container">
        {/* Section Header */}
        <div className="project-header-row">
          <div>
            <div className="project-badge">
              <Layers size={14} className="text-accent" />
              <span>Ground Initiatives</span>
            </div>
            <h2 className="project-title">Active Projects on the Ground</h2>
            <p className="project-subtitle">
              Structured grassroots interventions delivering measurable environmental restoration and rural school support. Drag or rotate through our live active project showcase below.
            </p>
          </div>
          <Link to="/projects" className="btn-view-all">
            <span>View All Projects</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 3D CIRCULAR CAROUSEL (Hero-level, enlarged, 3D cylindrical presentation) */}
        <div className="circular-carousel-section-wrap">
          <div className="carousel-interactive-cue" aria-hidden="true">
            <Sparkles size={13} className="text-accent" />
            <span>INTERACTIVE 3D PROJECT ROTATION • DRAG OR HOVER TO EXPLORE</span>
          </div>

          <div className="circular-carousel-stage-container">
            <CircularCarousel
              items={carouselItems}
              preset="cylinder"
              intro="rise"
              cardWidth={cardWidth}
              aspectRatio={0.9}
              speed={14}
              captions
            />
          </div>
        </div>
      </div>

      <style>{`
        .project-editorial-root {
          background: transparent;
          padding: 6rem 0 5rem 0;
          position: relative;
          overflow: hidden;
        }

        .project-header-row {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .project-header-row {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }

        .project-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(253, 251, 247, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          color: var(--charcoal-900, #0F172A);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .text-accent {
          color: var(--primary-saffron, #F59E0B);
        }

        .project-title {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--charcoal-900, #0F172A);
          margin-bottom: 0.85rem;
        }

        @media (min-width: 768px) {
          .project-title {
            font-size: 3.25rem;
          }
        }

        .project-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary, #475569);
          max-width: 650px;
          line-height: 1.6;
        }

        .btn-view-all {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(253, 251, 247, 0.9);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          color: var(--charcoal-900, #0F172A);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-pill, 9999px);
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
          transition: all 0.2s ease;
          text-decoration: none;
          align-self: flex-start;
          white-space: nowrap;
        }

        .btn-view-all:hover {
          background: rgba(247, 243, 235, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
          border-color: rgba(245, 158, 11, 0.4);
        }

        /* 3D CIRCULAR CAROUSEL WRAPPER — Transparent surface letting Warli artwork shine through */
        .circular-carousel-section-wrap {
          margin-top: 1.5rem;
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 1rem 0;
          overflow: visible;
          position: relative;
        }

        .carousel-interactive-cue {
          text-align: center;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--text-muted, #64748B);
          text-transform: uppercase;
          margin: 0 auto 1.5rem auto;
          background: rgba(253, 251, 247, 0.65);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill, 9999px);
          border: 1px solid rgba(226, 232, 240, 0.6);
        }

        /* Spacious Stage Container */
        .circular-carousel-stage-container {
          width: 100%;
          height: 780px;
          position: relative;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .circular-carousel-stage-container {
            height: 660px;
          }
        }

        @media (max-width: 768px) {
          .project-editorial-root {
            padding: 4.5rem 0 3.5rem 0;
          }
          .circular-carousel-stage-container {
            height: 580px;
          }
        }

        @media (max-width: 480px) {
          .circular-carousel-stage-container {
            height: 500px;
          }
        }
      `}</style>
    </section>
  );
}
