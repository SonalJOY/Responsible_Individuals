import test from 'node:test';
import assert from 'node:assert/strict';

test('Volunteer Page Business Logic & UI State Machine Tests', async (t) => {

  await t.test('1. Filter parameters map correctly to query parameters', () => {
    const rawFilters = {
      location: 'Bengaluru East',
      status: 'OPEN',
      interest: 'water-conservation',
    };

    const queryParams = {};
    if (rawFilters.location) queryParams.location = rawFilters.location;
    if (rawFilters.status) queryParams.status = rawFilters.status;
    if (rawFilters.interest) queryParams.interest = rawFilters.interest;

    assert.equal(queryParams.location, 'Bengaluru East');
    assert.equal(queryParams.status, 'OPEN');
    assert.equal(queryParams.interest, 'water-conservation');
  });

  await t.test('2. Filter reset restores all criteria to default null/empty', () => {
    let activeFilters = {
      location: 'Bengaluru East',
      status: 'OPEN',
      interest: 'water-conservation',
    };

    // Reset action
    activeFilters = {
      location: '',
      status: '',
      interest: '',
    };

    assert.equal(activeFilters.location, '');
    assert.equal(activeFilters.status, '');
    assert.equal(activeFilters.interest, '');
  });

  await t.test('3. Double submission prevention: lock guard prevents duplicate POST calls', async () => {
    let isSubmitting = false;
    let postCallCount = 0;

    const mockSubmit = async () => {
      if (isSubmitting) return; // Guard
      isSubmitting = true;
      postCallCount++;
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 50));
      isSubmitting = false;
    };

    // Rapid double-click in same event loop tick
    const p1 = mockSubmit();
    const p2 = mockSubmit();
    const p3 = mockSubmit();

    await Promise.all([p1, p2, p3]);

    assert.equal(postCallCount, 1, 'Expected only 1 network request despite 3 rapid submit clicks');
  });

  await t.test('4. Application validation: Statement of Purpose minimum length check', () => {
    const validateApplication = (statement) => {
      if (!statement || statement.trim().length < 10) {
        return 'Statement of purpose must be at least 10 characters long.';
      }
      return null;
    };

    assert.equal(validateApplication(''), 'Statement of purpose must be at least 10 characters long.');
    assert.equal(validateApplication('Short'), 'Statement of purpose must be at least 10 characters long.');
    assert.equal(validateApplication('I am very interested in helping the lake revival mission.'), null);
  });

  await t.test('5. Error handling: Extracts backend validation error correctly', () => {
    const formatErrorMessage = (err) => {
      if (err.response?.data) {
        const d = err.response.data;
        if (d.detail) return d.detail;
        if (d.opportunity) return Array.isArray(d.opportunity) ? d.opportunity[0] : d.opportunity;
        if (d.email) return Array.isArray(d.email) ? d.email[0] : d.email;
        if (d.error) return d.error;
      }
      return err.message || 'An unexpected error occurred.';
    };

    const duplicateError = {
      response: {
        data: { detail: 'You have already applied for this opportunity.' }
      }
    };
    assert.equal(formatErrorMessage(duplicateError), 'You have already applied for this opportunity.');

    const fullOppError = {
      response: {
        data: { opportunity: ['Opportunity has reached maximum capacity.'] }
      }
    };
    assert.equal(formatErrorMessage(fullOppError), 'Opportunity has reached maximum capacity.');
  });

  await t.test('6. Application status check: Matches existing application by Opportunity ID or Slug', () => {
    const user = { id: 'u1', email: 'volunteer@example.com' };
    const myApplications = [
      {
        id: 'app-1',
        opportunity: 'opp-101',
        opportunity_slug: 'lake-conservation-lead',
        opportunity_title: 'Lake Conservation Lead',
        status: 'PENDING',
        created_at: '2026-03-20T10:00:00Z',
      },
      {
        id: 'app-2',
        opportunity: 'opp-102',
        opportunity_slug: 'stem-mentor',
        opportunity_title: 'STEM Robotics Mentor',
        status: 'APPROVED',
        created_at: '2026-03-22T14:30:00Z',
      },
    ];

    const findExisting = (selectedOpp, apps, currentUser) => {
      if (!currentUser || !selectedOpp || !Array.isArray(apps)) return null;
      return apps.find((app) => 
        String(app.opportunity) === String(selectedOpp.id) ||
        (app.opportunity_id && String(app.opportunity_id) === String(selectedOpp.id)) ||
        (app.opportunity_slug && selectedOpp.slug && app.opportunity_slug === selectedOpp.slug)
      ) || null;
    };

    // Case A: Applied opportunity -> Returns existing application
    const oppApplied = { id: 'opp-101', slug: 'lake-conservation-lead', title: 'Lake Conservation Lead' };
    const resultApplied = findExisting(oppApplied, myApplications, user);
    assert.ok(resultApplied !== null);
    assert.equal(resultApplied.id, 'app-1');
    assert.equal(resultApplied.status, 'PENDING');

    // Case B: Unapplied opportunity -> Returns null (Form should open)
    const oppUnapplied = { id: 'opp-103', slug: 'tree-planting-drive', title: 'Urban Tree Planting' };
    const resultUnapplied = findExisting(oppUnapplied, myApplications, user);
    assert.equal(resultUnapplied, null);

    // Case C: Visitor (unauthenticated) -> Returns null (Registration form opens)
    const resultVisitor = findExisting(oppApplied, myApplications, null);
    assert.equal(resultVisitor, null);
  });

  await t.test('7. Application Status Labels & Mapping for UI', () => {
    const getStatusLabel = (status) => {
      switch (status) {
        case 'APPROVED':
          return 'Application Approved';
        case 'REJECTED':
          return 'Application Not Selected';
        case 'WAITLISTED':
          return 'Waitlisted';
        case 'PENDING':
        default:
          return 'Pending Review';
      }
    };

    assert.equal(getStatusLabel('PENDING'), 'Pending Review');
    assert.equal(getStatusLabel('APPROVED'), 'Application Approved');
    assert.equal(getStatusLabel('REJECTED'), 'Application Not Selected');
    assert.equal(getStatusLabel('WAITLISTED'), 'Waitlisted');
  });

  await t.test('8. UI Decision Matrix: Status View vs Application Form', () => {
    const resolveModalView = ({ successApplication, existingApplication, user, loading }) => {
      if (successApplication) return 'SUCCESS_CONFIRMATION';
      if (user && loading && !existingApplication) return 'LOADING';
      if (existingApplication) return 'APPLICATION_STATUS_VIEW';
      return 'APPLICATION_FORM';
    };

    // Newly submitted
    assert.equal(resolveModalView({ successApplication: { id: 'app-99' } }), 'SUCCESS_CONFIRMATION');

    // Loading applications for logged-in user
    assert.equal(resolveModalView({ user: { id: 'u1' }, loading: true, existingApplication: null }), 'LOADING');

    // Already applied -> Shows status view, no form
    assert.equal(resolveModalView({ user: { id: 'u1' }, loading: false, existingApplication: { id: 'app-1', status: 'PENDING' } }), 'APPLICATION_STATUS_VIEW');

    // Logged in, not yet applied -> Shows application form
    assert.equal(resolveModalView({ user: { id: 'u1' }, loading: false, existingApplication: null }), 'APPLICATION_FORM');

    // Visitor -> Shows registration & application form
    assert.equal(resolveModalView({ user: null, loading: false, existingApplication: null }), 'APPLICATION_FORM');
  });
});
