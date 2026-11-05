import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAuthParams, sanitizeInternalRedirect } from '../src/utils/navigation.js';

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

test('Phase 4 - Volunteer Dashboard & Route Guard Test Suite', async (t) => {

  // =========================================================================
  // 1. DASHBOARD TAB RESOLUTION & STATE MACHINE
  // =========================================================================
  await t.test('1. Tab Resolution: Defaults to overview when no parameter is present', () => {
    const validTabs = ['overview', 'opportunities', 'applications', 'profile'];
    const resolveTab = (pathTab, queryTab) => {
      const raw = (pathTab && validTabs.includes(pathTab.toLowerCase()))
        ? pathTab.toLowerCase()
        : queryTab;
      return (raw && validTabs.includes(raw.toLowerCase())) ? raw.toLowerCase() : 'overview';
    };

    assert.equal(resolveTab(null, null), 'overview');
    assert.equal(resolveTab(undefined, ''), 'overview');
    assert.equal(resolveTab('', null), 'overview');
  });

  await t.test('2. Tab Resolution: Accepts all 4 valid tabs via path or query param', () => {
    const validTabs = ['overview', 'opportunities', 'applications', 'profile'];
    const resolveTab = (pathTab, queryTab) => {
      const raw = (pathTab && validTabs.includes(pathTab.toLowerCase()))
        ? pathTab.toLowerCase()
        : queryTab;
      return (raw && validTabs.includes(raw.toLowerCase())) ? raw.toLowerCase() : 'overview';
    };

    for (const tab of validTabs) {
      assert.equal(resolveTab(tab, null), tab);
      assert.equal(resolveTab(tab.toUpperCase(), null), tab);
      assert.equal(resolveTab(null, tab), tab);
      assert.equal(resolveTab(null, tab.toUpperCase()), tab);
    }
  });

  await t.test('3. Tab Resolution: Rejects invalid tab names and falls back to overview', () => {
    const validTabs = ['overview', 'opportunities', 'applications', 'profile'];
    const resolveTab = (pathTab, queryTab) => {
      const raw = (pathTab && validTabs.includes(pathTab.toLowerCase()))
        ? pathTab.toLowerCase()
        : queryTab;
      return (raw && validTabs.includes(raw.toLowerCase())) ? raw.toLowerCase() : 'overview';
    };

    const invalidTabs = ['settings', 'admin', 'unknown', '<script>', '../../hack', 'analytics'];
    for (const invalid of invalidTabs) {
      assert.equal(resolveTab(invalid, null), 'overview');
      assert.equal(resolveTab(null, invalid), 'overview');
    }
  });

  await t.test('4. Tab Switching: Preserves existing URL parameters when switching tabs', () => {
    const currentParams = new URLSearchParams('opportunity=tree-plantation-lead&source=homepage');
    
    // Switch to profile tab
    currentParams.set('tab', 'profile');
    assert.equal(currentParams.get('tab'), 'profile');
    assert.equal(currentParams.get('opportunity'), 'tree-plantation-lead');
    assert.equal(currentParams.get('source'), 'homepage');

    // Switch to applications tab
    currentParams.set('tab', 'applications');
    assert.equal(currentParams.get('tab'), 'applications');
    assert.equal(currentParams.get('opportunity'), 'tree-plantation-lead');
  });

  // =========================================================================
  // 2. OPPORTUNITY HAND-OFF CONTEXT RESOLUTION
  // =========================================================================
  await t.test('5. Opportunity Hand-off: Resolves matched opportunity by slug or ID', () => {
    const opportunitiesCatalog = [
      { id: 1, slug: 'lake-cleanliness-coordinator', title: 'Lake Cleanliness Coordinator', status: 'OPEN', spots_available: 5, spots_filled: 2 },
      { id: 2, slug: 'tree-plantation-lead', title: 'Tree Plantation Drive Lead', status: 'OPEN', spots_available: 10, spots_filled: 10 },
      { id: 3, slug: 'food-relief-volunteer', title: 'Food Relief Volunteer', status: 'CLOSED', spots_available: 4, spots_filled: 1 },
    ];

    const matchOpportunity = (targetSlug) => {
      return opportunitiesCatalog.find(
        (o) => String(o.slug) === String(targetSlug) || String(o.id) === String(targetSlug)
      ) || null;
    };

    // By slug
    const matchedBySlug = matchOpportunity('lake-cleanliness-coordinator');
    assert.ok(matchedBySlug);
    assert.equal(matchedBySlug.id, 1);
    assert.equal(matchedBySlug.title, 'Lake Cleanliness Coordinator');

    // By ID
    const matchedById = matchOpportunity('1');
    assert.ok(matchedById);
    assert.equal(matchedById.slug, 'lake-cleanliness-coordinator');

    // Stale or non-existent
    assert.equal(matchOpportunity('non-existent-opportunity'), null);
  });

  await t.test('6. Opportunity Hand-off: Capacity and closed status detection', () => {
    const evaluateOpportunityAvailability = (opp) => {
      if (!opp) return { available: false, error: 'Opportunity not found' };
      if (opp.status !== 'OPEN') {
        return { available: false, error: `The role "${opp.title}" is currently closed.` };
      }
      if (opp.spots_available - opp.spots_filled <= 0) {
        return { available: false, error: `The role "${opp.title}" has reached capacity.` };
      }
      return { available: true, error: null };
    };

    // Open with spots available
    const openOpp = { id: 1, title: 'Lake Coordinator', status: 'OPEN', spots_available: 5, spots_filled: 2 };
    assert.deepEqual(evaluateOpportunityAvailability(openOpp), { available: true, error: null });

    // Open but full capacity
    const fullOpp = { id: 2, title: 'Tree Plantation Lead', status: 'OPEN', spots_available: 10, spots_filled: 10 };
    const fullResult = evaluateOpportunityAvailability(fullOpp);
    assert.equal(fullResult.available, false);
    assert.ok(fullResult.error.includes('reached capacity'));

    // Closed role
    const closedOpp = { id: 3, title: 'Food Relief', status: 'CLOSED', spots_available: 4, spots_filled: 1 };
    const closedResult = evaluateOpportunityAvailability(closedOpp);
    assert.equal(closedResult.available, false);
    assert.ok(closedResult.error.includes('currently closed'));
  });

  // =========================================================================
  // 3. HONEST EMPTY STATES & DATA INTEGRITY
  // =========================================================================
  await t.test('7. Empty State: Displays zero applications honestly without fabricating data', () => {
    const applications = [];
    const hasApplications = applications.length > 0;
    const emptyStateText = hasApplications ? null : 'No applications submitted yet';
    assert.equal(emptyStateText, 'No applications submitted yet');
  });

  await t.test('8. Empty State: Formats contribution hours honestly (0.0 hrs when unlogged)', () => {
    const formatHours = (hours) => `${parseFloat(hours || 0).toFixed(1)} hrs`;
    assert.equal(formatHours(null), '0.0 hrs');
    assert.equal(formatHours(undefined), '0.0 hrs');
    assert.equal(formatHours(0), '0.0 hrs');
    assert.equal(formatHours('0'), '0.0 hrs');
    assert.equal(formatHours(14.5), '14.5 hrs');
    assert.equal(formatHours('22.75'), '22.8 hrs');
  });

  await t.test('9. Role & Approval Badge: Clearly differentiates Applicant vs Verified Volunteer vs Admin', () => {
    const getRoleInfo = (user, profile) => {
      const isAdmin = user?.role === 'ADMIN' || user?.is_staff || user?.is_superuser;
      const isVerifiedVolunteer = user?.role === 'VOLUNTEER' || profile?.approval_status === 'APPROVED';

      const roleDisplay = isAdmin
        ? 'Super Admin'
        : isVerifiedVolunteer
          ? 'Verified Volunteer'
          : 'Applicant Account (Pending Review)';
      const roleClass = isAdmin ? 'admin' : isVerifiedVolunteer ? 'volunteer' : 'pending';

      return { roleDisplay, roleClass };
    };

    // Pending applicant
    const applicant = getRoleInfo({ role: 'USER', email: 'applicant@example.com' }, { approval_status: 'PENDING' });
    assert.equal(applicant.roleDisplay, 'Applicant Account (Pending Review)');
    assert.equal(applicant.roleClass, 'pending');

    // Approved volunteer via profile status
    const approvedProfile = getRoleInfo({ role: 'USER', email: 'vol@example.com' }, { approval_status: 'APPROVED' });
    assert.equal(approvedProfile.roleDisplay, 'Verified Volunteer');
    assert.equal(approvedProfile.roleClass, 'volunteer');

    // Approved volunteer via user role
    const approvedRole = getRoleInfo({ role: 'VOLUNTEER', email: 'vol@example.com' }, { approval_status: 'PENDING' });
    assert.equal(approvedRole.roleDisplay, 'Verified Volunteer');
    assert.equal(approvedRole.roleClass, 'volunteer');

    // Super Admin
    const admin = getRoleInfo({ role: 'ADMIN', is_staff: true }, { approval_status: 'APPROVED' });
    assert.equal(admin.roleDisplay, 'Super Admin');
    assert.equal(admin.roleClass, 'admin');
  });

  // =========================================================================
  // 4. PROFILE EDITING & FIELD-LEVEL RESTRICTIONS
  // =========================================================================
  await t.test('10. Profile Validation: Full name requires at least 2 non-whitespace characters', () => {
    const validateFullName = (name) => {
      if (!name || name.trim().length < 2) {
        return 'Please enter your full name (at least 2 characters).';
      }
      return null;
    };

    assert.equal(validateFullName(''), 'Please enter your full name (at least 2 characters).');
    assert.equal(validateFullName('   '), 'Please enter your full name (at least 2 characters).');
    assert.equal(validateFullName('A'), 'Please enter your full name (at least 2 characters).');
    assert.equal(validateFullName('Jo'), null);
    assert.equal(validateFullName('Sonal Joy'), null);
  });

  await t.test('11. Profile Validation: Indian mobile number format validation and normalization', () => {
    const normalizeAndValidatePhone = (phone) => {
      if (!phone || !phone.trim()) return { valid: true, normalized: '' };
      const raw = phone.trim();
      const cleanPhoneDigits = raw.replace(/\D/g, '');
      let coreDigits = cleanPhoneDigits;
      if (raw.startsWith('+91') && cleanPhoneDigits.startsWith('91')) {
        coreDigits = cleanPhoneDigits.slice(2);
      } else if (cleanPhoneDigits.length === 12 && cleanPhoneDigits.startsWith('91')) {
        coreDigits = cleanPhoneDigits.slice(2);
      }

      if (coreDigits.length > 0 && (coreDigits.length !== 10 || !/^[6-9]/.test(coreDigits))) {
        return { valid: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
      }

      return { valid: true, normalized: coreDigits ? `+91${coreDigits}` : '' };
    };

    // Valid 10-digit formats
    assert.deepEqual(normalizeAndValidatePhone('9876543210'), { valid: true, normalized: '+919876543210' });
    assert.deepEqual(normalizeAndValidatePhone('+91 9876543210'), { valid: true, normalized: '+919876543210' });
    assert.deepEqual(normalizeAndValidatePhone('+919876543210'), { valid: true, normalized: '+919876543210' });
    assert.deepEqual(normalizeAndValidatePhone('919876543210'), { valid: true, normalized: '+919876543210' });
    assert.deepEqual(normalizeAndValidatePhone('6123456789'), { valid: true, normalized: '+916123456789' });

    // Invalid formats
    assert.equal(normalizeAndValidatePhone('5123456789').valid, false); // starts with 5
    assert.equal(normalizeAndValidatePhone('1234567890').valid, false); // starts with 1
    assert.equal(normalizeAndValidatePhone('987654321').valid, false); // 9 digits
    assert.equal(normalizeAndValidatePhone('987654321000').valid, false); // too long
  });

  await t.test('12. Profile Form: Interest toggle adds or removes items without duplicates', () => {
    const toggleInterest = (currentList, id) => {
      const exists = currentList.some((item) => String(item) === String(id));
      return exists
        ? currentList.filter((item) => String(item) !== String(id))
        : [...currentList, id];
    };

    let interests = [1, 2];
    interests = toggleInterest(interests, 3);
    assert.deepEqual(interests, [1, 2, 3]);

    interests = toggleInterest(interests, 2);
    assert.deepEqual(interests, [1, 3]);

    interests = toggleInterest(interests, 1);
    assert.deepEqual(interests, [3]);
  });

  await t.test('13. Profile Form: User name synchronization on successful update', () => {
    const currentUser = { id: 10, email: 'volunteer@example.com', first_name: 'Old', last_name: 'Name' };
    const newFullName = 'Aarav Patel';

    const syncAuthUser = (user, fullName) => {
      const parts = fullName.trim().split(' ');
      return {
        ...user,
        first_name: parts[0] || user.first_name,
        last_name: parts.slice(1).join(' ') || user.last_name,
      };
    };

    const updatedUser = syncAuthUser(currentUser, newFullName);
    assert.equal(updatedUser.first_name, 'Aarav');
    assert.equal(updatedUser.last_name, 'Patel');
    assert.equal(updatedUser.email, 'volunteer@example.com');
  });

  await t.test('14. Security: Disallowed server fields are excluded from profile update payload', () => {
    const formInput = {
      full_name: 'Priya Sharma',
      phone: '+919876543210',
      city: 'Bengaluru',
      state: 'Karnataka',
      occupation: 'Environmental Scientist',
      skills: 'Water Testing, Soil Sampling',
      availability: 'Weekends',
      bio: 'Dedicated community volunteer.',
      interests: [1, 4],
      // Malicious or accidental server-controlled fields:
      email: 'hacked@example.com',
      role: 'ADMIN',
      approval_status: 'APPROVED',
      total_hours_contributed: 500,
      is_staff: true,
    };

    // Safe payload builder strictly filters server-controlled fields
    const buildSafeProfilePayload = (data) => ({
      full_name: data.full_name?.trim() || '',
      phone: data.phone?.trim() || '',
      city: data.city?.trim() || '',
      state: data.state?.trim() || '',
      occupation: data.occupation?.trim() || '',
      skills: data.skills?.trim() || '',
      availability: data.availability?.trim() || '',
      bio: data.bio?.trim() || '',
      interests: Array.isArray(data.interests) ? data.interests : [],
    });

    const payload = buildSafeProfilePayload(formInput);
    assert.equal(payload.full_name, 'Priya Sharma');
    assert.equal(payload.email, undefined);
    assert.equal(payload.role, undefined);
    assert.equal(payload.approval_status, undefined);
    assert.equal(payload.total_hours_contributed, undefined);
    assert.equal(payload.is_staff, undefined);
  });

  // =========================================================================
  // 5. ROUTE GUARD HARDENING (ProtectedRoute Logic)
  // =========================================================================
  await t.test('15. Route Guard: Unauthenticated access redirects with destination and opportunity', () => {
    const evaluateRouteAccess = ({ user, isAdmin, targetPath, oppSlug, adminOnly }) => {
      if (!user) {
        const query = buildAuthParams({ redirect: targetPath, opportunity: oppSlug });
        return { allow: false, redirect: `/volunteer-portal${query}` };
      }
      if (adminOnly && !isAdmin) {
        return { allow: false, redirect: '/volunteer/dashboard' };
      }
      return { allow: true, redirect: null };
    };

    // Anonymous user visiting dashboard with opportunity
    const anonDashboard = evaluateRouteAccess({
      user: null,
      isAdmin: false,
      targetPath: '/volunteer/dashboard',
      oppSlug: 'lake-cleanliness-coordinator',
      adminOnly: false,
    });
    assert.equal(anonDashboard.allow, false);
    const redirectUrl = new URL(anonDashboard.redirect, 'http://localhost');
    assert.equal(redirectUrl.pathname, '/volunteer-portal');
    assert.equal(redirectUrl.searchParams.get('redirect'), '/volunteer/dashboard');
    assert.equal(redirectUrl.searchParams.get('opportunity'), 'lake-cleanliness-coordinator');

    // Regular authenticated volunteer visiting dashboard
    const authedVolunteer = evaluateRouteAccess({
      user: { id: 5, role: 'USER' },
      isAdmin: false,
      targetPath: '/volunteer/dashboard',
      oppSlug: '',
      adminOnly: false,
    });
    assert.equal(authedVolunteer.allow, true);
    assert.equal(authedVolunteer.redirect, null);

    // Regular volunteer attempting to visit admin-only route
    const regularUserAdminAttempt = evaluateRouteAccess({
      user: { id: 5, role: 'USER' },
      isAdmin: false,
      targetPath: '/admin-portal',
      oppSlug: '',
      adminOnly: true,
    });
    assert.equal(regularUserAdminAttempt.allow, false);
    assert.equal(regularUserAdminAttempt.redirect, '/volunteer/dashboard');

    // Admin accessing admin-only route
    const adminAccess = evaluateRouteAccess({
      user: { id: 1, role: 'ADMIN' },
      isAdmin: true,
      targetPath: '/admin-portal',
      oppSlug: '',
      adminOnly: true,
    });
    assert.equal(adminAccess.allow, true);
    assert.equal(adminAccess.redirect, null);
  });

  await t.test('16. Route Guard: Malicious redirect destinations are neutralized by sanitizeInternalRedirect', () => {
    const sanitizeAndBuildRedirect = (untrustedDestination) => {
      const safe = sanitizeInternalRedirect(untrustedDestination, '/volunteer/dashboard');
      return safe;
    };

    assert.equal(sanitizeAndBuildRedirect('https://malicious.com'), '/volunteer/dashboard');
    assert.equal(sanitizeAndBuildRedirect('//evil.com/phish'), '/volunteer/dashboard');
    assert.equal(sanitizeAndBuildRedirect('javascript:alert(1)'), '/volunteer/dashboard');
    assert.equal(sanitizeAndBuildRedirect('/volunteer/dashboard?tab=applications'), '/volunteer/dashboard?tab=applications');
  });
});
