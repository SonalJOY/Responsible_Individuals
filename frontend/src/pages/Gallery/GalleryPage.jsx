import React, { useEffect, useState } from 'react';
import { galleryService } from '../../services/api';
import { Image, Camera, MapPin } from 'lucide-react';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const data = await galleryService.getItems();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const samplePhotos = [
    { title: 'Community Wetland Planting Drive', tag: 'Lake Restoration', loc: 'Kaikondrahalli, Bengaluru', color: '#10B981' },
    { title: 'Rural STEM Smart Lab Inauguration', tag: 'Education', loc: 'Kolar District', color: '#3B82F6' },
    { title: 'Urban Miyawaki Sapling Installation', tag: 'Afforestation', loc: 'Indiranagar, Bengaluru', color: '#059669' },
    { title: 'Women Artisan Weaving Workshop', tag: 'Livelihoods', loc: 'Tumakuru, Karnataka', color: '#8B5CF6' },
    { title: 'Citizen Water Quality Monitoring Walk', tag: 'Ecology', loc: 'Varthur Inflow, Bengaluru', color: '#0D9488' },
    { title: 'Zero Waste Source Segregation Drive', tag: 'Community', loc: 'Malleshwaram, Bengaluru', color: '#F59E0B' },
  ];

  return (
    <div className="gallery-page-root">
      <section className="gallery-hero">
        <div className="container">
          <span className="section-badge">Visual Documentation</span>
          <h1 className="gallery-hero-title">On the Ground: Action in Photos</h1>
          <p className="gallery-hero-subtitle">
            Moments of citizen ownership, youth discovery, and environmental rejuvenation across our field locations.
          </p>
        </div>
      </section>

      <section className="section bg-light-alt">
        <div className="container">
          <div className="gallery-grid">
            {samplePhotos.map((photo, idx) => (
              <div key={idx} className="card gallery-item-card">
                <div 
                  className="gallery-img-box"
                  style={{ background: `linear-gradient(135deg, ${photo.color} 0%, #0F172A 100%)` }}
                >
                  <Camera size={36} color="rgba(255,255,255,0.8)" />
                  <span className="gallery-tag-pill">{photo.tag}</span>
                </div>
                <div className="gallery-caption-box">
                  <h4 className="gallery-title">{photo.title}</h4>
                  <div className="gallery-loc"><MapPin size={13} /> {photo.loc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .gallery-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 4rem 0;
          text-align: center;
        }
        .gallery-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .gallery-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .gallery-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 640px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .gallery-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .gallery-item-card {
          background: #FFFFFF;
          overflow: hidden;
        }
        .gallery-img-box {
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .gallery-tag-pill {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
          backdrop-filter: blur(4px);
        }
        .gallery-caption-box {
          padding: 1.25rem 1.5rem;
        }
        .gallery-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.35rem;
        }
        .gallery-loc {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
