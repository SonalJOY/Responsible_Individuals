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
          // Normalize live data fields
          const normalizedLive = liveData.map((s) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            category: s.focus_area_name || s.category_name || 'Water & Environment',
            categoryColor: s.focus_area_color || '#10B981',
            description: s.excerpt || s.challenge || s.description,
            coverImage: s.cover_image || '/images/stories/varthur-blooming-wetland.jpg',
            heroImage: s.cover_image || '/images/stories/varthur-blooming-wetland.jpg',
            location: s.location || 'Bengaluru, Karnataka',
            readTime: s.read_time ? `${s.read_time} min read` : '5 min read',
            date: s.published_date || 'March 2026',
            quote: s.quote || defaultFeatured.quote,
            featured: s.featured,
            challenge: s.challenge,
            response: s.intervention || s.response,
            change: s.outcome || s.change,
            keyTakeaway: s.outcome || defaultFeatured.keyTakeaway
          }));

          // Featured story: prioritize Varthur Lake story with exact user quote & high-res image
          const liveFeatured = normalizedLive.find((s) => s.slug === 'from-barren-silt-to-blooming-lake') || 
                               normalizedLive.find((s) => s.featured) || 
                               defaultFeatured;

          setFeatured({
            ...defaultFeatured,
            ...liveFeatured,
            coverImage: liveFeatured.coverImage || defaultFeatured.coverImage,
            heroImage: liveFeatured.heroImage || defaultFeatured.heroImage,
            quote: defaultFeatured.quote, // Preserve exact user-requested quote
            metrics: defaultFeatured.metrics
          });

          // Build field stories without duplicates, ensuring rich complete showcase
          const featuredSlug = liveFeatured.slug || 'from-barren-silt-to-blooming-lake';
          const storiesMap = new Map();

          // 1. Seed with default field stories to guarantee complete cards
          defaultFieldStories.forEach((st) => {
            if (st.slug !== featuredSlug) {
              storiesMap.set(st.slug, st);
            }
          });

          // 2. Overlay live backend stories (excluding featured)
          normalizedLive.forEach((st) => {
            if (st.slug !== featuredSlug) {
              const existing = storiesMap.get(st.slug);
              storiesMap.set(st.slug, { ...existing, ...st });
            }
          });

          setStories(Array.from(storiesMap.values()));
        }
      } catch {
        // Backend offline or empty: cleanly retain complete prototype data
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
