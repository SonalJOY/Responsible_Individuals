import React from 'react';
import { 
  Shield, CheckCircle, Target, Award, Users, 
  Lightbulb, HeartHandshake, ArrowRight, Layers 
} from 'lucide-react';

export default function AboutPage() {
  const steps = [
    { num: '01', title: 'Identify Community Need', desc: 'Conduct ground-level participatory assessments to diagnose the exact root causes of local distress.' },
    { num: '02', title: 'Engage Community', desc: 'Form local citizen committees so residents, schools, and self-help groups take direct co-ownership.' },
    { num: '03', title: 'Design Solution', desc: 'Engineer scientifically sound, low-maintenance, and climate-resilient ecological or educational blueprints.' },
    { num: '04', title: 'Mobilize Partners', desc: 'Align corporate CSR capital, municipal government clearances, and technical domain experts.' },
    { num: '05', title: 'Implement', desc: 'Execute on the ground with transparent milestones, strict safety compliance, and community participation.' },
    { num: '06', title: 'Measure Impact', desc: 'Continuously track baseline vs achieved indicators (water quality, attendance, flora survival rate).' },
    { num: '07', title: 'Sustain', desc: 'Hand over operational maintenance to trained citizen stewards with long-term monitoring support.' },
    { num: '08', title: 'Scale & Replicate', desc: 'Publish open-source case studies and policy inputs to reproduce successful templates in neighboring wards.' },
  ];

  const team = [
    { name: 'Dr. Aruna Natarajan', role: 'Executive Chairperson', bio: 'Former environmental scientist with 22 years of experience leading urban wetland conservation and hydrology policy.' },
    { name: 'Karthik Raman', role: 'Head of Grassroots Programs', bio: 'Social development veteran who has spearheaded digital education access in over 400 rural government schools.' },
    { name: 'Meera Deshmukh', role: 'Director of Impact & Governance', bio: 'Certified auditor specializing in CSR compliance, social return on investment (SROI), and beneficiary protection.' },
    { name: 'Vikas Chenna', role: 'Lead Ecologist & Field Hydrologist', bio: 'Expert in native Karnataka flora, constructed wetland bioswales, and community biodiversity documentation.' },
  ];

  return (
    <div className="about-page-root">
      {/* Page Header */}
      <section className="about-hero">
        <div className="container">
          <span className="section-badge">Who We Are</span>
          <h1 className="about-hero-title">A Foundation Built on Accountable Citizen Action</h1>
          <p className="about-hero-subtitle">
            Responsible Individuals was founded on a simple premise: lasting social and environmental progress happens when individuals take ownership of their shared environment with scientific guidance and transparent support.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section bg-white">
        <div className="container">
          <div className="vision-mission-grid">
            <div className="card vm-card">
              <div className="vm-icon-box vision-bg">
                <Target size={28} color="#10B981" />
              </div>
              <h2 className="vm-title">Our Vision</h2>
              <p className="vm-text">
                A world of resilient, self-reliant communities where every individual actively safeguards local ecosystems, advances equitable education, and fosters collective well-being.
              </p>
            </div>

            <div className="card vm-card">
              <div className="vm-icon-box mission-bg">
                <Shield size={28} color="#2563EB" />
              </div>
              <h2 className="vm-title">Our Mission</h2>
              <p className="vm-text">
                To mobilize citizens, corporate CSR partners, and institutions into high-impact grassroots initiatives with verifiable data, open governance, and sustainable community ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Step Scientific Approach */}
      <section id="approach" className="section bg-light-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Methodology</span>
            <h2 className="section-title">Our 8-Step Approach</h2>
            <p className="section-subtitle">
              We do not believe in cosmetic one-off charity. Every initiative follows a rigorous end-to-end lifecycle designed for institutional sustainability.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((s, idx) => (
              <div key={s.num} className="card step-card">
                <div className="step-num-badge">{s.num}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Team */}
      <section id="leadership" className="section bg-white">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Leadership</span>
            <h2 className="section-title">Guiding Minds & Practitioners</h2>
            <p className="section-subtitle">
              Our multidisciplinary team brings together grassroots activists, environmental engineers, and public policy practitioners.
            </p>
          </div>

          <div className="team-grid">
            {team.map((member, idx) => (
              <div key={idx} className="card team-card">
                <div className="team-avatar-placeholder">
                  <span className="avatar-initials">{member.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <h3 className="member-name">{member.name}</h3>
                <span className="member-role">{member.role}</span>
                <p className="member-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .about-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 4rem 0;
          text-align: center;
        }
        .about-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .about-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        @media (min-width: 768px) {
          .about-hero-title {
            font-size: 3.5rem;
          }
        }
        .about-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 760px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .vision-mission-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .vision-mission-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .vm-card {
          padding: 3rem;
          background: #FFFFFF;
        }
        .vm-icon-box {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .vision-bg {
          background: #ECFDF5;
        }
        .mission-bg {
          background: #EFF6FF;
        }
        .vm-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 0.85rem;
          color: var(--slate-900);
        }
        .vm-text {
          font-size: 1.025rem;
          color: var(--text-muted);
          line-height: 1.7;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .steps-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .step-card {
          padding: 2rem;
          background: #FFFFFF;
          position: relative;
        }
        .step-num-badge {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--primary-500);
          margin-bottom: 1rem;
        }
        .step-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.5rem;
        }
        .step-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.55;
        }
        .team-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 640px) {
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .team-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .team-card {
          padding: 2rem;
          text-align: center;
          background: #FFFFFF;
        }
        .team-avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-pill);
          background: linear-gradient(135deg, #0F4C3A 0%, #10B981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }
        .avatar-initials {
          color: white;
          font-weight: 800;
          font-size: 1.5rem;
          font-family: var(--font-heading);
        }
        .member-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.25rem;
        }
        .member-role {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary-700);
          margin-bottom: 0.75rem;
        }
        .member-bio {
          font-size: 0.825rem;
          color: var(--text-muted);
          line-height: 1.55;
        }
      `}</style>
    </div>
  );
}
