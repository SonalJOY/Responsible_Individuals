import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Check, X, AlertCircle, HeartHandshake } from 'lucide-react';

export default function AdminVolunteers() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await adminService.getApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setActionLoading(appId);
    try {
      await adminService.updateApplicationStatus(appId, newStatus);
      setApplications(applications.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="admin-volunteers-view">
      <div className="admin-page-header">
        <h1 className="admin-main-heading">Volunteer Applications Management</h1>
        <p className="admin-subtext">Review citizen applications, verify interest alignment, and assign volunteer batches.</p>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ color: '#94A3B8', padding: '2rem' }}>Loading applications...</div>
        ) : applications.length === 0 ? (
          <div style={{ color: '#94A3B8', padding: '2rem' }}>No applications registered yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Opportunity Applied</th>
                <th>Motivation / Statement</th>
                <th>Applied Date</th>
                <th>Current Status</th>
                <th>Review Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.volunteer_name}</strong>
                    <span className="table-sub-info">{app.volunteer_email}</span>
                  </td>
                  <td>
                    <span>{app.opportunity_title}</span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <p className="statement-preview">{app.statement_of_purpose}</p>
                  </td>
                  <td>
                    <span className="table-date">{new Date(app.created_at).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-wrap">
                      <button
                        onClick={() => handleStatusChange(app.id, 'APPROVED')}
                        disabled={actionLoading === app.id || app.status === 'APPROVED'}
                        className="table-action-btn approve"
                        title="Approve Volunteer"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(app.id, 'REJECTED')}
                        disabled={actionLoading === app.id || app.status === 'REJECTED'}
                        className="table-action-btn reject"
                        title="Decline Volunteer"
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
        .admin-table-container {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: var(--radius-lg);
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }
        .admin-table th {
          background: #162035;
          padding: 1rem 1.25rem;
          color: #94A3B8;
          font-weight: 700;
          border-bottom: 1px solid #1E293B;
          text-transform: uppercase;
          font-size: 0.725rem;
          letter-spacing: 0.05em;
        }
        .admin-table td {
          padding: 1.15rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #CBD5E1;
        }
        .table-sub-info {
          display: block;
          font-size: 0.75rem;
          color: #64748B;
        }
        .statement-preview {
          font-size: 0.825rem;
          color: #94A3B8;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .table-date {
          font-size: 0.8rem;
          color: #64748B;
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
        .status-pill.pending {
          background: #78350F;
          color: #FBBF24;
        }
        .status-pill.rejected {
          background: #7F1D1D;
          color: #F87171;
        }
        .action-buttons-wrap {
          display: flex;
          gap: 0.5rem;
        }
        .table-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }
        .table-action-btn.approve {
          background: #065F46;
          color: #A7F3D0;
        }
        .table-action-btn.approve:hover:not(:disabled) {
          background: #047857;
        }
        .table-action-btn.reject {
          background: #7F1D1D;
          color: #FECACA;
        }
        .table-action-btn.reject:hover:not(:disabled) {
          background: #991B1B;
        }
        .table-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
