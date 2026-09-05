import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { MessageSquare, Mail, Phone, Clock } from 'lucide-react';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnquiries() {
      try {
        const data = await adminService.getEnquiries();
        setEnquiries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEnquiries();
  }, []);

  return (
    <div className="admin-enquiries-view">
      <div className="admin-page-header">
        <h1 className="admin-main-heading">Inquiries & Citizen Messages</h1>
        <p className="admin-subtext">Department-routed citizen communications, volunteer queries, and corporate CSR requests.</p>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ color: '#94A3B8', padding: '2rem' }}>Loading messages...</div>
        ) : enquiries.length === 0 ? (
          <div style={{ color: '#94A3B8', padding: '2rem' }}>No messages found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Department</th>
                <th>Subject</th>
                <th>Message Content</th>
                <th>Status</th>
                <th>Date Received</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                    <span className="table-sub-info">{e.email}</span>
                  </td>
                  <td>
                    <span className="dept-tag">{e.department_display || e.department}</span>
                  </td>
                  <td>
                    <strong>{e.subject}</strong>
                  </td>
                  <td style={{ maxWidth: '350px' }}>
                    <p className="msg-preview">{e.message}</p>
                  </td>
                  <td>
                    <span className={`status-pill ${e.status.toLowerCase()}`}>
                      {e.status}
                    </span>
                  </td>
                  <td>
                    <span className="table-date">{new Date(e.created_at).toLocaleDateString()}</span>
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
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #CBD5E1;
        }
        .dept-tag {
          background: #1E293B;
          color: #38BDF8;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .msg-preview {
          font-size: 0.825rem;
          color: #94A3B8;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
