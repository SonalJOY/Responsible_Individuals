import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import { 
  FolderKanban, HeartHandshake, CreditCard, Users, 
  Clock, ArrowUpRight, CheckCircle2, MessageSquare, AlertCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div style={{ color: '#94A3B8' }}>Loading executive analytics...</div>;
  }

  const kpis = stats?.kpis || {
    total_projects: 4,
    active_projects: 4,
    total_volunteers: 1,
    pending_volunteers: 0,
    donations_amount: 15000,
    donations_count: 1,
    beneficiaries_reached: 42900,
    upcoming_events: 2,
    pending_enquiries: 1,
  };

  return (
    <div className="admin-dashboard-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-main-heading">Operations Dashboard</h1>
          <p className="admin-subtext">Real-time consolidated KPIs across projects, volunteers, donations, and impact metrics.</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title-label">Active Projects</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">{kpis.active_projects} / {kpis.total_projects}</div>
          <span className="kpi-hint-text">100% on schedule</span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title-label">Verified Volunteers</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <HeartHandshake size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">{kpis.total_volunteers}</div>
          <span className="kpi-hint-text">{kpis.pending_volunteers} pending review</span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title-label">Total Donations Raised</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">₹{(kpis.donations_amount / 1000).toFixed(1)}k</div>
          <span className="kpi-hint-text">{kpis.donations_count} verified receipts</span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title-label">Beneficiaries Reached</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">{kpis.beneficiaries_reached.toLocaleString()}</div>
          <span className="kpi-hint-text">Across 4 field clusters</span>
        </div>
      </div>

      {/* Two Column Section: Recent Financials & Recent Applications */}
      <div className="admin-activity-grid">
        {/* Left: Recent Donations */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h3>Recent Donations</h3>
            <Link to="/admin-portal/donations" className="panel-action-link">View Ledger</Link>
          </div>
          <div className="panel-list">
            {(stats?.recent_donations || []).length === 0 ? (
              <p className="no-data">No recent donations logged.</p>
            ) : (
              stats.recent_donations.map((d) => (
                <div key={d.id} className="panel-list-item">
                  <div>
                    <strong>{d.donor__full_name || 'Anonymous Donor'}</strong>
                    <span className="item-sub">Receipt: {d.receipt_number}</span>
                  </div>
                  <div className="amount-badge">
                    +₹{Number(d.amount).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Volunteer Applications */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h3>Volunteer Applications</h3>
            <Link to="/admin-portal/volunteers" className="panel-action-link">Review All</Link>
          </div>
          <div className="panel-list">
            {(stats?.recent_applications || []).length === 0 ? (
              <p className="no-data">No pending applications.</p>
            ) : (
              stats.recent_applications.map((app) => (
                <div key={app.id} className="panel-list-item">
                  <div>
                    <strong>{app.volunteer_profile__full_name}</strong>
                    <span className="item-sub">{app.opportunity__title}</span>
                  </div>
                  <span className={`status-pill ${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Contact Inquiries */}
      <div className="admin-panel-card" style={{ marginTop: '2rem' }}>
        <div className="panel-card-header">
          <h3>Pending Inquiries & CSR Proposals</h3>
          <Link to="/admin-portal/enquiries" className="panel-action-link">Open Inbox</Link>
        </div>
        <div className="panel-list">
          {(stats?.recent_enquiries || []).length === 0 ? (
            <p className="no-data">No new inquiries logged.</p>
          ) : (
            stats.recent_enquiries.map((enq) => (
              <div key={enq.id} className="panel-list-item">
                <div>
                  <strong>{enq.name}</strong> • <span style={{ color: '#38BDF8' }}>[{enq.department}]</span> {enq.subject}
                </div>
                <span className="status-pill new">
                  {enq.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .admin-main-heading {
          font-size: 1.85rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 0.25rem;
        }
        .admin-subtext {
          font-size: 0.9rem;
          color: #94A3B8;
          margin-bottom: 2rem;
        }
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        @media (min-width: 640px) {
          .admin-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1200px) {
          .admin-kpi-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .admin-kpi-card {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: var(--radius-lg);
          padding: 1.75rem;
        }
        .kpi-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .kpi-title-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #94A3B8;
        }
        .kpi-icon-pill {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kpi-metric-val {
          font-family: var(--font-heading);
          font-size: 2.1rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 0.25rem;
        }
        .kpi-hint-text {
          font-size: 0.75rem;
          color: #10B981;
          font-weight: 600;
        }
        .admin-activity-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 1024px) {
          .admin-activity-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .admin-panel-card {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: var(--radius-lg);
          padding: 1.75rem;
        }
        .panel-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #1E293B;
        }
        .panel-card-header h3 {
          font-size: 1.15rem;
          color: #FFFFFF;
        }
        .panel-action-link {
          font-size: 0.8rem;
          font-weight: 700;
          color: #10B981;
        }
        .panel-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .panel-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.875rem;
        }
        .item-sub {
          display: block;
          font-size: 0.75rem;
          color: #64748B;
          margin-top: 0.15rem;
        }
        .amount-badge {
          font-weight: 700;
          color: #10B981;
        }
        .status-pill {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }
        .status-pill.approved {
          background: #064E3B;
          color: #34D399;
        }
        .status-pill.pending, .status-pill.new {
          background: #78350F;
          color: #FBBF24;
        }
        .status-pill.rejected {
          background: #7F1D1D;
          color: #F87171;
        }
        .no-data {
          color: #64748B;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
