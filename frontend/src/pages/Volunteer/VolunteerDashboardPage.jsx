import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { volunteerService } from '../../services/api';
import GlobalPreloader from '../../components/common/GlobalPreloader';
import {
  HeartHandshake,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  ArrowRight,
  LogOut,
  FolderKanban,
  Sparkles,
  Info,
  LayoutDashboard,
  Compass,
  User,
  ShieldCheck,
  Award,
  Calendar,
  Lock,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import './VolunteerDashboardPage.css';

export default function VolunteerDashboardPage() {
  const { user, logout, isAdmin, setAuthUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tab: pathTab } = useParams();
  const location = useLocation();

  // Active tab state: 'overview' | 'opportunities' | 'applications' | 'profile'
  const validTabs = ['overview', 'opportunities', 'applications', 'profile'];
  const rawTab = (pathTab && validTabs.includes(pathTab.toLowerCase()))
    ? pathTab.toLowerCase()
    : searchParams.get('tab');
  const initialTab = (rawTab && validTabs.includes(rawTab.toLowerCase()))
    ? rawTab.toLowerCase()
    : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const oppSlug = searchParams.get('opportunity') || sessionStorage.getItem('ri_target_opportunity') || '';

  // Opportunity hand-off state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [oppLoading, setOppLoading] = useState(Boolean(oppSlug));
  const [oppError, setOppError] = useState('');

  // Applications state
  const [myApplications, setMyApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [availableInterests, setAvailableInterests] = useState([]);
  
  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    state: '',
    occupation: '',
    skills: '',
    availability: 'Weekends',
    bio: '',
    interests: [],
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Sync tab change with URL query parameter without full reload
  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
    setSaveSuccess('');
    setSaveError('');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabName);
    setSearchParams(newParams, { replace: true });
  };

  // Validate targeted opportunity if query param exists
  useEffect(() => {
    let isMounted = true;

    async function validateTargetOpportunity() {
      if (!oppSlug) {
        setOppLoading(false);
        return;
      }

      setOppLoading(true);
      setOppError('');

      try {
        const opps = await volunteerService.getOpportunities();
        const list = Array.isArray(opps) ? opps : opps?.results || [];
        const match = list.find(
          (o) => String(o.slug) === String(oppSlug) || String(o.id) === String(oppSlug)
        );

        if (!isMounted) return;

        if (match) {
          setSelectedOpportunity(match);
          if (match.status !== 'OPEN' || (match.spots_available - match.spots_filled <= 0)) {
            setOppError(`The role "${match.title}" has reached capacity or is currently closed.`);
          }
        } else {
          setOppError(`We could not locate an active volunteer opportunity matching "${oppSlug}".`);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching target opportunity:', err);
          setOppError('Unable to load the selected opportunity. You can still browse other open roles.');
        }
      } finally {
        if (isMounted) {
          setOppLoading(false);
        }
      }
    }

    validateTargetOpportunity();

    return () => {
      isMounted = false;
    };
  }, [oppSlug]);

  // Load volunteer's existing applications
  useEffect(() => {
    let isMounted = true;

    async function loadApplications() {
      try {
        const data = await volunteerService.getMyApplications();
        if (isMounted) {
          setMyApplications(Array.isArray(data) ? data : data?.results || []);
        }
      } catch (err) {
        console.warn('Could not retrieve volunteer applications:', err);
      } finally {
        if (isMounted) {
          setAppsLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load volunteer profile & interests list
  useEffect(() => {
    let isMounted = true;

    async function loadProfileAndInterests() {
      try {
        const [profData, interestsData] = await Promise.all([
          volunteerService.getMyProfile().catch(() => null),
          volunteerService.getInterests().catch(() => []),
        ]);

        if (!isMounted) return;

        if (interestsData) {
          const list = Array.isArray(interestsData) ? interestsData : interestsData?.results || [];
          setAvailableInterests(list);
        }

        if (profData) {
          setProfile(profData);
          setProfileForm({
            full_name: profData.full_name || user?.first_name || '',
            phone: profData.phone || user?.phone || '',
            city: profData.city || '',
            state: profData.state || '',
            occupation: profData.occupation || '',
            skills: profData.skills || '',
            availability: profData.availability || 'Weekends',
            bio: profData.bio || '',
            interests: Array.isArray(profData.interests) ? profData.interests : [],
          });
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    }

    loadProfileAndInterests();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleInterestToggle = (id) => {
    setProfileForm((prev) => {
      const exists = prev.interests.some((item) => String(item) === String(id));
      const updated = exists
        ? prev.interests.filter((item) => String(item) !== String(id))
        : [...prev.interests, id];
      return { ...prev, interests: updated };
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');

    if (profileForm.full_name.trim().length < 2) {
      setSaveError('Please enter your full name (at least 2 characters).');
      return;
    }

    // Phone validation: Indian mobile format
    const cleanPhoneDigits = profileForm.phone.replace(/\D/g, '');
    let coreDigits = cleanPhoneDigits;
    if (profileForm.phone.startsWith('+91') && cleanPhoneDigits.startsWith('91')) {
      coreDigits = cleanPhoneDigits.slice(2);
    } else if (cleanPhoneDigits.length === 12 && cleanPhoneDigits.startsWith('91')) {
      coreDigits = cleanPhoneDigits.slice(2);
    }
    if (coreDigits.length > 0 && (coreDigits.length !== 10 || !/^[6-9]/.test(coreDigits))) {
      setSaveError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        full_name: profileForm.full_name.trim(),
        phone: coreDigits ? `+91${coreDigits}` : profileForm.phone.trim(),
        city: profileForm.city.trim(),
        state: profileForm.state.trim(),
        occupation: profileForm.occupation.trim(),
        skills: profileForm.skills.trim(),
        availability: profileForm.availability.trim(),
        bio: profileForm.bio.trim(),
        interests: profileForm.interests,
      };

      const updated = await volunteerService.updateMyProfile(payload);
      setProfile(updated);
      setSaveSuccess('Your profile details have been updated successfully.');

      // Sync display name with auth state
      if (setAuthUser && user) {
        const parts = profileForm.full_name.trim().split(' ');
        setAuthUser({
          ...user,
          first_name: parts[0] || user.first_name,
          last_name: parts.slice(1).join(' ') || user.last_name,
        });
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      const detail = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to update profile. Please verify your information and try again.';
      setSaveError(detail);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResetProfileForm = () => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        state: profile.state || '',
        occupation: profile.occupation || '',
        skills: profile.skills || '',
        availability: profile.availability || 'Weekends',
        bio: profile.bio || '',
        interests: Array.isArray(profile.interests) ? profile.interests : [],
      });
      setSaveSuccess('');
      setSaveError('');
    }
  };

  const isVerifiedVolunteer = user?.role === 'VOLUNTEER' || profile?.approval_status === 'APPROVED';
  const roleDisplay = isAdmin
    ? 'Super Admin'
    : isVerifiedVolunteer
      ? 'Verified Volunteer'
      : 'Applicant Account (Pending Review)';

  const roleClass = isAdmin ? 'admin' : isVerifiedVolunteer ? 'volunteer' : 'pending';

  // Handle loading state gracefully without prematurely redirecting
  if (!isAdmin && profileLoading) {
    return (
      <GlobalPreloader 
        isLoading={true} 
        isExiting={false} 
        message="Verifying volunteer dashboard access..." 
      />
    );
  }

  // If not admin and volunteer profile is not approved (PENDING, REJECTED, or missing), redirect to Applicant Portal
  if (!isAdmin && (!profile || profile.approval_status !== 'APPROVED')) {
    const nextQuery = location.search;
    return <Navigate to={`/volunteer/applicant-portal${nextQuery}`} replace />;
  }

  return (
    <div className="volunteer-dashboard-page">
      <div className="dashboard-container">
        
        {/* Header / Profile Bar */}
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="dashboard-avatar-badge">
              <HeartHandshake size={28} />
            </div>
            <div className="dashboard-title-wrap">
              <h1>Welcome, {user?.first_name || profile?.full_name || 'Volunteer'}</h1>
              <div className="dashboard-user-role-row">
                <span className={`role-tag ${roleClass}`}>
                  {isVerifiedVolunteer ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  <span>{roleDisplay}</span>
                </span>
                <span className="user-email-subtitle">{user?.email || profile?.email}</span>
                <span className="verification-pill">
                  <ShieldCheck size={12} color="#10B981" />
                  <span>Email Verified</span>
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link to="/volunteer" className="btn-dashboard-action btn-dashboard-outline">
              <span>Public Opportunities</span>
              <ExternalLink size={14} />
            </Link>
            <button onClick={handleSignOut} className="btn-dashboard-action btn-dashboard-outline" title="Sign Out">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* 4-Tab Navigation Bar */}
        <nav className="dashboard-tabs-bar" role="tablist" aria-label="Volunteer Dashboard Sections">
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`dashboard-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('overview')}
          >
            <LayoutDashboard size={17} />
            <span>Overview</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'opportunities'}
            className={`dashboard-tab-btn ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('opportunities')}
          >
            <Compass size={17} />
            <span>Opportunities</span>
            {selectedOpportunity && <span className="tab-dot-badge" title="Selected Role" />}
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'applications'}
            className={`dashboard-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('applications')}
          >
            <FileText size={17} />
            <span>My Applications</span>
            {myApplications.length > 0 && (
              <span className="tab-count-pill">{myApplications.length}</span>
            )}
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'profile'}
            className={`dashboard-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('profile')}
          >
            <User size={17} />
            <span>My Profile</span>
          </button>
        </nav>

        {/* =========================================================================
            TAB 1: OVERVIEW TAB
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="tab-panel-container">
            {/* Quick Stats Grid */}
            <div className="stats-metric-grid">
              <div className="stat-metric-card">
                <div className="stat-metric-header">
                  <div className="stat-metric-icon icon-blue">
                    <FileText size={20} />
                  </div>
                  <span className="stat-metric-tag">Submitted</span>
                </div>
                <div className="stat-metric-value">{myApplications.length}</div>
                <div className="stat-metric-title">Volunteer Applications</div>
                <div className="stat-metric-subtitle">
                  {myApplications.length === 0 ? 'No roles submitted yet' : `${myApplications.length} active submission(s)`}
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-metric-header">
                  <div className="stat-metric-icon icon-emerald">
                    <Clock size={20} />
                  </div>
                  <span className="stat-metric-tag">Verified</span>
                </div>
                <div className="stat-metric-value">
                  {parseFloat(profile?.total_hours_contributed || 0).toFixed(1)} <span className="stat-unit">hrs</span>
                </div>
                <div className="stat-metric-title">Contribution Hours</div>
                <div className="stat-metric-subtitle">
                  Logged upon verified drive completion
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-metric-header">
                  <div className="stat-metric-icon icon-saffron">
                    <Award size={20} />
                  </div>
                  <span className="stat-metric-tag">Milestones</span>
                </div>
                <div className="stat-metric-value">{profile?.certificates_count || 0}</div>
                <div className="stat-metric-title">Certificates Earned</div>
                <div className="stat-metric-subtitle">
                  Awarded for distinguished field service
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-metric-header">
                  <div className="stat-metric-icon icon-purple">
                    <UserCheck size={20} />
                  </div>
                  <span className="stat-metric-tag">Approval</span>
                </div>
                <div className="stat-metric-value" style={{ fontSize: '1.35rem', marginTop: '0.35rem' }}>
                  {profile?.approval_status === 'APPROVED' ? 'Approved & Active' : 'Pending Review'}
                </div>
                <div className="stat-metric-title">Volunteer Standing</div>
                <div className="stat-metric-subtitle">
                  Reviewed by NGO program coordinators
                </div>
              </div>
            </div>

            {/* Opportunity Hand-off Banner (if coming from public role card) */}
            {oppLoading ? (
              <div className="opportunity-handoff-card">
                <p>Validating selected opportunity role...</p>
              </div>
            ) : oppError ? (
              <div className="handoff-alert-warning">
                <AlertCircle size={20} />
                <div>
                  <strong>Opportunity Notice:</strong> {oppError}
                </div>
              </div>
            ) : selectedOpportunity ? (
              <section className="opportunity-handoff-card" aria-label="Selected Role">
                <div className="handoff-badge">
                  <Sparkles size={14} />
                  <span>Opportunity Context Preserved</span>
                </div>
                <h2 className="handoff-title">{selectedOpportunity.title}</h2>
                
                <div className="handoff-meta-row">
                  <div className="handoff-meta-item">
                    <MapPin size={15} color="var(--primary-saffron, #F97316)" />
                    <span>{selectedOpportunity.location}</span>
                  </div>
                  <div className="handoff-meta-item">
                    <Clock size={15} color="#0EA5E9" />
                    <span>{selectedOpportunity.commitment}</span>
                  </div>
                  <div className="handoff-meta-item">
                    <CheckCircle2 size={15} color="#34D399" />
                    <span>{selectedOpportunity.spots_available - selectedOpportunity.spots_filled} openings remaining</span>
                  </div>
                </div>

                <p className="handoff-description">
                  {selectedOpportunity.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleTabSwitch('opportunities')}
                    className="btn-dashboard-action btn-dashboard-primary"
                  >
                    <span>View Role Details & Apply Scaffold</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={() => handleTabSwitch('profile')}
                    className="btn-dashboard-action btn-dashboard-outline"
                  >
                    <span>Complete Volunteer Profile</span>
                  </button>
                </div>
              </section>
            ) : null}

            {/* Overview Panels Grid */}
            <div className="dashboard-grid">
              
              {/* Profile Summary Card */}
              <div className="dashboard-panel-card">
                <div className="panel-card-header">
                  <div className="panel-card-icon">
                    <User size={20} />
                  </div>
                  <h2>Volunteer Profile Summary</h2>
                </div>
                
                <div className="panel-card-body">
                  <div className="summary-field-row">
                    <span className="summary-field-label">Full Name</span>
                    <span className="summary-field-value">{profile?.full_name || user?.first_name || 'Not provided'}</span>
                  </div>
                  <div className="summary-field-row">
                    <span className="summary-field-label">Location</span>
                    <span className="summary-field-value">{profile?.city ? `${profile.city}, ${profile.state || 'Karnataka'}` : 'Not provided'}</span>
                  </div>
                  <div className="summary-field-row">
                    <span className="summary-field-label">Availability</span>
                    <span className="summary-field-value">{profile?.availability || 'Weekends'}</span>
                  </div>
                  <div className="summary-field-row">
                    <span className="summary-field-label">Skills</span>
                    <span className="summary-field-value">{profile?.skills || 'Community Volunteering'}</span>
                  </div>
                  <div className="summary-field-row" style={{ borderBottom: 'none' }}>
                    <span className="summary-field-label">Causes & Interests</span>
                    <div className="interest-chips-wrap">
                      {profile?.interests_detail && profile.interests_detail.length > 0 ? (
                        profile.interests_detail.map((item) => (
                          <span key={item.id} className="interest-chip-sm">
                            {item.name}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>No causes selected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <button
                    onClick={() => handleTabSwitch('profile')}
                    className="btn-dashboard-action btn-dashboard-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Edit Profile Details</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Recent Applications Card */}
              <div className="dashboard-panel-card">
                <div className="panel-card-header">
                  <div className="panel-card-icon">
                    <FileText size={20} />
                  </div>
                  <h2>Recent Applications</h2>
                </div>
                
                <div className="panel-card-body">
                  {appsLoading ? (
                    <p style={{ color: '#94A3B8' }}>Loading application history...</p>
                  ) : myApplications.length === 0 ? (
                    <div className="dashboard-empty-panel">
                      <p>You have not submitted any volunteer applications yet.</p>
                      <button
                        onClick={() => handleTabSwitch('opportunities')}
                        className="btn-dashboard-action btn-dashboard-primary"
                        style={{ marginTop: '0.75rem' }}
                      >
                        <span>Explore Roles</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {myApplications.slice(0, 3).map((app) => (
                        <div key={app.id} className="app-list-item">
                          <div>
                            <div className="app-list-title">{app.opportunity_title || 'Volunteer Role'}</div>
                            <div className="app-list-date">Submitted: {new Date(app.created_at).toLocaleDateString()}</div>
                          </div>
                          <span className={`role-tag ${app.status.toLowerCase()}`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {myApplications.length > 0 && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <button
                      onClick={() => handleTabSwitch('applications')}
                      className="btn-dashboard-action btn-dashboard-outline"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>View All Applications ({myApplications.length})</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Responsible Individuals Initiatives */}
              <div className="dashboard-panel-card">
                <div className="panel-card-header">
                  <div className="panel-card-icon">
                    <FolderKanban size={20} />
                  </div>
                  <h2>Active Field Initiatives</h2>
                </div>

                <div className="panel-card-body">
                  <p>
                    Responsible Individuals organizes community-driven environmental rejuvenation,
                    rural STEM workshops, and urban lake monitoring sessions across Bengaluru and Karnataka.
                  </p>
                  <div className="initiative-focus-list">
                    <div className="initiative-pill">Freshwater & Lake Revival</div>
                    <div className="initiative-pill">Rural STEM Lab Building</div>
                    <div className="initiative-pill">Urban Forest Afforestation</div>
                    <div className="initiative-pill">Zero-Waste Neighborhood Drives</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <Link
                    to="/projects"
                    className="btn-dashboard-action btn-dashboard-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Browse All NGO Projects</span>
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: OPPORTUNITIES SCAFFOLD
        ========================================================================= */}
        {activeTab === 'opportunities' && (
          <div className="tab-panel-container">
            <div className="tab-header-row">
              <div>
                <h2>Volunteer Opportunities</h2>
                <p className="tab-header-subtitle">
                  Browse and select grassroots volunteer drives across environmental and educational causes.
                </p>
              </div>
              <Link to="/volunteer#opportunities" className="btn-dashboard-action btn-dashboard-outline">
                <span>View Full Public Catalog</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            {selectedOpportunity ? (
              <div className="opportunity-full-card">
                <div className="opp-card-badge-row">
                  <span className="opp-focus-pill">{selectedOpportunity.focus_area_name || 'Community Impact'}</span>
                  <span className="opp-status-pill">{selectedOpportunity.status}</span>
                </div>
                
                <h3 className="opp-card-title">{selectedOpportunity.title}</h3>
                
                <div className="opp-card-meta-bar">
                  <div className="meta-bar-item">
                    <MapPin size={16} color="var(--primary-saffron, #F97316)" />
                    <span>{selectedOpportunity.location}</span>
                  </div>
                  <div className="meta-bar-item">
                    <Clock size={16} color="#0EA5E9" />
                    <span>{selectedOpportunity.commitment}</span>
                  </div>
                  <div className="meta-bar-item">
                    <CheckCircle2 size={16} color="#10B981" />
                    <span>{selectedOpportunity.spots_available - selectedOpportunity.spots_filled} of {selectedOpportunity.spots_available} spots open</span>
                  </div>
                </div>

                <div className="opp-card-section">
                  <h4>Role Overview</h4>
                  <p>{selectedOpportunity.description}</p>
                </div>

                {selectedOpportunity.responsibilities && (
                  <div className="opp-card-section">
                    <h4>Key Responsibilities</h4>
                    <p>{selectedOpportunity.responsibilities}</p>
                  </div>
                )}

                {selectedOpportunity.requirements && (
                  <div className="opp-card-section">
                    <h4>Qualifications & Requirements</h4>
                    <p>{selectedOpportunity.requirements}</p>
                  </div>
                )}

                <div className="opp-phase-notice">
                  <Info size={18} color="var(--primary-saffron, #F97316)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Phase 5 & 6 Handoff:</strong> Complete in-dashboard application submission,
                    statement of purpose entry, and duplicate lock guards will be activated in Phase 5 and Phase 6.
                    Your selected opportunity context has been saved.
                  </div>
                </div>
              </div>
            ) : (
              <div className="dashboard-empty-state-large">
                <Compass size={48} color="var(--primary-saffron, #F97316)" />
                <h3>Explore Open Community Roles</h3>
                <p>
                  No specific role was selected on the public page. You can review all active drives
                  and select a project that matches your skills and availability.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Link to="/volunteer#opportunities" className="btn-dashboard-action btn-dashboard-primary">
                    <span>Browse Public Opportunities</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: MY APPLICATIONS TAB
        ========================================================================= */}
        {activeTab === 'applications' && (
          <div className="tab-panel-container">
            <div className="tab-header-row">
              <div>
                <h2>My Volunteer Applications</h2>
                <p className="tab-header-subtitle">
                  Track real-time review status, coordinator feedback, and role confirmations.
                </p>
              </div>
            </div>

            {appsLoading ? (
              <div className="dashboard-empty-panel" style={{ padding: '3rem' }}>
                <p>Loading application history...</p>
              </div>
            ) : myApplications.length === 0 ? (
              <div className="dashboard-empty-state-large">
                <FileText size={48} color="#94A3B8" />
                <h3>No Applications Submitted Yet</h3>
                <p>
                  You haven't submitted any volunteer applications yet. Explore our open initiatives
                  and select a role to get started with Responsible Individuals.
                </p>
                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    onClick={() => handleTabSwitch('opportunities')}
                    className="btn-dashboard-action btn-dashboard-primary"
                  >
                    <span>Browse Volunteer Roles</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="applications-full-list">
                {myApplications.map((app) => (
                  <div key={app.id} className="application-detail-card">
                    <div className="app-detail-header">
                      <div>
                        <span className="app-focus-tag">{app.focus_area_name || 'Community Initiative'}</span>
                        <h3 className="app-detail-title">{app.opportunity_title || 'Volunteer Role'}</h3>
                      </div>
                      <span className={`role-tag ${app.status.toLowerCase()}`}>
                        {app.status === 'APPROVED' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        <span>{app.status}</span>
                      </span>
                    </div>

                    <div className="app-detail-meta-row">
                      {app.opportunity_location && (
                        <div className="app-meta-item">
                          <MapPin size={14} color="var(--primary-saffron, #F97316)" />
                          <span>{app.opportunity_location}</span>
                        </div>
                      )}
                      {app.opportunity_commitment && (
                        <div className="app-meta-item">
                          <Clock size={14} color="#0EA5E9" />
                          <span>{app.opportunity_commitment}</span>
                        </div>
                      )}
                      <div className="app-meta-item">
                        <Calendar size={14} color="#CBD5E1" />
                        <span>Submitted on {new Date(app.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {app.statement_of_purpose && (
                      <div className="app-detail-sop-box">
                        <span className="sop-box-label">Statement of Purpose</span>
                        <p>{app.statement_of_purpose}</p>
                      </div>
                    )}

                    {app.review_notes && (
                      <div className="app-review-notes-box">
                        <span className="notes-box-label">Coordinator Feedback:</span>
                        <p>{app.review_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: MY PROFILE (SELF-SERVICE)
        ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="tab-panel-container">
            <div className="tab-header-row">
              <div>
                <h2>Volunteer Profile Details</h2>
                <p className="tab-header-subtitle">
                  Update your contact details, skills, and cause interests for drive coordinators.
                </p>
              </div>
            </div>

            {profileLoading ? (
              <div className="dashboard-empty-panel" style={{ padding: '3rem' }}>
                <p>Loading profile information...</p>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="profile-edit-form">
                
                {saveSuccess && (
                  <div className="profile-alert success">
                    <CheckCircle2 size={18} />
                    <span>{saveSuccess}</span>
                  </div>
                )}

                {saveError && (
                  <div className="profile-alert error">
                    <AlertCircle size={18} />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="form-sections-grid">
                  
                  {/* Basic Personal Info */}
                  <div className="form-card-section">
                    <h3>Personal Information</h3>

                    <div className="form-field-group">
                      <label htmlFor="prof-name">Full Name *</label>
                      <input
                        id="prof-name"
                        type="text"
                        className="profile-text-input"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="prof-email">Email Address</label>
                      <div className="readonly-input-wrapper">
                        <input
                          id="prof-email"
                          type="email"
                          className="profile-text-input readonly"
                          value={profile?.email || user?.email || ''}
                          readOnly
                          disabled
                        />
                        <Lock size={15} className="readonly-lock-icon" />
                      </div>
                      <span className="field-hint">Email is linked to your authentication account and cannot be modified.</span>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="prof-phone">Phone Number (10 Digits)</label>
                      <input
                        id="prof-phone"
                        type="tel"
                        className="profile-text-input"
                        placeholder="+91 98765 43210"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                      <span className="field-hint">Indian mobile number starting with 6, 7, 8, or 9.</span>
                    </div>

                    <div className="form-row-2col">
                      <div className="form-field-group">
                        <label htmlFor="prof-city">City</label>
                        <input
                          id="prof-city"
                          type="text"
                          className="profile-text-input"
                          placeholder="Bengaluru"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        />
                      </div>
                      <div className="form-field-group">
                        <label htmlFor="prof-state">State</label>
                        <input
                          id="prof-state"
                          type="text"
                          className="profile-text-input"
                          placeholder="Karnataka"
                          value={profileForm.state}
                          onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="prof-occupation">Occupation / Profession</label>
                      <input
                        id="prof-occupation"
                        type="text"
                        className="profile-text-input"
                        placeholder="Environmental Scientist, Student, Engineer..."
                        value={profileForm.occupation}
                        onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Skills, Availability & Causes */}
                  <div className="form-card-section">
                    <h3>Volunteering Preferences</h3>

                    <div className="form-field-group">
                      <label htmlFor="prof-avail">General Availability</label>
                      <select
                        id="prof-avail"
                        className="profile-select-input"
                        value={profileForm.availability}
                        onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                      >
                        <option value="Weekends">Weekends</option>
                        <option value="Weekdays">Weekdays</option>
                        <option value="Evenings">Evenings</option>
                        <option value="Flexible">Flexible / On-Demand</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="prof-skills">Skills & Expertise</label>
                      <input
                        id="prof-skills"
                        type="text"
                        className="profile-text-input"
                        placeholder="e.g. Water Quality Testing, Teaching, Social Media, GIS"
                        value={profileForm.skills}
                        onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                      />
                      <span className="field-hint">Comma-separated skills you can offer during field campaigns.</span>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="prof-bio">Short Bio / Motivation</label>
                      <textarea
                        id="prof-bio"
                        className="profile-textarea-input"
                        rows={3}
                        placeholder="Tell us about your background and what inspires you to volunteer..."
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Causes of Interest</label>
                      <div className="interests-selection-grid">
                        {availableInterests.map((interest) => {
                          const isSelected = profileForm.interests.some(
                            (id) => String(id) === String(interest.id) || String(id) === String(interest.slug)
                          );
                          return (
                            <button
                              key={interest.id}
                              type="button"
                              className={`interest-select-chip ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleInterestToggle(interest.id)}
                            >
                              {isSelected ? <CheckCircle2 size={14} /> : null}
                              <span>{interest.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                <div className="profile-form-footer">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="btn-dashboard-action btn-dashboard-primary"
                  >
                    <Save size={16} />
                    <span>{saveLoading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetProfileForm}
                    disabled={saveLoading}
                    className="btn-dashboard-action btn-dashboard-outline"
                  >
                    <RotateCcw size={16} />
                    <span>Reset</span>
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
