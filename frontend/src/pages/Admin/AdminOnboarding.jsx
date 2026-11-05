import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/api';
import { 
  Users, CheckCircle2, Clock, XCircle, AlertCircle, 
  Search, RefreshCw, Eye, Check, X, ShieldCheck, 
  FileText, Calendar, MapPin, Mail, Phone, ChevronLeft, 
  ChevronRight, ArrowRight, ShieldAlert, Award, FileQuestion
} from 'lucide-react';

export default function AdminOnboarding() {
  const [applications, setApplications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Metrics state
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Modal states
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState({
    open: false,
    app: null,
    action: null, // 'APPROVED' | 'REJECTED'
    notes: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Fetch KPI counts across all categories
  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const [allRes, subRes, appRes, rejRes] = await Promise.all([
        adminService.getOnboardingApplications({ page: 1 }),
        adminService.getOnboardingApplications({ status: 'SUBMITTED', page: 1 }),
        adminService.getOnboardingApplications({ status: 'APPROVED', page: 1 }),
        adminService.getOnboardingApplications({ status: 'REJECTED', page: 1 }),
      ]);

      const getCount = (res, fallbackFilter) => {
        if (res && typeof res.count === 'number') return res.count;
        if (Array.isArray(res)) {
          return fallbackFilter ? res.filter(fallbackFilter).length : res.length;
        }
        return 0;
      };

      setMetrics({
        total: getCount(allRes),
        pending: getCount(subRes, a => a.status === 'SUBMITTED'),
        approved: getCount(appRes, a => a.status === 'APPROVED'),
        rejected: getCount(rejRes, a => a.status === 'REJECTED'),
      });
    } catch (err) {
      console.error('Failed to load onboarding metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Fetch paginated applications based on filters and search
  const fetchApplications = useCallback(async (page = 1, status = 'ALL', search = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = { page };
      if (status !== 'ALL') params.status = status;
      if (search && search.trim()) params.search = search.trim();

      const res = await adminService.getOnboardingApplications(params);

      if (Array.isArray(res)) {
        setApplications(res);
        setTotalCount(res.length);
      } else if (res && Array.isArray(res.results)) {
        setApplications(res.results);
        setTotalCount(res.count ?? res.results.length);
      } else {
        setApplications([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Unable to load onboarding applications. Please verify network or credentials.');
      setApplications([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchApplications(currentPage, filterStatus, activeSearch);
  }, [currentPage, filterStatus, activeSearch, fetchApplications]);

  // Handle Search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  const handleFilterChange = (newStatus) => {
    setFilterStatus(newStatus);
    setCurrentPage(1);
  };

  // Open detail view and fetch complete detail
  const handleOpenDetail = async (app) => {
    setSelectedApp(app);
    try {
      setDetailLoading(true);
      const fullDetail = await adminService.getOnboardingApplicationDetail(app.id);
      if (fullDetail && fullDetail.id) {
        setSelectedApp(fullDetail);
      }
    } catch (err) {
      console.warn('Could not fetch updated detail, using cached application row:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedApp(null);
  };

  // Trigger review confirmation dialog
  const promptReview = (app, action) => {
    setReviewModal({
      open: true,
      app,
      action,
      notes: app.admin_review_notes || '',
    });
  };

  const closeReviewModal = () => {
    setReviewModal({
      open: false,
      app: null,
      action: null,
      notes: '',
    });
  };

  // Submit Review Decision
  const handleConfirmReview = async () => {
    if (!reviewModal.app || !reviewModal.action) return;
    const { app, action, notes } = reviewModal;

    try {
      setReviewSubmitting(true);
      const res = await adminService.reviewOnboardingApplication(app.id, action, notes);

      showToast(
        `Application for ${app.volunteer_name || 'applicant'} successfully marked as ${action.toLowerCase()}.`,
        'success'
      );

      // Close review dialog
      closeReviewModal();

      // If detail modal is open for this application, update it
      if (selectedApp && selectedApp.id === app.id) {
        setSelectedApp(prev => ({
          ...prev,
          status: action,
          admin_review_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by_name: res.application?.reviewed_by_name || 'Admin',
        }));
      }

      // Refresh applications and metrics
      fetchApplications(currentPage, filterStatus, activeSearch);
      fetchMetrics();
    } catch (err) {
      console.error('Failed to submit review decision:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to submit review decision. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') {
      return <span className="status-badge approved"><CheckCircle2 size={13} /> Approved</span>;
    }
    if (s === 'REJECTED') {
      return <span className="status-badge rejected"><XCircle size={13} /> Declined</span>;
    }
    return <span className="status-badge pending"><Clock size={13} /> Pending Review</span>;
  };

  return (
    <div className="admin-onboarding-view">
      {/* Toast Notification */}
      {toast && (
        <div className={`admin-toast-banner ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-main-heading">Volunteer Onboarding Applications</h1>
          <p className="admin-subtext">
            Review citizen onboarding applications, evaluate motivations and availability, and manage volunteer verification status.
          </p>
        </div>
        <button 
          onClick={() => { fetchMetrics(); fetchApplications(currentPage, filterStatus, activeSearch); }} 
          className="admin-btn-secondary"
          title="Refresh Data"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Metrics Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card" onClick={() => handleFilterChange('ALL')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-title-label">Total Applications</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">{metricsLoading ? '...' : metrics.total}</div>
          <span className="kpi-hint-text">All recorded onboarding submissions</span>
        </div>

        <div className="admin-kpi-card highlight-pending" onClick={() => handleFilterChange('SUBMITTED')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-title-label">Pending Review</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">{metricsLoading ? '...' : metrics.pending}</div>
          <span className="kpi-hint-text">Awaiting administrative decision</span>
        </div>

        <div className="admin-kpi-card" onClick={() => handleFilterChange('APPROVED')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-title-label">Approved Volunteers</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">{metricsLoading ? '...' : metrics.approved}</div>
          <span className="kpi-hint-text">Promoted to active volunteer portal</span>
        </div>

        <div className="admin-kpi-card" onClick={() => handleFilterChange('REJECTED')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-title-label">Declined Applications</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
              <XCircle size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">{metricsLoading ? '...' : metrics.rejected}</div>
          <span className="kpi-hint-text">Maintained under public citizen role</span>
        </div>
      </div>

      {/* Control Bar: Search and Status Filters */}
      <div className="admin-controls-card">
        <form onSubmit={handleSearchSubmit} className="search-box-form">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by applicant name, email, or intent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} className="search-clear-btn" title="Clear Search">
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="admin-btn-search">
            Search
          </button>
        </form>

        <div className="filter-pills-row">
          <span className="filter-label">Filter:</span>
          {[
            { key: 'ALL', label: 'All Applications' },
            { key: 'SUBMITTED', label: 'Pending Review' },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Declined' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`filter-pill-btn ${filterStatus === tab.key ? 'active' : ''}`}
            >
              {tab.label}
              {tab.key === 'SUBMITTED' && metrics.pending > 0 && (
                <span className="pending-badge-dot">{metrics.pending}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="admin-table-container">
        {error && (
          <div className="admin-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => fetchApplications(currentPage, filterStatus, activeSearch)} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="admin-state-box">
            <RefreshCw size={24} className="spin-icon" />
            <p>Loading onboarding applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="admin-state-box">
            <FileQuestion size={40} color="#64748B" />
            <h3 className="empty-title">No applications found</h3>
            <p className="empty-subtext">
              {activeSearch || filterStatus !== 'ALL'
                ? 'No onboarding applications match your active filter or search query.'
                : 'No volunteer onboarding applications have been submitted yet.'}
            </p>
            {(activeSearch || filterStatus !== 'ALL') && (
              <button 
                onClick={() => { setSearchQuery(''); setActiveSearch(''); setFilterStatus('ALL'); }}
                className="admin-btn-secondary"
                style={{ marginTop: '0.75rem' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact & Location</th>
                  <th>Availability</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Review Decision</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="applicant-cell">
                        <strong className="applicant-name">{app.volunteer_name || 'Unnamed Applicant'}</strong>
                        <span className="applicant-email">{app.volunteer_email || 'No email registered'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span className="contact-item">
                          <Phone size={12} /> {app.volunteer_phone || 'Phone not set'}
                        </span>
                        <span className="contact-item">
                          <MapPin size={12} /> {app.volunteer_city || 'City not set'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="availability-tag">
                        {app.availability || 'Weekends'}
                      </span>
                    </td>
                    <td>
                      <span className="table-date">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : (app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A')}
                      </span>
                    </td>
                    <td>
                      {getStatusBadge(app.status)}
                    </td>
                    <td>
                      <div className="action-buttons-wrap">
                        <button
                          onClick={() => handleOpenDetail(app)}
                          className="table-action-btn view"
                          title="Inspect application narrative & background"
                        >
                          <Eye size={13} /> View Details
                        </button>

                        {app.status !== 'APPROVED' && (
                          <button
                            onClick={() => promptReview(app, 'APPROVED')}
                            className="table-action-btn approve"
                            title="Approve citizen as volunteer"
                          >
                            <Check size={13} /> Approve
                          </button>
                        )}

                        {app.status !== 'REJECTED' && (
                          <button
                            onClick={() => promptReview(app, 'REJECTED')}
                            className="table-action-btn reject"
                            title="Decline application"
                          >
                            <X size={13} /> Decline
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div className="admin-pagination-bar">
              <span className="pagination-info">
                Showing <strong>{applications.length}</strong> of <strong>{totalCount}</strong> applications (Page {currentPage} of {totalPages})
              </span>
              <div className="pagination-controls">
                <button
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="page-nav-btn"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="page-indicator">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="page-nav-btn"
                  title="Next Page"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedApp && (
        <div className="admin-modal-backdrop" onClick={handleCloseDetail}>
          <div className="admin-detail-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="dialog-title-block">
                <div className="dialog-avatar">
                  <Users size={22} color="#F97316" />
                </div>
                <div>
                  <h2 className="dialog-title">{selectedApp.volunteer_name || 'Applicant Dossier'}</h2>
                  <span className="dialog-sub">{selectedApp.volunteer_email}</span>
                </div>
              </div>
              <div className="dialog-header-right">
                {getStatusBadge(selectedApp.status)}
                <button onClick={handleCloseDetail} className="dialog-close-btn" title="Close Dossier">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="dialog-body-scroll">
              {detailLoading && (
                <div className="detail-sync-note">
                  <RefreshCw size={12} className="spin-icon" /> Synchronizing application data...
                </div>
              )}

              {/* Applicant Overview Card */}
              <div className="dialog-info-card">
                <h4 className="card-section-heading">Applicant Information</h4>
                <div className="info-grid-2">
                  <div className="info-grid-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-val">{selectedApp.volunteer_name || 'Not provided'}</span>
                  </div>
                  <div className="info-grid-item">
                    <span className="info-label">Registered Email</span>
                    <span className="info-val">{selectedApp.volunteer_email || 'Not provided'}</span>
                  </div>
                  <div className="info-grid-item">
                    <span className="info-label">Contact Phone</span>
                    <span className="info-val">{selectedApp.volunteer_phone || 'Not provided'}</span>
                  </div>
                  <div className="info-grid-item">
                    <span className="info-label">City / Region</span>
                    <span className="info-val">{selectedApp.volunteer_city || 'Not provided'}</span>
                  </div>
                  <div className="info-grid-item">
                    <span className="info-label">Availability Schedule</span>
                    <span className="info-val highlight">{selectedApp.availability || 'Weekends'}</span>
                  </div>
                  <div className="info-grid-item">
                    <span className="info-label">Submission Date</span>
                    <span className="info-val">
                      {selectedApp.submitted_at 
                        ? new Date(selectedApp.submitted_at).toLocaleString() 
                        : (selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleString() : 'N/A')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statement of Intent & Motivation */}
              <div className="dialog-info-card">
                <h4 className="card-section-heading">Statement of Intent & Motivation</h4>
                <div className="statement-quote-box">
                  <p>{selectedApp.statement_of_intent || 'No statement of intent was recorded.'}</p>
                </div>
              </div>

              {/* Skills & Prior Experience */}
              <div className="dialog-info-card">
                <h4 className="card-section-heading">Skills & Prior Experience</h4>
                <div className="experience-blocks">
                  <div className="experience-item">
                    <span className="info-label">Key Skills & Capabilities</span>
                    <p className="experience-text">
                      {selectedApp.skills_summary || 'No specialized skills specified by the applicant.'}
                    </p>
                  </div>
                  <div className="experience-item">
                    <span className="info-label">Prior NGO / Volunteer Experience</span>
                    <p className="experience-text">
                      {selectedApp.experience_summary || 'No prior volunteering experience reported.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Administrative Review Trail */}
              {(selectedApp.reviewed_at || selectedApp.reviewed_by_name || selectedApp.admin_review_notes) && (
                <div className="dialog-info-card audit-trail-card">
                  <h4 className="card-section-heading">Administrative Review Trail</h4>
                  <div className="info-grid-2">
                    <div className="info-grid-item">
                      <span className="info-label">Reviewed By</span>
                      <span className="info-val">{selectedApp.reviewed_by_name || 'Admin Officer'}</span>
                    </div>
                    <div className="info-grid-item">
                      <span className="info-label">Reviewed Timestamp</span>
                      <span className="info-val">
                        {selectedApp.reviewed_at ? new Date(selectedApp.reviewed_at).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  {selectedApp.admin_review_notes && (
                    <div className="review-notes-box">
                      <span className="info-label">Admin Notes / Decision Rationale</span>
                      <p>{selectedApp.admin_review_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* FUTURE-READY PLACEHOLDER: Documents & Verification (Separated section) */}
              <div className="dialog-info-card documents-placeholder-card">
                <div className="card-header-flex">
                  <h4 className="card-section-heading">Documents & Verification</h4>
                  <span className="future-tag">Phase 2 Pipeline</span>
                </div>
                <div className="future-notice-banner">
                  <ShieldCheck size={16} color="#38BDF8" />
                  <p>
                    Official government identity verification (Aadhaar, Voter ID, Address Verification, and Certifications) 
                    is slated for the upcoming Phase 2 verification pipeline. No physical or uploaded files were required 
                    during this preliminary digital onboarding registration.
                  </p>
                </div>

                <div className="placeholder-docs-grid">
                  <div className="doc-tile disabled">
                    <div className="doc-icon"><FileText size={18} /></div>
                    <div className="doc-meta">
                      <span className="doc-name">Government Photo ID</span>
                      <span className="doc-status">Pending Phase 2 Integration</span>
                    </div>
                  </div>
                  <div className="doc-tile disabled">
                    <div className="doc-icon"><MapPin size={18} /></div>
                    <div className="doc-meta">
                      <span className="doc-name">Address / Residence Proof</span>
                      <span className="doc-status">Pending Phase 2 Integration</span>
                    </div>
                  </div>
                  <div className="doc-tile disabled">
                    <div className="doc-icon"><Award size={18} /></div>
                    <div className="doc-meta">
                      <span className="doc-name">Skills & Certificates</span>
                      <span className="doc-status">Pending Phase 2 Integration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="dialog-footer">
              <button onClick={handleCloseDetail} className="admin-btn-secondary">
                Close
              </button>
              <div className="dialog-footer-actions">
                {selectedApp.status !== 'REJECTED' && (
                  <button
                    onClick={() => promptReview(selectedApp, 'REJECTED')}
                    className="admin-btn-reject"
                  >
                    <X size={15} /> Decline Application
                  </button>
                )}
                {selectedApp.status !== 'APPROVED' && (
                  <button
                    onClick={() => promptReview(selectedApp, 'APPROVED')}
                    className="admin-btn-approve"
                  >
                    <Check size={15} /> Approve as Volunteer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW CONFIRMATION DIALOG */}
      {reviewModal.open && (
        <div className="admin-modal-backdrop" onClick={closeReviewModal}>
          <div className="admin-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-wrap">
              {reviewModal.action === 'APPROVED' ? (
                <div className="action-circle-icon approve"><CheckCircle2 size={32} /></div>
              ) : (
                <div className="action-circle-icon reject"><ShieldAlert size={32} /></div>
              )}
            </div>

            <h3 className="confirm-title">
              {reviewModal.action === 'APPROVED' ? 'Approve Citizen Volunteer' : 'Decline Onboarding Application'}
            </h3>

            <p className="confirm-desc">
              {reviewModal.action === 'APPROVED' ? (
                <>
                  Are you sure you want to approve <strong>{reviewModal.app?.volunteer_name}</strong>? 
                  This will upgrade their platform account role to <strong>VOLUNTEER</strong>, 
                  mark their profile status as <strong>APPROVED</strong>, and grant them immediate access to the Volunteer Dashboard.
                </>
              ) : (
                <>
                  Are you sure you want to decline <strong>{reviewModal.app?.volunteer_name}</strong>'s onboarding application? 
                  Their platform account role will remain as <strong>PUBLIC</strong> citizen.
                </>
              )}
            </p>

            <div className="confirm-form-field">
              <label htmlFor="review-notes-input" className="form-label">
                Decision Notes / Reason {reviewModal.action === 'REJECTED' ? '(Recommended)' : '(Optional)'}
              </label>
              <textarea
                id="review-notes-input"
                rows={3}
                placeholder={
                  reviewModal.action === 'APPROVED'
                    ? 'Enter internal notes, special skill highlights, or onboarding instructions...'
                    : 'Provide the reason for decline (e.g. outside target service geography, insufficient availability)...'
                }
                value={reviewModal.notes}
                onChange={(e) => setReviewModal(prev => ({ ...prev, notes: e.target.value }))}
                className="confirm-textarea"
              />
            </div>

            <div className="confirm-dialog-actions">
              <button 
                type="button" 
                onClick={closeReviewModal} 
                disabled={reviewSubmitting}
                className="admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                disabled={reviewSubmitting}
                className={reviewModal.action === 'APPROVED' ? 'admin-btn-approve' : 'admin-btn-reject'}
              >
                {reviewSubmitting ? (
                  <>
                    <RefreshCw size={14} className="spin-icon" /> Submitting...
                  </>
                ) : (
                  <>
                    Confirm {reviewModal.action === 'APPROVED' ? 'Approval' : 'Decline'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .admin-onboarding-view {
          padding-bottom: 3rem;
        }
        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.75rem;
          gap: 1rem;
        }
        .admin-main-heading {
          font-size: 1.85rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }
        .admin-subtext {
          font-size: 0.9rem;
          color: #94A3B8;
          max-width: 720px;
          line-height: 1.5;
        }

        /* Toast banner */
        .admin-toast-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          animation: slideDown 0.3s ease;
        }
        .admin-toast-banner.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34D399;
        }
        .admin-toast-banner.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #F87171;
        }

        /* KPI Grid */
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.75rem;
        }
        .admin-kpi-card {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .admin-kpi-card:hover {
          transform: translateY(-2px);
          border-color: #334155;
        }
        .admin-kpi-card.highlight-pending {
          border-color: rgba(245, 158, 11, 0.3);
        }
        .kpi-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kpi-title-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .kpi-icon-pill {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kpi-metric-val {
          font-size: 1.85rem;
          font-weight: 800;
          color: #F8FAFC;
        }
        .kpi-hint-text {
          font-size: 0.75rem;
          color: #64748B;
        }

        /* Controls Card */
        .admin-controls-card {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .search-box-form {
          display: flex;
          gap: 0.5rem;
          flex: 1;
          max-width: 480px;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: #64748B;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: #162035;
          border: 1px solid #1E293B;
          color: #F8FAFC;
          border-radius: 8px;
          padding: 0.6rem 2.2rem 0.6rem 2.2rem;
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .search-input:focus {
          border-color: #F97316;
        }
        .search-clear-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 2px;
        }
        .admin-btn-search {
          background: #1E293B;
          border: 1px solid #334155;
          color: #F8FAFC;
          font-size: 0.825rem;
          font-weight: 600;
          border-radius: 8px;
          padding: 0.6rem 1rem;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .admin-btn-search:hover {
          background: #334155;
        }
        .filter-pills-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .filter-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          margin-right: 0.25rem;
        }
        .filter-pill-btn {
          background: #162035;
          border: 1px solid #1E293B;
          color: #94A3B8;
          border-radius: 20px;
          padding: 0.4rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 0.15s ease;
        }
        .filter-pill-btn:hover {
          background: #1E293B;
          color: #CBD5E1;
        }
        .filter-pill-btn.active {
          background: rgba(249, 115, 22, 0.15);
          border-color: rgba(249, 115, 22, 0.4);
          color: #F97316;
        }
        .pending-badge-dot {
          background: #F59E0B;
          color: #0F172A;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: 10px;
        }

        /* Table & Container */
        .admin-table-container {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: 12px;
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
          padding: 1.15rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #CBD5E1;
          vertical-align: middle;
        }
        .admin-table tr:hover td {
          background: rgba(255, 255, 255, 0.015);
        }
        .applicant-cell {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .applicant-name {
          color: #F8FAFC;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .applicant-email {
          color: #64748B;
          font-size: 0.75rem;
        }
        .contact-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: #94A3B8;
        }
        .availability-tag {
          display: inline-block;
          background: #162035;
          border: 1px solid #1E293B;
          color: #CBD5E1;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .table-date {
          font-size: 0.8rem;
          color: #94A3B8;
        }

        /* Status Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.725rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .status-badge.approved {
          background: #064E3B;
          color: #34D399;
          border: 1px solid rgba(52, 211, 153, 0.2);
        }
        .status-badge.pending {
          background: #78350F;
          color: #FBBF24;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }
        .status-badge.rejected {
          background: #7F1D1D;
          color: #F87171;
          border: 1px solid rgba(248, 113, 113, 0.2);
        }

        /* Action buttons */
        .action-buttons-wrap {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .table-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .table-action-btn.view {
          background: #1E293B;
          color: #E2E8F0;
        }
        .table-action-btn.view:hover {
          background: #334155;
        }
        .table-action-btn.approve {
          background: #065F46;
          color: #A7F3D0;
        }
        .table-action-btn.approve:hover {
          background: #047857;
        }
        .table-action-btn.reject {
          background: #7F1D1D;
          color: #FECACA;
        }
        .table-action-btn.reject:hover {
          background: #991B1B;
        }

        /* Pagination Bar */
        .admin-pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1.25rem;
          border-top: 1px solid #1E293B;
          background: #0F172A;
        }
        .pagination-info {
          font-size: 0.8rem;
          color: #94A3B8;
        }
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .page-nav-btn {
          background: #162035;
          border: 1px solid #1E293B;
          color: #E2E8F0;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
        }
        .page-nav-btn:hover:not(:disabled) {
          background: #1E293B;
        }
        .page-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .page-indicator {
          font-size: 0.8rem;
          color: #64748B;
          padding: 0 0.5rem;
        }

        /* State boxes */
        .admin-state-box {
          padding: 3.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #94A3B8;
          gap: 0.5rem;
        }
        .empty-title {
          font-size: 1.1rem;
          color: #F8FAFC;
          font-weight: 700;
        }
        .empty-subtext {
          font-size: 0.85rem;
          color: #64748B;
          max-width: 400px;
        }
        .admin-error-banner {
          background: rgba(239, 68, 68, 0.15);
          border-bottom: 1px solid rgba(239, 68, 68, 0.3);
          color: #F87171;
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
        }
        .retry-btn {
          margin-left: auto;
          background: #EF4444;
          color: #FFF;
          border: none;
          padding: 0.3rem 0.7rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* Buttons common */
        .admin-btn-secondary {
          background: #162035;
          border: 1px solid #1E293B;
          color: #CBD5E1;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .admin-btn-secondary:hover {
          background: #1E293B;
          color: #F8FAFC;
        }
        .admin-btn-approve {
          background: #059669;
          border: none;
          color: #FFFFFF;
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .admin-btn-approve:hover:not(:disabled) {
          background: #047857;
        }
        .admin-btn-reject {
          background: #DC2626;
          border: none;
          color: #FFFFFF;
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .admin-btn-reject:hover:not(:disabled) {
          background: #B91C1C;
        }
        .admin-btn-approve:disabled, .admin-btn-reject:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* MODAL BACKDROP */
        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }

        /* DETAIL DIALOG */
        .admin-detail-dialog {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: 14px;
          width: 100%;
          max-width: 820px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          animation: zoomIn 0.2s ease-out;
        }
        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #1E293B;
        }
        .dialog-title-block {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .dialog-avatar {
          width: 44px;
          height: 44px;
          background: rgba(249, 115, 22, 0.12);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dialog-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #F8FAFC;
          margin-bottom: 0.15rem;
        }
        .dialog-sub {
          font-size: 0.8rem;
          color: #94A3B8;
        }
        .dialog-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .dialog-close-btn {
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .dialog-close-btn:hover {
          color: #F8FAFC;
          background: #1E293B;
        }
        .dialog-body-scroll {
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .detail-sync-note {
          font-size: 0.75rem;
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* Detail Cards */
        .dialog-info-card {
          background: #162035;
          border: 1px solid #1E293B;
          border-radius: 10px;
          padding: 1.25rem;
        }
        .card-section-heading {
          font-size: 0.8rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }
        .card-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .card-header-flex .card-section-heading {
          margin-bottom: 0;
        }
        .info-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .info-grid-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .info-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
        }
        .info-val {
          font-size: 0.88rem;
          color: #F8FAFC;
          font-weight: 500;
        }
        .info-val.highlight {
          color: #F97316;
          font-weight: 700;
        }

        .statement-quote-box {
          background: #0F172A;
          border-left: 3px solid #F97316;
          padding: 1rem 1.25rem;
          border-radius: 0 8px 8px 0;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #CBD5E1;
          font-style: italic;
        }
        .experience-blocks {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .experience-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .experience-text {
          font-size: 0.875rem;
          color: #CBD5E1;
          line-height: 1.5;
        }

        .audit-trail-card {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(30, 41, 59, 0.6);
        }
        .review-notes-box {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.85rem;
          color: #E2E8F0;
        }

        /* Documents & Verification Section */
        .documents-placeholder-card {
          border-color: rgba(56, 189, 248, 0.25);
          background: #0E1A2E;
        }
        .future-tag {
          font-size: 0.68rem;
          font-weight: 800;
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          text-transform: uppercase;
        }
        .future-notice-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 8px;
          padding: 0.85rem 1rem;
          font-size: 0.8rem;
          color: #BAE6FD;
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        .placeholder-docs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .doc-tile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #162035;
          border: 1px dashed #334155;
          border-radius: 8px;
          padding: 0.75rem;
        }
        .doc-tile.disabled {
          opacity: 0.7;
        }
        .doc-icon {
          color: #64748B;
        }
        .doc-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .doc-name {
          font-size: 0.78rem;
          font-weight: 600;
          color: #E2E8F0;
        }
        .doc-status {
          font-size: 0.68rem;
          color: #64748B;
        }

        .dialog-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #1E293B;
          background: #0F172A;
          border-radius: 0 0 14px 14px;
        }
        .dialog-footer-actions {
          display: flex;
          gap: 0.75rem;
        }

        /* CONFIRM DIALOG */
        .admin-confirm-dialog {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: 14px;
          width: 100%;
          max-width: 520px;
          padding: 1.75rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.7);
          animation: zoomIn 0.2s ease-out;
        }
        .confirm-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .action-circle-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-circle-icon.approve {
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
        }
        .action-circle-icon.reject {
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
        }
        .confirm-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #F8FAFC;
          text-align: center;
          margin-bottom: 0.6rem;
        }
        .confirm-desc {
          font-size: 0.88rem;
          color: #94A3B8;
          text-align: center;
          line-height: 1.55;
          margin-bottom: 1.25rem;
        }
        .confirm-form-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1.5rem;
        }
        .form-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #CBD5E1;
        }
        .confirm-textarea {
          background: #162035;
          border: 1px solid #1E293B;
          border-radius: 8px;
          color: #F8FAFC;
          padding: 0.75rem;
          font-size: 0.85rem;
          resize: vertical;
          outline: none;
        }
        .confirm-textarea:focus {
          border-color: #F97316;
        }
        .confirm-dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 900px) {
          .admin-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .placeholder-docs-grid {
            grid-template-columns: 1fr;
          }
          .info-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

