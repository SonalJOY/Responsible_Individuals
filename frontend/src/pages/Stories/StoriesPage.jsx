import React, { useEffect, useState } from 'react';
import { storyService } from '../../services/api';
import { featuredStory as defaultFeatured, fieldStories as defaultFieldStories, communityMoments } from '../../data/storiesData';
import FeaturedStorySection from './components/FeaturedStorySection';
import StoryEditorialCard from './components/StoryEditorialCard';
import StoryQuoteSection from './components/StoryQuoteSection';
import StoriesBehindWorkSection from './components/StoriesBehindWorkSection';
import FromCommunitySection from './components/FromCommunitySection';
import './stories.css';

export default function StoriesPage() {
  const [featured, setFeatured] = useState(defaultFeatured);
  const [stories, setStories] = useState(defaultFieldStories);

  useEffect(() => {
    // Scroll to top on page load
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
      }
    }
    loadLiveStoriesIfAvailable();
  }, []);

  return (
    <div className="stories-page-root">
      {/* Hero Section — EXACT Existing Hero Design & Copy Preserved */}
      <section className="stories-hero">
        <div className="container">
          <span className="section-badge">Voices of Transformation</span>
          <h1 className="stories-hero-title">Stories of Change</h1>
          <p className="stories-hero-subtitle">
            Explore first-person accounts of students, dryland farmers, resident stewards, and youth whose lives have been impacted by our projects.
          </p>
        </div>
      </section>

      {/* SECTION 1 — FEATURED STORY */}
      <FeaturedStorySection story={featured} />

      {/* SECTION 2 — STORIES FROM THE FIELD */}
      <section className="field-stories-section" aria-label="Stories from the Field">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Field Narratives</span>
            <h2 className="section-title">Stories from the Field</h2>
            <p className="section-subtitle">
              First-hand moments from the people and communities working toward a better future.
            </p>
          </div>

          <div className="field-stories-grid">
            {stories.map((story) => (
              <StoryEditorialCard key={story.id || story.slug} story={story} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — STORY QUOTE / HUMAN VOICE */}
      <StoryQuoteSection />

      {/* SECTION 4 — STORIES BEHIND THE WORK */}
      <StoriesBehindWorkSection />

      {/* SECTION 5 — FROM THE COMMUNITY */}
      <FromCommunitySection moments={communityMoments} />
    </div>
  );
}
