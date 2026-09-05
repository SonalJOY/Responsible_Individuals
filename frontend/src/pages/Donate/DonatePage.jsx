import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { donationService, projectService } from '../../services/api';
import { 
  Heart, ShieldCheck, CheckCircle2, FileText, 
  Printer, Lock, Sparkles, CreditCard 
} from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function DonatePage() {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [frequency, setFrequency] = useState('ONETIME');
  const [amount, setAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project') || '');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    pan_number: '',
    city: 'Bengaluru',
    is_anonymous: false,
  });

  const [processing, setProcessing] = useState(false);
  const [donationResult, setDonationResult] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await projectService.getProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadProjects();
  }, []);

  const presetAmounts = [1000, 2500, 5000, 10000, 25000];

  const handlePresetClick = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    setAmount(Number(val) || 0);
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount < 100) {
      alert('Please select or enter an amount of at least ₹100.');
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        pan_number: formData.pan_number,
        city: formData.city,
        is_anonymous: formData.is_anonymous,
        amount: Number(amount),
        frequency: frequency,
        project_id: selectedProjectId ? selectedProjectId : null,
      };

      const result = await donationService.processDonation(payload);
      setDonationResult(result);
      setReceiptModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to process donation. Please check your network and try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="donate-page-root">
      {/* Hero Header */}
      <section className="donate-hero">
        <div className="container">
          <span className="section-badge">Tax Exempt 80G</span>
          <h1 className="donate-hero-title">Empower Sustainable Grassroots Action</h1>
          <p className="donate-hero-subtitle">
            100% of public donations are deployed directly into desilting materials, native tree nurseries, and rural STEM smart classrooms with transparent milestone tracking.
          </p>
        </div>
      </section>

      {/* Main Donation Container */}
      <section className="section bg-light-alt">
        <div className="container-narrow">
          <div className="card donate-card">
            <form onSubmit={handleDonateSubmit}>
              {/* Frequency Selector */}
              <div className="frequency-toggle-wrap">
                <button
                  type="button"
                  onClick={() => setFrequency('ONETIME')}
                  className={`freq-btn ${frequency === 'ONETIME' ? 'active' : ''}`}
                >
                  One-Time Contribution
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('MONTHLY')}
                  className={`freq-btn ${frequency === 'MONTHLY' ? 'active' : ''}`}
                >
                  <Sparkles size={14} /> Monthly Sustaining Partner
                </button>
              </div>

              {/* Amount Tiers */}
              <div className="amount-section">
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>Select Contribution Amount (INR)</label>
                <div className="preset-grid">
                  {presetAmounts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePresetClick(p)}
                      className={`preset-btn ${amount === p && !customAmount ? 'active' : ''}`}
                    >
                      ₹{p.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="custom-input-wrap">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    min="100"
                    placeholder="Or enter custom amount"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="form-control custom-amount-input"
                  />
                </div>
              </div>

              {/* Project / Cause Allocation */}
              <div className="form-group" style={{ marginTop: '1.75rem' }}>
                <label className="form-label">Allocate to Specific Cause (Optional)</label>
                <select
                  className="form-control"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">General Social & Environmental Impact Fund (Where needed most)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} ({p.location})</option>
                  ))}
                </select>
              </div>

              {/* Donor Details */}
              <div className="donor-fields-box">
                <h3 className="donor-fields-heading">Donor Details (for 80G Tax Exemption)</h3>
                
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Krishnan"
                      className="form-control"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="rajesh@example.com"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98450 12345"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PAN Number (Required for 80G Tax Receipt)</label>
                    <input
                      type="text"
                      maxLength="10"
                      placeholder="e.g. ABCDE1234F"
                      className="form-control"
                      style={{ textTransform: 'uppercase' }}
                      value={formData.pan_number}
                      onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              {/* Security & Guarantees */}
              <div className="donation-security-badges">
                <div className="sec-badge">
                  <Lock size={15} color="#10B981" />
                  <span>256-bit Encrypted Checkout</span>
                </div>
                <div className="sec-badge">
                  <ShieldCheck size={15} color="#10B981" />
                  <span>Section 80G Tax Exemption</span>
                </div>
                <div className="sec-badge">
                  <CheckCircle2 size={15} color="#10B981" />
                  <span>Instant Verified PDF Receipt</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={processing}
                className="btn btn-amber btn-lg donate-submit-btn"
              >
                <Heart size={20} fill="currentColor" />
                <span>{processing ? 'Processing Secure Donation...' : `Complete Contribution of ₹${Number(amount || 0).toLocaleString()}`}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Verified 80G Receipt Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Official 80G Donation Receipt"
        maxWidth="620px"
      >
        {donationResult && (
          <div className="receipt-modal-content">
            <div className="receipt-top-banner">
              <CheckCircle2 size={36} color="#10B981" />
              <div>
                <h4 className="receipt-success-title">Donation Successful!</h4>
                <p className="receipt-thank-msg">Thank you for powering accountable grassroots transformation.</p>
              </div>
            </div>

            <div className="receipt-paper" id="printable-receipt">
              <div className="receipt-org-header">
                <h3>RESPONSIBLE INDIVIDUALS FOUNDATION</h3>
                <p>Registered Section 8 Non-Profit • 80G Reg: CIT(E)/BLR/80G/2024-25</p>
                <span className="receipt-num-tag">Receipt #: <strong>{donationResult.receipt_number}</strong></span>
              </div>

              <div className="receipt-rows">
                <div className="receipt-row">
                  <span>Donor Name:</span>
                  <strong>{donationResult.donation?.donor_name}</strong>
                </div>
                <div className="receipt-row">
                  <span>Email & Phone:</span>
                  <span>{donationResult.donation?.donor_email}</span>
                </div>
                <div className="receipt-row">
                  <span>Transaction ID:</span>
                  <code>{donationResult.transaction_id}</code>
                </div>
                <div className="receipt-row">
                  <span>Date & Time:</span>
                  <span>{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="receipt-row highlight-amount">
                  <span>Amount Contributed:</span>
                  <strong>₹{Number(donationResult.donation?.amount).toLocaleString()} INR</strong>
                </div>
              </div>

              <div className="receipt-footer-notes">
                <p>Certified that this donation is eligible for 50% deduction under Section 80G of the Indian Income Tax Act, 1961.</p>
              </div>
            </div>

            <div className="receipt-actions-row">
              <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
              <button onClick={() => setReceiptModalOpen(false)} className="btn btn-primary btn-sm">
                <span>Done</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .donate-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 3.5rem 0;
          text-align: center;
        }
        .donate-hero .section-badge {
          background: rgba(245, 158, 11, 0.2);
          color: #FBBF24;
          border-color: rgba(245, 158, 11, 0.4);
        }
        .donate-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .donate-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .donate-card {
          padding: 3rem;
          background: #FFFFFF;
        }
        .frequency-toggle-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 2rem;
          background: var(--slate-100);
          padding: 0.35rem;
          border-radius: var(--radius-md);
        }
        .freq-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.75rem;
          border: none;
          background: transparent;
          font-weight: 700;
          font-size: 0.925rem;
          color: var(--slate-600);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .freq-btn.active {
          background: #FFFFFF;
          color: var(--primary-900);
          box-shadow: var(--shadow-sm);
        }
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 600px) {
          .preset-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        .preset-btn {
          padding: 0.85rem;
          border: 2px solid var(--border-subtle);
          background: #FFFFFF;
          border-radius: var(--radius-md);
          font-weight: 800;
          font-size: 1.05rem;
          color: var(--slate-800);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .preset-btn:hover {
          border-color: var(--accent-amber);
        }
        .preset-btn.active {
          border-color: var(--accent-amber);
          background: #FFFBEB;
          color: #B45309;
        }
        .custom-input-wrap {
          position: relative;
        }
        .currency-prefix {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--slate-400);
        }
        .custom-amount-input {
          padding-left: 2.2rem;
          font-size: 1.05rem;
          font-weight: 700;
        }
        .donor-fields-box {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }
        .donor-fields-heading {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 1.25rem;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 600px) {
          .form-grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }
        .donation-security-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          margin: 1.75rem 0;
          font-size: 0.8rem;
          color: var(--slate-600);
        }
        .sec-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .donate-submit-btn {
          width: 100%;
        }
        .receipt-modal-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .receipt-top-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
        }
        .receipt-success-title {
          font-size: 1.15rem;
          color: #065F46;
          font-weight: 800;
        }
        .receipt-thank-msg {
          font-size: 0.85rem;
          color: #047857;
        }
        .receipt-paper {
          background: #FAFAFA;
          border: 1px dashed #CBD5E1;
          padding: 1.5rem;
          border-radius: var(--radius-md);
        }
        .receipt-org-header {
          text-align: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid #E2E8F0;
          margin-bottom: 1rem;
        }
        .receipt-org-header h3 {
          font-size: 1.1rem;
          color: #0F4C3A;
        }
        .receipt-org-header p {
          font-size: 0.75rem;
          color: #64748B;
        }
        .receipt-num-tag {
          display: inline-block;
          font-size: 0.8rem;
          margin-top: 0.4rem;
          background: #E2E8F0;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .receipt-rows {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          font-size: 0.875rem;
        }
        .receipt-row {
          display: flex;
          justify-content: space-between;
          color: #334155;
        }
        .highlight-amount {
          padding-top: 0.5rem;
          border-top: 1px solid #E2E8F0;
          font-size: 1.05rem;
          color: #0F172A;
        }
        .receipt-footer-notes {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid #E2E8F0;
          font-size: 0.72rem;
          color: #64748B;
          text-align: center;
        }
        .receipt-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
}
