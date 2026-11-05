import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { volunteerService } from '../../services/api';
import GlobalPreloader from './GlobalPreloader';
import { buildAuthParams, evaluateRouteAuthorization } from '../../utils/navigation';
import { AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';

export { evaluateRouteAuthorization };

/**
 * Route guard component.
 * Ensures the user is authenticated before rendering children.
 * Optionally enforces admin/staff role if adminOnly is specified.
 * Optionally enforces approved volunteer status if requireApprovedVolunteer is specified.
 */
export default function ProtectedRoute({
  children,
  adminOnly = false,
  requireApprovedVolunteer = false,
}) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(Boolean(user && requireApprovedVolunteer && !isAdmin));
  const [profileError, setProfileError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user || !requireApprovedVolunteer || isAdmin) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await volunteerService.getMyProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to verify volunteer profile approval status:', err);
      setProfileError(
        err?.response?.data?.detail || 'Unable to verify volunteer standing. Please check your connection and try again.'
      );
    } finally {
      setProfileLoading(false);
    }
  }, [user, requireApprovedVolunteer, isAdmin]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const targetPath = `${location.pathname}${location.search}`;
  const searchParams = new URLSearchParams(location.search);
  const oppParam = searchParams.get('opportunity') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('ri_target_opportunity') : '') || '';

  const decision = evaluateRouteAuthorization({
    user,
    loading,
    isAdmin,
    adminOnly,
    requireApprovedVolunteer,
    profile,
    profileLoading,
    profileError,
    targetPath,
    oppParam,
  });

  if (decision.status === 'LOADING') {
    return (
      <GlobalPreloader 
        isLoading={true} 
        isExiting={false} 
        message={loading ? "Verifying session..." : "Verifying volunteer approval..."} 
      />
    );
  }

  if (decision.status === 'ERROR') {
    return (
      <div
        className="route-error-screen"
        role="alert"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#0b1120',
          color: '#f1f5f9',
        }}
      >
        <AlertCircle size={44} color="#EF4444" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
          Unable to Verify Volunteer Approval
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {decision.error}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={fetchProfile}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              background: '#f97316',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            <RotateCcw size={16} />
            <span>Retry Verification</span>
          </button>
          <Link
            to={`/volunteer/applicant-portal${location.search}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              textDecoration: 'none',
              background: '#1e293b',
              color: '#34d399',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            <span>Go to Applicant Portal</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (decision.redirect) {
    return <Navigate to={decision.redirect} replace />;
  }

  return children;
}

