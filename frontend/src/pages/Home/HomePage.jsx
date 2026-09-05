import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, ArrowRight, ShieldCheck, TreePine, GraduationCap, 
  Users, HeartPulse, Briefcase, CheckCircle, Sparkles, Building2
} from 'lucide-react';
import ImpactCounter from '../../components/common/ImpactCounter';
import ProjectCard from '../../components/common/ProjectCard';
import StoryCard from '../../components/common/StoryCard';
import { projectService, impactService, storyService, partnerService } from '../../services/api';

const areaIcons = {
  TreePine, GraduationCap, Users, HeartPulse, Briefcase, ShieldCheck
};

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
        setFeaturedProjects(projData.slice(0, 3));
        setImpactAreas(areasData);
        setStories(storiesData.slice(0, 2));
        setPartners(partnersData);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="home-page-root">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <Sparkles size={16} color="#10B981" />
              <span>Building Responsible Communities • 2026</span>
            </div>

            <h1 className="hero-title">
              Empowering Citizens.<br />
              <span className="hero-gradient-text">Creating Sustainable Impact.</span>
            </h1>

            <p className="hero-subtitle">
              Responsible Individuals connects communities, volunteers, donors, and corporate CSR partners through transparent, data-driven grassroots action to solve water, ecological, and educational challenges.
            </p>

            <div className="hero-cta-group">
              <Link to="/projects" className="btn btn-accent btn-lg">
                <span>Explore Our Work</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/volunteer" className="btn btn-outline btn-lg">
                <span>Join as a Volunteer</span>
              </Link>
            </div>

            {/* Quick Proof Pills */}
            <div className="hero-proof-pills">
              <div className="proof-pill">
                <CheckCircle size={16} color="#10B981" />
                <span>80G Tax Deductible</span>
              </div>
              <div className="proof-pill">
                <CheckCircle size={16} color="#10B981" />
                <span>100% Verified Outcomes</span>
              </div>
              <div className="proof-pill">
                <CheckCircle size={16} color="#10B981" />
                <span>Audited Financials</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Impact Statistics */}
      <ImpactCounter />

      {/* Focus Areas Section */}
      <section className="section bg-light-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Pillars</span>
            <h2 className="section-title">Strategic Impact Areas</h2>
            <p className="section-subtitle">
              Every project is mapped to rigorous Sustainable Development Goals (SDGs) to ensure measurable and lasting community transformation.
            </p>
          </div>

          <div className="areas-grid">
            {impactAreas.map((area) => {
              const IconComp = areaIcons[area.icon_name] || ShieldCheck;
              return (
                <div key={area.id} className="card area-card">
                  <div 
                    className="area-icon-wrap"
                    style={{ background: `${area.color_accent || '#10B981'}15`, color: area.color_accent || '#10B981' }}
                  >
                    <IconComp size={32} />
                  </div>
                  <h3 className="area-card-title">{area.name}</h3>
                  <p className="area-card-desc">{area.description}</p>
                  {area.sdg_alignment && (
                    <span className="sdg-tag">{area.sdg_alignment.split(',')[0]}</span>
                  )}
                  <Link to={`/projects?focus_area=${area.id}`} className="area-explore-link">
                    <span>View Projects</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="section">
        <div className="container">
          <div className="projects-header-row">
            <div>
              <span className="section-badge">Ground Initiatives</span>
              <h2 className="section-title">Active Projects on the Ground</h2>
            </div>
            <Link to="/projects" className="btn btn-secondary view-all-btn">
              <span>View All Projects</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="projects-grid">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Stories of Change */}
      <section className="section bg-light-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Real Lives, Real Change</span>
            <h2 className="section-title">Stories of Transformation</h2>
            <p className="section-subtitle">
              Behind every metric is an individual, school, or community whose journey reflects the power of accountable grassroots action.
            </p>
          </div>

          <div className="stories-grid">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      {/* CSR & Partner Showcase */}
      {partners.length > 0 && (
        <section className="section-sm partners-section">
          <div className="container">
            <div className="partners-header">
              <span className="partner-subhead">TRUSTED BY CSR PARTNERS & CITIZEN COLLECTIVES</span>
            </div>
            <div className="partners-logos-row">
              {partners.map((partner) => (
                <div key={partner.id} className="partner-badge-item">
                  <Building2 size={20} color="#10B981" />
                  <span className="partner-name">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final Call to Action */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner-card">
            <div className="cta-banner-text">
              <h2 className="cta-banner-title">Ready to Make a Measurable Difference?</h2>
              <p className="cta-banner-desc">
                Whether you choose to contribute your time as a weekend volunteer, fund a classroom smart lab, or partner with your CSR grant — your action creates ripple effects.
              </p>
            </div>
            <div className="cta-banner-actions">
              <Link to="/donate" className="btn btn-amber btn-lg">
                <Heart size={20} fill="currentColor" />
                <span>Donate Now</span>
              </Link>
              <Link to="/volunteer" className="btn btn-outline btn-lg">
                <span>Volunteer With Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          background: radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0) 50%),
                      linear-gradient(135deg, #091712 0%, #0F4C3A 60%, #0F172A 100%);
          color: white;
          padding: 6rem 0 5rem 0;
          position: relative;
          overflow: hidden;
        }
        .hero-container {
          position: relative;
          z-index: 10;
        }
        .hero-content {
          max-width: 820px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(52, 211, 153, 0.3);
          color: #34D399;
          padding: 0.4rem 1.1rem;
          border-radius: var(--radius-pill);
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: 0.04em;
        }
        .hero-title {
          font-size: 2.85rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
          color: #FFFFFF;
        }
        @media (min-width: 768px) {
          .hero-title {
            font-size: 4rem;
          }
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, #34D399 0%, #F59E0B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          max-width: 720px;
        }
        .hero-cta-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .hero-proof-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          font-size: 0.85rem;
          color: #94A3B8;
        }
        .proof-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .bg-light-alt {
          background-color: #F8FAFC;
        }
        .areas-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }
        @media (min-width: 640px) {
          .areas-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .areas-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .area-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: #FFFFFF;
        }
        .area-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .area-card-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.6rem;
        }
        .area-card-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1.25rem;
          flex: 1;
        }
        .sdg-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #047857;
          background: #D1FAE5;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
          margin-bottom: 1rem;
        }
        .area-explore-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--primary-800);
        }
        .area-explore-link:hover {
          color: var(--primary-600);
          transform: translateX(3px);
        }
        .projects-header-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3rem;
        }
        @media (min-width: 768px) {
          .projects-header-row {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }
        .projects-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .projects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .projects-grid {
            grid-template-columns: repeat(3, 1fr);
          }
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
        .partners-section {
          background: #FFFFFF;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          padding: 3rem 0;
        }
        .partners-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .partner-subhead {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--slate-400);
        }
        .partners-logos-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }
        .partner-badge-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--slate-50);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--slate-200);
          font-weight: 700;
          color: var(--slate-800);
          font-size: 0.95rem;
        }
        .cta-banner-section {
          padding: 5rem 0;
        }
        .cta-banner-card {
          background: linear-gradient(135deg, #0F4C3A 0%, #064E3B 60%, #0F172A 100%);
          color: white;
          padding: 3.5rem;
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          box-shadow: var(--shadow-xl);
        }
        @media (min-width: 1024px) {
          .cta-banner-card {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        .cta-banner-text {
          max-width: 600px;
        }
        .cta-banner-title {
          color: white;
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }
        .cta-banner-desc {
          color: #D1FAE5;
          font-size: 1.05rem;
          line-height: 1.65;
        }
        .cta-banner-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
