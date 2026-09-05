import React, { useEffect, useState } from 'react';
import { storyService } from '../../services/api';
import StoryCard from '../../components/common/StoryCard';

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStories() {
      try {
        const data = await storyService.getStories();
        setStories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStories();
  }, []);

  return (
    <div className="stories-page-root">
      <section className="stories-hero">
        <div className="container">
          <span className="section-badge">Voices of Transformation</span>
          <h1 className="stories-hero-title">Stories of Change</h1>
          <p className="stories-hero-subtitle">
            Explore first-person accounts of students, dryland farmers, resident stewards, and youth whose lives have been impacted by our projects.
          </p>
        </div>
      </section>

      <section className="section bg-light-alt">
        <div className="container">
          <div className="stories-grid">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .stories-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 4rem 0;
          text-align: center;
        }
        .stories-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .stories-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .stories-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .stories-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .stories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
