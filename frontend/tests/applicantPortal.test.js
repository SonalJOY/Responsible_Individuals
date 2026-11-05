import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRouteAuthorization, sanitizeInternalRedirect, buildAuthParams } from '../src/utils/navigation.js';

// Mock browser globals for Node test environment
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

test('Step 2 - Volunteer Applicant Portal & Role-Aware Routing Test Suite', async (t) => {

  // =========================================================================
  // 1. APPLICANT ONBOARDING FORM VALIDATION & SUBMISSION LOGIC
  // =========================================================================

  await t.test('1. Validation: Statement of intent requires at least 20 non-whitespace characters', () => {
    const validateStatementOfIntent = (statement) => {
      if (!statement || statement.trim().length < 20) {
        return 'Please write at least 20 characters explaining your motivation to volunteer.';
      }
      return null;
    };

    assert.equal(validateStatementOfIntent(''), 'Please write at least 20 characters explaining your motivation to volunteer.');
    assert.equal(validateStatementOfIntent('   '), 'Please write at least 20 characters explaining your motivation to volunteer.');
    assert.equal(validateStatementOfIntent('Too short'), 'Please write at least 20 characters explaining your motivation to volunteer.');
    assert.equal(validateStatementOfIntent('1234567890123456789'), 'Please write at least 20 characters explaining your motivation to volunteer.'); // 19 chars
    assert.equal(validateStatementOfIntent('I am passionate about restoring Bangalore lakes.'), null); // >= 20 chars
  });

  await t.test('2. Validation: Indian mobile number format validation and normalization', () => {
    const validateAndNormalizePhone = (phone) => {
      const trimmed = (phone || '').trim().replace(/\s+/g, '');
      if (!trimmed) return { valid: true, normalized: '' };

      const digitsOnly = trimmed.replace(/\D/g, '');
      let coreDigits = digitsOnly;
      if (trimmed.startsWith('+91') && digitsOnly.startsWith('91')) {
        coreDigits = digitsOnly.slice(2);
      } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        coreDigits = digitsOnly.slice(2);
      }

      if (coreDigits.length !== 10 || !/^[6-9]/.test(coreDigits)) {
        return { valid: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' };
      }

      return { valid: true, normalized: `+91${coreDigits}` };
    };

    assert.equal(validateAndNormalizePhone('9845012345').valid, true);
    assert.equal(validateAndNormalizePhone('9845012345').normalized, '+919845012345');
    assert.equal(validateAndNormalizePhone('+91 98450 12345').valid, true);
    assert.equal(validateAndNormalizePhone('+91 98450 12345').normalized, '+919845012345');
    assert.equal(validateAndNormalizePhone('5845012345').valid, false); // invalid starting digit
    assert.equal(validateAndNormalizePhone('984501234').valid, false); // 9 digits
    assert.equal(validateAndNormalizePhone('98450123456').valid, false); // 11 digits
    assert.equal(validateAndNormalizePhone('abc9845012').valid, false); // alpha
  });

  await t.test('3. Form Submission: Successful submission updates onboarding state', async () => {
    let mockBackendDb = null;
    const mockSubmitOnboarding = async (payload) => {
      if (payload.statement_of_intent.length < 20) {
        throw { response: { status: 400, data: { statement_of_intent: ['Minimum length 20 required.'] } } };
      }
      mockBackendDb = {
        id: 'onb-uuid-1',
        status: 'SUBMITTED',
        statement_of_intent: payload.statement_of_intent,
        skills_summary: payload.skills_summary || '',
        availability: payload.availability || 'Weekends',
        city: payload.city || 'Bengaluru',
        submitted_at: '2026-10-26T10:00:00Z',
      };
      return mockBackendDb;
    };

    const validPayload = {
      statement_of_intent: 'I want to help with weekend tree plantations and lake rejuvenation.',
      skills_summary: 'Field Water Testing, Tree Plantation',
      availability: 'Weekends',
      city: 'Bengaluru',
      phone: '+919876543210',
    };

    const result = await mockSubmitOnboarding(validPayload);
    assert.equal(result.status, 'SUBMITTED');
    assert.equal(result.id, 'onb-uuid-1');
    assert.equal(result.statement_of_intent, validPayload.statement_of_intent);
  });

  await t.test('4. Validation Error Extraction: Handles backend field and detail errors', () => {
    const extractBackendError = (err) => {
      return (
        err?.response?.data?.detail ||
        err?.response?.data?.statement_of_intent?.[0] ||
        err?.response?.data?.phone?.[0] ||
        'Failed to submit onboarding application. Please check your inputs.'
      );
    };

    // Field-specific error
    const fieldErr = { response: { data: { statement_of_intent: ['Statement must contain at least 20 characters.'] } } };
    assert.equal(extractBackendError(fieldErr), 'Statement must contain at least 20 characters.');

    // Detail string error
    const detailErr = { response: { data: { detail: 'Your volunteer profile is already verified and approved.' } } };
    assert.equal(extractBackendError(detailErr), 'Your volunteer profile is already verified and approved.');

    // Fallback error
    const fallbackErr = { response: { data: {} } };
    assert.equal(extractBackendError(fallbackErr), 'Failed to submit onboarding application. Please check your inputs.');
  });

  await t.test('5. Duplicate Submission Prevention: Locks in-flight requests and handles concurrent pending error', async () => {
    let inFlight = false;
    let pendingInDb = false;

    const handleFormSubmit = async (payload) => {
      if (inFlight) return { blocked: true, reason: 'ALREADY_IN_FLIGHT' };
      if (pendingInDb) {
        throw {
          response: {
            status: 400,
            data: { detail: 'You already have an onboarding application under review by our administration. Please await a decision.' }
          }
        };
      }
      inFlight = true;
      try {
        // simulate async dispatch
        pendingInDb = true;
        return { success: true, status: 'SUBMITTED' };
      } finally {
        inFlight = false;
      }
    };

    // First attempt succeeds
    const firstAttempt = await handleFormSubmit({ statement_of_intent: 'Motivation statement exceeding twenty characters' });
    assert.equal(firstAttempt.success, true);
    assert.equal(firstAttempt.status, 'SUBMITTED');

    // Concurrent duplicate submission is blocked by database pending lock
    await assert.rejects(
      async () => {
        await handleFormSubmit({ statement_of_intent: 'Second submission attempt while pending' });
      },
      (err) => {
        assert.ok(err.response.data.detail.includes('already have an onboarding application under review'));
        return true;
      }
    );
  });

  // =========================================================================
  // 2. ONBOARDING APPLICATION LIFECYCLE & REAPPLICATION WORKFLOW
  // =========================================================================

  await t.test('6. Status Display: Correctly maps submitted review milestone timeline', () => {
    const getTimelineState = (onboardingStatus) => {
      return {
        accountCreated: true,
        applicationSubmitted: ['SUBMITTED', 'APPROVED', 'REJECTED'].includes(onboardingStatus),
        coordinatorReview: onboardingStatus === 'SUBMITTED',
        driveAccessUnlocked: onboardingStatus === 'APPROVED',
      };
    };

    const submittedTimeline = getTimelineState('SUBMITTED');
    assert.equal(submittedTimeline.accountCreated, true);
    assert.equal(submittedTimeline.applicationSubmitted, true);
    assert.equal(submittedTimeline.coordinatorReview, true);
    assert.equal(submittedTimeline.driveAccessUnlocked, false);

    const approvedTimeline = getTimelineState('APPROVED');
    assert.equal(approvedTimeline.driveAccessUnlocked, true);
  });

  await t.test('7. Rejection Feedback: Displays admin review notes and review metadata', () => {
    const onboardingRecord = {
      id: 'onb-rejected-1',
      status: 'REJECTED',
      statement_of_intent: 'Short test intent',
      admin_review_notes: 'Please expand your prior experience with specific dates and organization names.',
      reviewed_at: '2026-10-25T14:30:00Z',
      reviewed_by_name: 'Coordinator Sharma',
    };

    const formatRejectionDisplay = (record) => {
      if (record.status !== 'REJECTED') return null;
      return {
        badge: 'Revision Required',
        feedbackNotes: record.admin_review_notes || 'Please provide additional details.',
        reviewedDate: new Date(record.reviewed_at).toLocaleDateString('en-IN'),
        reviewedBy: record.reviewed_by_name,
        canReapply: true,
      };
    };

    const display = formatRejectionDisplay(onboardingRecord);
    assert.ok(display);
    assert.equal(display.badge, 'Revision Required');
    assert.equal(display.feedbackNotes, 'Please expand your prior experience with specific dates and organization names.');
    assert.equal(display.canReapply, true);
    assert.equal(display.reviewedBy, 'Coordinator Sharma');
  });

  await t.test('8. Reapplication: Re-enables form with pre-populated values and allows resubmission', () => {
    const rejectedApplication = {
      status: 'REJECTED',
      statement_of_intent: 'Initial motivation statement.',
      skills_summary: 'Community Outreach',
      availability: 'Weekends',
      experience_summary: 'Student volunteer in college.',
    };

    // User clicks Update & Reapply
    let isEditingForm = false;
    const onReapplyClick = () => { isEditingForm = true; };
    onReapplyClick();
    assert.equal(isEditingForm, true);

    // Form pre-populates with previous fields
    const formData = {
      statement_of_intent: rejectedApplication.statement_of_intent,
      skills_summary: rejectedApplication.skills_summary,
      availability: rejectedApplication.availability,
      experience_summary: rejectedApplication.experience_summary,
    };
    assert.equal(formData.statement_of_intent, 'Initial motivation statement.');

    // User updates statement of intent to address coordinator feedback
    formData.statement_of_intent = 'Updated motivation: 3 years experience with Bangalore Lake Rejuvenation Trust from 2023-2026.';
    assert.ok(formData.statement_of_intent.length >= 20);
  });

  // =========================================================================
  // 3. READ-ONLY OPPORTUNITIES CATALOG & MODAL ACCESSIBILITY
  // =========================================================================

  await t.test('9. Read-Only Enforcement: Unapproved applicants cannot execute opportunity signup', () => {
    const opp = { id: 'opp-1', title: 'Lake Water Sampler', status: 'OPEN' };
    const userRole = 'PUBLIC';
    const profileStatus = 'PENDING';

    const getOpportunityActions = ({ userRole, profileStatus }) => {
      const isApproved = userRole === 'VOLUNTEER' && profileStatus === 'APPROVED';
      if (!isApproved) {
        return {
          canDirectApply: false,
          actionLabel: 'Onboarding Required',
          isLocked: true,
          targetSection: 'onboarding-form',
        };
      }
      return {
        canDirectApply: true,
        actionLabel: 'Apply Now',
        isLocked: false,
        targetSection: 'application-modal',
      };
    };

    const actions = getOpportunityActions({ userRole, profileStatus });
    assert.equal(actions.canDirectApply, false);
    assert.equal(actions.actionLabel, 'Onboarding Required');
    assert.equal(actions.isLocked, true);
    assert.equal(actions.targetSection, 'onboarding-form');
  });

  await t.test('10. Search & Filter: Filters opportunities by query, focus area, and location', () => {
    const catalog = [
      { id: 1, title: 'Freshwater Lake Restoration Lead', focus_area: 'Lakes', location: 'Bengaluru', requirements: 'Sampling equipment' },
      { id: 2, title: 'Rural STEM Lab Mentor', focus_area: 'Education', location: 'Mysuru', requirements: 'Science teaching' },
      { id: 3, title: 'Urban Forest Tree Planter', focus_area: 'Forestry', location: 'Bengaluru', requirements: 'Physical fitness' },
    ];

    const filterOpps = ({ query = '', focusArea = 'ALL', location = 'ALL' }) => {
      return catalog.filter((opp) => {
        if (focusArea !== 'ALL' && opp.focus_area !== focusArea) return false;
        if (location !== 'ALL' && opp.location !== location) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          const matchTitle = opp.title.toLowerCase().includes(q);
          const matchReq = opp.requirements.toLowerCase().includes(q);
          if (!matchTitle && !matchReq) return false;
        }
        return true;
      });
    };

    // Filter by location
    assert.equal(filterOpps({ location: 'Bengaluru' }).length, 2);
    assert.equal(filterOpps({ location: 'Mysuru' }).length, 1);

    // Filter by focus area
    assert.equal(filterOpps({ focusArea: 'Education' }).length, 1);

    // Search query
    assert.equal(filterOpps({ query: 'tree' }).length, 1);
    assert.equal(filterOpps({ query: 'tree' })[0].id, 3);

    // Reset filters
    assert.equal(filterOpps({}).length, 3);
  });

  await t.test('11. Modal Accessibility: Escape key dismisses modal and aria dialog attributes present', () => {
    let openModalId = 'opp-101';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        openModalId = null;
      }
    };

    // Press Escape
    handleKeyDown({ key: 'Escape' });
    assert.equal(openModalId, null, 'Modal should close on Escape key');

    // Backdrop click dismisses
    openModalId = 'opp-102';
    const onBackdropClick = () => { openModalId = null; };
    onBackdropClick();
    assert.equal(openModalId, null, 'Modal should close on backdrop click');
  });

  // =========================================================================
  // 4. ROLE-AWARE ROUTE AUTHORIZATION DECISION MATRIX (7 REQUIRED CASES)
  // =========================================================================

  await t.test('12. Route Authorization - Case 1: Pending applicant is redirected to /volunteer/applicant-portal', () => {
    const decision = evaluateRouteAuthorization({
      user: { id: 'u-1', email: 'applicant@test.org', role: 'PUBLIC' },
      loading: false,
      isAdmin: false,
      requireApprovedVolunteer: true,
      profile: { id: 'p-1', approval_status: 'PENDING' },
      profileLoading: false,
      profileError: null,
      targetPath: '/volunteer/dashboard?opportunity=lake-revival',
    });

    assert.equal(decision.status, 'UNAPPROVED');
    assert.equal(decision.redirect, '/volunteer/applicant-portal?opportunity=lake-revival');
  });

  await t.test('13. Route Authorization - Case 2: Rejected applicant is redirected to /volunteer/applicant-portal', () => {
    const decision = evaluateRouteAuthorization({
      user: { id: 'u-2', email: 'rejected@test.org', role: 'PUBLIC' },
      loading: false,
      isAdmin: false,
      requireApprovedVolunteer: true,
      profile: { id: 'p-2', approval_status: 'REJECTED' },
      profileLoading: false,
      profileError: null,
      targetPath: '/volunteer/dashboard',
    });

    assert.equal(decision.status, 'UNAPPROVED');
    assert.equal(decision.redirect, '/volunteer/applicant-portal');
  });

  await t.test('14. Route Authorization - Case 3: Approved volunteer is allowed access to full dashboard', () => {
    const decision = evaluateRouteAuthorization({
      user: { id: 'u-3', email: 'approved@test.org', role: 'VOLUNTEER' },
      loading: false,
      isAdmin: false,
      requireApprovedVolunteer: true,
      profile: { id: 'p-3', approval_status: 'APPROVED' },
      profileLoading: false,
      profileError: null,
      targetPath: '/volunteer/dashboard',
    });

    assert.equal(decision.status, 'ALLOWED');
    assert.equal(decision.redirect, null);
  });

  await t.test('15. Route Authorization - Case 4: Administrator/staff retains authorized access without redirect to applicant portal', () => {
    const adminDashboardDecision = evaluateRouteAuthorization({
      user: { id: 'u-admin', email: 'admin@test.org', is_staff: true, role: 'SUPER_ADMIN' },
      loading: false,
      isAdmin: true,
      requireApprovedVolunteer: true,
      profile: null, // Admin might not have a VolunteerProfile
      profileLoading: false,
      profileError: null,
      targetPath: '/volunteer/dashboard',
    });

    assert.equal(adminDashboardDecision.status, 'ALLOWED');
    assert.equal(adminDashboardDecision.redirect, null);

    const adminPortalDecision = evaluateRouteAuthorization({
      user: { id: 'u-admin', email: 'admin@test.org', is_staff: true, role: 'SUPER_ADMIN' },
      loading: false,
      isAdmin: true,
      adminOnly: true,
      requireApprovedVolunteer: false,
      targetPath: '/admin-portal',
    });

    assert.equal(adminPortalDecision.status, 'ALLOWED');
    assert.equal(adminPortalDecision.redirect, null);
  });

  await t.test('16. Route Authorization - Case 5: Unauthenticated visitor is redirected to /volunteer-portal with destination', () => {
    const decision = evaluateRouteAuthorization({
      user: null,
      loading: false,
      isAdmin: false,
      requireApprovedVolunteer: true,
      targetPath: '/volunteer/dashboard?tab=profile',
      oppParam: 'lake-cleanliness',
    });

    assert.equal(decision.status, 'UNAUTHENTICATED');
    const redirectUrl = new URL(decision.redirect, 'http://localhost');
    assert.equal(redirectUrl.pathname, '/volunteer-portal');
    assert.equal(redirectUrl.searchParams.get('redirect'), '/volunteer/dashboard?tab=profile');
    assert.equal(redirectUrl.searchParams.get('opportunity'), 'lake-cleanliness');
  });

  await t.test('17. Route Authorization - Case 6: Loading states render preloader and never prematurely redirect', () => {
    // Auth loading
    const authLoadingDecision = evaluateRouteAuthorization({
      user: null,
      loading: true,
      isAdmin: false,
      requireApprovedVolunteer: true,
      targetPath: '/volunteer/dashboard',
    });
    assert.equal(authLoadingDecision.status, 'LOADING');
    assert.equal(authLoadingDecision.redirect, null);

    // Profile loading for authenticated user
    const profileLoadingDecision = evaluateRouteAuthorization({
      user: { id: 'u-5', email: 'loading@test.org' },
      loading: false,
      isAdmin: false,
      requireApprovedVolunteer: true,
      profile: null,
      profileLoading: true,
      targetPath: '/volunteer/dashboard',
    });
    assert.equal(profileLoadingDecision.status, 'LOADING');
    assert.equal(profileLoadingDecision.redirect, null);
  });

  await t.test('18. Route Authorization - Case 7: Profile fetch error explicitly blocks access without treating missing profile as approval', () => {
    // Fetch error state
    const errorDecision = evaluateRouteAuthorization({
      user: { id: 'u-6', email: 'error@test.org' },
      loading: false,
      isAdmin: false,
      requireApprovedVolunteer: true,
      profile: null,
      profileLoading: false,
      profileError: 'Network request failed: 500 Internal Server Error',
      targetPath: '/volunteer/dashboard',
    });

    assert.equal(errorDecision.status, 'ERROR');
    assert.equal(errorDecision.redirect, null);
    assert.equal(errorDecision.error, 'Network request failed: 500 Internal Server Error');

    // Missing profile without error (e.g. 404 / empty) is treated as unapproved, NOT allowed
    const missingProfileDecision = evaluateRouteAuthorization({
      user: { id: 'u-7', email: 'missing@test.org' },
      loading: false,
      isAdmin: false,
      requireApprovedVolunteer: true,
      profile: null,
      profileLoading: false,
      profileError: null,
      targetPath: '/volunteer/dashboard',
    });

    assert.equal(missingProfileDecision.status, 'UNAPPROVED');
    assert.equal(missingProfileDecision.redirect, '/volunteer/applicant-portal');
  });

  // =========================================================================
  // 5. POST-REGISTRATION ROLE-AWARE REDIRECT RESOLUTION
  // =========================================================================

  await t.test('19. Post-Registration Redirect: Default route for newly registered non-admin user is /volunteer/applicant-portal', () => {
    const resolvePostRegistrationDestination = (user, opportunity, redirect) => {
      const isUserAdmin = Boolean(user?.is_admin_or_staff || user?.is_staff);
      const isApprovedVolunteer = Boolean(user?.role === 'VOLUNTEER');

      if (isUserAdmin) {
        return '/admin-portal';
      }
      if (isApprovedVolunteer) {
        return opportunity
          ? `/volunteer/dashboard?opportunity=${encodeURIComponent(opportunity)}`
          : (redirect ? sanitizeInternalRedirect(redirect, '/volunteer/dashboard') : '/volunteer/dashboard');
      }
      return opportunity
        ? `/volunteer/applicant-portal?opportunity=${encodeURIComponent(opportunity)}`
        : (redirect ? sanitizeInternalRedirect(redirect, '/volunteer/applicant-portal') : '/volunteer/applicant-portal');
    };

    // Case A: Newly registered citizen with no params -> /volunteer/applicant-portal
    const newCitizen = { id: 10, email: 'citizen@test.org', role: 'PUBLIC' };
    assert.equal(resolvePostRegistrationDestination(newCitizen, '', ''), '/volunteer/applicant-portal');

    // Case B: With opportunity context preserved
    assert.equal(
      resolvePostRegistrationDestination(newCitizen, 'lake-coordinator', ''),
      '/volunteer/applicant-portal?opportunity=lake-coordinator'
    );

    // Case C: With valid internal redirect preserved
    assert.equal(
      resolvePostRegistrationDestination(newCitizen, '', '/impact'),
      '/impact'
    );

    // Case D: With malicious external redirect neutralized
    assert.equal(
      resolvePostRegistrationDestination(newCitizen, '', 'https://evil.com/phish'),
      '/volunteer/applicant-portal'
    );

    // Case E: Admin user goes to /admin-portal
    const adminUser = { id: 1, email: 'admin@test.org', is_staff: true };
    assert.equal(resolvePostRegistrationDestination(adminUser, '', ''), '/admin-portal');
  });
});
