import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { volunteerService } from '../../services/api';
import {
  HeartHandshake,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  LogOut,
  Sparkles,
  MapPin,
  Calendar,
  Lock,
  RotateCcw,
  User,
  Phone,
  ChevronDown,
  Info,
  X,
  Send,
  Building2
} from 'lucide-react';
import GlobalPreloader from '../../components/common/GlobalPreloader';
import './ApplicantPortalPage.css';

export default function ApplicantPortalPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Profile and Onboarding status state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  // Opportunities state (Read-Only)
  const [opportunities, setOpportunities] = useState([]);
  const [oppsLoading, setOppsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFocusArea, setSelectedFocusArea] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedOppDetail, setSelectedOppDetail] = useState(null);

  // Onboarding Form State
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [formData, setFormData] = useState({
    statement_of_intent: '',
    skills_summary: '',
    experience_summary: '',
    availability: 'Weekends',
    city: 'Bengaluru',
    phone: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // ----------------------------------------------------------
  // 1. Load Profile & Onboarding Application Status
  // ----------------------------------------------------------
  const loadProfileAndOnboarding = async () => {
    try {
      const [profData, onbData] = await Promise.all([
        volunteerService.getMyProfile().catch(() => null),
        volunteerService.getMyOnboarding().catch(() => null),
      ]);

      setProfile(profData);
      setOnboarding(onbData);

      // Pre-populate form data from profile or previous onboarding application
      if (profData || onbData) {
        setFormData((prev) => ({
          statement_of_intent: onbData?.statement_of_intent || prev.statement_of_intent,
          skills_summary: onbData?.skills_summary || profData?.skills || prev.skills_summary,
          experience_summary: onbData?.experience_summary || prev.experience_summary,
          availability: onbData?.availability || profData?.availability || 'Weekends',
          city: profData?.city || 'Bengaluru',
          phone: profData?.phone || user?.phone || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load applicant profile or onboarding data:', err);
    } finally {
      setProfileLoading(false);
      setOnboardingLoading(false);
    }
  };

  useEffect(() => {
    loadProfileAndOnboarding();
  }, [user]);

  // ----------------------------------------------------------
  // 2. Load Opportunities for Read-Only Exploration
  // ----------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    async function loadOpportunities() {
      setOppsLoading(true);
      try {
        const data = await volunteerService.getOpportunities();
        if (isMounted) {
          const list = Array.isArray(data) ? data : data?.results || [];
          setOpportunities(list);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Could not load opportunities:', err);
        }
      } finally {
        if (isMounted) {
          setOppsLoading(false);
        }
      }
    }

    loadOpportunities();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close opportunity modal on Escape key press
  useEffect(() => {
    if (!selectedOppDetail) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        setSelectedOppDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOppDetail]);

  // ----------------------------------------------------------
  // 3. Filter Opportunities
  // ----------------------------------------------------------
  const focusAreas = useMemo(() => {
    const areas = new Set();
    opportunities.forEach((o) => {
      if (o.focus_area?.name) areas.add(o.focus_area.name);
      else if (typeof o.focus_area === 'string') areas.add(o.focus_area);
    });
    return Array.from(areas);
  }, [opportunities]);

  const locations = useMemo(() => {
    const locs = new Set();
    opportunities.forEach((o) => {
      if (o.location) locs.add(o.location);
    });
    return Array.from(locs);
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Focus area filter
      if (selectedFocusArea !== 'ALL') {
        const areaName = opp.focus_area?.name || opp.focus_area || '';
        if (areaName !== selectedFocusArea) return false;
      }
      // Location filter
      if (selectedLocation !== 'ALL') {
        if (opp.location !== selectedLocation) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (opp.title || '').toLowerCase().includes(q);
        const descMatch = (opp.description || '').toLowerCase().includes(q);
        const reqMatch = (opp.requirements || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !reqMatch) return false;
      }
      return true;
    });
  }, [opportunities, selectedFocusArea, selectedLocation, searchQuery]);

  // ----------------------------------------------------------
  // 4. Form Validation & Submission
  // ----------------------------------------------------------
  const validateForm = () => {
    if (!formData.statement_of_intent || formData.statement_of_intent.trim().length < 20) {
      return 'Please write at least 20 characters explaining your motivation to volunteer.';
    }
    const cleanPhone = formData.phone.trim().replace(/\s+/g, '');
    if (cleanPhone) {
      const digitsOnly = cleanPhone.replace(/\D/g, '');
      const coreDigits = (cleanPhone.startsWith('+91') && digitsOnly.startsWith('91'))
        ? digitsOnly.slice(2)
        : digitsOnly;
      if (coreDigits.length !== 10 || !/^[6-9]/.test(coreDigits)) {
        return 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
      }
    }
    return '';
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const validationMsg = validateForm();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        statement_of_intent: formData.statement_of_intent.trim(),
        skills_summary: formData.skills_summary.trim(),
        experience_summary: formData.experience_summary.trim(),
        availability: formData.availability,
        city: formData.city.trim() || 'Bengaluru',
        phone: formData.phone.trim(),
      };

      const result = await volunteerService.submitOnboarding(payload);
      setOnboarding(result);
      setFormSuccess('Your volunteer onboarding application has been submitted successfully! Our coordinators will review your submission.');
      setIsEditingForm(false);

      // Refresh profile state
      const updatedProf = await volunteerService.getMyProfile().catch(() => null);
      if (updatedProf) setProfile(updatedProf);
    } catch (err) {
      console.error('Onboarding submission error:', err);
      const detail = err?.response?.data?.detail ||
        err?.response?.data?.statement_of_intent?.[0] ||
        err?.response?.data?.phone?.[0] ||
        'Failed to submit onboarding application. Please check your inputs.';
      setFormError(detail);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Determine current effective status
  const currentStatus = onboarding?.status || (profile?.approval_status === 'APPROVED' ? 'APPROVED' : 'NOT_SUBMITTED');
  const isApproved = profile?.approval_status === 'APPROVED' || currentStatus === 'APPROVED';

  // ----------------------------------------------------------
  // Render Loading
  // ----------------------------------------------------------
  if (profileLoading || onboardingLoading) {
    return (
      <GlobalPreloader
        isLoading={true}
        isExiting={false}
        message="Loading your volunteer onboarding status..."
      />
    );
  }

  return (
    <div className="applicant-portal-container">
      {/* ========================================================
          HERO & APPLICANT HEADER
      ======================================================== */}
      <section className="applicant-portal-hero">
        <div className="container hero-inner">
          <div className="hero-text-block">
            <div className="portal-badge-pill">
              <Sparkles size={14} className="sparkle-icon" />
              <span>Citizen Volunteer Portal</span>
            </div>

            <h1 className="hero-title">
              Welcome, <span className="highlight-name">{profile?.full_name || user?.first_name || 'Volunteer Applicant'}</span>
            </h1>

            <p className="hero-subtitle">
              Complete your one-time volunteer onboarding to unlock field participation, project drive sign-ups, and service certificates.
            </p>
          </div>

          <div className="applicant-id-card">
            <div className="id-card-header">
              <User size={18} className="user-icon" />
              <div className="id-card-user">
                <span className="user-email">{profile?.email || user?.email}</span>
                <span className="user-role-label">Status: {currentStatus.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="id-card-status">
              {isApproved && (
                <div className="status-pill status-approved">
                  <ShieldCheck size={16} />
                  <span>Approved & Verified Volunteer</span>
                </div>
              )}
              {currentStatus === 'SUBMITTED' && (
                <div className="status-pill status-submitted">
                  <Clock size={16} />
                  <span>Under Review</span>
                </div>
              )}
              {currentStatus === 'REJECTED' && (
                <div className="status-pill status-rejected">
                  <ShieldAlert size={16} />
                  <span>Revision Required</span>
                </div>
              )}
              {currentStatus === 'NOT_SUBMITTED' && !isApproved && (
                <div className="status-pill status-pending">
                  <AlertCircle size={16} />
                  <span>Action Required: Onboarding</span>
                </div>
              )}
            </div>

            <div className="id-card-actions">
              {isAdmin && (
                <Link to="/admin-portal" className="btn-secondary-link">
                  Admin Portal
                </Link>
              )}
              {isApproved && (
                <Link to="/volunteer/dashboard" className="btn-primary-link">
                  Full Volunteer Dashboard <ArrowRight size={14} />
                </Link>
              )}
              <button onClick={() => { logout(); navigate('/'); }} className="btn-logout-link" title="Sign Out">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ADMINISTRATOR / APPROVED VOLUNTEER NOTICE BANNER
      ======================================================== */}
      {isAdmin && (
        <div className="container notice-container">
          <div className="admin-notice-card">
            <Info size={20} className="notice-icon" />
            <div className="notice-content">
              <strong>Administrator Access Notice:</strong> As an administrator or staff member, you have full privileges to review citizen onboarding submissions and manage events.
            </div>
            <Link to="/admin-portal" className="notice-action-btn">
              Go to Admin Operations <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {isApproved && !isAdmin && (
        <div className="container notice-container">
          <div className="approved-notice-card">
            <CheckCircle2 size={22} className="check-icon" />
            <div className="notice-content">
              <h3>You are an Approved and Verified Volunteer!</h3>
              <p>Your volunteer profile is active. You have full access to field drives, hours logging, and verifiable certificates on your Volunteer Dashboard.</p>
            </div>
            <Link to="/volunteer/dashboard" className="btn-dashboard-redirect">
              Open Volunteer Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================
          ONBOARDING APPLICATION LIFECYCLE & STATUS SECTION
      ======================================================== */}
      <section className="onboarding-status-section">
        <div className="container">

          {/* STATE A: APPLICATION SUBMITTED & UNDER REVIEW */}
          {currentStatus === 'SUBMITTED' && !isEditingForm && (
            <div className="status-card-surface status-card-submitted animate-fade-in">
              <div className="status-card-header">
                <div className="icon-badge badge-blue">
                  <Clock size={28} />
                </div>
                <div className="status-card-titles">
                  <h2>Onboarding Application Under Review</h2>
                  <p className="submission-meta">
                    Submitted on {onboarding?.submitted_at ? new Date(onboarding.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                  </p>
                </div>
              </div>

              {/* Progress Milestones Tracker */}
              <div className="onboarding-timeline">
                <div className="timeline-step step-complete">
                  <div className="step-circle"><CheckCircle2 size={16} /></div>
                  <div className="step-label">Account Created</div>
                </div>
                <div className="timeline-step step-complete">
                  <div className="step-circle"><CheckCircle2 size={16} /></div>
                  <div className="step-label">Application Submitted</div>
                </div>
                <div className="timeline-step step-active">
                  <div className="step-circle"><Clock size={16} className="pulse-icon" /></div>
                  <div className="step-label">Coordinator Review</div>
                </div>
                <div className="timeline-step step-future">
                  <div className="step-circle"><Lock size={16} /></div>
                  <div className="step-label">Drive Access Unlocked</div>
                </div>
              </div>

              {/* Submitted Summary Details */}
              <div className="submitted-details-box">
                <h4>Submitted Statement of Intent</h4>
                <p className="statement-preview">"{onboarding?.statement_of_intent}"</p>
                <div className="meta-grid">
                  <div>
                    <span className="meta-label">Availability:</span>
                    <span className="meta-value">{onboarding?.availability || 'Weekends'}</span>
                  </div>
                  <div>
                    <span className="meta-label">Skills:</span>
                    <span className="meta-value">{onboarding?.skills_summary || 'Community Volunteering'}</span>
                  </div>
                  <div>
                    <span className="meta-label">Location:</span>
                    <span className="meta-value">{profile?.city || 'Bengaluru'}</span>
                  </div>
                </div>
              </div>

              <div className="info-callout">
                <Info size={16} />
                <span>Our coordination team typically reviews citizen onboarding applications within 24 to 48 hours. In the meantime, browse the upcoming opportunities below.</span>
              </div>
            </div>
          )}

          {/* STATE B: APPLICATION REJECTED / NEEDS REVISION */}
          {currentStatus === 'REJECTED' && (
            <div className="status-card-surface status-card-rejected animate-fade-in">
              <div className="status-card-header">
                <div className="icon-badge badge-rose">
                  <ShieldAlert size={28} />
                </div>
                <div className="status-card-titles">
                  <h2>Application Needs Attention & Revision</h2>
                  <p className="rejection-subtitle">
                    Our team reviewed your submission and requested additional details before onboarding can be approved.
                  </p>
                </div>
              </div>

              {/* Review Feedback Box */}
              <div className="feedback-alert-box">
                <div className="feedback-header">
                  <AlertCircle size={18} className="feedback-icon" />
                  <strong>Administrator Review Feedback:</strong>
                </div>
                <p className="feedback-body">
                  {onboarding?.admin_review_notes || 'Please expand your statement of intent with specific volunteer interests, past experience, or schedule availability.'}
                </p>
                {onboarding?.reviewed_at && (
                  <span className="feedback-timestamp">
                    Reviewed on {new Date(onboarding.reviewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {onboarding?.reviewed_by_name ? ` by ${onboarding.reviewed_by_name}` : ''}
                  </span>
                )}
              </div>

              {/* Action Prompt */}
              {!isEditingForm ? (
                <div className="reapply-action-bar">
                  <div className="reapply-text">
                    <strong>Ready to reapply?</strong> You can update your statement of intent and resubmit immediately without losing your account.
                  </div>
                  <button
                    type="button"
                    className="btn-reapply-cta"
                    onClick={() => {
                      setIsEditingForm(true);
                      setFormError('');
                    }}
                  >
                    <RotateCcw size={16} /> Update & Reapply
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* STATE C & REAPPLICATION: THE ONBOARDING FORM */}
          {((currentStatus === 'NOT_SUBMITTED' && !isApproved) || (currentStatus === 'REJECTED' && isEditingForm)) && (
            <div className="onboarding-form-card animate-fade-in">
              <div className="form-card-header">
                <div className="header-icon-wrap">
                  <FileText size={24} />
                </div>
                <div>
                  <h2>{currentStatus === 'REJECTED' ? 'Revise Your Volunteer Onboarding Application' : 'Volunteer Onboarding Application'}</h2>
                  <p className="form-header-subtitle">
                    Tell us about your motivation, skills, and availability. This is a one-time verification to join all community drives.
                  </p>
                </div>
              </div>

              {formSuccess && (
                <div className="form-alert alert-success">
                  <CheckCircle2 size={18} />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="form-alert alert-error">
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="onboarding-form">
                {/* Motivation / Statement of Intent */}
                <div className="form-group">
                  <label htmlFor="statement_of_intent" className="form-label required">
                    Statement of Intent & Motivation
                  </label>
                  <p className="field-hint">
                    Why do you wish to volunteer with Responsible Individuals? (Minimum 20 characters)
                  </p>
                  <textarea
                    id="statement_of_intent"
                    rows={4}
                    className="form-textarea"
                    placeholder="e.g. I am passionate about restoring Bangalore's urban lakes and planting native tree canopies. I have 2 years of grassroots tree plantation experience and want to actively contribute to weekend drives."
                    value={formData.statement_of_intent}
                    onChange={(e) => setFormData({ ...formData, statement_of_intent: e.target.value })}
                    required
                  />
                  <div className="char-count-row">
                    <span className={`char-counter ${formData.statement_of_intent.length >= 20 ? 'valid' : 'invalid'}`}>
                      {formData.statement_of_intent.length} / 20 characters minimum
                    </span>
                    {formData.statement_of_intent.length >= 20 && (
                      <span className="char-valid-indicator">
                        <CheckCircle2 size={14} /> Minimum length met
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills & Capabilities */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="skills_summary" className="form-label">
                      Skills & Expertise
                    </label>
                    <input
                      type="text"
                      id="skills_summary"
                      className="form-input"
                      placeholder="e.g. Water sampling, event coordination, teaching"
                      value={formData.skills_summary}
                      onChange={(e) => setFormData({ ...formData, skills_summary: e.target.value })}
                    />
                  </div>

                  {/* Availability */}
                  <div className="form-group">
                    <label htmlFor="availability" className="form-label">
                      Availability
                    </label>
                    <select
                      id="availability"
                      className="form-select"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    >
                      <option value="Weekends">Weekends (Saturdays & Sundays)</option>
                      <option value="Weekdays">Weekdays</option>
                      <option value="Mornings">Morning Drives (6 AM - 10 AM)</option>
                      <option value="Flexible / Call Basis">Flexible / On-Call Basis</option>
                      <option value="Full-time">Full-time Volunteer</option>
                    </select>
                  </div>
                </div>

                {/* Prior Experience */}
                <div className="form-group">
                  <label htmlFor="experience_summary" className="form-label">
                    Prior Volunteer or Community Experience (Optional)
                  </label>
                  <textarea
                    id="experience_summary"
                    rows={2}
                    className="form-textarea"
                    placeholder="Share any past initiatives, student NSS drives, or community campaigns you took part in."
                    value={formData.experience_summary}
                    onChange={(e) => setFormData({ ...formData, experience_summary: e.target.value })}
                  />
                </div>

                {/* Contact and City Confirmation */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      City of Residence
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="form-input"
                      placeholder="e.g. Bengaluru"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number (For Drive WhatsApp / SMS Alerts)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="form-input"
                      placeholder="e.g. 98450 12345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions-row">
                  {currentStatus === 'REJECTED' && (
                    <button
                      type="button"
                      className="btn-cancel-edit"
                      onClick={() => setIsEditingForm(false)}
                      disabled={formSubmitting}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-submit-onboarding"
                    disabled={formSubmitting || formData.statement_of_intent.trim().length < 20}
                  >
                    {formSubmitting ? (
                      <>
                        <Clock size={16} className="spin-icon" /> Submitting Application...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> {currentStatus === 'REJECTED' ? 'Submit Revised Application' : 'Submit Onboarding Application'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================
          READ-ONLY OPPORTUNITIES EXPLORATION SECTION
      ======================================================== */}
      <section className="opportunities-exploration-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="section-pill">
                <Compass size={14} />
                <span>Drive Catalog</span>
              </div>
              <h2 className="section-heading">Browse Volunteer Opportunities</h2>
              <p className="section-subheading">
                Explore open grassroots projects. Once your onboarding application is approved by our coordinators, you will be able to register for field drives directly.
              </p>
            </div>

            <div className="read-only-badge">
              <Lock size={14} />
              <span>Read-Only Mode</span>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="catalog-filters-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by role, cause, or keywords..."
                className="catalog-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filter-selects-row">
              {/* Focus Area Select */}
              <div className="select-pill-wrap">
                <Filter size={14} className="filter-icon" />
                <select
                  value={selectedFocusArea}
                  onChange={(e) => setSelectedFocusArea(e.target.value)}
                  className="catalog-select"
                >
                  <option value="ALL">All Focus Areas</option>
                  {focusAreas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Location Select */}
              <div className="select-pill-wrap">
                <MapPin size={14} className="filter-icon" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="catalog-select"
                >
                  <option value="ALL">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Opportunities Cards Grid */}
          {oppsLoading ? (
            <div className="opps-loading-state">
              <Clock size={24} className="spin-icon" />
              <span>Loading volunteer drives...</span>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="opps-empty-state">
              <AlertCircle size={36} className="empty-icon" />
              <h3>No opportunities match your filter</h3>
              <p>Try resetting your search query or selecting "All Focus Areas".</p>
              <button
                type="button"
                className="btn-reset-filters"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFocusArea('ALL');
                  setSelectedLocation('ALL');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="opportunities-grid">
              {filteredOpportunities.map((opp) => {
                const focusName = opp.focus_area?.name || opp.focus_area || 'Community Action';
                const spotsRemaining = Math.max(0, (opp.spots_available || 10) - (opp.spots_filled || 0));
                const isFull = spotsRemaining <= 0 || opp.status === 'FILLED';

                return (
                  <div key={opp.id} className="opportunity-card">
                    <div className="card-top-row">
                      <span className="focus-badge">{focusName}</span>
                      <span className={`spots-badge ${isFull ? 'spots-full' : 'spots-open'}`}>
                        {isFull ? 'Drive Filled' : `${spotsRemaining} spots available`}
                      </span>
                    </div>

                    <h3 className="opp-card-title">{opp.title}</h3>

                    <p className="opp-card-desc">
                      {opp.description?.length > 140
                        ? `${opp.description.slice(0, 140)}...`
                        : opp.description}
                    </p>

                    <div className="opp-meta-list">
                      <div className="opp-meta-item">
                        <MapPin size={14} />
                        <span>{opp.location || 'Bengaluru'}</span>
                      </div>
                      <div className="opp-meta-item">
                        <Calendar size={14} />
                        <span>{opp.commitment || 'Weekends'}</span>
                      </div>
                      {opp.project?.title && (
                        <div className="opp-meta-item">
                          <Building2 size={14} />
                          <span>{opp.project.title}</span>
                        </div>
                      )}
                    </div>

                    <div className="card-footer-action">
                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={() => setSelectedOppDetail(opp)}
                      >
                        Role Details <ArrowRight size={14} />
                      </button>

                      {/* Informative Lock Button */}
                      <button
                        type="button"
                        className="btn-locked-action"
                        title="Complete onboarding application above to unlock drive sign-up"
                        onClick={() => {
                          window.scrollTo({ top: 200, behavior: 'smooth' });
                          if (currentStatus === 'NOT_SUBMITTED' || currentStatus === 'REJECTED') {
                            setIsEditingForm(true);
                          }
                        }}
                      >
                        <Lock size={14} /> Onboarding Required
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================
          ROLE DETAIL MODAL (LIGHTBOX)
      ======================================================== */}
      {selectedOppDetail && (
        <div
          className="modal-backdrop animate-fade-in"
          onClick={() => setSelectedOppDetail(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-opp-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="focus-badge">
                  {selectedOppDetail.focus_area?.name || 'Community Action'}
                </span>
                <h3 id="modal-opp-title" className="modal-title">{selectedOppDetail.title}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedOppDetail(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-meta-grid">
                <div>
                  <span className="modal-label">Location:</span>
                  <span className="modal-val">{selectedOppDetail.location}</span>
                </div>
                <div>
                  <span className="modal-label">Commitment:</span>
                  <span className="modal-val">{selectedOppDetail.commitment}</span>
                </div>
                <div>
                  <span className="modal-label">Spots Left:</span>
                  <span className="modal-val">
                    {Math.max(0, (selectedOppDetail.spots_available || 10) - (selectedOppDetail.spots_filled || 0))} of {selectedOppDetail.spots_available}
                  </span>
                </div>
              </div>

              <div className="modal-section">
                <h4>Role Description</h4>
                <p>{selectedOppDetail.description}</p>
              </div>

              {selectedOppDetail.responsibilities && (
                <div className="modal-section">
                  <h4>Key Responsibilities</h4>
                  <p>{selectedOppDetail.responsibilities}</p>
                </div>
              )}

              {selectedOppDetail.requirements && (
                <div className="modal-section">
                  <h4>Prerequisites & Requirements</h4>
                  <p>{selectedOppDetail.requirements}</p>
                </div>
              )}

              <div className="modal-lock-notice">
                <Lock size={18} />
                <div>
                  <strong>Drive Registration Locked:</strong> Only verified volunteers can sign up for this role. Complete your onboarding application above to join!
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedOppDetail(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-modal-onboarding-cta"
                onClick={() => {
                  setSelectedOppDetail(null);
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                  if (currentStatus === 'NOT_SUBMITTED' || currentStatus === 'REJECTED') {
                    setIsEditingForm(true);
                  }
                }}
              >
                Go to Onboarding Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
