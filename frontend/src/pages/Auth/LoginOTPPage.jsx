import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShieldCheck,
    KeyRound,
    AlertCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';


export default function LoginOTPPage() {

    const navigate = useNavigate();

    const {
        verifyLoginOTP,
    } = useAuth();


    const [identifier, setIdentifier] =
        useState('');

    const [code, setCode] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState('');

    const [message, setMessage] =
        useState('');


    // ----------------------------------------------------------
    // Get login email from session storage
    // ----------------------------------------------------------

    useEffect(() => {

        const savedIdentifier =
            sessionStorage.getItem(
                'ri_login_identifier'
            );

        if (!savedIdentifier) {
            navigate('/login');
            return;
        }

        setIdentifier(savedIdentifier);

    }, [navigate]);


    // ----------------------------------------------------------
    // VERIFY LOGIN OTP
    // ----------------------------------------------------------

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError('');
        setMessage('');


        if (!code.trim()) {
            setError(
                'Please enter the verification code.'
            );
            return;
        }


        if (code.trim().length !== 6) {
            setError(
                'Verification code must be 6 digits.'
            );
            return;
        }


        try {

            setLoading(true);


            const data =
                await verifyLoginOTP(
                    identifier,
                    code.trim()
                );


            // Remove temporary login identifier
            sessionStorage.removeItem(
                'ri_login_identifier'
            );


            setMessage(
                'Login successful! Redirecting...'
            );


            // Admin users go to admin portal
            if (
                data.user?.is_admin_or_staff ||
                data.user?.is_staff
            ) {

                setTimeout(() => {
                    navigate('/admin-portal');
                }, 800);

            } else {

                setTimeout(() => {
                    navigate('/');
                }, 800);

            }

        } catch (err) {

            console.error(
                'Login OTP verification error:',
                err
            );


            const backendMessage =
                err.response?.data?.detail ||
                err.response?.data?.non_field_errors?.[0];


            setError(
                backendMessage ||
                'Invalid or expired verification code.'
            );

        } finally {

            setLoading(false);

        }
    };


    // ----------------------------------------------------------
    // PAGE
    // ----------------------------------------------------------

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}
        >

            <div
                style={{
                    width: '100%',
                    maxWidth: '460px',
                }}
            >

                {/* Header */}

                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '32px',
                    }}
                >

                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            margin: '0 auto 16px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >

                        <ShieldCheck
                            size={38}
                        />

                    </div>


                    <h1>
                        Verify Your Login
                    </h1>


                    <p>
                        Enter the 6-digit verification
                        code sent to your email.
                    </p>

                </div>


                {/* Card */}

                <div
                    style={{
                        padding: '32px',
                        borderRadius: '16px',
                    }}
                >

                    {/* Email */}

                    <div
                        style={{
                            marginBottom: '20px',
                        }}
                    >

                        <label>
                            Email
                        </label>


                        <input
                            type="email"
                            value={identifier}
                            readOnly
                            style={{
                                width: '100%',
                                marginTop: '8px',
                                padding: '12px',
                            }}
                        />

                    </div>


                    {/* OTP */}

                    <form onSubmit={handleSubmit}>

                        <div
                            style={{
                                marginBottom: '20px',
                            }}
                        >

                            <label>
                                Verification Code
                            </label>


                            <div
                                style={{
                                    position: 'relative',
                                    marginTop: '8px',
                                }}
                            >

                                <KeyRound
                                    size={20}
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform:
                                            'translateY(-50%)',
                                    }}
                                />


                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) =>
                                        setCode(
                                            e.target.value.replace(
                                                /\D/g,
                                                ''
                                            )
                                        )
                                    }
                                    placeholder="Enter 6-digit OTP"
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 42px',
                                        letterSpacing: '4px',
                                    }}
                                    autoFocus
                                />

                            </div>

                        </div>


                        {/* Error */}

                        {error && (

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '16px',
                                }}
                            >

                                <AlertCircle
                                    size={18}
                                />

                                <span>
                                    {error}
                                </span>

                            </div>

                        )}


                        {/* Success */}

                        {message && (

                            <div
                                style={{
                                    marginBottom: '16px',
                                }}
                            >

                                {message}

                            </div>

                        )}


                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                code.length !== 6
                            }
                            style={{
                                width: '100%',
                                padding: '13px',
                            }}
                        >

                            {loading
                                ? 'Verifying...'
                                : 'Verify & Login'}

                        </button>

                    </form>


                    {/* Back */}

                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '24px',
                        }}
                    >

                        <Link to="/login">
                            ← Back to Login
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}