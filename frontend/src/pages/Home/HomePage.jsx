import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { projectService, impactService, partnerService } from '../../services/api';

// Editorial Home Components
import Hero from '../../components/home/Hero';
import CursorNetworkField from '../../components/home/CursorNetworkField';
import FloatingSocialIcons from '../../components/home/FloatingSocialIcons';
import VisionSection from '../../components/home/VisionSection';
import MissionSection from '../../components/home/MissionSection';
import ImpactStats from '../../components/home/ImpactStats';
import OrbitCards from '../../components/home/OrbitCards';
import ProjectShowcase from '../../components/home/ProjectShowcase';
import EventsCalendarSection from '../../components/home/EventsCalendarSection';
import FinalCTA from '../../components/home/FinalCTA';
import CurvedTransition from '../../components/home/CurvedTransition';

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [projData, partnersData] = await Promise.all([
          projectService.getProjects({ featured: true }),
          partnerService.getPartners(),
        ]);
        setFeaturedProjects(projData || []);
        setPartners(partnersData || []);
      } catch (err) {
        console.error('Failed to load home data from API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="home-editorial-page">
      {/* Interactive Cursor Constellation Field (pointer-events: none, behind content) */}
      <CursorNetworkField />

      {/* Floating Social-Media Badges on Left and Right Edges (Requirement 5) */}
      <FloatingSocialIcons />

      {/* 1. HERO SECTION (Preserved) */}
      <Hero />

      {/* Curved Transition: Hero to Vision Section */}
      <CurvedTransition type="convex" fill="#FDFBF7" />

      {/* 2. OUR VISION (Requirement 2: Separate Vision Section with Animation) */}
      <VisionSection />

      {/* Curved Transition: Vision to Mission Section */}
      <CurvedTransition type="concave" fill="#FFFFFF" />

      {/* 3. OUR MISSION (Requirement 2: Separate Mission Section with Animation) */}
      <MissionSection />

      {/* Curved Transition: Mission to Real-Time Impact Numbers */}
      <CurvedTransition type="convex" fill="#FFFFFF" />

      {/* 4. REAL-TIME IMPACT NUMBERS & VOLUNTEER COUNT (Requirement 3 & 4: Fixed Animation & Total Volunteer Count) */}
      <ImpactStats />

      {/* Curved Transition: White to Warm Cream */}
      <CurvedTransition type="concave" fill="#F7F3EB" />

      {/* 5. TURNING RESPONSIBILITY INTO ACTION (Horizontal Orbiting Cards) */}
      <OrbitCards />

      {/* Curved Transition: Cream to Warm Ivory */}
      <CurvedTransition type="convex" fill="#FDFBF7" />

      {/* 6. PROJECTS ON THE GROUND (Requirement 1: Vertically Organized Layout & Relevant Photos) */}
      <ProjectShowcase projects={featuredProjects} />

      {/* Curved Transition: Ivory to White */}
      <CurvedTransition type="concave" fill="#FFFFFF" />

      {/* 7. UPCOMING EVENTS: MONTHLY CALENDAR & IMAGE CAROUSEL (Requirement 6 & 7) */}
      <EventsCalendarSection />

      {/* 8. CSR & PARTNERS ROW (Preserved) */}
      <section className="partners-editorial-strip">
        <div className="container">
          <div className="partners-title-wrap">
            <span className="partners-small-head">
              TRUSTED BY CSR PARTNERS &amp; CITIZEN COLLECTIVES
            </span>
          </div>
          <div className="partners-marquee-row">
            {partners.length > 0 ? (
              partners.map((p) => (
                <div key={p.id} className="partner-editorial-item">
                  <Building2 size={20} color="#7DD3FC" />
                  <span className="partner-name-text">{p.name}</span>
                </div>
              ))
            ) : (
              <>
                <div className="partner-editorial-item">
                  <Building2 size={20} color="#7DD3FC" />
                  <span className="partner-name-text">Infosys Foundation</span>
                </div>
                <div className="partner-editorial-item">
                  <Building2 size={20} color="#7DD3FC" />
                  <span className="partner-name-text">Wipro Cares</span>
                </div>
                <div className="partner-editorial-item">
                  <Building2 size={20} color="#7DD3FC" />
                  <span className="partner-name-text">Azim Premji Philanthropic</span>
                </div>
                <div className="partner-editorial-item">
                  <Building2 size={20} color="#7DD3FC" />
                  <span className="partner-name-text">Titan CSR Initiative</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION (Warm Editorial Canvas with Vignettes) */}
      <FinalCTA />

      {/* Curved Transition: Neutral to Dark Footer */}
      <CurvedTransition type="concave" fill="#0F172A" />

      <style>{`
        .home-editorial-page {
          background-color: var(--cream-50, #FDFBF7);
          overflow-x: hidden;
          position: relative;
        }
        .partners-editorial-strip {
          background-color: #FFFFFF;
          padding: 3.5rem 0;
          border-top: 1px solid var(--border-subtle, #E2E8F0);
          border-bottom: 1px solid var(--border-subtle, #E2E8F0);
        }
        .partners-title-wrap {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .partners-small-head {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: var(--text-muted, #64748B);
          text-transform: uppercase;
        }
        .partners-marquee-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1.5rem 2.5rem;
        }
        .partner-editorial-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: var(--cream-50, #FDFBF7);
          border: 1px solid var(--border-subtle, #E2E8F0);
          padding: 0.75rem 1.6rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--charcoal-900, #0F172A);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }
        .partner-editorial-item:hover {
          background: #FFFFFF;
          border-color: var(--primary-saffron, #F97316);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}
