import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/api';
import { 
  Users, UserCheck, ShieldCheck, CheckCircle2, XCircle, Clock, 
  Search, RefreshCw, X, AlertCircle, Award, Calendar, ChevronLeft, 
  ChevronRight, ArrowUpRight, Ban, Check, MapPin, Mail, Phone, 
  Briefcase, FileText, Activity
} from 'lucide-react';

export default function AdminVolunteerDirectory() {
  // Directory list & pagination state
  const [volunteers, setVolunteers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [filterApproval, setFilterApproval] = useState('ALL');
  const [filterActive, setFilterActive] = useState('ALL');

  // KPI Metrics state
  const [metrics, setMetrics] = useState({
    totalApproved: 0,
    activeVolunteers: 0,
    inactiveVolunteers: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Detail Drawer / Modal state
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [detailLoading, setDetailLoading] = useState(false);
  const [historyApplications, setHistoryApplications] = useState([]);
  const [historyParticipations, setHistoryParticipations] = useState([]);
  const [historyCertificates, setHistoryCertificates] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Status Change Confirmation Dialog state
  const [statusModal, setStatusModal] = useState({
    open: false,
    volunteer: null,
    targetIsActive: false,
    reason: '',
  });
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Fetch KPI metrics across dataset
  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const [approvedRes, activeRes, inactiveRes] = await Promise.all([
        adminService.getVolunteerDirectory({ approval_status: 'APPROVED', page: 1 }),
        adminService.getVolunteerDirectory({ approval_status: 'APPROVED', is_active: 'true', page: 1 }),
        adminService.getVolunteerDirectory({ approval_status: 'APPROVED', is_active: 'false', page: 1 }),
      ]);

      const getCount = (res) => {
        if (res && typeof res.count === 'number') return res.count;
        if (Array.isArray(res)) return res.length;
        if (res && Array.isArray(res.results)) return res.results.length;
        return 0;
      };

      setMetrics({
        totalApproved: getCount(approvedRes),
        activeVolunteers: getCount(activeRes),
        inactiveVolunteers: getCount(inactiveRes),
      });
    } catch (err) {
      console.error('Failed to load directory metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Fetch paginated directory based on filters
  const fetchDirectory = useCallback(async (page = 1, approval = 'ALL', active = 'ALL', search = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = { page };
      if (approval !== 'ALL') params.approval_status = approval;
      if (active !== 'ALL') params.is_active = active;
      if (search && search.trim()) params.search = search.trim();

      const res = await adminService.getVolunteerDirectory(params);

      if (Array.isArray(res)) {
        setVolunteers(res);
        setTotalCount(res.length);
      } else if (res && Array.isArray(res.results)) {
        setVolunteers(res.results);
        setTotalCount(res.count ?? res.results.length);
      } else {
        setVolunteers([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to load volunteer directory:', err);
      setError('Unable to load volunteer directory. Please verify your connection.');
      setVolunteers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchDirectory(currentPage, filterApproval, filterActive, activeSearch);
  }, [currentPage, filterApproval, filterActive, activeSearch, fetchDirectory]);

  // Handle Search Submission
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

  const handleFilterApprovalChange = (val) => {
    setFilterApproval(val);
    setCurrentPage(1);
  };

  const handleFilterActiveChange = (val) => {
    setFilterActive(val);
    setCurrentPage(1);
  };

  // Open Volunteer Detail Drawer/Modal
  const handleOpenDetail = async (volunteer) => {
    setSelectedVolunteer(volunteer);
    setActiveTab('overview');
    try {
      setDetailLoading(true);
      const detail = await adminService.getVolunteerDetail(volunteer.id);
      if (detail && detail.id) {
        setSelectedVolunteer(detail);
      }
    } catch (err) {
      console.warn('Using cached volunteer summary row:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedVolunteer(null);
    setHistoryApplications([]);
    setHistoryParticipations([]);
    setHistoryCertificates([]);
  };

  // Load history records based on active tab
  useEffect(() => {
    if (!selectedVolunteer) return;

    if (activeTab === 'applications') {
      setTabLoading(true);
      adminService.getVolunteerOpportunityApplications(selectedVolunteer.id)
        .then(data => setHistoryApplications(Array.isArray(data) ? data : data?.results || []))
        .catch(err => console.error('Failed to load opportunity applications:', err))
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'participations') {
      setTabLoading(true);
      adminService.getVolunteerParticipations(selectedVolunteer.id)
        .then(data => setHistoryParticipations(Array.isArray(data) ? data : data?.results || []))
        .catch(err => console.error('Failed to load participation history:', err))
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'certificates') {
      setTabLoading(true);
      adminService.getVolunteerCertificates(selectedVolunteer.id)
        .then(data => setHistoryCertificates(Array.isArray(data) ? data : data?.results || []))
        .catch(err => console.error('Failed to load certificates:', err))
        .finally(() => setTabLoading(false));
    }
  }, [activeTab, selectedVolunteer]);

  // Open status management dialog
  const promptStatusChange = (volunteer, targetIsActive) => {
    setStatusError(null);
    setStatusModal({
      open: true,
      volunteer,
      targetIsActive,
      reason: '',
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      open: false,
      volunteer: null,
      targetIsActive: false,
      reason: '',
    });
    setStatusError(null);
  };

  // Submit active-status transition
  const handleConfirmStatusChange = async () => {
    const { volunteer, targetIsActive, reason } = statusModal;
    if (!volunteer) return;

    const trimmedReason = (reason || '').trim();
    if (trimmedReason.length < 5) {
      setStatusError('Please provide a meaningful reason of at least 5 characters.');
      return;
    }

    try {
      setStatusSubmitting(true);
      setStatusError(null);
      const res = await adminService.setVolunteerActiveStatus(volunteer.id, targetIsActive, trimmedReason);

      const actionVerb = targetIsActive ? 'activated' : 'deactivated';
      showToast(
        res.message || `Volunteer profile for ${volunteer.full_name} successfully ${actionVerb}.`,
        'success'
      );

      // Update selected volunteer modal if open
      if (selectedVolunteer && selectedVolunteer.id === volunteer.id) {
        setSelectedVolunteer(prev => ({
          ...prev,
          is_active: targetIsActive,
        }));
      }

      closeStatusModal();
      // Refresh directory and KPIs
      fetchDirectory(currentPage, filterApproval, filterActive, activeSearch);
      fetchMetrics();
    } catch (err) {
      console.error('Failed to update active status:', err);
      const backendErr = err.response?.data?.reason?.[0] 
        || err.response?.data?.detail 
        || err.response?.data?.message 
        || 'Failed to update volunteer active status. Please try again.';
      setStatusError(backendErr);
    } finally {
      setStatusSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const getApprovalBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') {
      return <span className="status-badge approved"><CheckCircle2 size={13} /> Approved</span>;
    }
    if (s === 'REJECTED') {
      return <span className="status-badge rejected"><XCircle size={13} /> Rejected</span>;
    }
    return <span className="status-badge pending"><Clock size={13} /> Pending</span>;
  };

  const getActiveBadge = (isActive) => {
    if (isActive) {
      return <span className="status-badge active-standing"><Check size={13} /> Active</span>;
    }
    return <span className="status-badge inactive-standing"><Ban size={13} /> Inactive</span>;
  };

  // Calculate contributed hours for currently displayed page records
  const pageContributedHours = volunteers.reduce((acc, v) => {
    const hrs = parseFloat(v.total_hours_contributed || 0);
    return acc + (isNaN(hrs) ? 0 : hrs);
  }, 0);

  return (
    <div className="admin-directory-view">
      {/* Toast Banner */}
      {toast && (
        <div className={`admin-toast-banner ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-main-heading">Volunteer Directory</h1>
          <p className="admin-subtext">
            Search, inspect, and manage verified volunteers, view complete contribution records, and administer operational standing.
          </p>
        </div>
        <button
          onClick={() => {
            fetchDirectory(currentPage, filterApproval, filterActive, activeSearch);
            fetchMetrics();
          }}
          className="admin-refresh-btn"
          title="Refresh Directory"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title-label">Approved Volunteers</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">
            {metricsLoading ? '...' : metrics.totalApproved}
          </div>
          <span className="kpi-hint-text">Passed onboarding vetting</span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title-label">Active Standing</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">
            {metricsLoading ? '...' : metrics.activeVolunteers}
          </div>
          <span className="kpi-hint-text">Eligible for drive participation</span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title-label">Inactive / Suspended</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
              <Ban size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">
            {metricsLoading ? '...' : metrics.inactiveVolunteers}
          </div>
          <span className="kpi-hint-text">Temporarily restricted</span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title-label">Page Contributed Hours</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-metric-val">
            {loading ? '...' : `${pageContributedHours.toFixed(1)}h`}
          </div>
          <span className="kpi-hint-text">Sum for currently displayed page</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search volunteers by name, email, phone, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
          {searchQuery && (
            <button type="button" onClick={handleClearSearch} className="search-clear-btn" title="Clear search">
              <X size={14} />
            </button>
          )}
          <button type="submit" className="search-submit-btn">Search</button>
        </form>

        <div className="admin-filter-dropdowns">
          {/* Approval Status Filter */}
          <div className="filter-select-group">
            <label className="filter-label">Onboarding:</label>
            <select
              value={filterApproval}
              onChange={(e) => handleFilterApprovalChange(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved Only</option>
              <option value="PENDING">Pending Verification</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Active Status Filter */}
          <div className="filter-select-group">
            <label className="filter-label">Standing:</label>
            <select
              value={filterActive}
              onChange={(e) => handleFilterActiveChange(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Standing</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-state-box">
            <RefreshCw size={24} className="spin-icon" />
            <p>Loading volunteer directory...</p>
          </div>
        ) : error ? (
          <div className="admin-state-box error">
            <AlertCircle size={28} />
            <p>{error}</p>
            <button
              onClick={() => fetchDirectory(currentPage, filterApproval, filterActive, activeSearch)}
              className="retry-btn"
            >
              Retry Loading
            </button>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="admin-state-box">
            <Users size={32} style={{ opacity: 0.4 }} />
            <p className="state-heading">No volunteers found</p>
            <p className="state-hint">
              {activeSearch || filterApproval !== 'ALL' || filterActive !== 'ALL'
                ? 'Try adjusting your filters or search terms.'
                : 'No volunteer profiles are registered in the directory yet.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Onboarding</th>
                <th>Standing</th>
                <th>Hours Contributed</th>
                <th>Certificates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((vol) => (
                <tr key={vol.id}>
                  <td>
                    <div className="applicant-cell">
                      <strong>{vol.full_name || 'Volunteer'}</strong>
                      <span className="applicant-occupation">{vol.occupation || 'Volunteer Contributor'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <span>{vol.email}</span>
                      <span className="contact-phone">{vol.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span className="city-cell">{vol.city || 'Bengaluru'}</span>
                  </td>
                  <td>
                    {getApprovalBadge(vol.approval_status)}
                  </td>
                  <td>
                    {getActiveBadge(vol.is_active)}
                  </td>
                  <td>
                    <span className="hours-pill">
                      {parseFloat(vol.total_hours_contributed || 0).toFixed(1)} hrs
                    </span>
                  </td>
                  <td>
                    <span className="cert-count-pill">
                      {vol.certificates_count ?? 0} {vol.certificates_count === 1 ? 'cert' : 'certs'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-wrap">
                      <button
                        onClick={() => handleOpenDetail(vol)}
                        className="table-action-btn view-btn"
                        title="View Volunteer Details"
                      >
                        View Details
                      </button>
                      {vol.is_active ? (
                        <button
                          onClick={() => promptStatusChange(vol, false)}
                          className="table-action-btn deactivate-sm-btn"
                          title="Deactivate Volunteer Profile"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => promptStatusChange(vol, true)}
                          className="table-action-btn activate-sm-btn"
                          title="Reactivate Volunteer Profile"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && volunteers.length > 0 && (
        <div className="admin-pagination-footer">
          <span className="pagination-count-label">
            Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} volunteers
          </span>
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="pagination-btn"
              title="Previous Page"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="pagination-page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="pagination-btn"
              title="Next Page"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Volunteer Profile Details Modal */}
      {selectedVolunteer && (
        <div className="admin-modal-backdrop" onClick={handleCloseDetail}>
          <div className="admin-modal-window directory-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-titles">
                <span className="modal-pre-title">Volunteer Profile</span>
                <h2 className="modal-title">{selectedVolunteer.full_name}</h2>
              </div>
              <button onClick={handleCloseDetail} className="modal-close-btn" title="Close Details">
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="directory-modal-tabs">
              <button
                className={`modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FileText size={15} /> Overview & Bio
              </button>
              <button
                className={`modal-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
                onClick={() => setActiveTab('applications')}
              >
                <Activity size={15} /> Opportunity Applications
              </button>
              <button
                className={`modal-tab-btn ${activeTab === 'participations' ? 'active' : ''}`}
                onClick={() => setActiveTab('participations')}
              >
                <Clock size={15} /> Participation & Hours
              </button>
              <button
                className={`modal-tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
                onClick={() => setActiveTab('certificates')}
              >
                <Award size={15} /> Certificates
              </button>
            </div>

            {/* Modal Body */}
            <div className="directory-modal-body">
              {detailLoading ? (
                <div className="modal-loading-box">
                  <RefreshCw size={24} className="spin-icon" />
                  <p>Loading profile details...</p>
                </div>
              ) : activeTab === 'overview' ? (
                /* Overview Tab */
                <div className="tab-pane-overview">
                  <div className="overview-top-strip">
                    <div className="overview-badges">
                      <div>
                        <span className="field-label-sm">Onboarding Vetting:</span>
                        {getApprovalBadge(selectedVolunteer.approval_status)}
                      </div>
                      <div>
                        <span className="field-label-sm">Operational Standing:</span>
                        {getActiveBadge(selectedVolunteer.is_active)}
                      </div>
                    </div>
                    <div className="overview-actions">
                      {selectedVolunteer.is_active ? (
                        <button
                          onClick={() => promptStatusChange(selectedVolunteer, false)}
                          className="deactivate-btn-solid"
                        >
                          <Ban size={14} /> Deactivate Profile
                        </button>
                      ) : (
                        <button
                          onClick={() => promptStatusChange(selectedVolunteer, true)}
                          className="activate-btn-solid"
                        >
                          <Check size={14} /> Activate Profile
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="detail-grid-cards">
                    <div className="detail-info-card">
                      <h3 className="card-subheading">Contact & Demographics</h3>
                      <div className="detail-row">
                        <span className="row-label"><Mail size={14} /> Email:</span>
                        <span className="row-val">{selectedVolunteer.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="row-label"><Phone size={14} /> Phone:</span>
                        <span className="row-val">{selectedVolunteer.phone || 'Not provided'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="row-label"><MapPin size={14} /> Location:</span>
                        <span className="row-val">
                          {[selectedVolunteer.city, selectedVolunteer.state].filter(Boolean).join(', ') || 'Bengaluru'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="row-label"><Briefcase size={14} /> Occupation:</span>
                        <span className="row-val">{selectedVolunteer.occupation || 'Not specified'}</span>
                      </div>
                    </div>

                    <div className="detail-info-card">
                      <h3 className="card-subheading">Engagement & Skills</h3>
                      <div className="detail-row">
                        <span className="row-label">Availability:</span>
                        <span className="row-val">{selectedVolunteer.availability || 'Weekends'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="row-label">Total Verified Hours:</span>
                        <span className="row-val highlight-val">
                          {parseFloat(selectedVolunteer.total_hours_contributed || 0).toFixed(1)} hrs
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="row-label">Certificates Awarded:</span>
                        <span className="row-val">{selectedVolunteer.certificates_count ?? 0}</span>
                      </div>
                      <div className="detail-row">
                        <span className="row-label">Registered Since:</span>
                        <span className="row-val">
                          {new Date(selectedVolunteer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="detail-text-block">
                    <h3 className="card-subheading">Skills & Capabilities</h3>
                    <div className="tags-flex">
                      {(selectedVolunteer.skills || 'Community Action')
                        .split(',')
                        .map((s, idx) => (
                          <span key={idx} className="skill-tag">
                            {s.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Interests Section */}
                  {selectedVolunteer.interests_detail && selectedVolunteer.interests_detail.length > 0 && (
                    <div className="detail-text-block">
                      <h3 className="card-subheading">Cause Focus & Interests</h3>
                      <div className="tags-flex">
                        {selectedVolunteer.interests_detail.map(int => (
                          <span key={int.id || int.slug} className="interest-tag">
                            {int.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {selectedVolunteer.bio && (
                    <div className="detail-text-block">
                      <h3 className="card-subheading">Personal Statement / Bio</h3>
                      <p className="bio-paragraph">{selectedVolunteer.bio}</p>
                    </div>
                  )}
                </div>
              ) : activeTab === 'applications' ? (
                /* Opportunity Applications Tab */
                <div className="tab-pane-history">
                  {tabLoading ? (
                    <div className="modal-loading-box">
                      <RefreshCw size={20} className="spin-icon" />
                      <p>Loading application history...</p>
                    </div>
                  ) : historyApplications.length === 0 ? (
                    <div className="history-empty-box">
                      <Activity size={28} style={{ opacity: 0.4 }} />
                      <p className="state-heading">No Drive Applications Logged</p>
                      <p className="state-hint">This volunteer has not applied to any specific volunteer drives yet.</p>
                    </div>
                  ) : (
                    <div className="history-table-wrap">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>Opportunity / Drive</th>
                            <th>Applied Date</th>
                            <th>Motivation Preview</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyApplications.map(app => (
                            <tr key={app.id}>
                              <td>
                                <strong>{app.opportunity_title}</strong>
                                <span className="item-sub-loc">{app.opportunity_location || 'Field Drive'}</span>
                              </td>
                              <td>{new Date(app.created_at).toLocaleDateString()}</td>
                              <td style={{ maxWidth: '280px' }}>
                                <p className="history-text-clamp">{app.statement_of_purpose}</p>
                              </td>
                              <td>
                                <span className={`status-pill ${app.status.toLowerCase()}`}>
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : activeTab === 'participations' ? (
                /* Participation Sessions Tab */
                <div className="tab-pane-history">
                  {tabLoading ? (
                    <div className="modal-loading-box">
                      <RefreshCw size={20} className="spin-icon" />
                      <p>Loading participation sessions...</p>
                    </div>
                  ) : historyParticipations.length === 0 ? (
                    <div className="history-empty-box">
                      <Clock size={28} style={{ opacity: 0.4 }} />
                      <p className="state-heading">No Participation Sessions</p>
                      <p className="state-hint">No verified field hours have been recorded for this volunteer yet.</p>
                    </div>
                  ) : (
                    <div className="history-table-wrap">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Activity Performed</th>
                            <th>Project</th>
                            <th>Hours</th>
                            <th>Verification</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyParticipations.map(p => (
                            <tr key={p.id}>
                              <td>{p.date}</td>
                              <td><strong>{p.activity_performed}</strong></td>
                              <td>{p.project_title || 'General Volunteer Drive'}</td>
                              <td>
                                <span className="hours-pill">{parseFloat(p.hours).toFixed(1)} hrs</span>
                              </td>
                              <td>
                                {p.verified ? (
                                  <span className="status-badge approved"><CheckCircle2 size={12} /> Verified</span>
                                ) : (
                                  <span className="status-badge pending"><Clock size={12} /> Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                /* Certificates Tab */
                <div className="tab-pane-history">
                  {tabLoading ? (
                    <div className="modal-loading-box">
                      <RefreshCw size={20} className="spin-icon" />
                      <p>Loading certificates...</p>
                    </div>
                  ) : historyCertificates.length === 0 ? (
                    <div className="history-empty-box">
                      <Award size={28} style={{ opacity: 0.4 }} />
                      <p className="state-heading">No Certificates Issued</p>
                      <p className="state-hint">No service certificates have been issued to this volunteer yet.</p>
                    </div>
                  ) : (
                    <div className="cert-cards-grid">
                      {historyCertificates.map(cert => (
                        <div key={cert.id} className="cert-item-card">
                          <div className="cert-card-top">
                            <Award size={22} className="cert-badge-icon" />
                            <span className={`status-pill ${cert.status.toLowerCase()}`}>
                              {cert.status}
                            </span>
                          </div>
                          <h4 className="cert-title">{cert.title}</h4>
                          <span className="cert-code">ID: {cert.certificate_code}</span>
                          <div className="cert-meta-row">
                            <span>Hours: <strong>{parseFloat(cert.hours_recognized || 0).toFixed(1)} hrs</strong></span>
                            <span>Issued: <strong>{cert.issue_date}</strong></span>
                          </div>
                          <span className="cert-issuer">Issued by: {cert.issued_by}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseDetail} className="modal-cancel-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Management Confirmation Modal */}
      {statusModal.open && statusModal.volunteer && (
        <div className="admin-modal-backdrop" onClick={closeStatusModal}>
          <div className="admin-modal-window status-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-titles">
                <span className="modal-pre-title">Administrative Standing Control</span>
                <h2 className="modal-title">
                  {statusModal.targetIsActive ? 'Activate Volunteer Profile' : 'Deactivate Volunteer Profile'}
                </h2>
              </div>
              <button onClick={closeStatusModal} className="modal-close-btn" title="Close">
                <X size={20} />
              </button>
            </div>

            <div className="status-modal-body">
              <div className={`status-alert-box ${statusModal.targetIsActive ? 'activate' : 'deactivate'}`}>
                {statusModal.targetIsActive ? (
                  <p>
                    You are activating <strong>{statusModal.volunteer.full_name}</strong>. Their standing will be restored and they will become eligible to apply for open volunteer drives.
                  </p>
                ) : (
                  <p>
                    You are deactivating <strong>{statusModal.volunteer.full_name}</strong>. They will be restricted from applying to volunteer opportunities until reactivated. Their account, past participation records, certificates, and hours will remain safely preserved.
                  </p>
                )}
              </div>

              {statusError && (
                <div className="status-modal-error">
                  <AlertCircle size={16} />
                  <span>{statusError}</span>
                </div>
              )}

              <div className="form-group-wrap">
                <label className="input-label required">
                  Reason for Status Change (Required)
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide a mandatory administrative reason (minimum 5 characters, e.g. Temporary leave of absence, Volunteer requested reactivation)..."
                  value={statusModal.reason}
                  onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                  className="status-textarea"
                />
                <span className="input-hint">
                  This note is recorded in the permanent audit trail for operational accountability.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={closeStatusModal}
                disabled={statusSubmitting}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={statusSubmitting || !statusModal.reason || statusModal.reason.trim().length < 5}
                className={`modal-confirm-btn ${statusModal.targetIsActive ? 'activate-btn' : 'deactivate-btn'}`}
              >
                {statusSubmitting ? 'Updating...' : statusModal.targetIsActive ? 'Confirm Activation' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS Styles matching RI ADMIN design tokens */}
      <style>{`
        .admin-directory-view {
          padding-bottom: 3rem;
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
          max-width: 820px;
          line-height: 1.45;
        }
        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.75rem;
          gap: 1rem;
        }
        .admin-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.1rem;
          border-radius: var(--radius-md, 8px);
          background: #1E293B;
          color: #E2E8F0;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .admin-refresh-btn:hover {
          background: #334155;
          color: #FFFFFF;
        }

        /* KPI Cards Grid */
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .admin-kpi-card {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: var(--radius-lg, 12px);
          padding: 1.25rem;
        }
        .kpi-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .kpi-title-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #94A3B8;
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
          font-size: 1.75rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 0.25rem;
        }
        .kpi-hint-text {
          font-size: 0.775rem;
          color: #64748B;
        }

        /* Filter & Search Bar */
        .admin-filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: space-between;
          align-items: center;
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }
        .admin-search-wrap {
          display: flex;
          align-items: center;
          position: relative;
          flex: 1;
          min-width: 280px;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: #64748B;
          pointer-events: none;
        }
        .admin-search-input {
          width: 100%;
          background: #162035;
          border: 1px solid #1E293B;
          color: #FFFFFF;
          padding: 0.65rem 4.5rem 0.65rem 2.5rem;
          border-radius: var(--radius-md, 8px);
          font-size: 0.875rem;
          transition: border-color 0.15s ease;
        }
        .admin-search-input:focus {
          outline: none;
          border-color: #3B82F6;
        }
        .search-clear-btn {
          position: absolute;
          right: 4.5rem;
          background: transparent;
          border: none;
          color: #64748B;
          cursor: pointer;
        }
        .search-clear-btn:hover { color: #FFFFFF; }
        .search-submit-btn {
          position: absolute;
          right: 0.35rem;
          background: #2563EB;
          color: #FFFFFF;
          border: none;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.775rem;
          font-weight: 600;
          cursor: pointer;
        }
        .search-submit-btn:hover { background: #1D4ED8; }

        .admin-filter-dropdowns {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }
        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .filter-label {
          font-size: 0.775rem;
          font-weight: 600;
          color: #94A3B8;
        }
        .admin-select {
          background: #162035;
          border: 1px solid #1E293B;
          color: #E2E8F0;
          padding: 0.55rem 0.85rem;
          border-radius: 6px;
          font-size: 0.825rem;
          cursor: pointer;
        }
        .admin-select:focus { outline: none; border-color: #3B82F6; }

        /* Table */
        .admin-table-container {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: var(--radius-lg, 12px);
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
          padding: 0.95rem 1.15rem;
          color: #94A3B8;
          font-weight: 700;
          border-bottom: 1px solid #1E293B;
          text-transform: uppercase;
          font-size: 0.725rem;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .admin-table td {
          padding: 1rem 1.15rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #CBD5E1;
        }
        .applicant-cell strong {
          display: block;
          color: #F8FAFC;
          font-size: 0.9rem;
        }
        .applicant-occupation {
          display: block;
          font-size: 0.75rem;
          color: #64748B;
        }
        .contact-cell span {
          display: block;
          font-size: 0.825rem;
          color: #94A3B8;
        }
        .contact-phone {
          font-size: 0.75rem !important;
          color: #64748B !important;
        }
        .city-cell {
          font-size: 0.825rem;
          color: #CBD5E1;
        }
        .hours-pill {
          background: rgba(245, 158, 11, 0.12);
          color: #FBBF24;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.55rem;
          border-radius: 6px;
        }
        .cert-count-pill {
          background: rgba(139, 92, 246, 0.12);
          color: #C084FC;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.55rem;
          border-radius: 6px;
        }

        /* Status Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .status-badge.approved {
          background: #064E3B;
          color: #34D399;
        }
        .status-badge.rejected {
          background: #7F1D1D;
          color: #F87171;
        }
        .status-badge.pending {
          background: #78350F;
          color: #FBBF24;
        }
        .status-badge.active-standing {
          background: #065F46;
          color: #6EE7B7;
        }
        .status-badge.inactive-standing {
          background: #450A0A;
          color: #FCA5A5;
        }

        .action-buttons-wrap {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .table-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .table-action-btn.view-btn {
          background: #1E293B;
          color: #E2E8F0;
          border: 1px solid #334155;
        }
        .table-action-btn.view-btn:hover {
          background: #334155;
          color: #FFFFFF;
        }
        .table-action-btn.deactivate-sm-btn {
          background: rgba(239, 68, 68, 0.15);
          color: #FCA5A5;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }
        .table-action-btn.deactivate-sm-btn:hover {
          background: #DC2626;
          color: #FFFFFF;
        }
        .table-action-btn.activate-sm-btn {
          background: rgba(16, 185, 129, 0.15);
          color: #6EE7B7;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .table-action-btn.activate-sm-btn:hover {
          background: #059669;
          color: #FFFFFF;
        }

        /* States */
        .admin-state-box {
          padding: 3.5rem 1rem;
          text-align: center;
          color: #94A3B8;
        }
        .admin-state-box.error { color: #F87171; }
        .state-heading {
          font-size: 1.1rem;
          font-weight: 700;
          color: #E2E8F0;
          margin: 0.75rem 0 0.25rem;
        }
        .state-hint {
          font-size: 0.85rem;
          color: #64748B;
        }
        .retry-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          background: #1E293B;
          color: #FFFFFF;
          border: 1px solid #334155;
          font-weight: 600;
          cursor: pointer;
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Pagination */
        .admin-pagination-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 0.5rem;
          color: #94A3B8;
          font-size: 0.85rem;
        }
        .pagination-controls {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .pagination-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #0F172A;
          border: 1px solid #1E293B;
          color: #E2E8F0;
          padding: 0.45rem 0.85rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }
        .pagination-btn:hover:not(:disabled) {
          background: #1E293B;
        }
        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pagination-page-indicator {
          font-size: 0.825rem;
          color: #64748B;
        }

        /* Modal Backdrop & Window */
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
        .admin-modal-window {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: var(--radius-xl, 16px);
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65);
          display: flex;
          flex-direction: column;
        }
        .directory-detail-modal {
          max-width: 860px;
        }
        .status-confirm-modal {
          max-width: 540px;
        }
        .modal-header {
          padding: 1.25rem 1.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1E293B;
        }
        .modal-pre-title {
          font-size: 0.75rem;
          color: #F97316;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .modal-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-top: 0.15rem;
        }
        .modal-close-btn {
          background: transparent;
          border: none;
          color: #64748B;
          cursor: pointer;
        }
        .modal-close-btn:hover { color: #FFFFFF; }

        /* Modal Tabs */
        .directory-modal-tabs {
          display: flex;
          background: #090D16;
          border-bottom: 1px solid #1E293B;
          padding: 0 1.25rem;
          gap: 0.5rem;
          overflow-x: auto;
        }
        .modal-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1rem;
          border: none;
          background: transparent;
          color: #94A3B8;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .modal-tab-btn:hover { color: #E2E8F0; }
        .modal-tab-btn.active {
          color: #38BDF8;
          border-bottom-color: #38BDF8;
        }

        .directory-modal-body {
          padding: 1.75rem;
          flex: 1;
          overflow-y: auto;
        }
        .modal-footer {
          padding: 1rem 1.75rem;
          border-top: 1px solid #1E293B;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          background: #0B1120;
        }
        .modal-cancel-btn {
          background: #1E293B;
          border: 1px solid #334155;
          color: #CBD5E1;
          padding: 0.55rem 1.25rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .modal-cancel-btn:hover { background: #334155; color: #FFFFFF; }

        /* Overview Tab Details */
        .overview-top-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          background: #162035;
          border: 1px solid #1E293B;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }
        .overview-badges {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .field-label-sm {
          display: block;
          font-size: 0.7rem;
          color: #64748B;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }
        .deactivate-btn-solid {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #DC2626;
          color: #FFFFFF;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }
        .deactivate-btn-solid:hover { background: #B91C1C; }
        .activate-btn-solid {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #059669;
          color: #FFFFFF;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }
        .activate-btn-solid:hover { background: #047857; }

        .detail-grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .detail-info-card {
          background: #162035;
          border: 1px solid #1E293B;
          border-radius: 10px;
          padding: 1.25rem;
        }
        .card-subheading {
          font-size: 0.85rem;
          font-weight: 700;
          color: #38BDF8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.85rem;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.45rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 0.85rem;
        }
        .detail-row:last-child { border-bottom: none; }
        .row-label {
          color: #94A3B8;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .row-val {
          color: #F8FAFC;
          font-weight: 600;
        }
        .row-val.highlight-val {
          color: #FBBF24;
          font-weight: 800;
        }
        .detail-text-block {
          background: #162035;
          border: 1px solid #1E293B;
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .tags-flex {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .skill-tag {
          background: #1E293B;
          border: 1px solid #334155;
          color: #93C5FD;
          font-size: 0.775rem;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
        }
        .interest-tag {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6EE7B7;
          font-size: 0.775rem;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
        }
        .bio-paragraph {
          font-size: 0.875rem;
          color: #CBD5E1;
          line-height: 1.55;
        }

        /* History Tables */
        .history-table-wrap {
          border: 1px solid #1E293B;
          border-radius: 8px;
          overflow-x: auto;
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .history-table th {
          background: #162035;
          padding: 0.75rem 1rem;
          color: #94A3B8;
          font-size: 0.725rem;
          text-transform: uppercase;
          border-bottom: 1px solid #1E293B;
        }
        .history-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #CBD5E1;
        }
        .item-sub-loc {
          display: block;
          font-size: 0.75rem;
          color: #64748B;
        }
        .history-text-clamp {
          font-size: 0.8rem;
          color: #94A3B8;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .status-pill {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .status-pill.approved { background: #064E3B; color: #34D399; }
        .status-pill.pending { background: #78350F; color: #FBBF24; }
        .status-pill.rejected { background: #7F1D1D; color: #F87171; }
        .status-pill.active { background: #065F46; color: #6EE7B7; }

        .history-empty-box {
          text-align: center;
          padding: 3rem 1rem;
          color: #94A3B8;
        }

        /* Certificate Cards */
        .cert-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }
        .cert-item-card {
          background: #162035;
          border: 1px solid #1E293B;
          border-radius: 10px;
          padding: 1.25rem;
        }
        .cert-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .cert-badge-icon { color: #F59E0B; }
        .cert-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #F8FAFC;
          margin-bottom: 0.25rem;
        }
        .cert-code {
          font-size: 0.725rem;
          color: #38BDF8;
          font-family: monospace;
          display: block;
          margin-bottom: 0.75rem;
        }
        .cert-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.775rem;
          color: #94A3B8;
          margin-bottom: 0.5rem;
        }
        .cert-issuer {
          display: block;
          font-size: 0.725rem;
          color: #64748B;
        }

        /* Status Modal */
        .status-modal-body {
          padding: 1.5rem 1.75rem;
        }
        .status-alert-box {
          padding: 1rem 1.25rem;
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.45;
          margin-bottom: 1.25rem;
        }
        .status-alert-box.deactivate {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #FCA5A5;
        }
        .status-alert-box.activate {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6EE7B7;
        }
        .status-modal-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.15);
          color: #F87171;
          padding: 0.65rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }
        .form-group-wrap {
          margin-bottom: 1rem;
        }
        .input-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #CBD5E1;
          margin-bottom: 0.45rem;
        }
        .input-label.required::after {
          content: ' *';
          color: #F87171;
        }
        .status-textarea {
          width: 100%;
          background: #162035;
          border: 1px solid #1E293B;
          color: #FFFFFF;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          resize: vertical;
        }
        .status-textarea:focus { outline: none; border-color: #3B82F6; }
        .input-hint {
          display: block;
          font-size: 0.75rem;
          color: #64748B;
          margin-top: 0.35rem;
        }
        .modal-confirm-btn {
          border: none;
          color: #FFFFFF;
          padding: 0.55rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }
        .modal-confirm-btn.deactivate-btn { background: #DC2626; }
        .modal-confirm-btn.deactivate-btn:hover:not(:disabled) { background: #B91C1C; }
        .modal-confirm-btn.activate-btn { background: #059669; }
        .modal-confirm-btn.activate-btn:hover:not(:disabled) { background: #047857; }
        .modal-confirm-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Toast */
        .admin-toast-banner {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.25rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          z-index: 1200;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          animation: slideIn 0.25s ease-out;
        }
        .admin-toast-banner.success {
          background: #064E3B;
          color: #34D399;
          border: 1px solid #059669;
        }
        .admin-toast-banner.error {
          background: #7F1D1D;
          color: #F87171;
          border: 1px solid #DC2626;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

