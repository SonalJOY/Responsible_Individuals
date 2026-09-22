import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, ArrowUpRight, Users, Sparkles } from 'lucide-react';

export default function LatestUpdates() {
  const updates = [
    {
      id: 1,
      slug: 'lake-cleanup-and-tree-plantation-drive',
      category: 'COMMUNITY DRIVE',
      title: 'Monsoon Lake Restoration & Miyawaki Sapling Planting',
      date: 'Sept 26, 2026',
      time: '7:30 AM – 11:30 AM',
      location: 'Kaikondrahalli Lake, Bengaluru',
      desc: 'Join 250 volunteers for our flagship monsoon plantation drive. We will install 800 native tree saplings and bio-mulch root beds along the shoreline.',
      registered: 142,
      capacity: 250,
      gradient: 'linear-gradient(135deg, #091712 0%, #0F4C3A 60%, #10B981 100%)',
    },
    {
      id: 2,
      slug: 'stem-tutor-workshop-and-volunteer-orientation',
      category: 'VOLUNTEER ORIENTATION',
      title: 'Rural School STEM Mentorship: Volunteer Orientation',
      date: 'Oct 10, 2026',
      time: '10:00 AM – 1:00 PM',
      location: 'Social Impact Hub, Indiranagar',
      desc: 'Orientation session for engineers and university students interested in teaching weekend robotics and coding sessions to rural government school batches.',
      registered: 56,
      capacity: 80,
      gradient: 'linear-gradient(135deg, #0C1E38 0%, #1E3A8A 60%, #3B82F6 100%)',
    },
    {
      id: 3,
      slug: 'water-census-drive',
      category: 'ECOLOGY WALK',
      title: 'Citizen Water Quality Monitoring & Bird Census',
      date: 'Oct 24, 2026',
      time: '6:30 AM – 9:30 AM',
      location: 'Varthur Wetland, Bengaluru East',
      desc: 'Hands-on water testing for dissolved oxygen and documenting migratory bird counts with field hydrologists.',
      registered: 35,
      capacity: 50,
      gradient: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)',
    },
    {
      id: 4,
      slug: 'zero-waste-workshop',
      category: 'CIVIC WORKSHOP',
      title: 'Decentralized Composting & Zero-Waste Masterclass',
      date: 'Nov 07, 2026',
      time: '11:00 AM – 1:30 PM',
      location: 'Ward Hub, Jayanagar',
      desc: 'Hands-on aerobic composting literacy for residential apartment associations and citizen green ambassadors.',
      registered: 48,
      capacity: 60,
      gradient: 'linear-gradient(135deg, #2E1A1A 0%, #4A2810 60%, #D97706 100%)',
    },
  ];

  const featuredUpdate = updates[0];
  const supportingUpdates = updates.slice(1, 4);

  return (
    <section className="updates-editorial-root">
      <div className="container">
        {/* Header Row */}
        <div className="updates-header-row">
          <div>
            <div className="updates-badge">
              <Sparkles size={14} className="text-emerald" />
              <span>Ground Engagements</span>
            </div>
            <h2 className="updates-title">Latest Updates & Volunteer Drives</h2>
          </div>

          <Link to="/events" className="btn-see-all-events">
            <span>View All Drives</span>
            <div className="arrow-icon-wrap">
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>

        {/* Editorial Layout: 1 Featured Event + 3 Supporting Items */}
        <div className="updates-grid-layout">
          {/* Main Large Featured Drive */}
          <div className="featured-update-card">
            <div 
              className="featured-update-art"
              style={{ background: featuredUpdate.gradient }}
            >
              <div className="art-overlay">
                <span className="featured-pill">{featuredUpdate.category}</span>
                <div className="event-meta-pill">
                  <Calendar size={13} />
                  <span>{featuredUpdate.date}</span>
                </div>
              </div>
            </div>

            <div className="featured-update-info">
              <div className="update-venue-line">
                <MapPin size={14} color="#059669" />
                <span>{featuredUpdate.location}</span>
                <span className="time-tag">• {featuredUpdate.time}</span>
              </div>

              <h3 className="featured-update-heading">
                <Link to="/events">{featuredUpdate.title}</Link>
              </h3>

              <p className="featured-update-desc">{featuredUpdate.desc}</p>

              <div className="featured-update-bottom">
                <div className="attendance-chip">
                  <Users size={14} color="#059669" />
                  <span><strong>{featuredUpdate.registered}</strong> of {featuredUpdate.capacity} registered</span>
                </div>

                <Link to="/events" className="btn-register-drive">
                  <span>Register Volunteer Spot</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Supporting 3 Updates Stack */}
          <div className="supporting-updates-stack">
            {supportingUpdates.map((item) => (
              <div key={item.id} className="supporting-update-item">
                <div className="supporting-item-top">
                  <span className="supporting-cat-badge">{item.category}</span>
                  <span className="supporting-date">
                    <Calendar size={12} /> {item.date}
                  </span>
                </div>

                <h4 className="supporting-item-title">
                  <Link to="/events">{item.title}</Link>
                </h4>

                <div className="supporting-item-location">
                  <MapPin size={13} color="#64748B" />
                  <span>{item.location}</span>
                </div>

                <p className="supporting-item-desc">{item.desc}</p>

                <div className="supporting-item-footer">
                  <span className="spots-info">
                    {item.registered}/{item.capacity} spots filled
                  </span>
                  <Link to="/events" className="supporting-action-arrow" aria-label="View Event">
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .updates-editorial-root {
          background-color: #FFFFFF;
          padding: 6rem 0;
          position: relative;
        }
        .updates-header-row {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3.5rem;
        }
        @media (min-width: 768px) {
          .updates-header-row {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }
        .updates-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--cream-100);
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
        .updates-title {
          font-family: var(--font-heading);
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--charcoal-900);
          letter-spacing: -0.025em;
          line-height: 1.15;
        }
        @media (min-width: 768px) {
          .updates-title {
            font-size: 3.2rem;
          }
        }
        .btn-see-all-events {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--cream-100);
          border: 1px solid var(--border-subtle);
          color: var(--charcoal-800);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }
        .btn-see-all-events:hover {
          background: var(--cream-200);
          transform: translateY(-2px);
        }
        .arrow-icon-wrap {
          width: 26px;
          height: 26px;
          border-radius: var(--radius-pill);
          background: rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .updates-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        @media (min-width: 1024px) {
          .updates-grid-layout {
            grid-template-columns: 1.2fr 0.9fr;
            gap: 2.5rem;
          }
        }
        .featured-update-card {
          background: var(--cream-50);
          border: 1px solid var(--border-subtle);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          transition: transform var(--transition-normal);
        }
        .featured-update-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 45px rgba(8, 41, 31, 0.1);
        }
        .featured-update-art {
          height: 260px;
          position: relative;
        }
        .art-overlay {
          position: absolute;
          inset: 0;
          padding: 1.75rem;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          color: white;
        }
        .featured-pill {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-pill);
        }
        .event-meta-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #E2E8F0;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-pill);
        }
        .featured-update-info {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .update-venue-line {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.825rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .time-tag {
          color: var(--charcoal-700);
          font-weight: 600;
        }
        .featured-update-heading {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1.3;
          color: var(--charcoal-900);
          margin-bottom: 1rem;
        }
        .featured-update-heading a:hover {
          color: #059669;
        }
        .featured-update-desc {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
          flex: 1;
        }
        .featured-update-bottom {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }
        .attendance-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--charcoal-800);
        }
        .btn-register-drive {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #10B981;
          color: #042F1A;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-pill);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
          transition: all var(--transition-fast);
        }
        .btn-register-drive:hover {
          background: #059669;
          color: #FFFFFF;
          transform: translateY(-2px);
        }
        .supporting-updates-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .supporting-update-item {
          background: var(--cream-50);
          border: 1px solid var(--border-subtle);
          border-radius: 24px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-fast);
        }
        .supporting-update-item:hover {
          background: #FFFFFF;
          border-color: #10B981;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .supporting-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .supporting-cat-badge {
          font-size: 0.72rem;
          font-weight: 800;
          color: #059669;
          letter-spacing: 0.05em;
        }
        .supporting-date {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .supporting-item-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--charcoal-900);
          line-height: 1.35;
          margin-bottom: 0.5rem;
        }
        .supporting-item-title a:hover {
          color: #059669;
        }
        .supporting-item-location {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .supporting-item-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }
        .supporting-item-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle);
        }
        .spots-info {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--charcoal-700);
        }
        .supporting-action-arrow {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-pill);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--charcoal-800);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        .supporting-update-item:hover .supporting-action-arrow {
          background: #10B981;
          border-color: #10B981;
          color: #FFFFFF;
          transform: translateX(3px);
        }
      `}</style>
    </section>
  );
}
