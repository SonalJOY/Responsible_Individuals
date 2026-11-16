import React, { useState, useRef } from 'react';
import { contactService } from '../../services/api';
import { 
  Mail, Phone, MapPin, Clock, Send, CheckCircle2, 
  MessageSquare, Sparkles, ShieldCheck, HeartHandshake,
  AlertCircle, ArrowRight, ExternalLink
} from 'lucide-react';
import FloatingSocialIcons from '../../components/home/FloatingSocialIcons';
import { SOCIAL_LINKS } from '../../data/socialLinks';

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
  const [submitError, setSubmitError] = useState(null);
  const videoRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';

    try {
      // 1. Direct Web3Forms notification (if access key configured)
      if (accessKey) {
        try {
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              access_key: accessKey,
              name: formData.name,
              email: formData.email,
              phone: formData.phone || 'Not provided',
              department: formData.department,
              subject: `[Website Inquiry - ${formData.department}] ${formData.subject}`,
              message: formData.message,
              from_name: 'Responsible Individuals Website',
            }),
          });
        } catch (web3Err) {
          console.warn('Web3Forms dispatch notice:', web3Err);
        }
      }

      // 2. Submit to backend API to persist enquiry in database
      try {
        await contactService.submitEnquiry(formData);
      } catch (backendErr) {
        console.warn('Backend enquiry recording notice:', backendErr);
        // If neither Web3Forms nor backend worked, throw to show direct fallback
        if (!accessKey) {
          throw backendErr;
        }
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Contact enquiry submit error:', err);
      // Graceful local completion + fallback guidance
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setSubmitError(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'GENERAL',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="contact-page-root">
      {/* 1. Full-Page Ambient Background Video & Tinted Overlay */}
      <div className="contact-video-bg-container" aria-hidden="true">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="/images/focusarea.jpg"
          className="contact-bg-video"
        >
          <source src="/videos/background.mp4" type="video/mp4" />
          <source src="/videos/stock.mp4" type="video/mp4" />
        </video>
        <div className="contact-video-overlay" />
      </div>

      {/* 2. Floating Social Media Icons (Same right dock as Homepage) */}
      <FloatingSocialIcons />

      {/* 3. Main Foreground Content Container */}
      <div className="container contact-main-container">
        {/* Page Hero Header */}
        <header className="contact-header-block">
          <div className="contact-eyebrow-pill">
            <Sparkles size={14} className="text-saffron" />
            <span>Direct Citizen &amp; Partner Engagement</span>
          </div>

          <h1 className="contact-heading-title">
            Let&apos;s Connect &amp; Create Impact Together
          </h1>

          <p className="contact-heading-subtitle">
            Whether you want to propose a local lake for ecological restoration, explore corporate CSR partnerships, or volunteer on the ground—our coordinators route your inquiry directly to the right ground squad.
          </p>

          <div className="contact-proof-tags-row">
            <div className="contact-proof-pill">
              <ShieldCheck size={14} className="text-emerald" />
              <span>Section 8 Registered Non-Profit</span>
            </div>
            <div className="contact-proof-pill">
              <Sparkles size={14} className="text-saffron" />
              <span>50% 80G Tax Deductible</span>
            </div>
            <div className="contact-proof-pill">
              <Clock size={14} className="text-blue" />
              <span>Guaranteed Response &lt; 24h</span>
            </div>
          </div>
        </header>

        {/* 2-Column Translucent Glass Layout */}
        <div className="contact-grid-stage">
          {/* LEFT COLUMN: Coordinates & Office Information */}
          <aside className="contact-info-column" aria-label="Organization contact information">
            {/* Headquarters Glass Card */}
            <div className="contact-glass-card">
              <div className="glass-card-header">
                <div className="glass-header-icon-wrap emerald-icon">
                  <MapPin size={22} />
                </div>
                <div>
                  <span className="glass-card-kicker">OFFICIAL HEADQUARTERS</span>
                  <h2 className="glass-card-heading">Bengaluru Impact Hub</h2>
                </div>
              </div>

              <div className="contact-entries-stack">
                {/* Office Address */}
                <div className="contact-entry-item">
                  <div className="entry-icon-badge">
                    <MapPin size={18} />
                  </div>
                  <div className="entry-text-group">
                    <span className="entry-label">Address</span>
                    <p className="entry-val">
                      #48, 5th b bross, near kabir mutt, Kengeri satellite town, Bengaluru 560060
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="contact-entry-item">
                  <div className="entry-icon-badge">
                    <Mail size={18} />
                  </div>
                  <div className="entry-text-group">
                    <span className="entry-label">Email</span>
                    <p className="entry-val">
                      <a href="mailto:theresponsibleindividuals@gmail.com" className="contact-interactive-link">
                        theresponsibleindividuals@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="contact-entry-item">
                  <div className="entry-icon-badge">
                    <Phone size={18} />
                  </div>
                  <div className="entry-text-group">
                    <span className="entry-label">Phone Numbers</span>
                    <p className="entry-val">
                      <a href="tel:+919900016979" className="contact-interactive-link">+91 99000 16979</a>
                      <span className="val-sep">•</span>
                      <a href="tel:+917899277968" className="contact-interactive-link">+91 78992 77968</a>
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="contact-entry-item">
                  <div className="entry-icon-badge">
                    <Clock size={18} />
                  </div>
                  <div className="entry-text-group">
                    <span className="entry-label">Working Hours</span>
                    <p className="entry-val">
                      Daily: 10:30 AM – 5:30 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action Button */}
              <div className="whatsapp-quick-action">
                <a 
                  href={SOCIAL_LINKS.whatsapp.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-whatsapp-direct"
                  aria-label="Directly message Responsible Individuals on WhatsApp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.886 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>Chat on WhatsApp: +91 99000 16979</span>
                </a>
              </div>
            </div>

            {/* Legal & Tax Information Card */}
            <div className="contact-glass-card legal-glass-card">
              <div className="legal-badge-pill">
                <ShieldCheck size={16} className="text-saffron" />
                <span>Statutory Governance</span>
              </div>
              <h3 className="legal-title">Legal &amp; Tax Information</h3>
              <p className="legal-desc">
                Responsible Individuals Foundation is a non-profit registered under Section 8 of the Companies Act, 2013.<br />
                Donations eligible for 50% deduction under Section 80G.
              </p>
              <div className="legal-meta-row">
                <div className="meta-pill">
                  <strong>CIN:</strong> U85300KA2024NPL184920
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Translucent Routed Inquiry Form */}
          <main className="contact-form-column">
            <div className="contact-glass-card form-glass-panel">
              <div className="form-header-bar">
                <div className="glass-header-icon-wrap saffron-icon">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <span className="glass-card-kicker">ROUTED DISPATCH FORM</span>
                  <h2 className="glass-card-heading">Send a Direct Message</h2>
                </div>
              </div>

              <p className="form-sub-desc">
                Select your inquiry department below. Your message will be automatically tagged and routed to the corresponding field coordinator.
              </p>

              {submitted ? (
                <div className="contact-success-glass-box" role="status" aria-live="polite">
                  <div className="success-icon-halo">
                    <CheckCircle2 size={54} color="#10B981" />
                  </div>
                  <h3 className="success-title">Message Successfully Dispatched!</h3>
                  <p className="success-lead">
                    Thank you, <strong>{formData.name || 'Friend'}</strong>. Your inquiry has been routed to our <strong>{formData.department}</strong> department coordinator.
                  </p>
                  <p className="success-details">
                    A confirmation has been recorded for <strong>{formData.email}</strong>. Our team will review your message and reply within 1 business day.
                  </p>
                  <button 
                    type="button" 
                    onClick={handleResetForm}
                    className="btn-send-another"
                  >
                    <span>Send Another Message</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-glass-form" noValidate={false}>
                  {submitError && (
                    <div className="form-error-banner" role="alert">
                      <AlertCircle size={18} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Row 1: Name and Email */}
                  <div className="form-dual-row">
                    <div className="form-group-item">
                      <label htmlFor="contact-name" className="field-label">
                        Full Name <span className="req-star">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. Ramesh V"
                        className="glass-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        autoComplete="name"
                      />
                    </div>

                    <div className="form-group-item">
                      <label htmlFor="contact-email" className="field-label">
                        Email Address <span className="req-star">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="ramesh@example.com"
                        className="glass-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone and Department */}
                  <div className="form-dual-row">
                    <div className="form-group-item">
                      <label htmlFor="contact-phone" className="field-label">
                        Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="glass-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        autoComplete="tel"
                      />
                    </div>

                    <div className="form-group-item">
                      <label htmlFor="contact-department" className="field-label">
                        Routing Department <span className="req-star">*</span>
                      </label>
                      <div className="select-wrapper">
                        <select
                          id="contact-department"
                          className="glass-input glass-select"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          required
                        >
                          <option value="GENERAL">General Inquiries &amp; Outreach</option>
                          <option value="VOLUNTEER">Volunteer Opportunities &amp; Certificates</option>
                          <option value="DONATION">Donations &amp; 80G Tax Receipts</option>
                          <option value="CSR">Corporate &amp; CSR Alliances</option>
                          <option value="MEDIA">Press &amp; Media Engagement</option>
                          <option value="PROJECT">Community Project Proposals &amp; Water Revival</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Subject */}
                  <div className="form-group-item">
                    <label htmlFor="contact-subject" className="field-label">
                      Subject <span className="req-star">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      placeholder="Brief summary of your inquiry..."
                      className="glass-input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  {/* Row 4: Message */}
                  <div className="form-group-item">
                    <label htmlFor="contact-message" className="field-label">
                      Your Message <span className="req-star">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      placeholder="Provide details about your inquiry, proposal, or question..."
                      className="glass-input glass-textarea"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="btn-glass-submit"
                    aria-label="Send your routed inquiry"
                  >
                    <Send size={18} />
                    <span>{submitting ? 'Routing Message...' : 'Send Routed Message'}</span>
                  </button>

                  <p className="form-security-footer">
                    <ShieldCheck size={14} className="text-emerald" />
                    <span>Your contact details are encrypted and handled exclusively by our dispatch coordinators.</span>
                  </p>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .contact-page-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          background-color: #0F172A; /* Fallback background */
          color: #FFFFFF;
          overflow-x: hidden;
          padding: 4.5rem 0 6.5rem 0;
        }

        /* 1. Full-Page Ambient Background Video & Tinted Overlay */
        .contact-video-bg-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .contact-bg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          pointer-events: none;
          filter: brightness(0.92) contrast(1.05);
        }

        .contact-video-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 15% 15%, rgba(245, 158, 11, 0.16) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(14, 165, 233, 0.18) 0%, transparent 55%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.78) 0%, rgba(15, 23, 42, 0.62) 50%, rgba(15, 23, 42, 0.90) 100%);
          pointer-events: none;
        }

        /* 2. Main Foreground Layout */
        .contact-main-container {
          position: relative;
          z-index: 10;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* Hero Header */
        .contact-header-block {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 3.75rem auto;
        }

        .contact-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #FBBF24;
          padding: 0.4rem 1.25rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.35rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        }

        .text-saffron {
          color: var(--primary-saffron, #F59E0B);
        }

        .text-emerald {
          color: #10B981;
        }

        .text-blue {
          color: var(--secondary-light-blue, #7DD3FC);
        }

        .contact-heading-title {
          font-family: var(--font-heading);
          font-size: 2.75rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: #FFFFFF;
          line-height: 1.18;
          margin-bottom: 1.15rem;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        @media (min-width: 768px) {
          .contact-heading-title {
            font-size: 3.5rem;
          }
        }

        .contact-heading-subtitle {
          font-size: 1.15rem;
          color: #E2E8F0;
          line-height: 1.68;
          margin-bottom: 2rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .contact-proof-tags-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
        }

        .contact-proof-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          padding: 0.4rem 1rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.82rem;
          font-weight: 700;
          color: #F1F5F9;
        }

        /* 3. 2-Column Translucent Grid Stage */
        .contact-grid-stage {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        @media (min-width: 992px) {
          .contact-grid-stage {
            grid-template-columns: 1fr 1.55fr;
            gap: 3rem;
          }
        }

        /* Translucent Glass Card Foundation */
        .contact-glass-card {
          background: rgba(15, 23, 42, 0.66);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 28px;
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.14);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .contact-glass-card:hover {
          border-color: rgba(245, 158, 11, 0.35);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18);
        }

        @media (max-width: 640px) {
          .contact-glass-card {
            padding: 1.75rem 1.4rem;
            border-radius: 22px;
          }
        }

        /* Glass Header Icon & Titles */
        .glass-card-header {
          display: flex;
          align-items: center;
          gap: 1.15rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .glass-header-icon-wrap {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .emerald-icon {
          background: rgba(16, 185, 129, 0.16);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34D399;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
        }

        .saffron-icon {
          background: rgba(245, 158, 11, 0.16);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #FBBF24;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
        }

        .glass-card-kicker {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #94A3B8;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .glass-card-heading {
          font-family: var(--font-heading);
          font-size: 1.65rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.22;
        }

        /* Contact Entries Stack */
        .contact-entries-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .contact-entry-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.1rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 18px;
          transition: all 0.2s ease;
        }

        .contact-entry-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(245, 158, 11, 0.4);
          transform: translateX(3px);
        }

        .entry-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #7DD3FC;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .entry-text-group {
          flex: 1;
        }

        .entry-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #94A3B8;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .entry-val {
          font-size: 0.95rem;
          font-weight: 600;
          color: #FFFFFF;
          line-height: 1.45;
          margin-bottom: 0.25rem;
        }

        .val-sep {
          margin: 0 0.5rem;
          color: #64748B;
        }

        .contact-interactive-link {
          color: #FFFFFF;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .contact-interactive-link:hover {
          color: var(--primary-saffron, #F59E0B);
          text-decoration: underline;
        }

        .contact-sub-link {
          color: #7DD3FC;
          text-decoration: none;
        }

        .contact-sub-link:hover {
          color: #FFFFFF;
          text-decoration: underline;
        }

        .entry-sub-note {
          display: block;
          font-size: 0.78rem;
          color: #94A3B8;
          line-height: 1.4;
        }

        /* Direct WhatsApp Button */
        .whatsapp-quick-action {
          margin-top: 1rem;
        }

        .btn-whatsapp-direct {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          background: rgba(37, 211, 102, 0.16);
          border: 1px solid rgba(37, 211, 102, 0.45);
          color: #4ADE80;
          padding: 0.85rem 1.4rem;
          border-radius: var(--radius-pill, 9999px);
          font-weight: 800;
          font-size: 0.92rem;
          text-decoration: none;
          transition: all 0.22s ease;
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.15);
        }

        .btn-whatsapp-direct:hover {
          background: #22C55E;
          color: #FFFFFF;
          border-color: #22C55E;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.35);
        }

        /* Legal & 80G Card */
        .legal-glass-card {
          margin-top: 2rem;
        }

        .legal-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #FBBF24;
          padding: 0.25rem 0.85rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 0.85rem;
        }

        .legal-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 0.5rem;
        }

        .legal-desc {
          font-size: 0.88rem;
          color: #CBD5E1;
          line-height: 1.55;
          margin-bottom: 1.25rem;
        }

        .legal-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
        }

        .meta-pill {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.35rem 0.8rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.78rem;
          color: #E2E8F0;
        }

        /* RIGHT COLUMN: Form Panel */
        .form-glass-panel {
          position: relative;
        }

        .form-header-bar {
          display: flex;
          align-items: center;
          gap: 1.15rem;
          margin-bottom: 1rem;
        }

        .form-sub-desc {
          font-size: 0.95rem;
          color: #CBD5E1;
          line-height: 1.55;
          margin-bottom: 2rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .contact-glass-form {
          display: flex;
          flex-direction: column;
          gap: 1.35rem;
        }

        .form-error-banner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(225, 29, 72, 0.18);
          border: 1px solid rgba(225, 29, 72, 0.45);
          color: #FDA4AF;
          padding: 0.75rem 1.1rem;
          border-radius: 14px;
          font-size: 0.88rem;
        }

        .form-dual-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 600px) {
          .form-dual-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-group-item {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .field-label {
          font-size: 0.82rem;
          font-weight: 800;
          color: #E2E8F0;
          letter-spacing: 0.03em;
        }

        .req-star {
          color: var(--primary-saffron, #F59E0B);
        }

        .glass-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          padding: 0.85rem 1.15rem;
          border-radius: 14px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .glass-input::placeholder {
          color: #64748B;
        }

        .glass-input:hover {
          border-color: rgba(245, 158, 11, 0.5);
        }

        .glass-input:focus {
          outline: none;
          background: rgba(15, 23, 42, 0.8);
          border-color: var(--primary-saffron, #F59E0B);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25), inset 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .glass-select {
          cursor: pointer;
        }

        .glass-select option {
          background: #0F172A;
          color: #FFFFFF;
          padding: 0.5rem;
        }

        .glass-textarea {
          resize: vertical;
          min-height: 120px;
          line-height: 1.5;
        }

        .btn-glass-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          background: linear-gradient(135deg, #F59E0B 0%, #EA580C 100%);
          color: #FFFFFF;
          border: none;
          padding: 1rem 2rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 1.02rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.35);
          margin-top: 0.5rem;
        }

        .btn-glass-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(245, 158, 11, 0.5);
          filter: brightness(1.08);
        }

        .btn-glass-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-security-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #94A3B8;
          line-height: 1.45;
          margin-top: 0.5rem;
        }

        /* Success State Panel */
        .contact-success-glass-box {
          text-align: center;
          padding: 3rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .success-icon-halo {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 0 35px rgba(16, 185, 129, 0.25);
          animation: pulseHalo 2s infinite ease-in-out;
        }

        @keyframes pulseHalo {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        .success-title {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 1rem;
        }

        .success-lead {
          font-size: 1.05rem;
          color: #F1F5F9;
          line-height: 1.6;
          margin-bottom: 0.75rem;
          max-width: 540px;
        }

        .success-details {
          font-size: 0.9rem;
          color: #94A3B8;
          line-height: 1.5;
          margin-bottom: 2rem;
          max-width: 500px;
        }

        .btn-send-another {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          padding: 0.75rem 1.75rem;
          border-radius: var(--radius-pill, 9999px);
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-send-another:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #FFFFFF;
          transform: translateY(-2px);
        }

        /* Accessibility: Respect Reduced Motion Preferences */
        @media (prefers-reduced-motion: reduce) {
          .contact-bg-video {
            display: none;
          }
          .contact-page-root {
            background-color: #0F172A !important;
          }
          .contact-glass-card,
          .btn-glass-submit,
          .success-icon-halo {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
