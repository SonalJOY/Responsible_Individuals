import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { volunteerService, authService } from '../../services/api';
import { buildAuthParams, sanitizeInternalRedirect } from '../../utils/navigation';
import {
  HeartHandshake,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Sparkles
} from 'lucide-react';
import './VolunteerPortalPage.css';

export default function VolunteerPortalPage() {
  const { user, login, register, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oppSlug = searchParams.get('opportunity') || sessionStorage.getItem('ri_target_opportunity') || '';
  const candidateRedirect = searchParams.get('redirect');
  const safeRedirect = sanitizeInternalRedirect(candidateRedirect, '/volunteer/dashboard');

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register' | 'forgot'
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [oppWarning, setOppWarning] = useState('');

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Forgot Password Form State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Cache opportunity slug in session storage for resilient multi-step OTP transitions
  useEffect(() => {
    if (oppSlug) {
      sessionStorage.setItem('ri_target_opportunity', oppSlug);
    }
  }, [oppSlug]);

  // If already authenticated, route immediately to role-appropriate portal
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin-portal', { replace: true });
      } else if (user.role === 'VOLUNTEER') {
        const dest = oppSlug ? `/volunteer/dashboard?opportunity=${encodeURIComponent(oppSlug)}` : safeRedirect;
        navigate(dest, { replace: true });
      } else {
        const dest = oppSlug ? `/volunteer/applicant-portal?opportunity=${encodeURIComponent(oppSlug)}` : '/volunteer/applicant-portal';
        navigate(dest, { replace: true });
      }
    }
  }, [user, isAdmin, oppSlug, safeRedirect, navigate]);

  // Validate targeted opportunity
  useEffect(() => {
    let isMounted = true;

    async function checkOpportunity() {
      if (!oppSlug) return;

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
            setOppWarning(`Note: The role "${match.title}" is currently filled or closed. You can still access the portal to apply for other opportunities.`);
          }
        } else {
          setOppWarning(`Note: The role "${oppSlug}" was not found or is no longer listed.`);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Unable to validate opportunity:', err);
        }
      }
    }

    checkOpportunity();

    return () => {
      isMounted = false;
    };
  }, [oppSlug]);

  // Target query params for auth redirects
  const nextAuthQuery = buildAuthParams({
    opportunity: oppSlug,
    redirect: safeRedirect,
  });

  // Password requirements for short registration
  const passwordRequirements = [
    { label: 'At least 12 characters', met: regForm.password.length >= 12 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(regForm.password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(regForm.password) },
    { label: 'One number', met: /[0-9]/.test(regForm.password) },
    { label: 'One special symbol', met: /[^A-Za-z0-9\s]/.test(regForm.password) },
    { label: 'No spaces', met: regForm.password.length > 0 && !/\s/.test(regForm.password) },
  ];

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your email or phone number.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setLoginLoading(true);
    try {
      const data = await login(loginIdentifier.trim(), loginPassword);
      sessionStorage.setItem('ri_login_identifier', data.identifier || loginIdentifier.trim());
      navigate(`/login-otp${nextAuthQuery}`);
    } catch (err) {
      console.error('Login error:', err);
      const detail = err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0] || 'Invalid credentials. Please verify your email/phone and password.';
      setLoginError(detail);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (regForm.name.trim().length < 2) {
      setRegError('Please enter your full name.');
      return;
    }

    const emailTrimmed = regForm.email.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setRegError('Please enter a valid email address.');
      return;
    }

    const phoneTrimmed = regForm.phone.trim();
    const cleanPhoneDigits = phoneTrimmed.replace(/\D/g, '');
    let coreDigits = cleanPhoneDigits;
    if (phoneTrimmed.startsWith('+91') && cleanPhoneDigits.startsWith('91')) {
      coreDigits = cleanPhoneDigits.slice(2);
    } else if (cleanPhoneDigits.length === 12 && cleanPhoneDigits.startsWith('91')) {
      coreDigits = cleanPhoneDigits.slice(2);
    }

    if (coreDigits.length !== 10 || !/^[6-9]/.test(coreDigits)) {
      setRegError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (passwordRequirements.some((r) => !r.met)) {
      setRegError('Please meet all password complexity criteria.');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setRegLoading(true);
    try {
      const formattedPhone = `+91${coreDigits}`;
      const payload = {
        name: regForm.name.trim(),
        email: emailTrimmed,
        phone: formattedPhone,
        password: regForm.password,
      };

      const res = await register(payload);
      sessionStorage.setItem('ri_verification_identifier', res?.identifier || emailTrimmed);
      navigate(`/verify-otp${nextAuthQuery}`);
    } catch (err) {
      console.error('Registration error:', err);
      const data = err?.response?.data;
      const msg = data?.email?.[0] || data?.phone?.[0] || data?.detail || 'Registration failed. An account with this email or phone may already exist.';
      setRegError(msg);
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authService.requestPasswordReset(forgotEmail.trim());
      setForgotMsg(res?.message || 'A password reset verification code has been dispatched to your email.');
    } catch (err) {
      setForgotError(err?.response?.data?.detail || 'Unable to request password reset code. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="volunteer-portal-root">
      <div className="portal-backdrop-glow" aria-hidden="true" />

      <div className="portal-card-container">
        
        {/* Header Branding */}
        <div className="portal-header-box">
          <div className="portal-brand-badge">
            <HeartHandshake size={14} />
            <span>Volunteer Portal</span>
          </div>
          <h1 className="portal-title">Responsible Individuals</h1>
          <p className="portal-subtitle">
            Sign in or register to join on-ground restoration initiatives and manage your volunteer applications.
          </p>
        </div>

        {/* Selected Opportunity Callout Ribbon */}
        {selectedOpportunity && (
          <div className={`portal-target-opp-ribbon ${oppWarning ? 'closed' : ''}`}>
            <div className="target-opp-icon">
              <Sparkles size={16} />
            </div>
            <div className="target-opp-info">
              <span className="target-opp-tag">Opportunity Hand-off</span>
              <span className="target-opp-name">{selectedOpportunity.title}</span>
            </div>
          </div>
        )}

        {oppWarning && (
          <div className="portal-error-banner" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{oppWarning}</span>
          </div>
        )}

        {/* Card Body */}
        <div className="portal-card">
          
          {user ? (
            /* Already Signed-In State */
            <div className="portal-auth-signedin">
              <div className="signedin-avatar-icon">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="signedin-heading">You are already signed in</h2>
              <p className="signedin-desc">
                Signed in as <strong>{user.email}</strong>. Continue directly to your volunteer dashboard.
              </p>
              <Link
                to={`/volunteer/dashboard${buildAuthParams({ opportunity: oppSlug })}`}
                className="portal-btn-submit"
                style={{ textDecoration: 'none' }}
              >
                <span>Go to Volunteer Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            /* Unauthenticated Tabs */
            <>
              {/* Tab Navigation */}
              <nav className="portal-nav-tabs" aria-label="Portal Navigation Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`portal-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`portal-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className={`portal-tab-btn ${activeTab === 'forgot' ? 'active' : ''}`}
                >
                  Forgot Password
                </button>
              </nav>

              {/* -------------------- SIGN IN TAB -------------------- */}
              {activeTab === 'signin' && (
                <form onSubmit={handleLoginSubmit} noValidate>
                  {loginError && (
                    <div className="portal-error-banner" role="alert">
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="portal_login_identifier">
                      Email or Mobile Number
                    </label>
                    <div className="portal-input-wrap">
                      <Mail size={16} className="portal-input-icon" />
                      <input
                        id="portal_login_identifier"
                        type="text"
                        className="portal-input"
                        placeholder="name@example.com or 10-digit phone"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="portal_login_password">
                      Password
                    </label>
                    <div className="portal-input-wrap">
                      <Lock size={16} className="portal-input-icon" />
                      <input
                        id="portal_login_password"
                        type="password"
                        className="portal-input"
                        placeholder="••••••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="portal-btn-submit"
                    disabled={loginLoading}
                  >
                    <span>{loginLoading ? 'Verifying Credentials...' : 'Sign In with Email OTP'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* -------------------- REGISTER TAB -------------------- */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} noValidate>
                  {regError && (
                    <div className="portal-error-banner" role="alert">
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="portal_reg_name">
                      Full Name
                    </label>
                    <div className="portal-input-wrap">
                      <User size={16} className="portal-input-icon" />
                      <input
                        id="portal_reg_name"
                        type="text"
                        className="portal-input"
                        placeholder="e.g. Divya Nair"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="portal_reg_email">
                      Email Address
                    </label>
                    <div className="portal-input-wrap">
                      <Mail size={16} className="portal-input-icon" />
                      <input
                        id="portal_reg_email"
                        type="email"
                        className="portal-input"
                        placeholder="name@example.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="portal_reg_phone">
                      Mobile Number
                    </label>
                    <div className="portal-input-wrap">
                      <Phone size={16} className="portal-input-icon" />
                      <input
                        id="portal_reg_phone"
                        type="tel"
                        className="portal-input"
                        placeholder="10-digit number (e.g. 9845012345)"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="portal_reg_password">
                      Password
                    </label>
                    <div className="portal-input-wrap">
                      <Lock size={16} className="portal-input-icon" />
                      <input
                        id="portal_reg_password"
                        type="password"
                        className="portal-input"
                        placeholder="At least 12 characters"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Checklist */}
                  <div className="portal-pw-reqs">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className={`portal-pw-req-item ${req.met ? 'met' : ''}`}>
                        {req.met ? <CheckCircle2 size={12} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid currentColor' }} />}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="portal_reg_confirm">
                      Confirm Password
                    </label>
                    <div className="portal-input-wrap">
                      <Lock size={16} className="portal-input-icon" />
                      <input
                        id="portal_reg_confirm"
                        type="password"
                        className="portal-input"
                        placeholder="Re-enter your password"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="portal-btn-submit"
                    disabled={regLoading}
                  >
                    <span>{regLoading ? 'Creating Account...' : 'Continue to Email OTP Verification'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* -------------------- FORGOT PASSWORD TAB -------------------- */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleForgotSubmit} noValidate>
                  {forgotError && (
                    <div className="portal-error-banner" role="alert">
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {forgotMsg && (
                    <div className="portal-success-banner" role="alert">
                      <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                      <span>{forgotMsg}</span>
                    </div>
                  )}

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="portal_forgot_email">
                      Registered Email
                    </label>
                    <div className="portal-input-wrap">
                      <Mail size={16} className="portal-input-icon" />
                      <input
                        id="portal_forgot_email"
                        type="email"
                        className="portal-input"
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="portal-btn-submit"
                    disabled={forgotLoading}
                  >
                    <span>{forgotLoading ? 'Requesting Code...' : 'Send Reset Code'}</span>
                    <KeyRound size={16} />
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <Link
                      to={`/forgot-password${nextAuthQuery}`}
                      style={{ color: '#0EA5E9', fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      Already have an OTP? Reset password here →
                    </Link>
                  </div>
                </form>
              )}
            </>
          )}

        </div>

      </div>
    </main>
  );
}
