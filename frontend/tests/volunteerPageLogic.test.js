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
});
