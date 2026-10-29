import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/api';

// Editorial Home Components
import Hero from '../../components/home/Hero';
import CursorNetworkField from '../../components/home/CursorNetworkField';
import FloatingSocialIcons from '../../components/home/FloatingSocialIcons';
import WhatWeDoSection from '../../components/home/WhatWeDoSection';
import OurStorySection from '../../components/home/OurStorySection';
import FocusAreasSection from '../../components/home/FocusAreasSection';
import ImpactStats from '../../components/home/ImpactStats';
import OrbitCards from '../../components/home/OrbitCards';
import ProjectShowcase from '../../components/home/ProjectShowcase';
import EventsCalendarSection from '../../components/home/EventsCalendarSection';
import TrustedPartnersSection from '../../components/home/TrustedPartnersSection';
import FinalCTA from '../../components/home/FinalCTA';

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
      {/* Shared Continuous Homepage Background Layer (Positioned beneath all homepage sections below header) */}
      <div className="homepage-shared-backdrop" aria-hidden="true">
        <div className="homepage-backdrop-img" />
        <div className="homepage-backdrop-overlay" />
      </div>

      {/* Interactive Cursor Constellation Field (pointer-events: none, behind foreground content) */}
      <CursorNetworkField />

      {/* Floating Social-Media Badges on Right Viewport Edge */}
      <FloatingSocialIcons />

      {/* Foreground Content Stack (Renders clearly above the shared continuous focusarea background) */}
      <div className="homepage-content-stack">
        {/* 1. HERO SECTION */}
        <Hero />

        {/* 2. WHAT WE DO */}
        <WhatWeDoSection />

        {/* 3. OUR STORY */}
        <OurStorySection />

        {/* 4. FOCUS AREAS OF OUR NGO (Integrated Mission & Vision Videos + 3 Focus Pillars) */}
        <FocusAreasSection />

        {/* 5. REAL-TIME IMPACT NUMBERS & VOLUNTEER COUNT */}
        <ImpactStats />

        {/* 6. TURNING RESPONSIBILITY INTO ACTION (Horizontal Orbiting Cards) */}
        <OrbitCards />

        {/* 7. PROJECTS ON THE GROUND (3D Cylindrical Carousel) */}
        <ProjectShowcase projects={featuredProjects} />

        {/* 8. UPCOMING EVENTS: MONTHLY CALENDAR & IMAGE CAROUSEL */}
        <EventsCalendarSection />

        {/* 9. TRUSTED BY CSR PARTNERS & CITIZEN COLLECTIVES */}
        <TrustedPartnersSection />

        {/* 10. FINAL CALL TO ACTION */}
        <FinalCTA />
      </div>

      <style>{`
        .home-editorial-page {
          position: relative;
          overflow-x: hidden;
          width: 100%;
          min-height: 100vh;
        }

        /* Shared continuous background covering the full homepage content area below header */
        .homepage-shared-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .homepage-backdrop-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-image: url('/images/focusarea.webp'), url('/images/focusarea.jpg');
          background-size: cover;
          background-position: center 25%;
          background-repeat: no-repeat;
          transform: translateZ(0);
        }

        /* Subtle warm palette overlay preserving rich Warli mural detail while maximizing readability */
        .homepage-backdrop-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(253, 251, 247, 0.75) 0%,
            rgba(253, 251, 247, 0.68) 30%,
            rgba(253, 251, 247, 0.66) 70%,
            rgba(253, 251, 247, 0.78) 100%
          );
          pointer-events: none;
        }

        .homepage-content-stack {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        @media (max-width: 768px) {
          .homepage-backdrop-img {
            background-position: center top;
          }
        }
      `}</style>
    </div>
  );
}
