import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user?.is_admin_or_staff || data.user?.is_staff) {
        navigate('/admin-portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@responsibleindividuals.org');
    setPassword('Admin@12345');
  };

  return (
    <div className="login-page-root">
      <div className="login-card-box">
        <div className="login-header">
          <div className="login-logo-wrap">
            <ShieldCheck size={28} color="#10B981" />
          </div>
          <h1 className="login-title">Sign in to Platform</h1>
          <p className="login-sub">Access your volunteer dashboard, donation receipts, or administrator console.</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                required
                className="form-control"
                placeholder="name@organization.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                required
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary login-btn">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Fill Demo Admin Credentials Button */}
        <div className="demo-credentials-box">
          <button type="button" onClick={fillAdminCredentials} className="demo-fill-btn">
            <KeyRound size={14} />
            <span>Use Demo Admin Credentials</span>
          </button>
          <span className="demo-hint">admin@responsibleindividuals.org • Admin@12345</span>
        </div>
      </div>

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
          margin-top: 0.5rem;
        }
        .demo-credentials-box {
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px dashed var(--border-subtle);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }
        .demo-fill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--slate-700);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .demo-fill-btn:hover {
          background: #E2E8F0;
        }
        .demo-hint {
          font-size: 0.75rem;
          color: var(--slate-500);
        }
      `}</style>
    </div>
  );
}
