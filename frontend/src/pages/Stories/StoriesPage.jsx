import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { storyService } from '../../services/api';
import { featuredStory as defaultFeatured, fieldStories as defaultFieldStories, communityMoments } from '../../data/storiesData';
import StoriesScrollProgress from './components/StoriesScrollProgress';
import StoriesBackToTop from './components/StoriesBackToTop';
import StoriesHero from './components/StoriesHero';
import FeaturedStorySection from './components/FeaturedStorySection';
import StoryEditorialCard from './components/StoryEditorialCard';
import StoryQuoteSection from './components/StoryQuoteSection';
import StoriesBehindWorkSection from './components/StoriesBehindWorkSection';
import FromCommunitySection from './components/FromCommunitySection';
import './stories.css';

export default function StoriesPage() {
  const [featured, setFeatured] = useState(defaultFeatured);
  const [stories, setStories] = useState(defaultFieldStories);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Scroll to top on page mount
    window.scrollTo(0, 0);

    async function loadLiveStoriesIfAvailable() {
      try {
        const liveData = await storyService.getStories();
        if (Array.isArray(liveData) && liveData.length > 0) {
          // If backend has live stories, utilize them; otherwise retain complete prototype data
          const featuredItem = liveData.find((s) => s.featured) || liveData[0];
          setFeatured(featuredItem);
          setStories(liveData.slice(1));
        }
      } catch {
        // Backend offline or empty: cleanly retain prototype data without console error clutter
      } finally {
        setIsLoading(false);
      }
    }
    loadLiveStoriesIfAvailable();
  }, []);

  return (
    <div className="stories-page-root">
      {/* Stories Scroll Progress Indicator */}
      <StoriesScrollProgress />

      {/* Hero Section — Enhanced with Cinematic Background Video & Motion */}
      <StoriesHero />

      {/* SECTION 1 — FEATURED STORY */}
      <FeaturedStorySection story={featured} />

      {/* SECTION 2 — STORIES FROM THE FIELD */}
      <section className="field-stories-section" aria-label="Stories from the Field">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-badge">Field Narratives</span>
            <h2 className="section-title">Stories from the Field</h2>
            <p className="section-subtitle">
              First-hand moments from the people and communities working toward a better future.
            </p>
          </motion.div>

          <div className="field-stories-grid">
            {stories.map((story, idx) => (
              <StoryEditorialCard
                key={story.id || story.slug || idx}
                story={story}
                index={idx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — STORY QUOTE / HUMAN VOICE */}
      <StoryQuoteSection />

      {/* SECTION 4 — STORIES BEHIND THE WORK (Every Number Has a Story + Metrics) */}
      <StoriesBehindWorkSection />

      {/* SECTION 5 — FROM THE COMMUNITY GALLERY */}
      <FromCommunitySection moments={communityMoments} />

      {/* Stories Back to Top Floating Button */}
      <StoriesBackToTop />
    </div>
  );
}
