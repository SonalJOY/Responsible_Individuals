import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  useVolunteerOpportunities, 
  useVolunteerInterests, 
  useVolunteerProfile, 
  useVolunteerApplication 
} from '../../hooks/useVolunteer';
import { 
  HeartHandshake, MapPin, Clock, CheckCircle2, 
  Send, Filter, X, AlertCircle, LogIn, 
  UserCheck, RotateCcw, Check
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import InteractiveDotGrid from '../../components/common/InteractiveDotGrid';
import VolunteerPhotoStrip from '../../components/common/VolunteerPhotoStrip';
import WhyVolunteerSection from '../../components/common/WhyVolunteerSection';
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

  const openApplyModal = (opp) => {
    setSelectedOpp(opp);
    resetApplicationState();
    setLoginError('');
    setFieldErrors({});
    setTouched({});
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

    // Revalidate touched fields or password fields live
    if (touched[name] || name === 'password' || name === 'confirm_password' || name === 'phone' || name === 'email') {
      const err = validateSingleField(name, value, updated);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));

      // If password is changed and confirm_password was entered or touched, re-evaluate confirm_password
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
      // Switches seamlessly into authenticated application mode
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

    // Determine fields to validate based on auth state
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

    // If validation fails, focus the first invalid field and do not call API
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
        // Authenticated volunteer flow
        await applyAsAuthenticated({
          opportunity_id: selectedOpp.id,
          statement_of_purpose: formData.statement_of_purpose.trim(),
          experience: formData.experience.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          skills: formData.skills.trim(),
          availability: formData.availability,
        });
      } else {
        // Visitor registration + application flow
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

        await registerAndApply(regPayload, applyPayload, registerVolunteer);
      }
    } catch {
      // Error is cleanly populated in custom hook and displayed in error banner
    }
  };

  // Distinct locations & commitment options extracted for filter dropdowns
  const uniqueLocations = Array.from(new Set(opportunities.map((o) => o.location).filter(Boolean)));

  return (
    <div className="volunteer-page-root">
      {/* Hero Header */}
      <section className="volunteer-hero">
        <InteractiveDotGrid
          spacing={34}
          interactionRadius={140}
          repelForce={16}
          dotRadius={1.4}
          dotOpacity={0.26}
          connectionOpacity={0.20}
          dotColor="#34D399"
          accentColor="#A78BFA"
          connectionColor="#A78BFA"
        />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="section-badge">Get Involved</span>
          <h1 className="volunteer-hero-title">Become a Responsible Individual</h1>
          <p className="volunteer-hero-subtitle">
            Give your time, skills, and energy to revive community water bodies, mentor rural students in robotics, and drive zero-waste neighborhoods.
          </p>
        </div>
      </section>

      {/* Volunteer Stories Animated Photo Strip (Phase 3B-UI) */}
      <VolunteerPhotoStrip 
        onExploreRoles={() => {
          const el = document.getElementById('opportunities');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Why Volunteer Section (Phase 3B-UI) */}
      <WhyVolunteerSection 
        onExploreRoles={() => {
          const el = document.getElementById('opportunities');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Opportunities Section */}
      <section className="section bg-light-alt" id="opportunities">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Open Calls</span>
            <h2 className="section-title">Active Volunteer Roles</h2>
            <p className="section-subtitle">
              Choose an initiative matching your schedule and skills. All roles include comprehensive on-ground orientation.
            </p>
          </div>

          {/* Interactive Backend Filter Bar */}
          <div className="opp-filters-bar">
            <div className="filters-label">
              <Filter size={16} />
              <span>Filter Opportunities:</span>
            </div>

            <div className="filters-inputs-wrap">
              {/* Location Filter */}
              <div className="filter-item">
                <select
                  className="filter-select"
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
              <div className="filter-item">
                <select
                  className="filter-select"
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
                  onClick={clearFilters} 
                  className="filter-reset-btn"
                  title="Clear all filters"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Opportunities Cards Grid / State Handling */}
          {oppsLoading ? (
            <div className="opps-loading-state">
              <div className="spinner-indicator" />
              <p>Loading available volunteer roles...</p>
            </div>
          ) : oppsError ? (
            <div className="opps-error-state">
              <AlertCircle size={32} color="#EF4444" />
              <h3>Failed to Load Opportunities</h3>
              <p>{oppsError}</p>
              <button onClick={() => refetchOpps()} className="btn btn-outline btn-sm">
                Try Again
              </button>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="opps-empty-state">
              <HeartHandshake size={48} color="#94A3B8" />
              <h3>No Opportunities Match Your Criteria</h3>
              <p>Try resetting the filters or check back soon as new seasonal initiatives launch regularly.</p>
              <button onClick={clearFilters} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                View All Roles
              </button>
            </div>
          ) : (
            <div className="opps-grid">
              {opportunities.map((opp) => {
                const spotsLeft = opp.spots_available - opp.spots_filled;
                const isClosed = opp.status === 'CLOSED' || opp.status === 'FILLED' || spotsLeft <= 0;

                return (
                  <div key={opp.id} className="card opp-card">
                    <div className="opp-card-top">
                      <span className="opp-area-badge">
                        {opp.focus_area_name || 'Community Impact'}
                      </span>
                      <span className={`opp-spots-badge ${isClosed ? 'filled' : ''}`}>
                        {isClosed ? 'Role Filled' : `${spotsLeft} spots remaining`}
                      </span>
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
                      disabled={isClosed}
                      className={`btn ${isClosed ? 'btn-secondary' : 'btn-primary'} opp-apply-btn`}
                    >
                      <span>{isClosed ? 'Role Filled' : 'Apply for this Role'}</span>
                      {!isClosed && <Send size={15} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Application Wizard Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={closeApplyModal}
        title={
          successApplication 
            ? 'Application Submitted' 
            : `Volunteer Application: ${selectedOpp?.title || ''}`
        }
      >
        {successApplication ? (
          /* Confirmation State */
          <div className="application-success-box">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} color="#10B981" />
            </div>
            <h3>Thank You, {formData.first_name || user?.first_name || 'Volunteer'}!</h3>
            <div className="success-status-pill">Status: PENDING REVIEW</div>
            <p className="success-desc">
              Your application for <strong>{selectedOpp?.title}</strong> has been registered in the system. 
              Our volunteer coordination team will review your profile alignment and reach out with orientation schedules within 48 hours.
            </p>
            <button 
              onClick={closeApplyModal} 
              className="btn btn-primary" 
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Done & Return to Opportunities
            </button>
          </div>
        ) : (
          /* Application Form Flow */
          <div className="modal-form-flow">
            {/* Error Banner */}
            {submitError && (
              <div className="modal-error-alert" role="alert">
                <AlertCircle size={18} className="error-icon" />
                <div className="error-text-content">
                  <strong>Submission Issue:</strong>
                  <span>{submitError}</span>
                </div>
                <button 
                  onClick={() => resetApplicationState()} 
                  className="error-dismiss-btn"
                  aria-label="Dismiss error"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* User Authentication Status Banner */}
            {user ? (
              <div className="authenticated-user-banner">
                <UserCheck size={18} color="#10B981" />
                <div>
                  <span>Applying as: <strong>{user.get_full_name || user.first_name || user.email}</strong></span>
                  <span className="auth-email-hint">{user.email}</span>
                </div>
              </div>
            ) : (
              /* Unauthenticated Visitor Tabs */
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

            {/* Visitor Quick Login Tab */}
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
                <button type="submit" disabled={loginLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <LogIn size={15} />
                  <span>{loginLoading ? 'Authenticating...' : 'Sign In & Continue Application'}</span>
                </button>
              </form>
            ) : (
              /* Application Form (For both Authenticated and Registering Volunteers) */
              <form onSubmit={handleApplicationSubmit} className="volunteer-form" noValidate>
                {/* Registration fields if user is not authenticated */}
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

                    {/* Compact Password Strength & Requirement Checklist */}
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

                {/* Common Profile & Logistics Fields */}
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
                    placeholder="e.g. Teaching, Water Testing, Event Management, Photography"
                    value={formData.skills}
                    onChange={(e) => handleFieldChange('skills', e.target.value)}
                  />
                </div>

                {/* Dynamic Interest Chips (If unauthenticated registration) */}
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

                {/* Application Statement */}
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

      {/* Scoped CSS Styles */}
      <style>{`
        .volunteer-hero {
          position: relative;
          overflow: hidden;
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
        .opp-filters-bar {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .filters-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--slate-700);
        }
        .filters-inputs-wrap {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
        }
        .filter-select {
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          font-size: 0.85rem;
          color: var(--slate-800);
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }
        .filter-select:focus {
          border-color: var(--primary-600);
        }
        .filter-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-md);
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--slate-700);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .filter-reset-btn:hover {
          background: #E2E8F0;
        }
        .opps-loading-state,
        .opps-empty-state,
        .opps-error-state {
          text-align: center;
          padding: 4rem 2rem;
          background: #FFFFFF;
          border: 1px dashed var(--border-subtle);
          border-radius: var(--radius-xl);
        }
        .spinner-indicator {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(16, 185, 129, 0.2);
          border-top-color: #10B981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
        .opp-spots-badge.filled {
          color: #DC2626;
          background: #FEF2F2;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
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
        .modal-error-alert {
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #991B1B;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
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
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
          color: #065F46;
        }
        .auth-email-hint {
          display: block;
          font-size: 0.75rem;
          color: #047857;
        }
        .auth-mode-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: #F1F5F9;
          padding: 0.25rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.25rem;
        }
        .auth-tab-btn {
          padding: 0.5rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--slate-600);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .auth-tab-btn.active {
          background: #FFFFFF;
          color: var(--slate-900);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
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
          border-radius: var(--radius-pill);
          border: 1px solid var(--border-subtle);
          background: #F8FAFC;
          color: var(--slate-700);
          font-size: 0.775rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .interest-chip:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }
        .interest-chip.active {
          background: #ECFDF5;
          border-color: #10B981;
          color: #065F46;
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
          border-radius: var(--radius-pill);
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }
        .success-desc {
          color: var(--text-muted);
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
          background: #F8FAFC;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }
        .pwd-strength-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.775rem;
          margin-bottom: 0.35rem;
        }
        .pwd-strength-label {
          color: var(--slate-600);
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
          border-radius: var(--radius-pill);
          overflow: hidden;
        }
        .pwd-strength-bar {
          height: 100%;
          transition: width 0.25s ease, background-color 0.25s ease;
          border-radius: var(--radius-pill);
        }
        .pwd-requirements-card {
          background: #F8FAFC;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
        }
        .pwd-req-title {
          font-size: 0.775rem;
          font-weight: 700;
          color: var(--slate-700);
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
          color: var(--slate-500);
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
      `}</style>
    </div>
  );
}
