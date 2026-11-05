import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeInternalRedirect, buildAuthParams } from '../src/utils/navigation.js';

// Mock sessionStorage for Node test environment
globalThis.sessionStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

test('Phase 3 - Security & Navigation Test Suite', async (t) => {

  await t.test('1. Legitimate routes and nested routes are accepted', () => {
    const legitimateTargets = [
      '/',
      '/about',
      '/about/',
      '/projects',
      '/projects/lake-revival',
      '/projects/lake-revival/team',
      '/impact',
      '/volunteer',
      '/volunteer/dashboard',
      '/volunteer/dashboard/profile',
      '/volunteer-portal',
      '/donate',
      '/events',
      '/stories',
      '/stories/urban-greening',
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
      '/admin-portal/volunteers',
      '/admin-portal/donations',
      '/admin-portal/enquiries',
    ];

    for (const target of legitimateTargets) {
      const sanitized = sanitizeInternalRedirect(target, '/volunteer/dashboard');
      assert.equal(
        sanitized,
        target,
        `Expected legitimate target "${target}" to be allowed, but got: "${sanitized}"`
      );
    }
  });

  await t.test('2. Arbitrary internal paths not in allowlist are rejected', () => {
    const arbitraryInternalPaths = [
      '/secret',
      '/secret/passwords',
      '/admin', // not an allowed frontend route; only /admin-portal is allowed
      '/admin/volunteers',
      '/api',
      '/api/v1/auth/login',
      '/api/v1/volunteers/register/',
      '/unauthorized',
      '/internal',
      '/dashboard', // only /volunteer/dashboard is allowed
      '/users/123',
      '/phpmyadmin',
      '/wp-admin',
      '/system/env',
    ];

    for (const target of arbitraryInternalPaths) {
      const sanitized = sanitizeInternalRedirect(target, '/volunteer/dashboard');
      assert.equal(
        sanitized,
        '/volunteer/dashboard',
        `Expected arbitrary internal path "${target}" to be rejected and fall back, but got: "${sanitized}"`
      );
    }
  });

  await t.test('3. External and protocol-relative URLs are rejected', () => {
    const externalTargets = [
      'https://malicious-site.com',
      'http://attacker.org/steal-creds',
      '//attacker.org/test',
      '//evil.com',
      '///attacker.org',
      '////attacker.org',
      'https://legitimate-looking.com/volunteer/dashboard',
      'http://localhost:8000/volunteer/dashboard',
      'javascript:alert(document.cookie)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
    ];

    for (const target of externalTargets) {
      const sanitized = sanitizeInternalRedirect(target, '/volunteer/dashboard');
      assert.equal(
        sanitized,
        '/volunteer/dashboard',
        `Expected external/protocol-relative target "${target}" to be rejected, but got: "${sanitized}"`
      );
    }
  });

  await t.test('4. Backslashes, encoded bypasses, and malformed paths are rejected', () => {
    const evasiveTargets = [
      '/\\attacker.org',
      '\\attacker.org',
      '\\\\attacker.org\\test',
      '/projects\\attacker.com',
      '/projects/lake-revival\\..\\secret',
      '/projects/%5cattacker',
      '/%5c%5cattacker.com',
      '/%5cevil',
      '/projects/%2e%2e/secret', // path traversal resolving to /secret which is not allowed
      '/%00evil',
      '/\r\n/attacker.com',
      '/volunteer\tdashboard',
      'volunteer/dashboard', // missing leading slash
      '',
      '   ',
      null,
      undefined,
    ];

    for (const target of evasiveTargets) {
      const sanitized = sanitizeInternalRedirect(target, '/volunteer/dashboard');
      assert.equal(
        sanitized,
        '/volunteer/dashboard',
        `Expected evasive/malformed target "${target}" to be rejected, but got: "${sanitized}"`
      );
    }
  });

  await t.test('5. Query strings and hashes are strictly preserved on legitimate routes', () => {
    const targetsWithQueryAndHash = [
      {
        input: '/volunteer/dashboard?opportunity=lake-revival#apply',
        expected: '/volunteer/dashboard?opportunity=lake-revival#apply'
      },
      {
        input: '/projects?focus=water&city=bengaluru#results',
        expected: '/projects?focus=water&city=bengaluru#results'
      },
      {
        input: '/stories/urban-farming?view=grid#highlights',
        expected: '/stories/urban-farming?view=grid#highlights'
      },
      {
        input: '/admin-portal/volunteers?status=PENDING#table',
        expected: '/admin-portal/volunteers?status=PENDING#table'
      },
      {
        input: '/?ref=portal#hero',
        expected: '/?ref=portal#hero'
      }
    ];

    for (const { input, expected } of targetsWithQueryAndHash) {
      const sanitized = sanitizeInternalRedirect(input, '/volunteer/dashboard');
      assert.equal(
        sanitized,
        expected,
        `Expected query and hash to be preserved for "${input}", but got: "${sanitized}"`
      );
    }
  });

  await t.test('6. Safe fallback behavior works across custom and default fallbacks', () => {
    // Default fallback
    assert.equal(sanitizeInternalRedirect('//evil.com'), '/volunteer/dashboard');
    assert.equal(sanitizeInternalRedirect(null), '/volunteer/dashboard');
    assert.equal(sanitizeInternalRedirect('/secret'), '/volunteer/dashboard');

    // Custom fallback
    assert.equal(sanitizeInternalRedirect('//evil.com', '/'), '/');
    assert.equal(sanitizeInternalRedirect('/secret', '/projects'), '/projects');
    assert.equal(sanitizeInternalRedirect(undefined, '/about'), '/about');
    assert.equal(sanitizeInternalRedirect('malformed', ''), '');
  });

  await t.test('7. WHATWG URL parser and React Router navigation verification', () => {
    // Verify that WHATWG URL parser isolates relative internal paths against base origin
    const base = 'https://internal.ri.org';
    const parsedValid = new URL('/volunteer/dashboard?opp=lake', base);
    assert.equal(parsedValid.origin, base);
    assert.equal(parsedValid.pathname, '/volunteer/dashboard');
    assert.equal(parsedValid.search, '?opp=lake');

    // Verify parser behavior on host-spoofing inputs
    const parsedEvilRelative = new URL('//attacker.com', base);
    assert.equal(parsedEvilRelative.origin, 'https://attacker.com');
    assert.notEqual(parsedEvilRelative.origin, base);

    // Verify simulated React Router location state resolution:
    // In React Router, navigate(safeRedirect) expects a relative path matching app routes.
    const simulateRouterNavigate = (candidate, fallback = '/volunteer/dashboard') => {
      const target = sanitizeInternalRedirect(candidate, fallback);
      // React Router route matching simulation
      const currentOrigin = 'https://ri.org';
      const resolved = new URL(target, currentOrigin);
      return {
        safePath: target,
        internal: resolved.origin === currentOrigin,
        pathname: resolved.pathname,
      };
    };

    const nav1 = simulateRouterNavigate('/projects/lake-revival?view=detail');
    assert.equal(nav1.internal, true);
    assert.equal(nav1.safePath, '/projects/lake-revival?view=detail');
    assert.equal(nav1.pathname, '/projects/lake-revival');

    const navEvil = simulateRouterNavigate('//evil.com/phish');
    assert.equal(navEvil.internal, true);
    assert.equal(navEvil.safePath, '/volunteer/dashboard');
    assert.equal(navEvil.pathname, '/volunteer/dashboard');
  });

  await t.test('3. Query Parameter Builder: Constructs secure auth query strings correctly', () => {
    // Both redirect and opportunity
    assert.equal(
      buildAuthParams({ redirect: '/volunteer/dashboard', opportunity: 'clean-water-lead' }),
      '?opportunity=clean-water-lead&redirect=%2Fvolunteer%2Fdashboard'
    );

    // Only opportunity
    assert.equal(
      buildAuthParams({ opportunity: 'lake-revival' }),
      '?opportunity=lake-revival'
    );

    // Only redirect
    assert.equal(
      buildAuthParams({ redirect: '/projects' }),
      '?redirect=%2Fprojects'
    );

    // Empty params
    assert.equal(buildAuthParams({}), '');
    assert.equal(buildAuthParams({ redirect: '', opportunity: '' }), '');
    assert.equal(buildAuthParams(null), '');
  });

  await t.test('4. Opportunity Preservation through OTP Verification Cycle', () => {
    sessionStorage.clear();

    // Step A: User arrives at /volunteer and clicks "Apply for this Role"
    const clickedOpp = { id: 101, slug: 'lake-conservation-lead', title: 'Lake Conservation Lead' };
    const targetSlug = clickedOpp.slug;
    sessionStorage.setItem('ri_target_opportunity', targetSlug);

    // Step B: Preserved through registration and OTP query parameters
    const authQuery = buildAuthParams({ redirect: '', opportunity: targetSlug });
    assert.equal(authQuery, '?opportunity=lake-conservation-lead');

    // Step C: Verify OTP page resolves the opportunity from params or sessionStorage
    const urlParams = new URLSearchParams(authQuery);
    const resolvedOpp = urlParams.get('opportunity') || sessionStorage.getItem('ri_target_opportunity');
    assert.equal(resolvedOpp, 'lake-conservation-lead');

    // Step D: Navigation destination after OTP verification
    const destination = resolvedOpp
      ? `/volunteer/dashboard?opportunity=${encodeURIComponent(resolvedOpp)}`
      : '/';
    assert.equal(destination, '/volunteer/dashboard?opportunity=lake-conservation-lead');
  });

  await t.test('5. Stale, Closed or Missing Opportunity Detection', () => {
    const activeOpportunities = [
      { id: 1, slug: 'lake-conservation-lead', status: 'OPEN', spots_available: 10, spots_filled: 2 },
      { id: 2, slug: 'tree-planting-drive', status: 'OPEN', spots_available: 5, spots_filled: 5 }, // Filled
      { id: 3, slug: 'stem-mentor', status: 'CLOSED', spots_available: 4, spots_filled: 1 },       // Closed
    ];

    const validateOpportunitySlug = (slug, list) => {
      if (!slug || !Array.isArray(list)) return { valid: false, reason: 'MISSING' };
      const matched = list.find((o) => o.slug === slug || String(o.id) === String(slug));
      if (!matched) return { valid: false, reason: 'NOT_FOUND' };
      const spotsLeft = matched.spots_available - matched.spots_filled;
      if (matched.status !== 'OPEN' || spotsLeft <= 0) {
        return { valid: false, reason: 'CLOSED_OR_FILLED', opportunity: matched };
      }
      return { valid: true, opportunity: matched };
    };

    // Valid open opportunity
    const openRes = validateOpportunitySlug('lake-conservation-lead', activeOpportunities);
    assert.equal(openRes.valid, true);
    assert.equal(openRes.opportunity.id, 1);

    // Filled opportunity
    const filledRes = validateOpportunitySlug('tree-planting-drive', activeOpportunities);
    assert.equal(filledRes.valid, false);
    assert.equal(filledRes.reason, 'CLOSED_OR_FILLED');

    // Closed opportunity
    const closedRes = validateOpportunitySlug('stem-mentor', activeOpportunities);
    assert.equal(closedRes.valid, false);
    assert.equal(closedRes.reason, 'CLOSED_OR_FILLED');

    // Stale/Non-existent opportunity slug
    const missingRes = validateOpportunitySlug('expired-opportunity-2024', activeOpportunities);
    assert.equal(missingRes.valid, false);
    assert.equal(missingRes.reason, 'NOT_FOUND');
  });
});
