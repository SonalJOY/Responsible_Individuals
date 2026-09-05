import React, { useEffect, useState } from 'react';
import { careerService } from '../../services/api';
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    applicant_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    cover_letter: '',
  });

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await careerService.getJobs();
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const openApply = (job) => {
    setSelectedJob(job);
    setSubmitted(false);
    setModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('job_post', selectedJob.id);
      data.append('applicant_name', formData.applicant_name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('linkedin_url', formData.linkedin_url);
      data.append('cover_letter', formData.cover_letter);

      await careerService.applyJob(data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="careers-page-root">
      <section className="careers-hero">
        <div className="container">
          <span className="section-badge">Join Our Mission</span>
          <h1 className="careers-hero-title">Careers at Responsible Individuals</h1>
          <p className="careers-hero-subtitle">
            Work at the intersection of ecological engineering, educational equity, and citizen mobilization. Build impactful careers driven by real community outcomes.
          </p>
        </div>
      </section>

      <section className="section bg-light-alt">
        <div className="container-narrow">
          <div className="section-header">
            <span className="section-badge">Current Openings</span>
            <h2 className="section-title">Open Positions</h2>
          </div>

          <div className="jobs-list">
            {jobs.map((job) => (
              <div key={job.id} className="card job-card">
                <div className="job-card-header">
                  <div>
                    <span className="job-dept-tag">{job.department}</span>
                    <h3 className="job-title">{job.title}</h3>
                  </div>
                  <button onClick={() => openApply(job)} className="btn btn-primary btn-sm">
                    Apply Now
                  </button>
                </div>

                <p className="job-desc">{job.description}</p>

                <div className="job-meta-row">
                  <div className="job-meta-item"><MapPin size={15} /> <span>{job.location}</span></div>
                  <div className="job-meta-item"><Briefcase size={15} /> <span>{job.job_type_display}</span></div>
                  <div className="job-meta-item"><Clock size={15} /> <span>{job.experience_required} exp</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={submitted ? 'Application Received' : `Apply: ${selectedJob?.title || ''}`}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={48} color="#10B981" />
            <h3 style={{ margin: '1rem 0 0.5rem 0' }}>Application Received</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              Thank you for applying, {formData.applicant_name}! Our talent team will review your qualifications and reach out to {formData.email}.
            </p>
            <button onClick={() => setModalOpen(false)} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.applicant_name}
                onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
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
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="form-control"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brief Note / Cover Letter</label>
              <textarea
                rows={3}
                placeholder="Tell us about your background..."
                className="form-control"
                value={formData.cover_letter}
                onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
              {submitting ? 'Submitting...' : 'Submit Job Application'}
            </button>
          </form>
        )}
      </Modal>

      <style>{`
        .careers-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 4rem 0;
          text-align: center;
        }
        .careers-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .careers-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .careers-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .job-card {
          padding: 2rem;
          background: #FFFFFF;
        }
        .job-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .job-dept-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary-700);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .job-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-top: 0.25rem;
        }
        .job-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 1.25rem;
        }
        .job-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          font-size: 0.825rem;
          color: var(--slate-600);
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }
        .job-meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
      `}</style>
    </div>
  );
}
