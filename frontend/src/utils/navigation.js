/**
 * Navigation and redirect security utilities.
 */

// Allowable internal route prefixes (root '/' is handled separately as an exact match to prevent universal prefix matching)
export const ALLOWED_INTERNAL_PREFIXES = [
  '/volunteer',
  '/volunteer-portal',
  '/projects',
  '/impact',
  '/about',
  '/donate',
  '/events',
  '/stories',
  '/gallery',
  '/partners',
  '/careers',
  '/contact',
  '/login',
  '/register',
  '/verify-otp',
  '/login-otp',
  '/forgot-password',
  '/admin-portal',
];

/**
 * Validates and sanitizes a redirect URL to ensure it is strictly an internal application route.
 * Rejects external URLs, protocol-relative URLs (e.g. //attacker.com), javascript:, data: schemes,
 * arbitrary internal paths not matching the allowlist, and paths containing backslashes or encoded bypasses.
 *
 * @param {string|null|undefined} target - The untrusted candidate redirect URL
 * @param {string} [fallback='/volunteer/dashboard'] - Default fallback if candidate is invalid
 * @returns {string} Sanitized safe internal redirect path
 */
export function sanitizeInternalRedirect(target, fallback = '/volunteer/dashboard') {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  const trimmed = target.trim();

  // Must begin with a single slash and must NOT begin with '//'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  // Reject URLs containing raw backslashes, encoded backslashes, control characters, or null bytes
  if (
    trimmed.includes('\\') ||
    /%5c/i.test(trimmed) ||
    /%00/.test(trimmed) ||
    /[\r\n\t\0]/.test(trimmed)
  ) {
    return fallback;
  }

  // Reject URLs containing protocols or suspicious schemes (e.g. javascript:, data:, https:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  try {
    // Parse using a dummy base to inspect the resulting pathname
    const parsed = new URL(trimmed, 'https://internal.ri.org');

    // Ensure origin matches our dummy origin (no external host spoofing)
    if (parsed.origin !== 'https://internal.ri.org') {
      return fallback;
    }

    const pathOnly = parsed.pathname;

    // Check exact root match '/' without using '/' as a universal prefix
    const isExactRoot = pathOnly === '/';

    // Check against allowed explicit internal prefixes
    const isAllowedPrefix = ALLOWED_INTERNAL_PREFIXES.some(
      (prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`)
    );

    if (!isExactRoot && !isAllowedPrefix) {
      return fallback;
    }

    // Return the safe relative path including query and hash
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Builds a query string preserving opportunity and redirect parameters.
 *
 * @param {Object} params
 * @param {string} [params.opportunity]
 * @param {string} [params.redirect]
 * @returns {string} Formatted search query string (e.g. "?opportunity=lake-revival&redirect=%2Fvolunteer%2Fdashboard")
 */
export function buildAuthParams(params = {}) {
  const safeParams = params || {};
  const { opportunity, redirect } = safeParams;
  const searchParams = new URLSearchParams();
  if (opportunity && typeof opportunity === 'string' && opportunity.trim()) {
    searchParams.set('opportunity', opportunity.trim());
  }
  if (redirect && typeof redirect === 'string') {
    const safe = sanitizeInternalRedirect(redirect, '');
    if (safe) {
      searchParams.set('redirect', safe);
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

/**
 * Evaluates route authorization and role-aware access decisions.
 * Used by ProtectedRoute and test suites.
 *
 * @param {Object} options
 * @param {Object|null} options.user - Authenticated user object or null
 * @param {boolean} [options.loading=false] - Auth session loading state
 * @param {boolean} [options.isAdmin=false] - Whether user has staff or admin role
 * @param {boolean} [options.adminOnly=false] - Whether route requires staff/admin
 * @param {boolean} [options.requireApprovedVolunteer=false] - Whether route requires approved volunteer standing
 * @param {Object|null} [options.profile=null] - VolunteerProfile object
 * @param {boolean} [options.profileLoading=false] - Profile fetch loading state
 * @param {string|null} [options.profileError=null] - Profile fetch error message if any
 * @param {string} [options.targetPath=''] - Intended internal destination path
 * @param {string} [options.oppParam=''] - Opportunity parameter if present
 * @returns {{ status: 'LOADING'|'UNAUTHENTICATED'|'DENIED'|'UNAPPROVED'|'ERROR'|'ALLOWED', redirect: string|null, error: string|null }}
 */
export function evaluateRouteAuthorization({
  user,
  loading = false,
  isAdmin = false,
  adminOnly = false,
  requireApprovedVolunteer = false,
  profile = null,
  profileLoading = false,
  profileError = null,
  targetPath = '',
  oppParam = '',
}) {
  if (loading) {
    return { status: 'LOADING', redirect: null, error: null };
  }

  if (!user) {
    const query = buildAuthParams({ redirect: targetPath, opportunity: oppParam });
    return { status: 'UNAUTHENTICATED', redirect: `/volunteer-portal${query}`, error: null };
  }

  if (adminOnly && !isAdmin) {
    return { status: 'DENIED', redirect: '/volunteer/dashboard', error: null };
  }

  if (requireApprovedVolunteer && !isAdmin) {
    if (profileLoading) {
      return { status: 'LOADING', redirect: null, error: null };
    }
    if (profileError) {
      return { status: 'ERROR', redirect: null, error: profileError };
    }
    if (!profile || profile.approval_status !== 'APPROVED') {
      const query = targetPath && targetPath.includes('?') ? targetPath.slice(targetPath.indexOf('?')) : '';
      return { status: 'UNAPPROVED', redirect: `/volunteer/applicant-portal${query}`, error: null };
    }
  }

  return { status: 'ALLOWED', redirect: null, error: null };
}

