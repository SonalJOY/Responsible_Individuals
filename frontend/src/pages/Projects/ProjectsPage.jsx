import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProjectCard from '../../components/common/ProjectCard';
import { projectService, impactService } from '../../services/api';
import { Search, Filter, Layers } from 'lucide-react';

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(searchParams.get('focus_area') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, areasRes] = await Promise.all([
          projectService.getProjects(),
          impactService.getAreas(),
        ]);
        setProjects(projRes);
        setAreas(areasRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFilterChange = (areaId) => {
    setSelectedArea(areaId);
    if (areaId === 'all') {
      searchParams.delete('focus_area');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ focus_area: areaId });
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesArea = selectedArea === 'all' || p.focus_area === selectedArea;
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesArea && matchesSearch;
  });

  return (
    <div className="projects-page-root">
      {/* Page Header */}
      <section className="projects-hero">
        <div className="container">
          <span className="section-badge">Our Work</span>
          <h1 className="projects-hero-title">Ground Projects & Interventions</h1>
          <p className="projects-hero-subtitle">
            Explore our structured, science-backed grassroots projects solving critical water restoration, education inequality, and urban ecology challenges.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="section-sm bg-white border-bottom">
        <div className="container">
          <div className="filter-controls-row">
            {/* Focus Area Pill Tabs */}
            <div className="area-tabs">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`area-tab-btn ${selectedArea === 'all' ? 'active' : ''}`}
              >
                All Projects
              </button>
              {areas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleFilterChange(a.id)}
                  className={`area-tab-btn ${selectedArea === a.id ? 'active' : ''}`}
                >
                  {a.name.split('&')[0].trim()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search projects or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section bg-light-alt">
        <div className="container">
          {loading ? (
            <div className="loading-state">Loading initiatives...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <Layers size={48} color="#94A3B8" />
              <h3>No projects found</h3>
              <p>Try selecting another focus area or clearing your search term.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .projects-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 3.5rem 0;
          text-align: center;
        }
        .projects-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .projects-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .projects-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 740px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .border-bottom {
          border-bottom: 1px solid var(--border-subtle);
        }
        .filter-controls-row {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        @media (min-width: 900px) {
          .filter-controls-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        .area-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .area-tab-btn {
          padding: 0.5rem 1.15rem;
          border-radius: var(--radius-pill);
          border: 1px solid var(--border-subtle);
          background: var(--white);
          color: var(--slate-700);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .area-tab-btn:hover {
          border-color: var(--primary-500);
          color: var(--primary-800);
        }
        .area-tab-btn.active {
          background: var(--primary-800);
          color: var(--white);
          border-color: var(--primary-800);
          box-shadow: 0 2px 8px rgba(15, 76, 58, 0.25);
        }
        .search-input-wrap {
          position: relative;
          min-width: 280px;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-400);
        }
        .search-input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.6rem;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--primary-500);
        }
        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem 0;
          color: var(--slate-500);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
}
