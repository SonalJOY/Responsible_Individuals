import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/api';
import { 
  MapPin, Calendar, Users, DollarSign, Target, 
  CheckCircle2, Clock, Building2, Heart, ArrowLeft 
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await projectService.getProjectDetail(slug);
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [slug]);

  if (loading) {
    return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2>Project not found</h2>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Projects</Link>
      </div>
    );
  }

  const {
    title,
    focus_area_name,
    focus_area_color,
    status,
    location,
    start_date,
    end_date,
    budget,
    raised_amount,
    beneficiaries_count,
    progress_percentage,
    summary,
    description,
    problem_statement,
    solution_approach,
    objectives = [],
    activities = [],
    kpis = [],
    partners = [],
  } = project;

  return (
    <div className="project-detail-root">
      {/* Top Banner */}
      <section className="detail-hero" style={{ borderBottomColor: focus_area_color || '#10B981' }}>
        <div className="container">
          <Link to="/projects" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to all projects</span>
          </Link>

          <div className="detail-hero-body">
            <div className="meta-badges">
              <span className="badge" style={{ backgroundColor: focus_area_color || '#10B981', color: 'white' }}>
                {focus_area_name}
              </span>
              <span className="badge badge-emerald">
                Status: {status.replace('_', ' ')}
              </span>
            </div>

            <h1 className="detail-title">{title}</h1>
            <p className="detail-lead">{summary}</p>

            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <MapPin size={18} color="#10B981" />
                <div>
                  <span className="meta-label">Location</span>
                  <strong>{location}</strong>
                </div>
              </div>

              <div className="detail-meta-item">
                <Calendar size={18} color="#10B981" />
                <div>
                  <span className="meta-label">Timeline</span>
                  <strong>{start_date} {end_date ? `to ${end_date}` : ''}</strong>
                </div>
              </div>

              <div className="detail-meta-item">
                <Users size={18} color="#10B981" />
                <div>
                  <span className="meta-label">Direct Impact</span>
                  <strong>{(beneficiaries_count || 0).toLocaleString()} people</strong>
                </div>
              </div>

              <div className="detail-meta-item">
                <DollarSign size={18} color="#10B981" />
                <div>
                  <span className="meta-label">Funding Status</span>
                  <strong>₹{Number(raised_amount).toLocaleString()} / ₹{Number(budget).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section bg-light-alt">
        <div className="container">
          <div className="detail-layout-grid">
            {/* Left Column: Deep Dive Narrative */}
            <div className="detail-main-col">
              {/* Problem & Solution */}
              <div className="card detail-card">
                <h2 className="detail-card-heading">The Community Challenge</h2>
                <p className="detail-p">{problem_statement || description}</p>

                {solution_approach && (
                  <>
                    <h2 className="detail-card-heading" style={{ marginTop: '2rem' }}>Our Scientific Approach</h2>
                    <p className="detail-p">{solution_approach}</p>
                  </>
                )}
              </div>

              {/* Measurable KPIs */}
              {kpis.length > 0 && (
                <div className="card detail-card">
                  <h2 className="detail-card-heading">Key Measurable Metrics (KPIs)</h2>
                  <div className="kpi-list">
                    {kpis.map((kpi) => (
                      <div key={kpi.id} className="kpi-item">
                        <div className="kpi-labels">
                          <strong>{kpi.metric_name}</strong>
                          <span className="kpi-value-text">
                            {Number(kpi.achieved).toLocaleString()} / {Number(kpi.target).toLocaleString()} {kpi.unit}
                          </span>
                        </div>
                        <div className="kpi-progress-bar">
                          <div 
                            className="kpi-progress-fill" 
                            style={{ width: `${Math.min(kpi.percentage, 100)}%`, backgroundColor: focus_area_color || '#10B981' }}
                          />
                        </div>
                        <span className="kpi-pct">{kpi.percentage}% achieved</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Objectives & Activities */}
              {activities.length > 0 && (
                <div className="card detail-card">
                  <h2 className="detail-card-heading">Field Activity Timeline</h2>
                  <div className="activities-timeline">
                    {activities.map((act) => (
                      <div key={act.id} className="activity-row">
                        <div className="activity-icon-wrap">
                          <CheckCircle2 size={20} color="#10B981" />
                        </div>
                        <div className="activity-info">
                          <h4 className="activity-title">{act.title}</h4>
                          {act.outcome && <p className="activity-outcome">{act.outcome}</p>}
                          <div className="activity-date">
                            <Clock size={12} /> <span>{act.date || 'Scheduled'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: CTA & Partners */}
            <div className="detail-side-col">
              {/* Support Card */}
              <div className="card detail-action-card">
                <h3 className="action-card-title">Support This Initiative</h3>
                <p className="action-card-text">
                  Your contribution directly funds transparent materials, labor, bio-enzymes, and equipment for this project.
                </p>

                <div className="detail-funding-progress">
                  <div className="progress-labels">
                    <span>{progress_percentage}% funded</span>
                    <span>₹{Number(raised_amount).toLocaleString()}</span>
                  </div>
                  <div className="detail-bar-track">
                    <div 
                      className="detail-bar-fill" 
                      style={{ width: `${Math.min(progress_percentage, 100)}%` }} 
                    />
                  </div>
                </div>

                <Link to={`/donate?project=${project.id}`} className="btn btn-amber action-btn">
                  <Heart size={18} fill="currentColor" />
                  <span>Donate to Project</span>
                </Link>

                <Link to="/volunteer" className="btn btn-secondary action-btn" style={{ marginTop: '0.75rem' }}>
                  <span>Volunteer for this Project</span>
                </Link>

                <div className="tax-notice-side">
                  <span className="tax-badge-sm">80G</span>
                  <span>50% tax exemption receipt provided instantly</span>
                </div>
              </div>

              {/* Supporting Partners */}
              {partners.length > 0 && (
                <div className="card detail-partners-card">
                  <h4 className="partners-card-title">Supporting Partners</h4>
                  <div className="partners-card-list">
                    {partners.map((pt) => (
                      <div key={pt.id} className="partner-card-row">
                        <Building2 size={20} color="#10B981" />
                        <div>
                          <strong>{pt.partner_name}</strong>
                          <span className="partner-role-sub">{pt.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .detail-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 4.5rem 0 3.5rem 0;
          border-bottom: 4px solid #10B981;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #34D399;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        .back-link:hover {
          color: white;
        }
        .meta-badges {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .detail-title {
          color: white;
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .detail-title {
            font-size: 3.25rem;
          }
        }
        .detail-lead {
          font-size: 1.15rem;
          color: #D1FAE5;
          max-width: 820px;
          line-height: 1.65;
          margin-bottom: 2.5rem;
        }
        .detail-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }
        @media (min-width: 900px) {
          .detail-meta-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .detail-meta-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .meta-label {
          display: block;
          font-size: 0.725rem;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .detail-meta-item strong {
          color: white;
          font-size: 0.95rem;
        }
        .detail-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        @media (min-width: 1024px) {
          .detail-layout-grid {
            grid-template-columns: 2fr 1.1fr;
          }
        }
        .detail-card {
          padding: 2.25rem;
          background: #FFFFFF;
          margin-bottom: 2rem;
        }
        .detail-card-heading {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 1.25rem;
        }
        .detail-p {
          font-size: 1rem;
          color: var(--slate-700);
          line-height: 1.7;
        }
        .kpi-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .kpi-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.925rem;
          margin-bottom: 0.4rem;
        }
        .kpi-progress-bar {
          height: 8px;
          background: var(--slate-200);
          border-radius: var(--radius-pill);
          overflow: hidden;
        }
        .kpi-progress-fill {
          height: 100%;
          border-radius: var(--radius-pill);
        }
        .kpi-pct {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-top: 0.25rem;
          display: block;
        }
        .activities-timeline {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .activity-row {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .activity-title {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .activity-outcome {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 0.35rem;
        }
        .activity-date {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--slate-500);
        }
        .detail-action-card {
          padding: 2rem;
          background: #FFFFFF;
          margin-bottom: 2rem;
          border-top: 4px solid var(--accent-amber);
        }
        .action-card-title {
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .action-card-text {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 1.5rem;
        }
        .detail-funding-progress {
          margin-bottom: 1.5rem;
        }
        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }
        .detail-bar-track {
          height: 8px;
          background: var(--slate-200);
          border-radius: var(--radius-pill);
          overflow: hidden;
        }
        .detail-bar-fill {
          height: 100%;
          background: var(--accent-amber);
          border-radius: var(--radius-pill);
        }
        .action-btn {
          width: 100%;
        }
        .tax-notice-side {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--slate-500);
          margin-top: 1.25rem;
        }
        .tax-badge-sm {
          background: var(--primary-100);
          color: var(--primary-800);
          padding: 0.15rem 0.4rem;
          font-weight: 800;
          border-radius: var(--radius-sm);
        }
        .detail-partners-card {
          padding: 1.75rem;
          background: #FFFFFF;
        }
        .partners-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .partners-card-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .partner-card-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
        }
        .partner-role-sub {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
