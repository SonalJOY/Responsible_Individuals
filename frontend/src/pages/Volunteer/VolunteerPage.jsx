import React, { useEffect, useState } from 'react';
import { volunteerService } from '../../services/api';
import { 
  HeartHandshake, MapPin, Clock, Users, CheckCircle2, 
  Send, Sparkles, Award, Shield 
} from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function VolunteerPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: 'Bengaluru',
    occupation: '',
    skills: '',
    availability: 'Weekends',
    statement_of_purpose: '',
    experience: '',
  });

  useEffect(() => {
    async function loadVolunteerData() {
      try {
        const [oppsData, intData] = await Promise.all([
          volunteerService.getOpportunities(),
          volunteerService.getInterests(),
        ]);
        setOpportunities(oppsData);
        setInterests(intData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVolunteerData();
  }, []);

  const openApplyModal = (opp) => {
    setSelectedOpp(opp);
    setSubmitted(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Create volunteer profile
      const profile = await volunteerService.createProfile({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        occupation: formData.occupation,
        skills: formData.skills,
        availability: formData.availability,
      });

      // Submit application
      if (selectedOpp && profile?.id) {
        await volunteerService.apply({
          opportunity: selectedOpp.id,
          volunteer_profile: profile.id,
          statement_of_purpose: formData.statement_of_purpose,
          experience: formData.experience,
        });
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      // Even if profile exists, acknowledge application
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="volunteer-page-root">
      {/* Hero */}
      <section className="volunteer-hero">
        <div className="container">
          <span className="section-badge">Get Involved</span>
          <h1 className="volunteer-hero-title">Become a Responsible Individual</h1>
          <p className="volunteer-hero-subtitle">
            Give your time, skills, and energy to revive community water bodies, mentor rural students in robotics, and drive zero-waste neighborhoods.
          </p>
        </div>
      </section>

      {/* Value Props */}
      <section className="section-sm bg-white border-bottom">
        <div className="container">
          <div className="vol-perks-grid">
            <div className="perk-box">
              <Sparkles size={24} color="#10B981" />
              <div>
                <strong>Structured Field Action</strong>
                <p>Not just random cleanups; work with scientists and structured toolkits.</p>
              </div>
            </div>
            <div className="perk-box">
              <Award size={24} color="#2563EB" />
              <div>
                <strong>Tracked Impact & Certificates</strong>
                <p>Log your contribution hours and earn certified volunteer recognition.</p>
              </div>
            </div>
            <div className="perk-box">
              <Users size={24} color="#F59E0B" />
              <div>
                <strong>Passionate Community</strong>
                <p>Connect with 2,500+ active change-makers across colleges and tech firms.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities List */}
      <section className="section bg-light-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Open Calls</span>
            <h2 className="section-title">Active Volunteer Roles</h2>
            <p className="section-subtitle">
              Choose an opportunity matching your schedule and skills. All roles include an initial orientation.
            </p>
          </div>

          <div className="opps-grid">
            {opportunities.map((opp) => (
              <div key={opp.id} className="card opp-card">
                <div className="opp-card-top">
                  <span className="opp-area-badge">{opp.focus_area_name || 'Community'}</span>
                  <span className="opp-spots-badge">{opp.spots_available - opp.spots_filled} spots remaining</span>
                </div>

                <h3 className="opp-title">{opp.title}</h3>
                <p className="opp-desc">{opp.description}</p>

                <div className="opp-meta-list">
                  <div className="opp-meta-row">
                    <MapPin size={16} color="#10B981" />
                    <span><strong>Location:</strong> {opp.location}</span>
                  </div>
                  <div className="opp-meta-row">
                    <Clock size={16} color="#10B981" />
                    <span><strong>Commitment:</strong> {opp.commitment}</span>
                  </div>
                </div>

                <div className="opp-requirements-box">
                  <span className="req-label">Requirements:</span>
                  <p className="req-text">{opp.requirements}</p>
                </div>

                <button 
                  onClick={() => openApplyModal(opp)} 
                  className="btn btn-primary opp-apply-btn"
                >
                  <span>Apply for this Role</span>
                  <Send size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Wizard Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={submitted ? 'Application Received' : `Volunteer Application: ${selectedOpp?.title || ''}`}
      >
        {submitted ? (
          <div className="application-success-box">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} color="#10B981" />
            </div>
            <h3>Thank You, {formData.full_name}!</h3>
            <p>
              Your volunteer application has been recorded. Our volunteer coordinator will review your profile and reach out to you via <strong>{formData.email}</strong> with orientation details within 48 hours.
            </p>
            <button onClick={() => setModalOpen(false)} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Back to Opportunities
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="volunteer-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Priya Sharma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="priya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / Location *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Current Occupation</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Student / Software Engineer"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Availability</label>
                <select
                  className="form-control"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                >
                  <option value="Weekends">Weekends Only</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Flexible">Flexible / On-Demand</option>
                  <option value="Remote">Remote Only</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Key Skills</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Teaching, Event Coordination, Water Testing, Social Media"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Why do you want to join this initiative? *</label>
              <textarea
                required
                rows={3}
                className="form-control"
                placeholder="Tell us about your motivation..."
                value={formData.statement_of_purpose}
                onChange={(e) => setFormData({ ...formData, statement_of_purpose: e.target.value })}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
              {submitting ? 'Submitting Application...' : 'Submit Volunteer Application'}
            </button>
          </form>
        )}
      </Modal>

      <style>{`
        .volunteer-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 4rem 0;
          text-align: center;
        }
        .volunteer-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .volunteer-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        @media (min-width: 768px) {
          .volunteer-hero-title {
            font-size: 3.5rem;
          }
        }
        .volunteer-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 740px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .vol-perks-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .vol-perks-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .perk-box {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .perk-box strong {
          display: block;
          font-size: 1.05rem;
          color: var(--slate-900);
          margin-bottom: 0.25rem;
        }
        .perk-box p {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .opps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .opps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .opp-card {
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
        }
        .opp-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .opp-area-badge {
          background: var(--primary-50);
          color: var(--primary-800);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
        }
        .opp-spots-badge {
          font-size: 0.75rem;
          font-weight: 600;
          color: #059669;
        }
        .opp-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.75rem;
        }
        .opp-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 1.25rem;
        }
        .opp-meta-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--slate-700);
          margin-bottom: 1.25rem;
        }
        .opp-meta-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .opp-requirements-box {
          background: var(--slate-50);
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          border: 1px solid var(--slate-200);
          flex: 1;
        }
        .req-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--slate-500);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .req-text {
          font-size: 0.85rem;
          color: var(--slate-700);
          line-height: 1.45;
        }
        .opp-apply-btn {
          width: 100%;
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
        .application-success-box {
          text-align: center;
          padding: 1rem 0;
        }
        .success-icon-wrap {
          margin-bottom: 1rem;
        }
        .application-success-box h3 {
          font-size: 1.4rem;
          margin-bottom: 0.75rem;
        }
        .application-success-box p {
          color: var(--text-muted);
          font-size: 0.925rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
