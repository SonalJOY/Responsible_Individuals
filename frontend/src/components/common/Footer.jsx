import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { contactService } from '../../services/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await contactService.subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer-root">
      <div className="container footer-content">
        <div className="footer-grid">
          {/* Col 1: Brand & Mission */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <Shield size={22} color="#FFFFFF" />
              </div>
              <div className="footer-logo-text">
                <span className="footer-title">RESPONSIBLE</span>
                <span className="footer-subtitle">INDIVIDUALS</span>
              </div>
            </div>
            <p className="footer-desc">
              Building responsible, self-sustaining communities through measurable grassroots interventions in ecological restoration, quality education, and community stewardship.
            </p>
            <div className="tax-exemption-tag">
              <span className="tax-badge">80G Verified</span>
              <span>All donations eligible for 50% Indian tax deduction</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/about">Our Story & Mission</Link></li>
              <li><Link to="/projects">Featured Projects</Link></li>
              <li><Link to="/impact">Impact Dashboard</Link></li>
              <li><Link to="/stories">Stories of Change</Link></li>
              <li><Link to="/events">Events & Cleanup Drives</Link></li>
              <li><Link to="/gallery">Photo & Video Gallery</Link></li>
            </ul>
          </div>

          {/* Col 3: Get Involved */}
          <div className="footer-col">
            <h4 className="footer-heading">Get Involved</h4>
            <ul className="footer-links">
              <li><Link to="/volunteer">Volunteer Opportunities</Link></li>
              <li><Link to="/donate">Make a Donation</Link></li>
              <li><Link to="/partners">Corporate CSR Partnerships</Link></li>
              <li><Link to="/careers">Careers & Fellowships</Link></li>
              <li><Link to="/contact">Contact & Grievance</Link></li>
              <li><Link to="/admin-portal">Admin Staff Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Stay Informed</h4>
            <p className="footer-newsletter-text">
              Subscribe to receive our monthly community impact reports and volunteer drive announcements.
            </p>

            {subscribed ? (
              <div className="subscribe-success">
                <CheckCircle2 size={18} color="#10B981" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
                <button type="submit" disabled={loading} className="newsletter-btn" aria-label="Subscribe">
                  <Send size={16} />
                </button>
              </form>
            )}

            <div className="footer-contact-info">
              <div className="contact-line">
                <MapPin size={16} /> <span>Indiranagar, Bengaluru, KA 560038</span>
              </div>
              <div className="contact-line">
                <Mail size={16} /> <span>connect@responsibleindividuals.org</span>
              </div>
              <div className="contact-line">
                <Phone size={16} /> <span>+91 80 4123 4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Responsible Individuals Foundation. Registered Section 8 Non-Profit Organization.</p>
          <div className="footer-bottom-links">
            <Link to="/contact">Privacy Policy</Link>
            <Link to="/contact">Terms of Service</Link>
            <Link to="/contact">Annual Disclosures</Link>
          </div>
        </div>
      </div>

      <style>{`
        .footer-root {
          background: #091219;
          color: #94A3B8;
          padding: 4.5rem 0 2rem 0;
          border-top: 1px solid #1E293B;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        @media (min-width: 640px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1.4fr 0.8fr 0.8fr 1.2fr;
            gap: 3rem;
          }
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        .footer-logo-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #0F4C3A 0%, #10B981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-logo-text {
          display: flex;
          flex-direction: column;
        }
        .footer-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.1rem;
          color: #FFFFFF;
          letter-spacing: 0.04em;
        }
        .footer-subtitle {
          font-size: 0.68rem;
          font-weight: 700;
          color: #10B981;
          letter-spacing: 0.12em;
        }
        .footer-desc {
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1.25rem;
          color: #94A3B8;
        }
        .tax-exemption-tag {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.8rem;
          color: #CBD5E1;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .tax-badge {
          background: #10B981;
          color: #042F1A;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }
        .footer-heading {
          color: #FFFFFF;
          font-size: 1.05rem;
          margin-bottom: 1.25rem;
          font-weight: 700;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .footer-links a {
          color: #94A3B8;
          font-size: 0.9rem;
          transition: color var(--transition-fast);
        }
        .footer-links a:hover {
          color: #10B981;
        }
        .footer-newsletter-text {
          font-size: 0.875rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        .newsletter-form {
          display: flex;
          position: relative;
          margin-bottom: 1.5rem;
        }
        .newsletter-input {
          width: 100%;
          padding: 0.7rem 3rem 0.7rem 1rem;
          background: #16222F;
          border: 1px solid #283747;
          border-radius: var(--radius-md);
          color: #FFFFFF;
          font-size: 0.875rem;
        }
        .newsletter-input:focus {
          outline: none;
          border-color: #10B981;
        }
        .newsletter-btn {
          position: absolute;
          right: 4px;
          top: 4px;
          bottom: 4px;
          padding: 0 1rem;
          background: #10B981;
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .newsletter-btn:hover {
          background: #059669;
        }
        .subscribe-success {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10B981;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .footer-contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          font-size: 0.85rem;
        }
        .contact-line {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #94A3B8;
        }
        .footer-bottom {
          margin-top: 3.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #1E293B;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          font-size: 0.825rem;
        }
        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
          }
        }
        .footer-bottom-links {
          display: flex;
          gap: 1.25rem;
        }
        .footer-bottom-links a {
          color: #64748B;
        }
        .footer-bottom-links a:hover {
          color: #CBD5E1;
        }
      `}</style>
    </footer>
  );
}
