import React, { useState, useEffect } from 'react';
import { partnerService } from '../../services/api';
import { 
  Building2, CheckCircle2, ShieldCheck, FileCheck, 
  Users, Award, Send, ArrowRight 
} from 'lucide-react';

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    org_name: '',
    contact_person: '',
    email: '',
    phone: '',
    org_type: 'Corporate / CSR',
    area_of_interest: 'Lake & Water Rejuvenation',
    location: '',
    expected_contribution: 'CSR Grant',
    message: '',
  });

  useEffect(() => {
    async function loadPartners() {
      try {
        const data = await partnerService.getPartners();
        setPartners(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadPartners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await partnerService.submitEnquiry(formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="partners-page-root">
      {/* Hero */}
      <section className="partners-hero">
        <div className="container">
          <span className="section-badge">CSR & Institutional Alliances</span>
          <h1 className="partners-hero-title">Partner With Purpose</h1>
          <p className="partners-hero-subtitle">
            Deploy your corporate CSR capital into high-impact, audit-ready grassroots projects with complete transparency, GPS milestone verification, and measurable SROI.
          </p>
        </div>
      </section>

      {/* CSR Value Pillars */}
      <section className="section bg-white border-bottom">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Partner With RI</span>
            <h2 className="section-title">Institutional Rigor for Corporate CSR</h2>
          </div>

          <div className="csr-perks-grid">
            <div className="card perk-card">
              <ShieldCheck size={32} color="#10B981" />
              <h3>Section 135 Compliant</h3>
              <p>Full regulatory compliance with Ministry of Corporate Affairs (MCA) guidelines, Form CSR-1 registration, and 80G tax exemption.</p>
            </div>

            <div className="card perk-card">
              <FileCheck size={32} color="#2563EB" />
              <h3>Audit-Ready SROI Reports</h3>
              <p>Quarterly milestone tracking, before/after scientific metrics (DO, NDVI, attendance), and third-party financial audits.</p>
            </div>

            <div className="card perk-card">
              <Users size={32} color="#F59E0B" />
              <h3>Employee Volunteering</h3>
              <p>Curated weekend lake cleanups, tree-planting drives, and STEM mentorship days designed for corporate teams of 50 to 500+ employees.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="section bg-light-alt">
        <div className="container-narrow">
          <div className="card partnership-form-card">
            <div className="form-header-box">
              <h2 className="form-card-title">Initiate a Partnership Inquiry</h2>
              <p className="form-card-sub">Tell us about your organization's CSR mandate and our team will get in touch within 24 hours.</p>
            </div>

            {submitted ? (
              <div className="partner-success-state">
                <CheckCircle2 size={54} color="#10B981" />
                <h3>Thank You for Reaching Out!</h3>
                <p>
                  We have received the partnership enquiry for <strong>{formData.org_name}</strong>. Our CSR Partnerships Director will contact <strong>{formData.contact_person}</strong> ({formData.email}) with our institutional project portfolio and proposal deck.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Technologies India"
                      className="form-control"
                      value={formData.org_name}
                      onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sumanth Rao"
                      className="form-control"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Official Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="sumanth@acme.com"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 99000 11223"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Organization Type</label>
                    <select
                      className="form-control"
                      value={formData.org_type}
                      onChange={(e) => setFormData({ ...formData, org_type: e.target.value })}
                    >
                      <option value="Corporate / CSR">Corporate / CSR Foundation</option>
                      <option value="NGO Partner">Non-Profit / NGO Partner</option>
                      <option value="Government Body">Government / Municipal Department</option>
                      <option value="Academic Institution">Academic / University Partner</option>
                      <option value="Resident Collective">Resident Welfare Association (RWA)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Focus Area</label>
                    <select
                      className="form-control"
                      value={formData.area_of_interest}
                      onChange={(e) => setFormData({ ...formData, area_of_interest: e.target.value })}
                    >
                      <option value="Lake & Water Rejuvenation">Lake & Water Rejuvenation</option>
                      <option value="Rural STEM Smart Classrooms">Rural STEM Smart Classrooms</option>
                      <option value="Urban Miyawaki Afforestation">Urban Miyawaki Afforestation</option>
                      <option value="Zero Waste Decentralized Hubs">Zero Waste Decentralized Hubs</option>
                      <option value="Employee Volunteering Engagement">Employee Volunteering Engagement</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Briefly describe your CSR objectives or proposal *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about your planned budget, target geographies, or employee volunteering expectations..."
                    className="form-control"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <Send size={18} />
                  <span>{submitting ? 'Submitting Proposal...' : 'Submit CSR Partnership Proposal'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .partners-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 4rem 0;
          text-align: center;
        }
        .partners-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .partners-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .partners-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 760px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .csr-perks-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .csr-perks-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .perk-card {
          padding: 2.5rem;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        .perk-card h3 {
          font-size: 1.25rem;
          color: var(--slate-900);
        }
        .perk-card p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .partnership-form-card {
          padding: 3rem;
          background: #FFFFFF;
        }
        .form-header-box {
          margin-bottom: 2rem;
          text-align: center;
        }
        .form-card-title {
          font-size: 1.85rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .form-card-sub {
          font-size: 0.95rem;
          color: var(--text-muted);
        }
        .partner-success-state {
          text-align: center;
          padding: 2.5rem 0;
        }
        .partner-success-state h3 {
          font-size: 1.5rem;
          margin: 1.25rem 0 0.5rem 0;
        }
        .partner-success-state p {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.65;
          max-width: 600px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
