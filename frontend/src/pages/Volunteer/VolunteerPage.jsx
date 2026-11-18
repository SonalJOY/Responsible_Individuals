import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  useVolunteerOpportunities, 
  useVolunteerInterests, 
  useVolunteerProfile, 
  useVolunteerApplication,
  useMyVolunteerApplications
} from '../../hooks/useVolunteer';
import { 
  MapPin, Clock, CheckCircle2, 
  Send, Filter, X, AlertCircle, LogIn, 
  UserCheck, RotateCcw, Check, Sparkles,
  ArrowDown, ArrowRight, ShieldCheck, HeartHandshake,
  Compass, Users, Calendar
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import VolunteerPhotoStrip from '../../components/common/VolunteerPhotoStrip';
import WhyVolunteerSection from '../../components/common/WhyVolunteerSection';
import VolunteerImpactStrip from '../../components/common/VolunteerImpactStrip';
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  checkPasswordRequirements,
  evaluatePasswordStrength,
  validateStatementOfPurpose
} from '../../utils/validation';

export default function VolunteerPage() {
  const navigate = useNavigate();
  const { user, login, registerVolunteer } = useAuth();
  
  // Custom hooks
  const { 
    opportunities, 
    loading: oppsLoading, 
    error: oppsError, 
    filters, 
    updateFilters, 
    clearFilters, 
    refetch: refetchOpps 
  } = useVolunteerOpportunities();

  const { interests } = useVolunteerInterests();
  const { profile } = useVolunteerProfile(user);
  const { 
    myApplications, 
    loading: myAppsLoading, 
    refetchApplications 
  } = useMyVolunteerApplications(user);
  
  const { 
    submitting, 
    error: submitError, 
    successApplication, 
    applyAsAuthenticated, 
    registerAndApply, 
    reset: resetApplicationState 
  } = useVolunteerApplication();

  // Modal and Interaction State
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    occupation: '',
    skills: '',
    availability: 'Weekends',
    bio: '',
    selectedInterests: [],
    statement_of_purpose: '',
    experience: '',
  });

  // Validation State
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Inline Login credentials for modal login tab
  const [loginCreds, setLoginCreds] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Live password requirement checklist & strength evaluations
  const pwdReqs = checkPasswordRequirements(formData.password);
  const pwdStrength = evaluatePasswordStrength(formData.password);

  // Check if current authenticated user has already applied for selected opportunity
  const existingApplication = user && selectedOpp && Array.isArray(myApplications)
    ? myApplications.find((app) => 
        String(app.opportunity) === String(selectedOpp.id) ||
        (app.opportunity_id && String(app.opportunity_id) === String(selectedOpp.id)) ||
        (app.opportunity_slug && selectedOpp.slug && app.opportunity_slug === selectedOpp.slug)
      )
    : null;

  // Sync authenticated user profile data into form whenever user / profile is available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: profile?.phone || user.phone || prev.phone,
        city: profile?.city || prev.city,
        state: profile?.state || prev.state,
        occupation: profile?.occupation || prev.occupation,
        skills: profile?.skills || prev.skills,
        availability: profile?.availability || prev.availability,
        bio: profile?.bio || prev.bio,
      }));
    }
  }, [user, profile]);

  const scrollToOpportunities = () => {
    const el = document.getElementById('opportunities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplyClick = (opp) => {
    const oppIdentifier = opp.slug || opp.id;
    if (oppIdentifier) {
      sessionStorage.setItem('ri_target_opportunity', String(oppIdentifier));
    }
    if (user) {
      navigate(`/volunteer/dashboard?opportunity=${encodeURIComponent(oppIdentifier)}`);
    } else {
      navigate(`/volunteer-portal?opportunity=${encodeURIComponent(oppIdentifier)}`);
    }
  };

  const _openApplyModal = (opp) => {
    setSelectedOpp(opp);
    resetApplicationState();
    setLoginError('');
    setFieldErrors({});
    setTouched({});
    if (user) {
      refetchApplications();
    }
    setModalOpen(true);
  };

  const closeApplyModal = () => {
    setModalOpen(false);
    resetApplicationState();
    setSelectedOpp(null);
    setLoginError('');
    setFieldErrors({});
    setTouched({});
  };

  const toggleInterest = (interestId) => {
    setFormData((prev) => {
      const current = prev.selectedInterests;
      if (current.includes(interestId)) {
        return { ...prev, selectedInterests: current.filter((id) => id !== interestId) };
      } else {
        return { ...prev, selectedInterests: [...current, interestId] };
      }
    });
  };

  const validateSingleField = (name, value, allValues = formData) => {
    switch (name) {
      case 'first_name':
        if (!user && (!value || !value.trim())) return 'First name is required.';
        return null;
      case 'email':
        if (!user) return validateEmail(value);
        return null;
      case 'password':
        if (!user) return validatePassword(value);
        return null;
      case 'confirm_password':
        if (!user) return validateConfirmPassword(allValues.password, value);
        return null;
      case 'phone':
        return validatePhone(value);
      case 'city':
        if (!value || !value.trim()) return 'City / Location is required.';
        return null;
      case 'statement_of_purpose':
        return validateStatementOfPurpose(value);
      default:
        return null;
    }
  };

  const handleFieldChange = (name, value) => {
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touched[name] || name === 'password' || name === 'confirm_password' || name === 'phone' || name === 'email') {
      const err = validateSingleField(name, value, updated);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));

      if (name === 'password' && (touched.confirm_password || updated.confirm_password)) {
        const confirmErr = validateConfirmPassword(value, updated.confirm_password);
        setFieldErrors((prev) => ({ ...prev, confirm_password: confirmErr }));
      }
    }
  };

  const handleFieldBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateSingleField(name, formData[name], formData);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginCreds.email, loginCreds.password);
      refetchApplications();
    } catch (err) {
      console.error(err);
      setLoginError(err?.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;

    const fieldsToValidate = user
      ? ['phone', 'city', 'statement_of_purpose']
      : ['first_name', 'email', 'password', 'confirm_password', 'phone', 'city', 'statement_of_purpose'];

    const errors = {};
    const newTouched = {};

    fieldsToValidate.forEach((field) => {
      newTouched[field] = true;
      const err = validateSingleField(field, formData[field], formData);
      if (err) {
        errors[field] = err;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const fieldIdMap = {
        first_name: 'vol_first_name',
        email: 'vol_email',
        password: 'vol_password',
        confirm_password: 'vol_confirm_password',
        phone: 'vol_phone',
        city: 'vol_city',
        statement_of_purpose: 'vol_statement',
      };

      for (const field of fieldsToValidate) {
        if (errors[field]) {
          const el = document.getElementById(fieldIdMap[field]);
          if (el) {
            el.focus();
            break;
          }
        }
      }
      return;
    }

    try {
      if (user) {
        await applyAsAuthenticated({
          opportunity_id: selectedOpp.id,
          statement_of_purpose: formData.statement_of_purpose.trim(),
          experience: formData.experience.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          skills: formData.skills.trim(),
          availability: formData.availability,
        });
        refetchApplications();
      } else {
        const regPayload = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirm_password: formData.confirm_password,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          occupation: formData.occupation.trim(),
          skills: formData.skills.trim() || 'Community Volunteering',
          availability: formData.availability,
          bio: formData.bio.trim(),
          interests: formData.selectedInterests,
        };

        const applyPayload = {
          opportunity_id: selectedOpp.id,
          statement_of_purpose: formData.statement_of_purpose.trim(),
          experience: formData.experience.trim(),
        };

        const regRes = await registerAndApply(regPayload, applyPayload, registerVolunteer);
        if (regRes?.requires_otp) {
          sessionStorage.setItem('ri_verification_identifier', regRes.identifier || formData.email.trim());
          const oppIdentifier = selectedOpp?.slug || selectedOpp?.id;
          if (oppIdentifier) {
            sessionStorage.setItem('ri_target_opportunity', String(oppIdentifier));
          }
          navigate(`/verify-otp?opportunity=${encodeURIComponent(oppIdentifier || '')}`);
          return;
        }
        refetchApplications();
      }
    } catch {
      // Handled via custom hook error state
    }
  };

  // Helper to pair opportunity with genuine initiative photography
  const getOpportunityImage = (opp) => {
    const title = (opp?.title || '').toLowerCase();
    const area = (opp?.focus_area_name || '').toLowerCase();

    if (title.includes('water') || title.includes('lake') || area.includes('water') || area.includes('wetland')) {
      return '/images/stories/citizen-water-monitoring.jpg';
    }
    if (title.includes('stem') || title.includes('robot') || title.includes('mentor') || title.includes('teach') || area.includes('education')) {
      return '/images/volunteer_interaction.jpeg';
    }
    if (title.includes('tree') || title.includes('sapling') || title.includes('afforest') || area.includes('environment')) {
      return '/images/environment_image.jpeg';
    }
    if (title.includes('art') || title.includes('craft') || title.includes('drawing')) {
      return '/images/students_art.jpeg';
    }
    return '/images/Group_selfie.jpeg';
  };

  const uniqueLocations = Array.from(new Set(opportunities.map((o) => o.location).filter(Boolean)));

  return (
    <div className="volunteer-page-editorial-root">
      {/* ====================================================================
          1. HERO SECTION — IMMERSIVE, EDITORIAL WITH AUTHENTIC PHOTOGRAPHY
          ==================================================================== */}
      <section className="volunteer-hero-editorial" aria-label="Volunteer Hero">
        <div className="volunteer-hero-media-wrapper">
          <img 
            src="/images/environment_image.jpeg" 
            alt="Community volunteers planting native saplings and restoring local environments"
            className="volunteer-hero-bg-img"
          />
          <div className="volunteer-hero-overlay" />
        </div>

        <div className="container volunteer-hero-content-wrap">
          <div className="volunteer-hero-content">
            <div className="section-badge volunteer-hero-badge">
              <Sparkles size={14} className="badge-sparkle-hero" />
              <span>Grassroots Civic Stewardship</span>
            </div>

            <h1 className="volunteer-hero-heading">
              Be a Responsible Individual
            </h1>

            <p className="volunteer-hero-text">
              Contribute your time, skills, and energy to grassroots community initiatives. 
              Whether reviving neighborhood water bodies, mentoring students in experiential science, 
              or planting native groves, every hour creates verified ground-level impact.
            </p>

            <div className="volunteer-hero-actions">
              <button 
                type="button" 
                onClick={scrollToOpportunities} 
                className="btn btn-primary volunteer-hero-primary-btn"
                aria-label="Explore Volunteer Opportunities"
              >
                <span>Explore Opportunities</span>
                <ArrowDown size={16} />
              </button>

              <button 
                type="button" 
                onClick={scrollToOpportunities}
                className="btn btn-outline-white volunteer-hero-secondary-btn"
                aria-label="Share Your Skills with our initiatives"
              >
                <Compass size={16} />
                <span>Share Your Skills</span>
              </button>
            </div>

            {/* Verified On-Ground Highlights */}
            <div className="volunteer-hero-highlights">
              <div className="hero-highlight-pill">
                <ShieldCheck size={15} className="highlight-icon" />
                <span>Structured Orientation Provided</span>
              </div>
              <div className="hero-highlight-pill">
                <Users size={15} className="highlight-icon" />
                <span>Collaborative Community Teams</span>
              </div>
              <div className="hero-highlight-pill">
                <Calendar size={15} className="highlight-icon" />
                <span>Flexible Weekend Field Drives</span>
              </div>
            </div>
          </div>

          {/* Premium Animated Impact Statistics Strip */}
          <VolunteerImpactStrip />
        </div>
      </section>

      {/* ====================================================================
          2. VOICES OF OUR VOLUNTEERS — REAL TESTIMONIALS (WARM-WHITE & SAFFRON)
          ==================================================================== */}
      <VolunteerPhotoStrip 
        onExploreRoles={scrollToOpportunities}
      />

      {/* ====================================================================
          3. WHY VOLUNTEER WITH US — 4 BENEFIT CARDS
          ==================================================================== */}
      <WhyVolunteerSection 
        onExploreRoles={scrollToOpportunities}
      />

      {/* ====================================================================
          4. ACTIVE VOLUNTEER OPPORTUNITIES — WIDER, SCAN-FRIENDLY & ACCESSIBLE
          ==================================================================== */}
      <section className="section volunteer-opps-section" id="opportunities">
        <div className="container">
          <div className="section-header opps-section-header">
            <span className="section-badge opps-badge">Open Calls</span>
            <h2 className="section-title opps-title">Active Volunteer Roles</h2>
            <p className="section-subtitle opps-subtitle">
              Choose an initiative matching your location, interests, and schedule. 
              Every role includes clear safety guidance, experienced coordination, and on-ground orientation.
            </p>
          </div>

          {/* Clean, Scan-Friendly Filter Bar */}
          <div className="opp-filters-bar-modern">
            <div className="filters-label-modern">
              <Filter size={17} className="filter-icon-saffron" />
              <span>Filter Opportunities:</span>
            </div>

            <div className="filters-inputs-wrap-modern">
              {/* Location Filter */}
              <div className="filter-select-container">
                <select
                  className="filter-select-modern"
                  value={filters.location || ''}
                  onChange={(e) => updateFilters({ location: e.target.value })}
                  aria-label="Filter by Location"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Status / Availability Filter */}
              <div className="filter-select-container">
                <select
                  className="filter-select-modern"
                  value={filters.status || 'OPEN'}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  aria-label="Filter by Role Status"
                >
                  <option value="OPEN">Open for Applications</option>
                  <option value="">All Roles (Including Filled)</option>
                  <option value="FILLED">Filled Roles</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(filters.location || (filters.status && filters.status !== 'OPEN')) && (
                <button 
                  type="button"
                  onClick={clearFilters} 
                  className="filter-reset-btn-modern"
                  title="Clear all filters"
                  aria-label="Reset all filters"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Opportunities Cards Grid / State Handling */}
          {oppsLoading ? (
            <div className="opps-loading-state-modern">
              <div className="spinner-indicator-saffron" />
              <h3>Retrieving Available Initiatives</h3>
              <p>Connecting to grassroots project database...</p>
            </div>
          ) : oppsError ? (
            <div className="opps-error-state-modern">
              <AlertCircle size={36} color="#DC2626" />
              <h3>Unable to Load Opportunities</h3>
              <p>{oppsError}</p>
              <button 
                type="button"
                onClick={() => refetchOpps()} 
                className="btn btn-primary btn-sm"
              >
                Try Again
              </button>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="opps-empty-state-modern">
              <HeartHandshake size={48} className="empty-state-icon" />
              <h3>No Roles Match Your Selected Filters</h3>
              <p>Try clearing your location or status filter to see other active initiatives, or check back soon.</p>
              <button 
                type="button"
                onClick={clearFilters} 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: '1rem' }}
              >
                View All Open Roles
              </button>
            </div>
          ) : (
            <div className="opps-grid-modern">
              {opportunities.map((opp) => {
                const spotsLeft = opp.spots_available - opp.spots_filled;
                const isClosed = opp.status === 'CLOSED' || opp.status === 'FILLED' || spotsLeft <= 0;
                const oppImg = getOpportunityImage(opp);

                return (
                  <article key={opp.id} className="opp-card-modern">
                    {/* Media Thumbnail */}
                    <div className="opp-card-media-wrap">
                      <img 
                        src={oppImg} 
                        alt={opp.title} 
                        className="opp-card-img"
                        loading="lazy"
                      />
                      <div className="opp-card-media-tags">
                        <span className="opp-area-badge-modern">
                          {opp.focus_area_name || 'Community Impact'}
                        </span>
                        <span className={`opp-spots-badge-modern ${isClosed ? 'filled' : 'open'}`}>
                          {isClosed ? 'Role Filled' : `${spotsLeft} spots available`}
                        </span>
                      </div>
                    </div>

                    {/* Card Information */}
                    <div className="opp-card-content">
                      <h3 className="opp-card-title">{opp.title}</h3>
                      <p className="opp-card-desc">{opp.description}</p>

                      {/* Key Logistics Meta Box */}
                      <div className="opp-meta-box">
                        <div className="opp-meta-item">
                          <MapPin size={16} className="opp-meta-icon" />
                          <div>
                            <span className="opp-meta-label">Location</span>
                            <span className="opp-meta-val">{opp.location}</span>
                          </div>
                        </div>

                        <div className="opp-meta-item">
                          <Clock size={16} className="opp-meta-icon" />
                          <div>
                            <span className="opp-meta-label">Commitment</span>
                            <span className="opp-meta-val">{opp.commitment}</span>
                          </div>
                        </div>
                      </div>

                      {/* Requirements Box */}
                      {opp.requirements && (
                        <div className="opp-req-box-modern">
                          <span className="opp-req-title">Role Requirements</span>
                          <p className="opp-req-body">{opp.requirements}</p>
                        </div>
                      )}

                      {/* Action CTA */}
                      <div className="opp-card-footer">
                        <button
                          type="button"
                          onClick={() => handleApplyClick(opp)}
                          disabled={isClosed}
                          className={`btn ${isClosed ? 'btn-secondary-disabled' : 'btn-primary'} opp-action-btn`}
                          aria-label={isClosed ? `${opp.title} is filled` : `Apply for ${opp.title}`}
                        >
                          <span>{isClosed ? 'Role Filled' : 'Apply for this Role'}</span>
                          {!isClosed && <Send size={15} />}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          5. FINAL CALL TO ACTION — AUTHENTIC VOLUNTEER GROUP PHOTOGRAPH
          ==================================================================== */}
      <section className="volunteer-final-cta-section" aria-label="Volunteer Call to Action">
        <div className="final-cta-media-wrap">
          <img 
            src="/images/Group_selfie.jpeg" 
            alt="Responsible Individuals volunteer squad gathered in the field"
            className="final-cta-bg-img"
          />
          <div className="final-cta-overlay" />
        </div>

        <div className="container final-cta-container">
          <div className="final-cta-card">
            <span className="final-cta-badge">Join The Movement</span>
            <h2 className="final-cta-title">Ready to Make a Difference?</h2>
            <p className="final-cta-text">
              Join a dedicated community working towards healthier environments, stronger communities, and brighter futures. 
              Bring your energy, ideas, and commitment to ground-level change.
            </p>

            <div className="final-cta-buttons">
              <button 
                type="button" 
                onClick={scrollToOpportunities} 
                className="btn btn-primary final-cta-btn-primary"
              >
                <span>Become a Volunteer</span>
                <ArrowRight size={16} />
              </button>

              <Link to="/projects" className="btn btn-outline-white final-cta-btn-secondary">
                <span>Explore Our Work</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. APPLICATION WIZARD MODAL — FULL EXISTING LOGIC PRESERVED
          ==================================================================== */}
      <Modal 
        isOpen={modalOpen} 
        onClose={closeApplyModal}
        maxWidth="620px"
        title={
          successApplication 
            ? 'Application Submitted' 
            : existingApplication
              ? 'Application Status'
              : `Volunteer Application: ${selectedOpp?.title || ''}`
        }
      >
        {successApplication ? (
          <div className="application-success-box">
            <div className="success-icon-wrap">
              <CheckCircle2 size={52} color="#D97706" />
            </div>
            <h3>Thank You, {formData.first_name || user?.first_name || 'Volunteer'}!</h3>
            <div className="success-status-pill">Status: PENDING REVIEW</div>
            <p className="success-desc">
              Your application for <strong>{selectedOpp?.title}</strong> has been registered in the system. 
              Our volunteer coordination team will review your profile alignment and reach out with orientation schedules within 48 hours.
            </p>
            <button 
              type="button"
              onClick={closeApplyModal} 
              className="btn btn-primary" 
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Done & Return to Opportunities
            </button>
          </div>
        ) : user && myAppsLoading && !existingApplication ? (
          <div className="app-status-loading">
            <div className="spinner-indicator-saffron" />
            <p>Checking your application status...</p>
          </div>
        ) : existingApplication ? (
          <div className="existing-app-status-box">
            <div className="app-status-icon-wrap">
              {existingApplication.status === 'APPROVED' ? (
                <CheckCircle2 size={48} color="#059669" />
              ) : existingApplication.status === 'REJECTED' ? (
                <AlertCircle size={48} color="#EF4444" />
              ) : (
                <Clock size={48} color="#D97706" />
              )}
            </div>

            <h3 className="app-status-title">Application Already Submitted</h3>
            <p className="app-status-subtitle">
              You have already submitted an application for this volunteer initiative. Below is the current status:
            </p>

            <div className={`app-status-card status-${(existingApplication.status || 'PENDING').toLowerCase()}`}>
              <div className="app-status-card-header">
                <span className="app-status-role-title">{selectedOpp?.title || existingApplication.opportunity_title}</span>
                <span className={`app-status-pill pill-${(existingApplication.status || 'PENDING').toLowerCase()}`}>
                  {existingApplication.status === 'APPROVED'
                    ? 'Application Approved'
                    : existingApplication.status === 'REJECTED'
                      ? 'Application Not Selected'
                      : existingApplication.status === 'WAITLISTED'
                        ? 'Waitlisted'
                        : 'Pending Review'}
                </span>
              </div>

              <div className="app-status-details-grid">
                {existingApplication.created_at && (
                  <div className="app-status-detail-item">
                    <span className="detail-label">Submitted On</span>
                    <span className="detail-value">
                      {new Date(existingApplication.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {selectedOpp?.location && (
                  <div className="app-status-detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{selectedOpp.location}</span>
                  </div>
                )}
                {selectedOpp?.commitment && (
                  <div className="app-status-detail-item">
                    <span className="detail-label">Commitment</span>
                    <span className="detail-value">{selectedOpp.commitment}</span>
                  </div>
                )}
              </div>

              <div className="app-status-message">
                {existingApplication.status === 'APPROVED' ? (
                  <p>Congratulations! Your application has been approved. Our team will contact you with orientation and on-ground scheduling details.</p>
                ) : existingApplication.status === 'REJECTED' ? (
                  <p>Thank you for your interest. While this role was not matched at this time, we encourage you to explore other open opportunities.</p>
                ) : existingApplication.status === 'WAITLISTED' ? (
                  <p>You are currently on the waitlist. If an opening becomes available, our coordinators will reach out directly.</p>
                ) : (
                  <p>Your application is currently under review by our coordinators. We typically process applications within 48 to 72 hours.</p>
                )}
              </div>
            </div>

            <button 
              type="button"
              onClick={closeApplyModal} 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1.25rem' }}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="modal-form-flow">
            {submitError && (
              <div className="modal-error-alert" role="alert">
                <AlertCircle size={18} className="error-icon" />
                <div className="error-text-content">
                  <strong>Submission Issue:</strong>
                  <span>{submitError}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => resetApplicationState()} 
                  className="error-dismiss-btn"
                  aria-label="Dismiss error"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {user ? (
              <div className="authenticated-user-banner">
                <UserCheck size={18} color="#D97706" />
                <div>
                  <span>Applying as: <strong>{user.get_full_name || user.first_name || user.email}</strong></span>
                  <span className="auth-email-hint">{user.email}</span>
                </div>
              </div>
            ) : (
              <div className="auth-mode-selector">
                <button 
                  type="button" 
                  className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('register'); setLoginError(''); }}
                >
                  New Volunteer (Register & Apply)
                </button>
                <button 
                  type="button" 
                  className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('login'); setLoginError(''); }}
                >
                  Already Registered? Sign In
                </button>
              </div>
            )}

            {!user && authMode === 'login' ? (
              <form onSubmit={handleInlineLogin} className="inline-login-form">
                {loginError && (
                  <div className="modal-error-alert" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    <span>{loginError}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="name@example.com"
                    value={loginCreds.email}
                    onChange={(e) => setLoginCreds({ ...loginCreds, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="••••••••"
                    value={loginCreds.password}
                    onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loginLoading} 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  <LogIn size={15} />
                  <span>{loginLoading ? 'Authenticating...' : 'Sign In & Continue Application'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="volunteer-form" noValidate>
                {!user && (
                  <>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="vol_first_name">First Name *</label>
                        <input
                          id="vol_first_name"
                          type="text"
                          required
                          className={`form-control ${touched.first_name && fieldErrors.first_name ? 'is-invalid' : ''}`}
                          placeholder="e.g. Priya"
                          value={formData.first_name}
                          onChange={(e) => handleFieldChange('first_name', e.target.value)}
                          onBlur={() => handleFieldBlur('first_name')}
                          aria-invalid={!!(touched.first_name && fieldErrors.first_name)}
                        />
                        {touched.first_name && fieldErrors.first_name && (
                          <div className="field-error-text" role="alert">
                            <AlertCircle size={12} />
                            <span>{fieldErrors.first_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="vol_last_name">Last Name</label>
                        <input
                          id="vol_last_name"
                          type="text"
                          className="form-control"
                          placeholder="e.g. Sharma"
                          value={formData.last_name}
                          onChange={(e) => handleFieldChange('last_name', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="vol_email">Email Address (Login Username) *</label>
                      <input
                        id="vol_email"
                        type="email"
                        required
                        maxLength={254}
                        className={`form-control ${touched.email && fieldErrors.email ? 'is-invalid' : ''}`}
                        placeholder="priya@example.com"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                        aria-invalid={!!(touched.email && fieldErrors.email)}
                      />
                      {touched.email && fieldErrors.email && (
                        <div className="field-error-text" role="alert">
                          <AlertCircle size={12} />
                          <span>{fieldErrors.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="vol_password">Create Password (min 12 chars) *</label>
                        <input
                          id="vol_password"
                          type="password"
                          required
                          minLength={12}
                          maxLength={128}
                          className={`form-control ${touched.password && fieldErrors.password ? 'is-invalid' : ''}`}
                          placeholder="••••••••••••"
                          value={formData.password}
                          onChange={(e) => handleFieldChange('password', e.target.value)}
                          onBlur={() => handleFieldBlur('password')}
                          aria-invalid={!!(touched.password && fieldErrors.password)}
                        />
                        {touched.password && fieldErrors.password && (
                          <div className="field-error-text" role="alert">
                            <AlertCircle size={12} />
                            <span>{fieldErrors.password}</span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="vol_confirm_password">Confirm Password *</label>
                        <input
                          id="vol_confirm_password"
                          type="password"
                          required
                          minLength={12}
                          maxLength={128}
                          className={`form-control ${touched.confirm_password && fieldErrors.confirm_password ? 'is-invalid' : ''}`}
                          placeholder="••••••••••••"
                          value={formData.confirm_password}
                          onChange={(e) => handleFieldChange('confirm_password', e.target.value)}
                          onBlur={() => handleFieldBlur('confirm_password')}
                          aria-invalid={!!(touched.confirm_password && fieldErrors.confirm_password)}
                        />
                        {touched.confirm_password && fieldErrors.confirm_password && (
                          <div className="field-error-text" role="alert">
                            <AlertCircle size={12} />
                            <span>{fieldErrors.confirm_password}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password Feedback */}
                    <div className="password-feedback-section">
                      {formData.password && (
                        <div className="pwd-strength-wrap">
                          <div className="pwd-strength-meta">
                            <span className="pwd-strength-label">Password Strength:</span>
                            <span className="pwd-strength-badge" style={{ color: pwdStrength.color }}>
                              {pwdStrength.label}
                            </span>
                          </div>
                          <div className="pwd-strength-track">
                            <div 
                              className="pwd-strength-bar" 
                              style={{ 
                                width: `${pwdStrength.percent}%`, 
                                backgroundColor: pwdStrength.color 
                              }} 
                            />
                          </div>
                        </div>
                      )}

                      <div className="pwd-requirements-card">
                        <div className="pwd-req-title">Password requirements</div>
                        <ul className="pwd-req-list">
                          <li className={`pwd-req-item ${pwdReqs.length ? 'passed' : ''}`}>
                            <span className="pwd-req-icon">{pwdReqs.length ? '✓' : '○'}</span>
                            <span>At least 12 characters</span>
                          </li>
                          <li className={`pwd-req-item ${pwdReqs.uppercase ? 'passed' : ''}`}>
                            <span className="pwd-req-icon">{pwdReqs.uppercase ? '✓' : '○'}</span>
                            <span>One uppercase letter</span>
                          </li>
                          <li className={`pwd-req-item ${pwdReqs.lowercase ? 'passed' : ''}`}>
                            <span className="pwd-req-icon">{pwdReqs.lowercase ? '✓' : '○'}</span>
                            <span>One lowercase letter</span>
                          </li>
                          <li className={`pwd-req-item ${pwdReqs.number ? 'passed' : ''}`}>
                            <span className="pwd-req-icon">{pwdReqs.number ? '✓' : '○'}</span>
                            <span>One number</span>
                          </li>
                          <li className={`pwd-req-item ${pwdReqs.special ? 'passed' : ''}`}>
                            <span className="pwd-req-icon">{pwdReqs.special ? '✓' : '○'}</span>
                            <span>One special character</span>
                          </li>
                          <li className={`pwd-req-item ${pwdReqs.noSpaces ? 'passed' : ''}`}>
                            <span className="pwd-req-icon">{pwdReqs.noSpaces ? '✓' : '○'}</span>
                            <span>No spaces</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                {/* Common Profile Fields */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol_phone">Phone Number *</label>
                    <input
                      id="vol_phone"
                      type="tel"
                      inputMode="numeric"
                      required
                      maxLength={10}
                      className={`form-control ${touched.phone && fieldErrors.phone ? 'is-invalid' : ''}`}
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      onBlur={() => handleFieldBlur('phone')}
                      aria-invalid={!!(touched.phone && fieldErrors.phone)}
                    />
                    {touched.phone && fieldErrors.phone && (
                      <div className="field-error-text" role="alert">
                        <AlertCircle size={12} />
                        <span>{fieldErrors.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="vol_city">City / Location *</label>
                    <input
                      id="vol_city"
                      type="text"
                      required
                      className={`form-control ${touched.city && fieldErrors.city ? 'is-invalid' : ''}`}
                      placeholder="e.g. Bengaluru"
                      value={formData.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      onBlur={() => handleFieldBlur('city')}
                      aria-invalid={!!(touched.city && fieldErrors.city)}
                    />
                    {touched.city && fieldErrors.city && (
                      <div className="field-error-text" role="alert">
                        <AlertCircle size={12} />
                        <span>{fieldErrors.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol_occupation">Current Occupation</label>
                    <input
                      id="vol_occupation"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Student / Software Engineer / Educator"
                      value={formData.occupation}
                      onChange={(e) => handleFieldChange('occupation', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="vol_availability">Availability Schedule</label>
                    <select
                      id="vol_availability"
                      className="form-control"
                      value={formData.availability}
                      onChange={(e) => handleFieldChange('availability', e.target.value)}
                    >
                      <option value="Weekends">Weekends Only</option>
                      <option value="Weekdays">Weekdays</option>
                      <option value="Flexible">Flexible / On-Demand</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="vol_skills">Key Skills</label>
                  <input
                    id="vol_skills"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Teaching, Water Testing, Event Coordination, Photography"
                    value={formData.skills}
                    onChange={(e) => handleFieldChange('skills', e.target.value)}
                  />
                </div>

                {!user && interests.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Impact Areas of Interest</label>
                    <div className="interest-chips-grid">
                      {interests.map((int) => {
                        const isSelected = formData.selectedInterests.includes(int.id) || formData.selectedInterests.includes(int.slug);
                        return (
                          <button
                            type="button"
                            key={int.id}
                            className={`interest-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleInterest(int.id)}
                          >
                            {isSelected ? <Check size={12} /> : null}
                            <span>{int.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="vol_statement">Why do you want to join this initiative? *</label>
                  <textarea
                    id="vol_statement"
                    required
                    rows={3}
                    className={`form-control ${touched.statement_of_purpose && fieldErrors.statement_of_purpose ? 'is-invalid' : ''}`}
                    placeholder="Tell us about your motivation and what you hope to achieve (min 10 characters)..."
                    value={formData.statement_of_purpose}
                    onChange={(e) => handleFieldChange('statement_of_purpose', e.target.value)}
                    onBlur={() => handleFieldBlur('statement_of_purpose')}
                    aria-invalid={!!(touched.statement_of_purpose && fieldErrors.statement_of_purpose)}
                  />
                  {touched.statement_of_purpose && fieldErrors.statement_of_purpose && (
                    <div className="field-error-text" role="alert">
                      <AlertCircle size={12} />
                      <span>{fieldErrors.statement_of_purpose}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="vol_experience">Prior Volunteering / Community Experience (Optional)</label>
                  <textarea
                    id="vol_experience"
                    rows={2}
                    className="form-control"
                    placeholder="Mention any past drives, student initiatives, or community work..."
                    value={formData.experience}
                    onChange={(e) => handleFieldChange('experience', e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  <Send size={15} />
                  <span>
                    {submitting 
                      ? 'Submitting Application...' 
                      : user 
                        ? 'Submit Application' 
                        : 'Register & Submit Application'}
                  </span>
                </button>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* ====================================================================
          SCOPED STYLES — EDITORIAL WARM-WHITE, CHARCOAL & SAFFRON DESIGN SYSTEM
          ==================================================================== */}
      <style>{`
        .volunteer-page-editorial-root {
          background-color: #FFFDF8;
          color: #171717;
          min-height: 100vh;
        }

        /* 1. Hero Section */
        .volunteer-hero-editorial {
          position: relative;
          min-height: 680px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 6.5rem 0 5rem 0;
          color: #FFFFFF;
        }

        @media (min-width: 992px) {
          .volunteer-hero-editorial {
            min-height: 760px;
            padding: 7.5rem 0 5.5rem 0;
          }
        }

        .volunteer-hero-media-wrapper {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .volunteer-hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 35%;
          transform: scale(1.02);
          transition: transform 12s ease-out;
        }

        .volunteer-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg, 
            rgba(23, 23, 23, 0.82) 0%, 
            rgba(23, 23, 23, 0.68) 50%, 
            rgba(23, 23, 23, 0.90) 100%
          );
        }

        .volunteer-hero-content-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .volunteer-hero-content {
          max-width: 820px;
          margin: 0 auto;
          text-align: center;
        }

        .volunteer-hero-badge {
          background: rgba(245, 158, 11, 0.2);
          color: #FDE68A;
          border: 1px solid rgba(245, 158, 11, 0.45);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.15rem;
          border-radius: 9999px;
          font-size: 0.825rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(4px);
        }

        .badge-sparkle-hero {
          color: #F59E0B;
        }

        .volunteer-hero-heading {
          color: #FFFFFF;
          font-size: clamp(2.35rem, 5.5vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1.35rem;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
        }

        .volunteer-hero-text {
          font-size: clamp(1.05rem, 2vw, 1.25rem);
          color: #E2E8F0;
          max-width: 720px;
          margin: 0 auto 2.25rem auto;
          line-height: 1.7;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
        }

        .volunteer-hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2.75rem;
        }

        .volunteer-hero-primary-btn {
          background: #F59E0B;
          color: #171717;
          font-weight: 700;
          border: none;
          padding: 0.85rem 1.85rem;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
        }

        .volunteer-hero-primary-btn:hover {
          background: #D97706;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(217, 119, 6, 0.45);
        }

        .btn-outline-white {
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          color: #FFFFFF;
          font-weight: 600;
          padding: 0.85rem 1.85rem;
          border-radius: 12px;
          backdrop-filter: blur(4px);
        }

        .btn-outline-white:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #FFFFFF;
          color: #FFFFFF;
          transform: translateY(-2px);
        }

        .volunteer-hero-highlights {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
        }

        .hero-highlight-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(23, 23, 23, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.4rem 0.95rem;
          border-radius: 9999px;
          font-size: 0.825rem;
          color: #F1F5F9;
          backdrop-filter: blur(4px);
        }

        .highlight-icon {
          color: #F59E0B;
        }

        /* 4. Active Volunteer Opportunities */
        .volunteer-opps-section {
          background-color: #FAF8F2;
          padding: 6rem 0 5.5rem 0;
          border-bottom: 1px solid #E8E1D5;
        }

        .opps-section-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 3.5rem auto;
        }

        .opps-badge {
          background: #FFF7ED;
          color: #B45309;
          border: 1px solid rgba(245, 158, 11, 0.35);
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 1rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.85rem;
        }

        .opps-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #171717;
          letter-spacing: -0.025em;
          margin-bottom: 0.85rem;
        }

        @media (min-width: 768px) {
          .opps-title {
            font-size: 2.85rem;
          }
        }

        .opps-subtitle {
          font-size: 1.1rem;
          color: #475569;
          line-height: 1.65;
        }

        /* Filter Bar Modern */
        .opp-filters-bar-modern {
          background: #FFFFFF;
          border: 1px solid #E8E1D5;
          border-radius: 16px;
          padding: 1rem 1.5rem;
          margin-bottom: 2.5rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(23, 23, 23, 0.03);
        }

        .filters-label-modern {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #171717;
        }

        .filter-icon-saffron {
          color: #D97706;
        }

        .filters-inputs-wrap-modern {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-select-container {
          position: relative;
        }

        .filter-select-modern {
          padding: 0.6rem 1.1rem;
          border-radius: 10px;
          border: 1px solid #E8E1D5;
          background: #FFFDF8;
          font-size: 0.875rem;
          color: #171717;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          min-height: 42px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .filter-select-modern:focus {
          border-color: #F59E0B;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
        }

        .filter-reset-btn-modern {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1rem;
          border-radius: 10px;
          background: #FFF7ED;
          border: 1px solid rgba(245, 158, 11, 0.35);
          font-size: 0.825rem;
          font-weight: 700;
          color: #B45309;
          cursor: pointer;
          min-height: 42px;
          transition: all 0.2s ease;
        }

        .filter-reset-btn-modern:hover {
          background: #FEF3C7;
          color: #92400E;
          transform: translateY(-1px);
        }

        /* Loading / Error / Empty States */
        .opps-loading-state-modern,
        .opps-empty-state-modern,
        .opps-error-state-modern {
          text-align: center;
          padding: 4.5rem 2rem;
          background: #FFFFFF;
          border: 1px dashed #E8E1D5;
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(23, 23, 23, 0.02);
        }

        .opps-loading-state-modern h3,
        .opps-empty-state-modern h3,
        .opps-error-state-modern h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #171717;
          margin: 1rem 0 0.5rem 0;
        }

        .opps-loading-state-modern p,
        .opps-empty-state-modern p,
        .opps-error-state-modern p {
          color: #64748B;
          font-size: 0.95rem;
          max-width: 480px;
          margin: 0 auto;
        }

        .empty-state-icon {
          color: #D97706;
          opacity: 0.7;
        }

        .spinner-indicator-saffron {
          width: 40px;
          height: 40px;
          border: 3.5px solid rgba(245, 158, 11, 0.2);
          border-top-color: #D97706;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Opportunities Grid */
        .opps-grid-modern {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 840px) {
          .opps-grid-modern {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .opp-card-modern {
          background: #FFFFFF;
          border: 1px solid #E8E1D5;
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 18px rgba(23, 23, 23, 0.04);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .opp-card-modern:hover {
          transform: translateY(-4px);
          border-color: #F59E0B;
          box-shadow: 0 14px 32px -8px rgba(217, 119, 6, 0.12);
        }

        .opp-card-media-wrap {
          position: relative;
          width: 100%;
          height: 190px;
          background: #0F172A;
          overflow: hidden;
        }

        .opp-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          transition: transform 0.6s ease;
        }

        .opp-card-modern:hover .opp-card-img {
          transform: scale(1.04);
        }

        .opp-card-media-tags {
          position: absolute;
          inset: 0;
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: linear-gradient(180deg, rgba(23, 23, 23, 0.5) 0%, rgba(23, 23, 23, 0) 50%);
        }

        .opp-area-badge-modern {
          background: #FFF7ED;
          color: #92400E;
          border: 1px solid rgba(245, 158, 11, 0.4);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          letter-spacing: 0.02em;
        }

        .opp-spots-badge-modern {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          letter-spacing: 0.02em;
        }

        .opp-spots-badge-modern.open {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }

        .opp-spots-badge-modern.filled {
          background: #FEF2F2;
          color: #991B1B;
          border: 1px solid #FECACA;
        }

        .opp-card-content {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .opp-card-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #171717;
          margin-bottom: 0.65rem;
          line-height: 1.3;
        }

        .opp-card-desc {
          font-size: 0.925rem;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 1.35rem;
        }

        .opp-meta-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          background: #FFFDF8;
          border: 1px solid #E8E1D5;
          border-radius: 12px;
          padding: 0.85rem 1rem;
          margin-bottom: 1.25rem;
        }

        .opp-meta-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
        }

        .opp-meta-icon {
          color: #D97706;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .opp-meta-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .opp-meta-val {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #171717;
          line-height: 1.35;
        }

        .opp-req-box-modern {
          background: #FAF8F2;
          border-left: 3px solid #F59E0B;
          padding: 0.85rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .opp-req-title {
          display: block;
          font-size: 0.725rem;
          font-weight: 700;
          color: #92400E;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .opp-req-body {
          font-size: 0.85rem;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }

        .opp-card-footer {
          margin-top: auto;
          padding-top: 0.5rem;
        }

        .opp-action-btn {
          width: 100%;
          min-height: 46px;
          font-weight: 700;
        }

        .btn-secondary-disabled {
          background: #E2E8F0;
          color: #94A3B8;
          border: none;
          cursor: not-allowed;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.65rem;
          border-radius: 8px;
          font-size: 0.95rem;
        }

        /* 5. Final Call to Action */
        .volunteer-final-cta-section {
          position: relative;
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 5.5rem 0;
          color: #FFFFFF;
        }

        .final-cta-media-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .final-cta-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
        }

        .final-cta-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg, 
            rgba(23, 23, 23, 0.88) 0%, 
            rgba(23, 23, 23, 0.78) 60%, 
            rgba(217, 119, 6, 0.55) 100%
          );
        }

        .final-cta-container {
          position: relative;
          z-index: 2;
        }

        .final-cta-card {
          max-width: 740px;
          margin: 0 auto;
          text-align: center;
        }

        .final-cta-badge {
          background: rgba(245, 158, 11, 0.25);
          color: #FDE68A;
          border: 1px solid rgba(245, 158, 11, 0.45);
          display: inline-block;
          padding: 0.35rem 1rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 1.25rem;
        }

        .final-cta-title {
          font-size: clamp(2.2rem, 4.5vw, 3.25rem);
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.025em;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .final-cta-text {
          font-size: 1.15rem;
          color: #E2E8F0;
          line-height: 1.65;
          margin-bottom: 2.25rem;
        }

        .final-cta-buttons {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .final-cta-btn-primary {
          background: #F59E0B;
          color: #171717;
          font-weight: 700;
          border: none;
          padding: 0.85rem 1.85rem;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
        }

        .final-cta-btn-primary:hover {
          background: #D97706;
          color: #FFFFFF;
          transform: translateY(-2px);
        }

        .final-cta-btn-secondary {
          white-space: nowrap;
        }

        /* 6. Application Modal Styles */
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

        .modal-error-alert {
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #991B1B;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.85rem;
        }

        .error-text-content {
          flex: 1;
          line-height: 1.4;
        }

        .error-text-content strong {
          display: block;
          margin-bottom: 0.15rem;
        }

        .error-dismiss-btn {
          background: transparent;
          border: none;
          color: #991B1B;
          cursor: pointer;
          padding: 0;
        }

        .authenticated-user-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #FFF7ED;
          border: 1px solid #FDE68A;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
          color: #92400E;
        }

        .auth-email-hint {
          display: block;
          font-size: 0.75rem;
          color: #B45309;
        }

        .auth-mode-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: #FAF8F2;
          padding: 0.25rem;
          border-radius: 10px;
          border: 1px solid #E8E1D5;
          margin-bottom: 1.25rem;
        }

        .auth-tab-btn {
          padding: 0.55rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .auth-tab-btn.active {
          background: #FFFFFF;
          color: #171717;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .interest-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.35rem;
        }

        .interest-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid #E8E1D5;
          background: #FFFDF8;
          color: #475569;
          font-size: 0.775rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .interest-chip:hover {
          background: #FAF8F2;
          border-color: #CBD5E1;
        }

        .interest-chip.active {
          background: #FFF7ED;
          border-color: #D97706;
          color: #92400E;
          font-weight: 700;
        }

        .application-success-box {
          text-align: center;
          padding: 1.5rem 0;
        }

        .success-icon-wrap {
          margin-bottom: 1rem;
        }

        .success-status-pill {
          display: inline-block;
          background: #FEF3C7;
          color: #92400E;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }

        .success-desc {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 480px;
          margin: 0 auto;
        }

        .form-control.is-invalid {
          border-color: #EF4444 !important;
          background-color: rgba(254, 242, 242, 0.4) !important;
        }

        .form-control.is-invalid:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
        }

        .field-error-text {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #DC2626;
          font-size: 0.775rem;
          font-weight: 500;
          margin-top: 0.35rem;
        }

        .password-feedback-section {
          margin-top: -0.25rem;
          margin-bottom: 1rem;
        }

        .pwd-strength-wrap {
          margin-bottom: 0.65rem;
          padding: 0.5rem 0.75rem;
          background: #FAF8F2;
          border: 1px solid #E8E1D5;
          border-radius: 10px;
        }

        .pwd-strength-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.775rem;
          margin-bottom: 0.35rem;
        }

        .pwd-strength-label {
          color: #475569;
          font-weight: 600;
        }

        .pwd-strength-badge {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .pwd-strength-track {
          width: 100%;
          height: 5px;
          background: #E2E8F0;
          border-radius: 9999px;
          overflow: hidden;
        }

        .pwd-strength-bar {
          height: 100%;
          transition: width 0.25s ease, background-color 0.25s ease;
          border-radius: 9999px;
        }

        .pwd-requirements-card {
          background: #FAF8F2;
          border: 1px solid #E8E1D5;
          border-radius: 10px;
          padding: 0.75rem 1rem;
        }

        .pwd-req-title {
          font-size: 0.775rem;
          font-weight: 700;
          color: #171717;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .pwd-req-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.35rem;
        }

        @media (min-width: 540px) {
          .pwd-req-list {
            grid-template-columns: 1fr 1fr;
          }
        }

        .pwd-req-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.775rem;
          color: #64748B;
          transition: color 0.2s ease;
        }

        .pwd-req-item.passed {
          color: #059669;
          font-weight: 600;
        }

        .pwd-req-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .app-status-loading {
          text-align: center;
          padding: 3rem 1rem;
        }

        .app-status-loading p {
          color: #64748B;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .existing-app-status-box {
          text-align: center;
          padding: 0.5rem 0;
        }

        .app-status-icon-wrap {
          margin-bottom: 0.75rem;
        }

        .app-status-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #171717;
          margin-bottom: 0.35rem;
        }

        .app-status-subtitle {
          color: #64748B;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .app-status-card {
          background: #FAF8F2;
          border: 1px solid #E8E1D5;
          border-radius: 14px;
          padding: 1.25rem;
          text-align: left;
        }

        .app-status-card.status-approved {
          border-color: #A7F3D0;
          background: #F0FDF4;
        }

        .app-status-card.status-rejected {
          border-color: #FECACA;
          background: #FEF2F2;
        }

        .app-status-card.status-waitlisted {
          border-color: #DDD6FE;
          background: #F5F3FF;
        }

        .app-status-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .app-status-role-title {
          font-weight: 700;
          font-size: 1.05rem;
          color: #171717;
        }

        .app-status-pill {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          letter-spacing: 0.03em;
        }

        .pill-pending {
          background: #FEF3C7;
          color: #92400E;
        }

        .pill-approved {
          background: #DCFCE7;
          color: #15803D;
        }

        .pill-rejected {
          background: #FEE2E2;
          color: #B91C1C;
        }

        .pill-waitlisted {
          background: #EDE9FE;
          color: #6D28D9;
        }

        .app-status-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-top: 1px solid #E8E1D5;
          border-bottom: 1px solid #E8E1D5;
          margin-bottom: 0.85rem;
        }

        .app-status-detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .app-status-detail-item .detail-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
        }

        .app-status-detail-item .detail-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: #171717;
        }

        .app-status-message {
          font-size: 0.825rem;
          color: #334155;
          background: rgba(255, 255, 255, 0.85);
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          line-height: 1.5;
        }

        .app-status-message p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
