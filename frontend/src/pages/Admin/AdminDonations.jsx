import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { CreditCard, Download, Search, CheckCircle2 } from 'lucide-react';

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadDonations() {
      try {
        const data = await adminService.getDonations();
        setDonations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDonations();
  }, []);

  const filtered = donations.filter(d => 
    d.donor_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.receipt_number?.toLowerCase().includes(search.toLowerCase()) ||
    d.transaction_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-donations-view">
      <div className="admin-page-header">
        <h1 className="admin-main-heading">Donations & Financial Ledger</h1>
        <p className="admin-subtext">Immutable audit trail of all contributions, gateway transactions, and 80G receipts.</p>
      </div>

      <div className="table-controls-bar">
        <input
          type="text"
          placeholder="Search by donor, receipt number, or TX ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ color: '#94A3B8', padding: '2rem' }}>Loading donations ledger...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: '#94A3B8', padding: '2rem' }}>No donation records found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Donor</th>
                <th>Allocated Cause</th>
                <th>Amount (INR)</th>
                <th>Frequency</th>
                <th>Transaction ID</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <code className="receipt-code">{d.receipt_number}</code>
                  </td>
                  <td>
                    <strong>{d.donor_name}</strong>
                    <span className="table-sub-info">{d.donor_email}</span>
                  </td>
                  <td>
                    <span>{d.campaign_title || 'General Impact Fund'}</span>
                  </td>
                  <td>
                    <strong className="amount-col">₹{Number(d.amount).toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className="freq-pill">{d.frequency}</span>
                  </td>
                  <td>
                    <code className="tx-code">{d.transaction_id}</code>
                  </td>
                  <td>
                    <span className="status-pill approved">{d.status}</span>
                  </td>
                  <td>
                    <span className="table-date">{new Date(d.created_at).toLocaleDateString()}</span>
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
          margin-bottom: 1.75rem;
        }
        .table-controls-bar {
          margin-bottom: 1.25rem;
        }
        .admin-search-input {
          width: 100%;
          max-width: 400px;
          padding: 0.65rem 1rem;
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.875rem;
        }
        .admin-search-input:focus {
          outline: none;
          border-color: #10B981;
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
        .receipt-code {
          color: #38BDF8;
          font-size: 0.8rem;
          background: rgba(56, 189, 248, 0.1);
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
        }
        .tx-code {
          color: #94A3B8;
          font-size: 0.75rem;
        }
        .amount-col {
          color: #10B981;
          font-size: 0.95rem;
        }
        .freq-pill {
          font-size: 0.7rem;
          background: #1E293B;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}
