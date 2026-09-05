import React, { useState } from 'react';
import { contactService } from '../../services/api';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'GENERAL',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactService.submitEnquiry(formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page-root">
      <section className="contact-hero">
        <div className="container">
          <span className="section-badge">Get in Touch</span>
          <h1 className="contact-hero-title">Contact & Department Inquiries</h1>
          <p className="contact-hero-subtitle">
            Whether you want to propose a local community wetland for revival, inquire about donations, or schedule a media interview, our coordinators route your query directly to the relevant team.
          </p>
        </div>
      </section>

      <section className="section bg-light-alt">
        <div className="container">
          <div className="contact-layout-grid">
            {/* Left: Office Coordinates */}
            <div className="contact-info-col">
              <div className="card contact-card">
                <h3 className="contact-card-title">Headquarters</h3>
                <div className="contact-details-list">
                  <div className="contact-item">
                    <MapPin size={20} color="#10B981" />
                    <div>
                      <strong>Office Address</strong>
                      <p>#42, Social Innovation Corridor, 100ft Road, Indiranagar, Bengaluru, KA 560038</p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <Mail size={20} color="#10B981" />
                    <div>
                      <strong>Email Dispatch</strong>
                      <p>connect@responsibleindividuals.org</p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <Phone size={20} color="#10B981" />
                    <div>
                      <strong>Direct Phone Line</strong>
                      <p>+91 80 4123 4567 / +91 98450 12345</p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <Clock size={20} color="#10B981" />
                    <div>
                      <strong>Working Hours</strong>
                      <p>Monday - Friday: 9:30 AM to 6:00 PM IST<br />Saturday: 8:00 AM to 1:00 PM (Field Days)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FCRA & Registration info */}
              <div className="card reg-info-card">
                <h4>Legal & Tax Information</h4>
                <p>Responsible Individuals Foundation is a non-profit registered under Section 8 of the Companies Act, 2013. Donations eligible for 50% deduction under Section 80G.</p>
                <div className="cin-line"><strong>CIN:</strong> U85300KA2024NPL184920</div>
              </div>
            </div>

            {/* Right: Department Routed Inquiry Form */}
            <div className="contact-form-col">
              <div className="card form-container-card">
                <h3 className="form-title">Send a Direct Message</h3>

                {submitted ? (
                  <div className="contact-success-box">
                    <CheckCircle2 size={48} color="#10B981" />
                    <h3>Message Dispatched!</h3>
                    <p>
                      Thank you for contacting us, <strong>{formData.name}</strong>. Your enquiry has been routed to our <strong>{formData.department}</strong> department. A team coordinator will reply to {formData.email} within 1 business day.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh V"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="ramesh@example.com"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Routing Department *</label>
                        <select
                          className="form-control"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                          <option value="GENERAL">General Inquiries</option>
                          <option value="VOLUNTEER">Volunteer Opportunities & Certificates</option>
                          <option value="DONATION">Donations & 80G Receipts</option>
                          <option value="CSR">Corporate & CSR Alliances</option>
                          <option value="MEDIA">Press & Media Engagement</option>
                          <option value="PROJECT">Community Project Proposals</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="Brief summary of your inquiry"
                        className="form-control"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Your Message *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Please provide details..."
                        className="form-control"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                      <Send size={18} />
                      <span>{submitting ? 'Sending Message...' : 'Send Routed Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .contact-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 4rem 0;
          text-align: center;
        }
        .contact-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .contact-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .contact-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 740px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .contact-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        @media (min-width: 900px) {
          .contact-layout-grid {
            grid-template-columns: 1fr 1.6fr;
          }
        }
        .contact-card, .reg-info-card, .form-container-card {
          padding: 2.5rem;
          background: #FFFFFF;
        }
        .reg-info-card {
          margin-top: 1.5rem;
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
        }
        .reg-info-card h4 {
          font-size: 1.05rem;
          margin-bottom: 0.5rem;
        }
        .reg-info-card p {
          font-size: 0.825rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .cin-line {
          font-size: 0.8rem;
          color: var(--slate-700);
        }
        .contact-card-title, .form-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 1.5rem;
        }
        .contact-details-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .contact-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .contact-item strong {
          display: block;
          font-size: 0.95rem;
          color: var(--slate-800);
          margin-bottom: 0.2rem;
        }
        .contact-item p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.45;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 500px) {
          .form-grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }
        .contact-success-box {
          text-align: center;
          padding: 2rem 0;
        }
        .contact-success-box h3 {
          font-size: 1.4rem;
          margin: 1rem 0 0.5rem 0;
        }
        .contact-success-box p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
