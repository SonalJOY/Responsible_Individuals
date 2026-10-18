
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

        return 'Something went wrong. Please try again.';
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);

        try {
            const result = await authService.requestPasswordReset(
                email.trim()
            );

            setMessage(
                result.message ||
                'If an account exists, a reset code has been sent.'
            );
            setStep(2);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!/^\d{6}$/.test(code.trim())) {
            setError('Enter the 6-digit OTP.');
            return;
        }

        if (!newPassword) {
            setError('Please enter a new password.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
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
                result.message || 'Password reset successfully.'
            );
            setStep(3);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="forgot-password-page">
            <section className="forgot-password-card">

                <div className="forgot-password-icon">
                    🔐
                </div>

                <h1 className="forgot-password-heading">
                    {step === 1 && 'Forgot Password?'}
                    {step === 2 && 'Reset Password'}
                    {step === 3 && 'Password Updated'}
                </h1>

                <p className="forgot-password-description">
                    {step === 1 &&
                        'Enter your registered email to receive a reset code.'}
                    {step === 2 &&
                        'Enter the OTP and choose your new password.'}
                    {step === 3 &&
                        'Your password has been changed successfully.'}
                </p>

                {error && (
                    <div
                        role="alert"
                        className="forgot-password-message forgot-password-error"
                    >
                        {error}
                    </div>
                )}

                {message && (
                    <div
                        role="status"
                        className="forgot-password-message forgot-password-success"
                    >
                        {message}
                    </div>
                )}

                {step === 1 && (
                    <form
                        onSubmit={handleRequestOTP}
                        className="forgot-password-form"
                    >
                        <div className="forgot-password-field">
                            <label className="forgot-password-label">
                                Registered Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="forgot-password-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="forgot-password-button"
                        >
                            {loading ? 'Sending...' : 'Send Reset OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form
                        onSubmit={handleResetPassword}
                        className="forgot-password-form"
                    >
                        <div className="forgot-password-field">
                            <label className="forgot-password-label">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                readOnly
                                className="forgot-password-input"
                            />
                        </div>

                        <div className="forgot-password-field">
                            <label className="forgot-password-label">
                                6-digit OTP
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(e) =>
                                    setCode(
                                        e.target.value.replace(/\D/g, '').slice(0, 6)
                                    )
                                }
                                placeholder="Enter OTP"
                                required
                                className="forgot-password-input"
                            />

                            <span className="forgot-password-hint">
                                The OTP is valid for 10 minutes.
                            </span>
                        </div>

                        <div className="forgot-password-field">
                            <label className="forgot-password-label">
                                New Password
                            </label>

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                className="forgot-password-input"
                            />
                        </div>

                        <div className="forgot-password-field">
                            <label className="forgot-password-label">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirm new password"
                                required
                                className="forgot-password-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="forgot-password-button"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setCode('');
                                setError('');
                                setMessage('');
                            }}
                            className="forgot-password-back-button"
                        >
                            Use a different email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="forgot-password-button"
                    >
                        Back to Login
                    </button>
                )}

                {step !== 3 && (
                    <p className="forgot-password-footer">
                        Remember your password?{' '}
                        <Link
                            to="/login"
                            className="forgot-password-link"
                        >
                            Sign in
                        </Link>
                    </p>
                )}
            </section>
        </main>
    );
}