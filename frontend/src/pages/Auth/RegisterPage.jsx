import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShieldCheck,
    User,
    Mail,
    Phone,
    Lock,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';

import api from '../../services/api';

export default function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setError('');

        if (form.name.trim().length < 2) {
            setError('Please enter your full name.');
            return;
        }

        const emailTrimmed = form.email.trim();
        if (!emailTrimmed) {
            setError('Please enter your email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrimmed)) {
            setError('Please enter a valid email address (e.g. name@example.com).');
            return;
        }

        const phoneTrimmed = form.phone.trim();
        if (!phoneTrimmed) {
            setError('Please enter your phone number.');
            return;
        }

        if (/[a-zA-Z]/.test(phoneTrimmed)) {
            setError('Phone number cannot contain letters. Please enter a valid 10-digit mobile number.');
            return;
        }

        if (/[^\d\s\-\(\)\+]/.test(phoneTrimmed)) {
            setError('Please enter a valid phone number containing digits only.');
            return;
        }

        const digits = phoneTrimmed.replace(/\D/g, '');
        let coreDigits = digits;
        if (phoneTrimmed.startsWith('+91') && digits.startsWith('91')) {
            coreDigits = digits.slice(2);
        } else if (digits.length === 12 && digits.startsWith('91')) {
            coreDigits = digits.slice(2);
        } else if (digits.length === 11 && digits.startsWith('0')) {
            coreDigits = digits.slice(1);
        }

        if (coreDigits.length > 10) {
            setError('Phone number cannot exceed 10 digits. Please enter a valid 10-digit mobile number.');
            return;
        }

        if (coreDigits.length < 10) {
            setError('Phone number must be at least 10 digits. Please enter a valid mobile number.');
            return;
        }

        if (coreDigits.startsWith('0')) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        if (form.password.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }

        const cleanPhone = phoneTrimmed.startsWith('+') ? ('+' + digits) : ('+91' + coreDigits);

        setLoading(true);

        try {
            const response = await api.post('/auth/register/', {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: cleanPhone,
                identifier: form.email.trim(),
                password: form.password,
            });

            /*
             * Django returns the identifier after successful registration.
             * We temporarily store it so the OTP page knows which
             * account is being verified.
             */
            sessionStorage.setItem(
                'ri_verification_identifier',
                response.data.identifier || form.email.trim()
            );

            // Go to OTP verification page
            navigate('/verify-otp');

        } catch (err) {
            console.error('Registration error:', err);

            const data = err?.response?.data;

            if (data?.email) {
                setError(
                    Array.isArray(data.email)
                        ? data.email[0]
                        : data.email
                );
            } else if (data?.phone) {
                setError(
                    Array.isArray(data.phone)
                        ? data.phone[0]
                        : data.phone
                );
            } else if (data?.identifier) {
                setError(
                    Array.isArray(data.identifier)
                        ? data.identifier[0]
                        : data.identifier
                );
            } else if (data?.password) {
                setError(
                    Array.isArray(data.password)
                        ? data.password[0]
                        : data.password
                );
            } else if (data?.name) {
                setError(
                    Array.isArray(data.name)
                        ? data.name[0]
                        : data.name
                );
            } else if (data?.detail) {
                setError(data.detail);
            } else {
                setError(
                    'Registration failed. Please check your details.'
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page-root">

            <div className="register-card-box">

                {/* Header */}
                <div className="register-header">

                    <div className="register-logo-wrap">
                        <ShieldCheck
                            size={28}
                            color="#10B981"
                        />
                    </div>

                    <h1 className="register-title">
                        Create Your Account
                    </h1>

                    <p className="register-sub">
                        Join Responsible Individuals and get involved
                        in meaningful community initiatives.
                    </p>

                </div>


                {/* Error */}
                {error && (
                    <div className="register-error-alert">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}


                {/* Registration Form */}
                <form onSubmit={handleRegister}>

                    {/* Full Name */}
                    <div className="form-group">

                        <label className="form-label">
                            Full Name
                        </label>

                        <div className="input-icon-wrap">

                            <User
                                size={16}
                                className="input-icon"
                            />

                            <input
                                type="text"
                                name="name"
                                required
                                className="form-control"
                                placeholder="Your full name"
                                value={form.name}
                                onChange={handleChange}
                                disabled={loading}
                            />

                        </div>

                    </div>


                    {/* Email */}
                    <div className="form-group">

                        <label className="form-label">
                            Email Address
                        </label>

                        <div className="input-icon-wrap">

                            <Mail
                                size={16}
                                className="input-icon"
                            />

                            <input
                                type="email"
                                name="email"
                                required
                                className="form-control"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={handleChange}
                                disabled={loading}
                            />

                        </div>

                    </div>


                    {/* Phone Number */}
                    <div className="form-group">

                        <label className="form-label">
                            Phone Number
                        </label>

                        <div className="input-icon-wrap">

                            <Phone
                                size={16}
                                className="input-icon"
                            />

                            <input
                                type="tel"
                                name="phone"
                                required
                                className="form-control"
                                placeholder="+91 98765 43210"
                                value={form.phone}
                                onChange={handleChange}
                                disabled={loading}
                            />

                        </div>

                        <p className="field-hint">
                            You will receive a verification code.
                        </p>

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
                                name="password"
                                required
                                minLength={8}
                                className="form-control"
                                placeholder="Minimum 8 characters"
                                value={form.password}
                                onChange={handleChange}
                                disabled={loading}
                            />

                        </div>

                    </div>


                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary register-btn"
                    >
                        {loading
                            ? 'Creating Account...'
                            : 'Create Account'}

                        {!loading && (
                            <ArrowRight size={17} />
                        )}

                    </button>

                </form>


                {/* Login Link */}
                <div className="login-link-box">

                    <span>
                        Already have an account?
                    </span>

                    <Link
                        to="/login"
                        className="login-link"
                    >
                        Sign In
                    </Link>

                </div>

            </div>


            <style>{`

        .register-page-root {
          min-height: calc(100vh - 76px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          background: #F8FAFC;
        }

        .register-card-box {
          width: 100%;
          max-width: 480px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 2.75rem 2.25rem;
          box-shadow: var(--shadow-md);
        }

        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .register-logo-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: #ECFDF5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
        }

        .register-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.5rem;
        }

        .register-sub {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .register-error-alert {
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

        .field-hint {
          font-size: 0.75rem;
          color: var(--slate-500);
          margin-top: 0.35rem;
        }

        .register-btn {
          width: 100%;
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-link-box {
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px dashed var(--border-subtle);
          display: flex;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.875rem;
          color: var(--slate-500);
        }

        .login-link {
          color: #047857;
          font-weight: 700;
          text-decoration: none;
        }

        .login-link:hover {
          text-decoration: underline;
        }

      `}</style>

        </div>
    );
}