import React, { useEffect, useState } from 'react';
import { impactService } from '../../services/api';
import { 
  BarChart3, Award, Users, Droplet, FileText, 
  Download, ArrowRight, CheckCircle, ShieldCheck 
} from 'lucide-react';
import ImpactCounter from '../../components/common/ImpactCounter';

export default function ImpactPage() {
  const [areas, setAreas] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImpact() {
      try {
        const [areasData, reportsData] = await Promise.all([
          impactService.getAreas(),
          impactService.getReports(),
        ]);
        setAreas(areasData);
        setReports(reportsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadImpact();
  }, []);

  return (
    <div className="impact-page-root">
      {/* Hero Header */}
      <section className="impact-hero">
        <div className="container">
          <span className="section-badge">Accountable Data</span>
          <h1 className="impact-hero-title">Measurable Social & Ecological Impact</h1>
          <p className="impact-hero-subtitle">
            We believe that transparency breeds trust. Every rupee spent and every volunteer hour contributed is tied directly to verifiable baseline and target outcomes.
          </p>
        </div>
      </section>

      {/* Real-time counters */}
      <ImpactCounter />

      {/* Impact Area Metrics Breakdown */}
      <section className="section bg-light-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Pillars</span>
            <h2 className="section-title">Metrics by Focus Area</h2>
            <p className="section-subtitle">
              Detailed tracking of scientific indicators across our key intervention spheres.
            </p>
          </div>

          <div className="impact-areas-list">
            {areas.map((area) => (
              <div key={area.id} className="card impact-area-row">
                <div className="impact-area-header">
                  <div>
                    <h3 className="area-title">{area.name}</h3>
                    <p className="area-tagline">{area.description}</p>
                  </div>
                  {area.sdg_alignment && (
                    <div className="sdg-pill-group">
                      {area.sdg_alignment.split(',').map((sdg, i) => (
                        <span key={i} className="sdg-badge-item">{sdg.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metrics Table / Grid */}
                {area.metrics && area.metrics.length > 0 && (
                  <div className="area-metrics-grid">
                    {area.metrics.map((m) => (
                      <div key={m.id} className="area-metric-box">
                        <div className="metric-box-top">
                          <span className="metric-name-text">{m.name}</span>
                          <span className="metric-type-badge">{m.metric_type}</span>
                        </div>
                        <div className="metric-num-line">
                          <span className="metric-achieved">{Number(m.achieved_value).toLocaleString()}</span>
                          <span className="metric-target">/ {Number(m.target_value).toLocaleString()} {m.unit}</span>
                        </div>
                        <div className="metric-track">
                          <div 
                            className="metric-fill" 
                            style={{ width: `${Math.min(m.percentage, 100)}%`, backgroundColor: area.color_accent || '#10B981' }} 
                          />
                        </div>
                        <span className="metric-pct-sub">{m.percentage}% of target achieved</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Annual Reports */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Audits & Reports</span>
            <h2 className="section-title">Annual Disclosures & Publications</h2>
            <p className="section-subtitle">
              Download our audited financial statements, comprehensive project outcomes, and third-party impact assessments.
            </p>
          </div>

          <div className="reports-grid">
            <div className="card report-card">
              <div className="report-icon-box">
                <FileText size={32} color="#059669" />
              </div>
              <div className="report-info">
                <h3 className="report-title">Annual Impact & Stewardship Report 2025-26</h3>
                <p className="report-desc">Comprehensive analysis of 6 lake revivals, 42 rural STEM smart classrooms, and audited financial statements.</p>
                <div className="report-meta">PDF • 14.2 MB • Section 12A / 80G Certified</div>
              </div>
              <button className="btn btn-secondary btn-sm report-dl-btn">
                <Download size={16} />
                <span>Download Report</span>
              </button>
            </div>

            <div className="card report-card">
              <div className="report-icon-box">
                <FileText size={32} color="#2563EB" />
              </div>
              <div className="report-info">
                <h3 className="report-title">Urban Hydrology & Wetland Baseline Survey 2025</h3>
                <p className="report-desc">Water quality parameters, dissolved oxygen shifts, and avian biodiversity census for Bengaluru East lake clusters.</p>
                <div className="report-meta">PDF • 8.6 MB • Hydrological Research</div>
              </div>
              <button className="btn btn-secondary btn-sm report-dl-btn">
                <Download size={16} />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .impact-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 4rem 0;
          text-align: center;
        }
        .impact-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .impact-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        @media (min-width: 768px) {
          .impact-hero-title {
            font-size: 3.5rem;
          }
        }
        .impact-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 740px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .impact-areas-list {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .impact-area-row {
          padding: 2.5rem;
          background: #FFFFFF;
        }
        .impact-area-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        @media (min-width: 768px) {
          .impact-area-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }
        .area-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.35rem;
        }
        .area-tagline {
          font-size: 0.95rem;
          color: var(--text-muted);
          max-width: 600px;
        }
        .sdg-pill-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .sdg-badge-item {
          background: #D1FAE5;
          color: #065F46;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-pill);
        }
        .area-metrics-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .area-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .area-metric-box {
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }
        .metric-box-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .metric-name-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--slate-800);
        }
        .metric-type-badge {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--slate-500);
          background: var(--slate-200);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }
        .metric-num-line {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          margin-bottom: 0.5rem;
        }
        .metric-achieved {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--slate-900);
        }
        .metric-target {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .metric-track {
          height: 6px;
          background: var(--slate-200);
          border-radius: var(--radius-pill);
          overflow: hidden;
          margin-bottom: 0.35rem;
        }
        .metric-fill {
          height: 100%;
          border-radius: var(--radius-pill);
        }
        .metric-pct-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .reports-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .reports-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .report-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.25rem;
          background: #FFFFFF;
        }
        .report-icon-box {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          background: var(--slate-50);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .report-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.5rem;
        }
        .report-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 0.75rem;
        }
        .report-meta {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--slate-500);
        }
        .report-dl-btn {
          margin-top: auto;
        }
      `}</style>
    </div>
  );
}
