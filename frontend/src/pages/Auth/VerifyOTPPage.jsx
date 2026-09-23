import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShieldCheck,
    KeyRound,
    AlertCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function VerifyOTPPage() {
    const navigate = useNavigate();

    const { verifyOTP, resendOTP } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [code, setCode] = useState('');

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);


    // ----------------------------------------------------------
    // LOAD IDENTIFIER
    // ----------------------------------------------------------

    useEffect(() => {
        const savedIdentifier = sessionStorage.getItem(
            'ri_verification_identifier'
        );

        if (!savedIdentifier) {
            navigate('/register');
            return;
        }

        setIdentifier(savedIdentifier);
    }, [navigate]);


    // ----------------------------------------------------------
    // VERIFY OTP
    // ----------------------------------------------------------

    const handleVerify = async (e) => {
        e.preventDefault();

        setError('');
        setMessage('');

        if (code.length !== 6) {
            setError(
                'Please enter the 6-digit verification code.'
            );
            return;
        }

        setLoading(true);

        try {

            /*
             * Use AuthContext instead of calling the API directly.
             *
             * AuthContext will:
             * 1. Verify the OTP
             * 2. Save the user in React state
             * 3. Return the JWT tokens and user
             */

            const data = await verifyOTP(
                identifier,
                code
            );


            // Store tokens as an extra safeguard

            if (data.access) {
                localStorage.setItem(
                    'ri_access_token',
                    data.access
                );
            }

            if (data.refresh) {
                localStorage.setItem(
                    'ri_refresh_token',
                    data.refresh
                );
            }

            if (data.user) {
                localStorage.setItem(
                    'ri_user',
                    JSON.stringify(data.user)
                );
            }


            // Remove temporary registration identifier

            sessionStorage.removeItem(
                'ri_verification_identifier'
            );


            setMessage(
                'Account verified successfully!'
            );


            // Go to home page

            setTimeout(() => {
                navigate('/');
            }, 800);

        } catch (err) {

            console.error(
                'OTP verification error:',
                err
            );

            const data = err?.response?.data;

            if (data?.non_field_errors) {

                setError(
                    Array.isArray(data.non_field_errors)
                        ? data.non_field_errors[0]
                        : data.non_field_errors
                );

            } else if (data?.detail) {

                setError(data.detail);

            } else {

                setError(
                    'Invalid or expired verification code.'
                );
            }

        } finally {

            setLoading(false);

        }
    };


    // ----------------------------------------------------------
    // RESEND OTP
    // ----------------------------------------------------------

    const handleResend = async () => {

        setError('');
        setMessage('');
        setResending(true);

        try {

            await resendOTP(identifier);

            setMessage(
                'A new verification code has been sent.'
            );

        } catch (err) {

            console.error(
                'Resend OTP error:',
                err
            );

            const data = err?.response?.data;

            if (data?.identifier) {

                setError(
                    Array.isArray(data.identifier)
                        ? data.identifier[0]
                        : data.identifier
                );

            } else if (data?.detail) {

                setError(data.detail);

            } else {

                setError(
                    'Could not resend the verification code.'
                );
            }

        } finally {

            setResending(false);

        }
    };


    // ----------------------------------------------------------
    // UI
    // ----------------------------------------------------------

    return (
        <div className="verify-page-root">

            <div className="verify-card-box">

                {/* Header */}

                <div className="verify-header">

                    <div className="verify-logo-wrap">

                        <ShieldCheck
                            size={28}
                            color="#10B981"
                        />

                    </div>


                    <h1 className="verify-title">
                        Verify Your Account
                    </h1>


                    <p className="verify-sub">
                        Enter the 6-digit verification code sent to:
                    </p>


                    <strong className="verify-identifier">
                        {identifier}
                    </strong>

                </div>


                {/* Error */}

                {error && (
                    <div className="verify-error-alert">

                        <AlertCircle size={16} />

                        <span>
                            {error}
                        </span>

                    </div>
                )}


                {/* Success */}

                {message && (
                    <div className="verify-success-alert">

                        <ShieldCheck size={16} />

                        <span>
                            {message}
                        </span>

                    </div>
                )}


                {/* OTP Form */}

                <form onSubmit={handleVerify}>

                    <div className="form-group">

                        <label className="form-label">
                            Verification Code
                        </label>


                        <div className="input-icon-wrap">

                            <KeyRound
                                size={16}
                                className="input-icon"
                            />


                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                required
                                className="form-control otp-input"
                                placeholder="000000"
                                value={code}
                                onChange={(e) =>
                                    setCode(
                                        e.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 6)
                                    )
                                }
                                disabled={loading}
                            />

                        </div>

                    </div>


                    <button
                        type="submit"
                        disabled={
                            loading ||
                            code.length !== 6
                        }
                        className="btn btn-primary verify-btn"
                    >

                        {loading
                            ? 'Verifying...'
                            : 'Verify Account'}

                    </button>

                </form>


                {/* Resend */}

                <div className="resend-box">

                    <span>
                        Didn't receive the code?
                    </span>


                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="resend-btn"
                    >

                        {resending
                            ? 'Sending...'
                            : 'Resend Code'}

                    </button>

                </div>


                {/* Back to Register */}

                <div className="back-register-box">

                    <Link
                        to="/register"
                        className="back-register-link"
                    >
                        Use a different email or phone
                    </Link>

                </div>

            </div>


            {/* Styles */}

            <style>{`

        .verify-page-root {
          min-height: calc(100vh - 76px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          background: #F8FAFC;
        }


        .verify-card-box {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 2.75rem 2.25rem;
          box-shadow: var(--shadow-md);
        }


        .verify-header {
          text-align: center;
          margin-bottom: 2rem;
        }


        .verify-logo-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: #ECFDF5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
        }


        .verify-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.5rem;
        }


        .verify-sub {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 0.25rem;
        }


        .verify-identifier {
          color: #047857;
          font-size: 0.9rem;
          word-break: break-word;
        }


        .verify-error-alert {
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


        .verify-success-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ECFDF5;
          color: #047857;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          border: 1px solid #6EE7B7;
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


        .otp-input {
          letter-spacing: 0.45rem;
          font-weight: 700;
          font-size: 1.2rem;
        }


        .verify-btn {
          width: 100%;
          margin-top: 0.75rem;
        }


        .resend-box {
          margin-top: 1.75rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--slate-500);
        }


        .resend-btn {
          border: none;
          background: transparent;
          color: #047857;
          font-weight: 700;
          cursor: pointer;
        }


        .resend-btn:hover {
          text-decoration: underline;
        }


        .resend-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }


        .back-register-box {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px dashed var(--border-subtle);
          text-align: center;
        }


        .back-register-link {
          color: var(--slate-500);
          font-size: 0.8rem;
          text-decoration: none;
        }


        .back-register-link:hover {
          color: #047857;
          text-decoration: underline;
        }

      `}</style>

        </div>
    );
}