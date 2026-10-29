import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/api';
import { 
  MapPin, Calendar, Users, Target, 
  CheckCircle2, Clock, Building2, ArrowLeft, Camera 
} from 'lucide-react';

import washImg1 from '../../assets/hosa-byrohalli-wash-1.jpg';
import washImg2 from '../../assets/hosa-byrohalli-wash-2.jpg';
import washImg3 from '../../assets/hosa-byrohalli-wash-3.jpg';

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
        // Fallback for Hosa Byrohalli WASH project if API has network/CORS hiccup
        if (slug === 'hosa-byrohalli-wash-programme') {
          setProject({
            title: 'WASH Awareness & School Sanitation Programme',
            slug: 'hosa-byrohalli-wash-programme',
            focus_area_name: 'Environment & Water Restoration',
            focus_area_color: '#10B981',
            status: 'COMPLETED',
            location: 'Hosa Byrohalli Government School, Bengaluru, Karnataka',
            start_date: '2025-12-16',
            end_date: '2025-12-16',
            budget: 250000,
            raised_amount: 250000,
            beneficiaries_count: 340,
            progress_percentage: 100.0,
            summary: 'Promoting hygiene, clean sanitation facilities, and water awareness while distributing educational stationery and cleaning materials at Hosa Byrohalli Government School.',
            description: 'As part of our commitment to promoting health, hygiene, and sanitation awareness among students, we conducted a comprehensive WASH (Water, Sanitation, and Hygiene) Awareness Programme at Hosa Byrohalli Government School on 16 December 2025. The programme focused on instilling lifelong healthy habits, demonstrating correct handwashing techniques, educating children on personal hygiene, and keeping school classrooms and surrounding grounds clean. To support the students academic journey and encourage clean sanitation practices, educational stationery kits and sanitation supplies were distributed. In addition, our field team conducted a thorough assessment of the schools washroom and sanitation infrastructure to identify key upgrade opportunities for long-term health and dignity.',
            problem_statement: 'Government school students in peri-urban communities often lack structured guidance on daily sanitation practices, safe hand hygiene, and access to regular sanitation consumables, increasing vulnerability to water-borne illnesses and school absenteeism.',
            solution_approach: 'A holistic school-level WASH intervention: interactive student hygiene workshops, distribution of hygiene & stationery materials, on-site washroom safety and accessibility auditing, and long-term sanitation maintenance planning with school faculty.',
            objectives: [
              { id: 'obj-1', title: 'Student WASH & personal hygiene awareness sessions', target: '100% student participation', order: 1 },
              { id: 'obj-2', title: 'Distribute study stationery kits and school cleaning supplies', target: '300+ students & facility maintenance', order: 2 },
              { id: 'obj-3', title: 'Comprehensive inspection of school sanitation & washroom facilities', target: 'Complete baseline infrastructure audit', order: 3 },
            ],
            activities: [
              { id: 'act-1', title: 'Interactive Handwashing & Sanitation Workshop', date: '2025-12-16', outcome: 'Demonstrated 6-step handwashing techniques and hygiene best practices to all classes' },
              { id: 'act-2', title: 'Educational Stationery & Cleaning Materials Distribution', date: '2025-12-16', outcome: 'Provided essential study stationery and hygiene supplies to students and staff' },
              { id: 'act-3', title: 'School Washroom & Sanitation Facility Condition Audit', date: '2025-12-16', outcome: 'Documented existing sanitation conditions to plan accessibility and repair improvements' },
            ],
            partners: [
              { id: 'pt-1', partner_name: 'Hosa Byrohalli Government School', role: 'School & Community Partner' },
              { id: 'pt-2', partner_name: 'Responsible Individuals Volunteer Corps', role: 'Program Execution Partner' },
            ],
            media: [
              { media_file: washImg1, caption: 'Interactive WASH awareness session with students at Hosa Byrohalli Government School' },
              { media_file: washImg2, caption: 'Distribution of learning stationery and sanitation supplies to students' },
              { media_file: washImg3, caption: 'School sanitation facility inspection and infrastructure condition assessment' },
            ]
          });
        }
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
    beneficiaries_count,
    summary,
    description,
    problem_statement,
    solution_approach,
    activities = [],
    partners = [],
    media = [],
  } = project;

  // Resolve media items (inject local authentic assets if needed)
  const displayMedia = (media && media.length > 0) ? media : (slug === 'hosa-byrohalli-wash-programme' ? [
    { media_file: washImg1, caption: 'Interactive WASH awareness session with students at Hosa Byrohalli Government School' },
    { media_file: washImg2, caption: 'Distribution of learning stationery and sanitation supplies to students' },
    { media_file: washImg3, caption: 'School sanitation facility inspection and infrastructure condition assessment' },
  ] : []);

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
                <Target size={18} color="#10B981" />
                <div>
                  <span className="meta-label">Domain Focus</span>
                  <strong>{focus_area_name || 'Community Impact'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section bg-light-alt" style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div className="detail-content-wrap">
            {/* Problem & Solution */}
            <div className="card detail-card">
              <h2 className="detail-card-heading">The Community Challenge</h2>
              <p className="detail-p">{problem_statement || description}</p>

              {solution_approach && (
                <>
                  <h2 className="detail-card-heading" style={{ marginTop: '2.5rem' }}>Our Scientific Approach</h2>
                  <p className="detail-p">{solution_approach}</p>
                </>
              )}
            </div>

            {/* Field Activity Timeline */}
            {activities.length > 0 && (
              <div className="card detail-card">
                <h2 className="detail-card-heading">Field Activity Timeline</h2>
                <div className="activities-timeline">
                  {activities.map((act) => (
                    <div key={act.id || act.title} className="activity-row">
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

            {/* Ground Documentation & Field Photo Gallery */}
            {displayMedia.length > 0 && (
              <div className="card detail-card">
                <div className="detail-gallery-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Camera size={22} color="#10B981" />
                    <h2 className="detail-card-heading" style={{ margin: 0 }}>Ground Documentation &amp; Field Photos</h2>
                  </div>
                  <span className="detail-photo-badge">{displayMedia.length} Verified Photos</span>
                </div>
                <div className="detail-media-grid">
                  {displayMedia.map((m, idx) => (
                    <div key={idx} className="detail-media-item">
                      <img 
                        src={m.media_file || m.url || m.src} 
                        alt={m.caption || `Field photograph ${idx + 1}`} 
                        className="detail-media-img"
                      />
                      {m.caption && <p className="detail-media-caption">{m.caption}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supporting Partners & Collaborators */}
            {partners.length > 0 && (
              <div className="card detail-card">
                <h2 className="detail-card-heading">Supporting Partners &amp; Collaborators</h2>
                <div className="detail-partners-grid">
                  {partners.map((pt) => (
                    <div key={pt.id || pt.partner_name} className="detail-partner-box">
                      <div className="partner-icon-box">
                        <Building2 size={24} color="#10B981" />
                      </div>
                      <div>
                        <strong className="partner-name">{pt.partner_name}</strong>
                        <span className="partner-role-sub">{pt.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="detail-footer-actions">
              <Link to="/projects" className="btn btn-outline detail-back-btn">
                <ArrowLeft size={16} />
                <span>Back to All Projects</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .detail-hero {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          color: white;
          padding: 4.5rem 0 3.5rem 0;
          border-bottom: 4px solid var(--primary-saffron, #F59E0B);
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--secondary-light-blue, #7DD3FC);
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
          color: #E2E8F0;
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
        .detail-content-wrap {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .detail-card {
          padding: 2.5rem;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04);
        }
        .detail-card-heading {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 1.25rem;
        }
        .detail-p {
          font-size: 1.05rem;
          color: var(--slate-700);
          line-height: 1.75;
          margin: 0;
        }
        .activities-timeline {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .activity-row {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          padding: 1.25rem;
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }
        .activity-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ECFDF5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .activity-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.35rem;
        }
        .activity-outcome {
          font-size: 0.9rem;
          color: #475569;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .activity-date {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--slate-500);
          font-weight: 600;
        }
        .detail-gallery-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .detail-photo-badge {
          background: #ECFDF5;
          color: #047857;
          font-size: 0.825rem;
          font-weight: 700;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid #A7F3D0;
        }
        .detail-media-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .detail-media-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 900px) {
          .detail-media-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .detail-media-item {
          border-radius: var(--radius-md, 12px);
          overflow: hidden;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .detail-media-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.12);
        }
        .detail-media-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }
        .detail-media-caption {
          padding: 1rem 1.15rem;
          font-size: 0.85rem;
          color: #334155;
          line-height: 1.5;
          margin: 0;
          flex: 1;
          background: #FFFFFF;
        }
        .detail-partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .detail-partner-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }
        .partner-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: #ECFDF5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .partner-name {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.2rem;
        }
        .partner-role-sub {
          display: block;
          font-size: 0.8rem;
          color: #64748B;
        }
        .detail-footer-actions {
          display: flex;
          justify-content: center;
          padding: 1.5rem 0 2rem 0;
        }
        .detail-back-btn {
          padding: 0.75rem 1.75rem;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
