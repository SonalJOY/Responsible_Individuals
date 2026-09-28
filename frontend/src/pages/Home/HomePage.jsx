import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { projectService, impactService, storyService, partnerService } from '../../services/api';

// Editorial Home Components
import Hero from '../../components/home/Hero';
import CursorNetworkField from '../../components/home/CursorNetworkField';
import ImpactStats from '../../components/home/ImpactStats';
import OrbitCards from '../../components/home/OrbitCards';
import ProjectShowcase from '../../components/home/ProjectShowcase';
import TransformationStories from '../../components/home/TransformationStories';
import StoryJourney from '../../components/home/StoryJourney';
import LatestUpdates from '../../components/home/LatestUpdates';
import FinalCTA from '../../components/home/FinalCTA';
import CurvedTransition from '../../components/home/CurvedTransition';

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [impactAreas, setImpactAreas] = useState([]);
  const [stories, setStories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [projData, areasData, storiesData, partnersData] = await Promise.all([
          projectService.getProjects({ featured: true }),
          impactService.getAreas(),
          storyService.getStories({ featured: true }),
          partnerService.getPartners(),
        ]);
        setFeaturedProjects(projData || []);
        setImpactAreas(areasData || []);
        setStories(storiesData || []);
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

      {/* 1. HERO SECTION */}
      <Hero />

      {/* Curved Transition: Cream to Pure White */}
      <CurvedTransition type="convex" fill="#FFFFFF" />

      {/* 2. REAL-TIME IMPACT NUMBERS (Huge Editorial Counters) */}
      <ImpactStats />

      {/* Curved Transition: White to Warm Cream */}
      <CurvedTransition type="concave" fill="#F7F3EB" />

      {/* 3. TURNING RESPONSIBILITY INTO ACTION (Horizontal Orbiting Cards) */}
      <OrbitCards />

      {/* Curved Transition: Cream to Warm Ivory */}
      <CurvedTransition type="convex" fill="#FDFBF7" />

      {/* 4. PROJECTS & INITIATIVES (Editorial Magazine Showcase) */}
      <ProjectShowcase projects={featuredProjects} />

      {/* Curved Transition: Ivory to Cream */}
      <CurvedTransition type="concave" fill="#F7F3EB" />

      {/* 5. STORIES OF TRANSFORMATION (Human Spotlight Carousel) */}
      <TransformationStories stories={stories} />

      {/* Curved Transition: Cream to Ivory */}
      <CurvedTransition type="convex" fill="#FDFBF7" />

      {/* 6. STORY JOURNEY PATH (Single SVG Path Math Architecture) */}
      <StoryJourney />

      {/* Curved Transition: Ivory to White */}
      <CurvedTransition type="concave" fill="#FFFFFF" />

      {/* 7. LATEST UPDATES & VOLUNTEER DRIVES */}
      <LatestUpdates />

      {/* 8. CSR & PARTNERS ROW */}
      <section className="partners-editorial-strip">
        <div className="container">
          <div className="partners-title-wrap">
            <span className="partners-small-head">
              TRUSTED BY CSR PARTNERS & CITIZEN COLLECTIVES
            </span>
          </div>
          <div className="partners-marquee-row">
            {partners.length > 0 ? (
              partners.map((p) => (
                <div key={p.id} className="partner-editorial-item">
                  <Building2 size={20} color="#10B981" />
                  <span className="partner-name-text">{p.name}</span>
                </div>
              ))
            ) : (
              <>
                <div className="partner-editorial-item">
                  <Building2 size={20} color="#10B981" />
                  <span className="partner-name-text">Infosys Foundation</span>
                </div>
                <div className="partner-editorial-item">
                  <Building2 size={20} color="#10B981" />
                  <span className="partner-name-text">Wipro Cares</span>
                </div>
                <div className="partner-editorial-item">
                  <Building2 size={20} color="#10B981" />
                  <span className="partner-name-text">Azim Premji Philanthropic</span>
                </div>
                <div className="partner-editorial-item">
                  <Building2 size={20} color="#10B981" />
                  <span className="partner-name-text">Titan CSR Initiative</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION (Warm Editorial Canvas with Vignettes) */}
      <FinalCTA />

      {/* Curved Transition: Cream to Dark Forest Footer */}
      <CurvedTransition type="concave" fill="#0C1210" />

      <style>{`
        .home-editorial-page {
          background-color: var(--cream-50);
          overflow-x: hidden;
        }
        .partners-editorial-strip {
          background-color: #FFFFFF;
          padding: 3.5rem 0;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }
        .partners-title-wrap {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .partners-small-head {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: var(--text-muted);
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
          background: var(--cream-50);
          border: 1px solid var(--border-subtle);
          padding: 0.75rem 1.6rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--charcoal-900);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }
        .partner-editorial-item:hover {
          background: #FFFFFF;
          border-color: #10B981;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}
