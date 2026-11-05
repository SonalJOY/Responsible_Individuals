import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { authService } from '../../services/api';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (err) => {
    const data = err.response?.data;

    if (typeof data === 'string') return data;
    if (data?.detail) return data.detail;

    if (data?.non_field_errors) {
      return data.non_field_errors.join(' ');
    }

    if (data && typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) =>
          `${key}: ${Array.isArray(value) ? value.join(' ') : value}`
        )
        .join(' ');
    }

    return 'Something went wrong. Please check your details and try again.';
  };

  // STEP 1: REQUEST OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.requestPasswordReset(emailTrimmed);

      setMessage(
        result.message ||
        'If an account exists, a 6-digit recovery code has been dispatched to your email.'
      );
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: CONFIRM RESET
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!/^\d{6}$/.test(code.trim())) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.confirmPasswordReset(
        email.trim(),
        code.trim(),
        newPassword
      );

      setMessage(
        result.message || 'Your password has been successfully reset.'
      );
      setStep(3);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  return (
    <div className="ri-fp-wrapper">
      {/* Ambient background lighting */}
      <div className="ri-fp-ambient-orb ri-fp-ambient-orb-1" aria-hidden="true" />
      <div className="ri-fp-ambient-orb ri-fp-ambient-orb-2" aria-hidden="true" />

      <div className="ri-fp-container">
        {/* LEFT PANEL: Security & Guidance Showcase */}
        <div className="ri-fp-showcase">
          <div className="ri-fp-showcase-bg" aria-hidden="true" />
          <div className="ri-fp-showcase-gradient-overlay" aria-hidden="true" />

          <div className="ri-fp-showcase-content">
            {/* Top Brand Badge */}
            <div>
              <div className="ri-fp-badge">
                <span className="ri-fp-badge-dot" />
                <span>Account Recovery & Security</span>
              </div>

              {/* Showcase Hero Headline */}
              <div className="ri-fp-hero-copy">
                <h2 className="ri-fp-heading">
                  Secure Password <br />
                  <span>Recovery System</span>
                </h2>
                <p className="ri-fp-subtext">
                  Follow our verified recovery process to safely regain access to your changemaker profile, projects, and volunteer dashboard.
                </p>
              </div>
            </div>

            {/* 3-Step Guided Process Indicator */}
            <div>
              <div className="ri-fp-steps-list">
                <div className={`ri-fp-step-item ${step === 1 ? 'active' : ''}`}>
                  <span className="ri-fp-step-num">
                    {step > 1 ? <Check size={14} /> : '1'}
                  </span>
                  <div className="ri-fp-step-body">
                    <span className="ri-fp-step-title">Request One-Time Code</span>
                    <span className="ri-fp-step-desc">Enter your registered email to receive a secure 6-digit OTP.</span>
                  </div>
                </div>

                <div className={`ri-fp-step-item ${step === 2 ? 'active' : ''}`}>
                  <span className="ri-fp-step-num">
                    {step > 2 ? <Check size={14} /> : '2'}
                  </span>
                  <div className="ri-fp-step-body">
                    <span className="ri-fp-step-title">Authenticate & Set Password</span>
                    <span className="ri-fp-step-desc">Verify your one-time code and create a robust new password.</span>
                  </div>
                </div>

                <div className={`ri-fp-step-item ${step === 3 ? 'active' : ''}`}>
                  <span className="ri-fp-step-num">
                    {step === 3 ? <Check size={14} /> : '3'}
                  </span>
                  <div className="ri-fp-step-body">
                    <span className="ri-fp-step-title">Immediate Restoration</span>
                    <span className="ri-fp-step-desc">Your credentials update instantly so you can sign in securely.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Footer */}
            <div className="ri-fp-showcase-footer">
              <ShieldCheck size={18} />
              <span>Time-Sensitive OTP • 256-Bit Cryptography • Verified Changemaker Safety</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Recovery Form Box */}
        <div className="ri-fp-form-panel">
          {/* Top Progress Tracker */}
          <div className="ri-fp-stepper">
            <span className="ri-fp-step-pill">
              {step === 1 && 'Step 1 of 3: Enter Email'}
              {step === 2 && 'Step 2 of 3: Verification & Reset'}
              {step === 3 && 'Step 3 of 3: Completed'}
            </span>
            <div className="ri-fp-step-progress-dots" aria-hidden="true">
              <span className={`ri-fp-dot ${step === 1 ? 'active' : 'completed'}`} />
              <span className={`ri-fp-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`} />
              <span className={`ri-fp-dot ${step === 3 ? 'active completed' : ''}`} />
            </div>
          </div>

          {/* Form Header */}
          <div className="ri-fp-form-header">
            <div className={`ri-fp-icon-wrap ${step === 3 ? 'success' : ''}`}>
              {step === 1 && <KeyRound size={26} strokeWidth={2.2} />}
              {step === 2 && <Lock size={26} strokeWidth={2.2} />}
              {step === 3 && <CheckCircle2 size={36} strokeWidth={2.4} />}
            </div>

            <h1 className={`ri-fp-form-title ${step === 3 ? 'centered' : ''}`}>
              {step === 1 && 'Forgot Password?'}
              {step === 2 && 'Set New Password'}
              {step === 3 && 'Password Reset Complete!'}
            </h1>

            <p className={`ri-fp-form-subtitle ${step === 3 ? 'centered' : ''}`}>
              {step === 1 && 'Enter your registered email address to receive your 6-digit recovery code.'}
              {step === 2 && 'Enter the OTP sent to your inbox along with your new account password.'}
              {step === 3 && 'Your credentials have been securely updated. You can now sign in.'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="ri-fp-alert error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Status Alert (Steps 1 & 2) */}
          {message && step !== 3 && (
            <div className="ri-fp-alert success" role="status">
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>
          )}

          {/* STEP 1: EMAIL REQUEST FORM */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} autoComplete="off" className="ri-fp-form">
              <div className="ri-fp-field-group">
                <div className="ri-fp-label-row">
                  <label className="ri-fp-label" htmlFor="fp_email">
                    Registered Email Address
                  </label>
                </div>

                <div className="ri-fp-input-wrapper">
                  <Mail size={18} className="ri-fp-leading-icon" />
                  <input
                    type="email"
                    id="fp_email"
                    name="fp_email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="ri-fp-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ri-fp-submit-btn"
              >
                {loading ? (
                  <>
                    <div className="ri-fp-spinner" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP & NEW PASSWORD FORM */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} autoComplete="off" className="ri-fp-form">
              {/* Sent-To Email Capsule */}
              <div className="ri-fp-target-box">
                <div className="ri-fp-target-content">
                  <Mail size={16} />
                  <div className="ri-fp-target-text">
                    <span className="ri-fp-target-label">Code Sent To</span>
                    <span className="ri-fp-target-email">{email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setCode('');
                    setError('');
                    setMessage('');
                  }}
                  className="ri-fp-target-change-btn"
                >
                  Change Email
                </button>
              </div>

              {/* 6-Digit OTP Input */}
              <div className="ri-fp-field-group">
                <div className="ri-fp-label-row">
                  <label className="ri-fp-label" htmlFor="fp_code">
                    6-Digit Verification Code
                  </label>
                  <span className="ri-fp-hint">Valid for 10 minutes</span>
                </div>

                <div className="ri-fp-input-wrapper">
                  <KeyRound size={18} className="ri-fp-leading-icon" />
                  <input
                    type="text"
                    id="fp_code"
                    name="fp_code"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    required
                    className="ri-fp-input code-input"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* New Password Input */}
              <div className="ri-fp-field-group">
                <div className="ri-fp-label-row">
                  <label className="ri-fp-label" htmlFor="fp_new_password">
                    New Password
                  </label>
                  <span className="ri-fp-hint">Min. 8 characters</span>
                </div>

                <div className="ri-fp-input-wrapper with-trailing">
                  <Lock size={18} className="ri-fp-leading-icon" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="fp_new_password"
                    name="fp_new_password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="ri-fp-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="ri-fp-trailing-btn"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Input */}
              <div className="ri-fp-field-group">
                <div className="ri-fp-label-row">
                  <label className="ri-fp-label" htmlFor="fp_confirm_password">
                    Confirm New Password
                  </label>
                  {passwordsMatch && (
                    <span className="ri-fp-match-pill match">
                      <Check size={12} /> Matches
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="ri-fp-match-pill mismatch">
                      Does not match
                    </span>
                  )}
                </div>

                <div className="ri-fp-input-wrapper with-trailing">
                  <Lock size={18} className="ri-fp-leading-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="fp_confirm_password"
                    name="fp_confirm_password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    required
                    className="ri-fp-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ri-fp-trailing-btn"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ri-fp-submit-btn"
              >
                {loading ? (
                  <>
                    <div className="ri-fp-spinner" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Update Password</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setCode('');
                  setError('');
                  setMessage('');
                }}
                className="ri-fp-back-text-btn"
              >
                <ArrowLeft size={16} />
                <span>Return to step 1 (change email)</span>
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 3 && (
            <div className="ri-fp-form">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="ri-fp-submit-btn success-btn"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Form Footer */}
          {step !== 3 && (
            <div className="ri-fp-footer">
              <span>Remember your password?</span>
              <Link to="/login" className="ri-fp-footer-link">
                Sign in to your account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
