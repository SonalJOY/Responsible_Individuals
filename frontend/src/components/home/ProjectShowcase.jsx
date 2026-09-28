import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight, Droplet, Sparkles, TrendingUp, Layers } from 'lucide-react';

export default function ProjectShowcase({ projects = [] }) {
  // Format currency in Indian format
  const formatCurrency = (val) => {
    const num = Number(val);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Fallback if projects not yet loaded
  const defaultFeatured = {
    id: 'p1',
    slug: 'lake-rejuvenation-bengaluru-east',
    title: 'Kaikondrahalli-Varthur Feeder Lake Rejuvenation',
    focus_area_name: 'Environment & Water Restoration',
    focus_area_color: '#10B981',
    location: 'Bengaluru East, Karnataka',
    summary: 'Transforming a silted 14-acre feeder wetland into a thriving biodiversity sanctuary, groundwater recharge zone, and volunteer community park.',
    budget: 4500000,
    raised_amount: 3850000,
    progress_percentage: 85,
    beneficiaries_count: 18500,
  };

  const defaultSupporting = [
    {
      id: 'p2',
      slug: 'rural-digital-classrooms-stem-hub',
      title: 'Digital Classrooms & STEM Labs for Rural Government Schools',
      focus_area_name: 'Education & Digital Access',
      focus_area_color: '#3B82F6',
      location: 'Kolar & Tumakuru Districts',
      summary: 'Bridging the rural-urban digital divide by equipping 30 rural high schools with interactive STEM software, robotics kits, and volunteer teacher mentors.',
      budget: 3200000,
      raised_amount: 2750000,
      progress_percentage: 86,
      beneficiaries_count: 7400,
    },
    {
      id: 'p3',
      slug: 'urban-miyawaki-micro-forests',
      title: 'Urban Micro-Forests: Miyawaki Green Lung Initiative',
      focus_area_name: 'Afforestation & Ecology',
      focus_area_color: '#059669',
      location: 'Bengaluru Metro Area',
      summary: 'Planting dense native multi-tier forests using the Japanese Miyawaki technique to lower local heat island temperatures and restore avian nesting zones.',
      budget: 1800000,
      raised_amount: 1800000,
      progress_percentage: 100,
      beneficiaries_count: 12000,
    },
  ];

  const featured = projects.length > 0 ? projects[0] : defaultFeatured;
  const supporting = projects.length > 1 ? projects.slice(1, 3) : defaultSupporting;

  return (
    <section className="project-editorial-root">
      <div className="container">
        {/* Section Header */}
        <div className="project-header-row">
          <div>
            <div className="project-badge">
              <Layers size={14} className="text-emerald" />
              <span>Ground Initiatives</span>
            </div>
            <h2 className="project-title">Active Projects on the Ground</h2>
          </div>
          <Link to="/projects" className="btn-view-all">
            <span>View All Projects</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Magazine Editorial Grid: 1 Large Dominant + 2 Asymmetrical */}
        <div className="magazine-grid">
          {/* Large Dominant Featured Project Card */}
          <div className="featured-hero-card">
            <div className="featured-hero-visual">
              {/* Organic Canvas Graphic */}
              <div 
                className="featured-photo-backdrop"
                style={{
                  background: 'linear-gradient(135deg, #08291F 0%, #0F4C3A 60%, #10B981 100%)',
                }}
              >
                <div className="featured-inner-overlay">
                  <span className="featured-flag">FLAGSHIP RESTORATION</span>
                  <div className="featured-tag-row">
                    <span className="featured-area-badge">
                      {featured.focus_area_name || 'Environment & Water Restoration'}
                    </span>
                    <span className="featured-location-badge">
                      <MapPin size={13} /> {featured.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="featured-hero-content">
              <h3 className="featured-project-heading">
                <Link to={`/projects/${featured.slug}`}>{featured.title}</Link>
              </h3>

              <p className="featured-project-summary">{featured.summary}</p>

              {/* Progress & Financials */}
              <div className="featured-funding-row">
                <div className="funding-stat-box">
                  <span className="funding-label">Raised to Date</span>
                  <span className="funding-val">{formatCurrency(featured.raised_amount)}</span>
                </div>
                <div className="funding-stat-box">
                  <span className="funding-label">Budget Goal</span>
                  <span className="funding-val">{formatCurrency(featured.budget)}</span>
                </div>
                <div className="funding-stat-box">
                  <span className="funding-label">Direct Beneficiaries</span>
                  <span className="funding-val text-emerald">
                    <Users size={14} style={{ display: 'inline', marginRight: 4 }} />
                    {(featured.beneficiaries_count || 18500).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="editorial-progress-track">
                <div 
                  className="editorial-progress-fill" 
                  style={{ width: `${Math.min(featured.progress_percentage || 85, 100)}%` }}
                />
              </div>

              <div className="featured-card-action">
                <Link to={`/projects/${featured.slug}`} className="btn-explore-project">
                  <span>Explore Project Blueprint</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Asymmetrical Supporting Column */}
          <div className="supporting-column">
            {supporting.map((proj) => (
              <div key={proj.id} className="supporting-card">
                <div className="supporting-card-top">
                  <span 
                    className="supporting-area-badge"
                    style={{ backgroundColor: `${proj.focus_area_color || '#3B82F6'}18`, color: proj.focus_area_color || '#3B82F6' }}
                  >
                    {proj.focus_area_name || 'Initiative'}
                  </span>
                  <span className="supporting-location">
                    <MapPin size={12} /> {proj.location}
                  </span>
                </div>

                <h4 className="supporting-title">
                  <Link to={`/projects/${proj.slug}`}>{proj.title}</Link>
                </h4>

                <p className="supporting-desc">{proj.summary}</p>

                <div className="supporting-footer">
                  <div className="supporting-impact-stat">
                    <Users size={14} color="#059669" />
                    <span><strong>{(proj.beneficiaries_count || 0).toLocaleString('en-IN')}</strong> reached</span>
                  </div>
                  <Link to={`/projects/${proj.slug}`} className="supporting-link">
                    <span>Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .project-editorial-root {
          background-color: var(--cream-50);
          padding: 6rem 0;
          position: relative;
        }
        .project-header-row {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3.5rem;
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
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--charcoal-800);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .project-title {
          font-family: var(--font-heading);
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--charcoal-900);
          letter-spacing: -0.025em;
          line-height: 1.15;
        }
        @media (min-width: 768px) {
          .project-title {
            font-size: 3.2rem;
          }
        }
        .btn-view-all {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--charcoal-800);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }
        .btn-view-all:hover {
          background: var(--cream-200);
          transform: translateY(-2px);
        }
        .magazine-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        @media (min-width: 1024px) {
          .magazine-grid {
            grid-template-columns: 1.25fr 0.95fr;
            gap: 2.5rem;
          }
        }
        .featured-hero-card {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(8, 41, 31, 0.08);
          display: flex;
          flex-direction: column;
          transition: transform var(--transition-normal);
        }
        .featured-hero-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 60px rgba(8, 41, 31, 0.12);
        }
        .featured-hero-visual {
          height: 280px;
          position: relative;
        }
        @media (min-width: 768px) {
          .featured-hero-visual {
            height: 320px;
          }
        }
        .featured-photo-backdrop {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .featured-inner-overlay {
          position: absolute;
          inset: 0;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.3) 0%, rgba(8, 41, 31, 0.7) 100%);
          color: white;
        }
        .featured-flag {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #34D399;
        }
        .featured-tag-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .featured-area-badge {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          padding: 0.3rem 0.85rem;
          border-radius: var(--radius-pill);
          font-size: 0.78rem;
          font-weight: 700;
        }
        .featured-location-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #E2E8F0;
          padding: 0.3rem 0.85rem;
          border-radius: var(--radius-pill);
          font-size: 0.78rem;
          font-weight: 600;
        }
        .featured-hero-content {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .featured-project-heading {
          font-family: var(--font-heading);
          font-size: 1.85rem;
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 1rem;
          color: var(--charcoal-900);
        }
        .featured-project-heading a:hover {
          color: #059669;
        }
        .featured-project-summary {
          font-size: 1.05rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin-bottom: 2rem;
          flex: 1;
        }
        .featured-funding-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding: 1.25rem;
          background: var(--cream-100);
          border-radius: 20px;
          margin-bottom: 1.25rem;
          border: 1px solid var(--border-subtle);
        }
        .funding-stat-box {
          display: flex;
          flex-direction: column;
        }
        .funding-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.25rem;
        }
        .funding-val {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--charcoal-900);
        }
        .editorial-progress-track {
          height: 8px;
          background: var(--cream-300);
          border-radius: var(--radius-pill);
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .editorial-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #059669 0%, #10B981 100%);
          border-radius: var(--radius-pill);
        }
        .btn-explore-project {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: #10B981;
          color: #042F1A;
          font-weight: 700;
          font-size: 1rem;
          padding: 0.85rem 1.85rem;
          border-radius: var(--radius-pill);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
          transition: all var(--transition-fast);
        }
        .btn-explore-project:hover {
          background: #059669;
          color: #FFFFFF;
          transform: translateY(-2px);
        }
        .supporting-column {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .supporting-card {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: 28px;
          padding: 2.25rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          transition: all var(--transition-normal);
        }
        .supporting-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(8, 41, 31, 0.08);
          border-color: #10B981;
        }
        .supporting-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .supporting-area-badge {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
          letter-spacing: 0.04em;
        }
        .supporting-location {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .supporting-title {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--charcoal-900);
          line-height: 1.35;
          margin-bottom: 0.75rem;
        }
        .supporting-title a:hover {
          color: #059669;
        }
        .supporting-desc {
          font-size: 0.925rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .supporting-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-subtle);
          font-size: 0.85rem;
        }
        .supporting-impact-stat {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--charcoal-800);
        }
        .supporting-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          color: #059669;
        }
        .supporting-link:hover {
          transform: translateX(3px);
        }
      `}</style>
    </section>
  );
}
