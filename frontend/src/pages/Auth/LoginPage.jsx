import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  KeyRound,
} from 'lucide-react';


export default function LoginPage() {

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();


  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  const validateIdentifier = (val) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please enter your email address or phone number.';
    }

    // Email check
    if (trimmed.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return 'Please enter a valid email address (e.g. name@example.com).';
      }
      return null;
    }

    // Letters without '@'
    if (/[a-zA-Z]/.test(trimmed)) {
      return 'Please enter a valid email address or 10-digit phone number.';
    }

    // Invalid non-digit characters
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


  // ----------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------

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


      // ------------------------------------------------------
      // Password is correct.
      // Backend sends OTP to registered email/phone.
      // ------------------------------------------------------

      sessionStorage.setItem(
        'ri_login_identifier',
        data.identifier || identifier.trim()
      );


      // Go to Login OTP page
      navigate('/login-otp');


    } catch (err) {

      console.error(
        'Login error:',
        err
      );

      const errData = err?.response?.data;
      const message =
        (Array.isArray(errData?.identifier) ? errData.identifier[0] : errData?.identifier) ||
        errData?.detail ||
        errData?.non_field_errors?.[0] ||
        'Invalid credentials. Please check your email/phone and password.';


      setError(message);

    } finally {

      setLoading(false);

    }
  };


  // ----------------------------------------------------------
  // ADMIN DEMO LOGIN
  // ----------------------------------------------------------

  const fillAdminCredentials = () => {

    setIdentifier(
      'admin@responsibleindividuals.org'
    );

    setPassword(
      'Admin@12345'
    );
  };


  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <div className="login-page-root">


      <div className="login-card-box">


        {/* Header */}

        <div className="login-header">

          <div className="login-logo-wrap">

            <ShieldCheck
              size={28}
              color="#10B981"
            />

          </div>


          <h1 className="login-title">
            Welcome Back
          </h1>


          <p className="login-sub">
            Sign in to your Responsible Individuals account.
          </p>

        </div>


        {/* Error */}

        {error && (

          <div className="login-error-alert">

            <AlertCircle size={16} />

            <span>
              {error}
            </span>

          </div>

        )}


        {/* Login Form */}

        <form onSubmit={handleLogin}>


          {/* Email or Phone */}

          <div className="form-group">

            <label className="form-label">
              Email Address or Phone Number
            </label>


            <div className="input-icon-wrap">

              <Mail
                size={16}
                className="input-icon"
              />


              <input
                type="text"
                name="identifier"
                required
                className="form-control"
                placeholder="name@example.com or phone number"
                value={identifier}
                onChange={(e) =>
                  setIdentifier(e.target.value)
                }
                disabled={loading}
              />

            </div>

          </div>


          {/* Password */}

          <div className="form-group">

            <label className="form-label">
              Password
            </label>


            <div className="input-icon-wrap">

              <Lock
                size={16}
                className="input-icon"
              />


              <input
                type="password"
                required
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={loading}
              />

            </div>

          </div>


          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary login-btn"
          >

            {loading
              ? 'Signing In...'
              : 'Sign In'}

          </button>

        </form>


        {/* Admin Demo Login */}

        <button
          type="button"
          onClick={fillAdminCredentials}
          className="admin-demo-btn"
        >

          <KeyRound size={15} />

          Use Admin Demo Account

        </button>


        {/* Register Link */}

        <div className="register-link-box">

          <span>
            Don't have an account?
          </span>


          <Link
            to="/register"
            className="register-link"
          >
            Create Account
          </Link>

        </div>


      </div>


      {/* Styles */}

      <style>{`

        .login-page-root {
          min-height: calc(100vh - 76px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          background: #F8FAFC;
        }


        .login-card-box {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 2.75rem 2.25rem;
          box-shadow: var(--shadow-md);
        }


        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }


        .login-logo-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: #ECFDF5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
        }


        .login-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.5rem;
        }


        .login-sub {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
        }


        .login-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #FEF2F2;
          color: #DC2626;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          border: 1px solid #FCA5A5;
        }


        .input-icon-wrap {
          position: relative;
        }


        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-400);
        }


        .input-icon-wrap .form-control {
          padding-left: 2.5rem;
        }


        .login-btn {
          width: 100%;
          margin-top: 0.75rem;
        }


        .admin-demo-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 0.7rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          background: #FFFFFF;
          color: var(--slate-600);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }


        .admin-demo-btn:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }


        .register-link-box {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px dashed var(--border-subtle);
          display: flex;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.875rem;
          color: var(--slate-500);
        }


        .register-link {
          color: #047857;
          font-weight: 700;
          text-decoration: none;
        }


        .register-link:hover {
          text-decoration: underline;
        }

      `}</style>


    </div>
  );
}