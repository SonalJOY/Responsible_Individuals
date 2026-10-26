import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/api';

// Editorial Home Components
import Hero from '../../components/home/Hero';
import CursorNetworkField from '../../components/home/CursorNetworkField';
import FloatingSocialIcons from '../../components/home/FloatingSocialIcons';
import WhatWeDoSection from '../../components/home/WhatWeDoSection';
import OurStorySection from '../../components/home/OurStorySection';
import VisionSection from '../../components/home/VisionSection';
import MissionSection from '../../components/home/MissionSection';

import FocusAreasSection from '../../components/home/FocusAreasSection';
import ImpactStats from '../../components/home/ImpactStats';
import OrbitCards from '../../components/home/OrbitCards';
import ProjectShowcase from '../../components/home/ProjectShowcase';
import EventsCalendarSection from '../../components/home/EventsCalendarSection';
import TrustedPartnersSection from '../../components/home/TrustedPartnersSection';
import FinalCTA from '../../components/home/FinalCTA';
import CurvedTransition from '../../components/home/CurvedTransition';

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState([]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const projData = await projectService.getProjects({ featured: true });
        setFeaturedProjects(projData || []);
      } catch (err) {
        console.error('Failed to load home data from API:', err);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="home-editorial-page">
      {/* Interactive Cursor Constellation Field (pointer-events: none, behind content) */}
      <CursorNetworkField />

      {/* Floating Social-Media Badges on Left and Right Edges */}
      <FloatingSocialIcons />

      {/* 1. HERO SECTION */}
      <Hero />

      {/* Curved Transition: Hero to What We Do */}
      <CurvedTransition type="convex" fill="#FDFBF7" />

      {/* 2. WHAT WE DO */}
      <WhatWeDoSection />

      {/* Curved Transition: What We Do to Our Story */}
      <CurvedTransition type="concave" fill="#FFFFFF" />

      {/* 3. OUR STORY */}
      <OurStorySection />

      {/* Curved Transition: Our Story to Our Vision */}
      <CurvedTransition type="convex" fill="#FDFBF7" />

      {/* 4. OUR VISION (Integrated Vision Video Asset) */}
      <VisionSection />

      {/* Curved Transition: Vision to Mission */}
      <CurvedTransition type="concave" fill="#FFFFFF" />

      {/* 5. OUR MISSION (Integrated Mission Video Asset) */}
      <MissionSection />

      {/* Curved Transition: Mission to Focus Areas */}
      <CurvedTransition type="convex" fill="#FDFBF7" />

      {/* 6. FOCUS AREAS OF OUR NGO (Education, Environment, Health) */}
      <FocusAreasSection />

      {/* Curved Transition: Focus Areas to Impact Numbers */}
      <CurvedTransition type="concave" fill="#FFFFFF" />

      {/* 8. REAL-TIME IMPACT NUMBERS & VOLUNTEER COUNT */}
      <ImpactStats />

      {/* Curved Transition: White to Warm Cream */}
      <CurvedTransition type="concave" fill="#F7F3EB" />

      {/* 9. TURNING RESPONSIBILITY INTO ACTION (Horizontal Orbiting Cards) */}
      <OrbitCards />

      {/* Curved Transition: Cream to Warm Ivory */}
      <CurvedTransition type="convex" fill="#FDFBF7" />

      {/* 10. PROJECTS ON THE GROUND (3D Cylindrical Carousel) */}
      <ProjectShowcase projects={featuredProjects} />

      {/* Curved Transition: Ivory to White */}
      <CurvedTransition type="concave" fill="#FFFFFF" />

      {/* 11. UPCOMING EVENTS: MONTHLY CALENDAR & IMAGE CAROUSEL */}
      <EventsCalendarSection />

      {/* 12. TRUSTED BY CSR PARTNERS & CITIZEN COLLECTIVES (Smooth Horizontal Sliding Marquee) */}
      <TrustedPartnersSection />

      {/* 13. FINAL CALL TO ACTION */}
      <FinalCTA />

      {/* Curved Transition: Neutral to Dark Footer */}
      <CurvedTransition type="concave" fill="#0F172A" />

      <style>{`
        .home-editorial-page {
          background-color: var(--cream-50, #FDFBF7);
          overflow-x: hidden;
          position: relative;
        }
      `}</style>
    </div>
  );
}
