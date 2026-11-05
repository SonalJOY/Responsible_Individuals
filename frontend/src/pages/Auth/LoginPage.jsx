import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // VALIDATION
  const validateIdentifier = (val) => {
    const trimmed = val.trim();

    if (!trimmed) {
      return 'Please enter your email address or phone number.';
    }

    // Email validation
    if (trimmed.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(trimmed)) {
        return 'Please enter a valid email address (e.g. name@example.com).';
      }

      return null;
    }

    // Reject letters without @
    if (/[a-zA-Z]/.test(trimmed)) {
      return 'Please enter a valid email address or 10-digit phone number.';
    }

    // Reject invalid characters
    if (/[^\d\s\-\(\)\+]/.test(trimmed)) {
      return 'Please enter a valid phone number containing digits only.';
    }

    const digits = trimmed.replace(/\D/g, '');
    let coreDigits = digits;

    if (trimmed.startsWith('+91') && digits.startsWith('91')) {
      coreDigits = digits.slice(2);
    } else if (digits.length === 12 && digits.startsWith('91')) {
      coreDigits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      coreDigits = digits.slice(1);
    }

    if (coreDigits.length > 10) {
      return 'Phone number cannot exceed 10 digits. Please enter a valid 10-digit mobile number.';
    }

    if (coreDigits.length < 10) {
      return 'Phone number must be at least 10 digits. Please enter a valid mobile number.';
    }

    if (coreDigits.startsWith('0')) {
      return 'Please enter a valid 10-digit mobile number.';
    }

    return null;
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateIdentifier(identifier);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const data = await login(
        identifier.trim(),
        password
      );

      // Save the identifier for OTP verification
      sessionStorage.setItem(
        'ri_login_identifier',
        data.identifier || identifier.trim()
      );

      // Save rememberMe preference if needed
      if (rememberMe) {
        localStorage.setItem('ri_remember_me', 'true');
      } else {
        localStorage.removeItem('ri_remember_me');
      }

      // Navigate to login OTP page
      navigate('/login-otp');

    } catch (err) {
      console.error('Login error:', err);

      const errData = err?.response?.data;

      const message =
        (Array.isArray(errData?.identifier)
          ? errData.identifier[0]
          : errData?.identifier) ||
        errData?.detail ||
        errData?.non_field_errors?.[0] ||
        'Invalid credentials. Please check your email/phone and password.';

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ri-login-wrapper">
      {/* Ambient background lighting */}
      <div className="ri-login-ambient-orb ri-login-ambient-orb-1" aria-hidden="true" />
      <div className="ri-login-ambient-orb ri-login-ambient-orb-2" aria-hidden="true" />

      <div className="ri-login-container">
        {/* LEFT PANEL: Community Impact Showcase */}
        <div className="ri-login-showcase">
          <div className="ri-login-showcase-bg" aria-hidden="true" />
          <div className="ri-login-showcase-gradient-overlay" aria-hidden="true" />

          <div className="ri-login-showcase-content">
            {/* Top Brand Badge */}
            <div>
              <div className="ri-login-badge">
                <span className="ri-badge-dot" />
                <span>Changemaker & Impact Portal</span>
              </div>

              {/* Showcase Hero Headline */}
              <div className="ri-showcase-hero">
                <h2 className="ri-showcase-heading">
                  Building Responsible Communities. <br />
                  <span>Creating Sustainable Impact.</span>
                </h2>
                <p className="ri-showcase-subtext">
                  Join thousands of dedicated volunteers, donors, and grassroots partners driving positive change in education, environment, and social welfare.
                </p>
              </div>
            </div>

            {/* Middle Section: Live Impact Metrics & Testimonial */}
            <div>
              <div className="ri-impact-stats-grid">
                <div className="ri-stat-card">
                  <div className="ri-stat-value">45,000+</div>
                  <div className="ri-stat-label">Lives Impacted</div>
                </div>
                <div className="ri-stat-card">
                  <div className="ri-stat-value">180+</div>
                  <div className="ri-stat-label">Field Drives</div>
                </div>
                <div className="ri-stat-card">
                  <div className="ri-stat-value">100%</div>
                  <div className="ri-stat-label">Direct Impact</div>
                </div>
              </div>

              <div className="ri-quote-card">
                <p className="ri-quote-text">
                  “Real societal impact isn't accidental. It begins with individual responsibility and collective community action.”
                </p>
                <div className="ri-quote-author">
                  <div className="ri-author-info">
                    <div className="ri-author-avatar-group">
                      <div className="ri-avatar-circle ri-avatar-1">RI</div>
                      <div className="ri-avatar-circle ri-avatar-2">VA</div>
                      <div className="ri-avatar-circle ri-avatar-3">SR</div>
                    </div>
                    <div className="ri-author-meta">
                      <span className="ri-author-name">Responsible Individuals</span>
                      <span className="ri-author-role">Community Network</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Footer */}
            <div className="ri-showcase-footer">
              <ShieldCheck size={18} />
              <span>Verified Non-Profit Portal • End-to-End Encrypted • Multi-Factor Auth</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Authentication Form */}
        <div className="ri-login-form-panel">
          {/* Header */}
          <div className="ri-form-header">
            <div className="ri-header-brand-row">
              <div className="ri-logo-icon-box">
                <ShieldCheck size={26} strokeWidth={2.2} />
              </div>
              <span className="ri-platform-tag">Secure Sign In</span>
            </div>

            <h1 className="ri-form-title">Welcome Back</h1>
            <p className="ri-form-subtitle">
              Sign in to manage your volunteer drives, project impact, or organization portal.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="ri-login-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} autoComplete="off" className="ri-form-body">
            {/* Email or Phone Input */}
            <div className="ri-form-group">
              <div className="ri-form-label-row">
                <label className="ri-form-label" htmlFor="login_identifier">
                  Email Address or Mobile Number
                </label>
              </div>

              <div className="ri-input-container">
                <Mail size={18} className="ri-input-leading-icon" />
                <input
                  type="text"
                  id="login_identifier"
                  name="login_identifier"
                  autoComplete="off"
                  required
                  className="ri-input-field"
                  placeholder="name@example.com or 10-digit mobile"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="ri-form-group">
              <div className="ri-form-label-row">
                <label className="ri-form-label" htmlFor="login_password">
                  Password
                </label>
              </div>

              <div className="ri-input-container with-trailing-icon">
                <Lock size={18} className="ri-input-leading-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login_password"
                  name="login_password"
                  autoComplete="new-password"
                  required
                  className="ri-input-field"
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ri-password-toggle-btn"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Meta Row: Remember Me & Forgot Password */}
            <div className="ri-form-meta-row">
              <label className="ri-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="ri-checkbox-input"
                />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="ri-forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="ri-submit-btn"
            >
              {loading ? (
                <>
                  <div className="ri-spinner" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Your Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer & Registration Prompt */}
          <div className="ri-form-footer">
            <div className="ri-register-prompt">
              <span>Don't have an account yet?</span>
              <Link to="/register" className="ri-register-link">
                Create Account
              </Link>
            </div>

            <div className="ri-form-security-badge">
              <KeyRound size={13} />
              <span>Multi-Factor OTP verification enabled for account security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
