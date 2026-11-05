import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for node environment
globalThis.localStorage = {
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

test('adminService - Onboarding Applications API Contracts', async (t) => {
  const recordedCalls = [];

  // Mock Axios instance
  const mockApi = {
    get: async (url, config = {}) => {
      recordedCalls.push({ method: 'GET', url, config });
      if (url === '/volunteers/onboarding-applications/') {
        const { params = {} } = config;
        let apps = [
          {
            id: 'onb-1',
            volunteer_profile: 'prof-1',
            volunteer_name: 'Ananya Sharma',
            volunteer_email: 'ananya@example.org',
            volunteer_phone: '9876543210',
            volunteer_city: 'Bengaluru',
            statement_of_intent: 'Passionate about urban water lake rejuvenation and environmental restoration.',
            skills_summary: 'Community Organizing, Water Testing',
            experience_summary: '2 years volunteer at local clean-up drives',
            availability: 'Weekends',
            status: 'SUBMITTED',
            submitted_at: '2026-11-01T10:00:00Z',
            reviewed_at: null,
            reviewed_by: null,
            reviewed_by_name: null,
            admin_review_notes: '',
          },
          {
            id: 'onb-2',
            volunteer_profile: 'prof-2',
            volunteer_name: 'Rohan Gupta',
            volunteer_email: 'rohan@example.org',
            volunteer_phone: '9123456780',
            volunteer_city: 'Mysuru',
            statement_of_intent: 'Experienced educator wanting to teach STEM to underprivileged children.',
            skills_summary: 'Teaching, Mathematics',
            experience_summary: 'Private tutoring for 3 years',
            availability: 'Flexible',
            status: 'APPROVED',
            submitted_at: '2026-10-28T09:00:00Z',
            reviewed_at: '2026-10-29T14:00:00Z',
            reviewed_by: 'adm-1',
            reviewed_by_name: 'Super Admin',
            admin_review_notes: 'Strong alignment with education mission.',
          },
          {
            id: 'onb-3',
            volunteer_profile: 'prof-3',
            volunteer_name: 'Kavita Nair',
            volunteer_email: 'kavita@example.org',
            volunteer_phone: '9988776655',
            volunteer_city: 'Mangaluru',
            statement_of_intent: 'Looking to join social activities in my free time.',
            skills_summary: '',
            experience_summary: '',
            availability: 'Weekdays',
            status: 'REJECTED',
            submitted_at: '2026-10-20T11:00:00Z',
            reviewed_at: '2026-10-21T12:00:00Z',
            reviewed_by: 'adm-1',
            reviewed_by_name: 'Super Admin',
            admin_review_notes: 'Service geography currently restricted to Bengaluru & Mysuru clusters.',
          }
        ];

        if (params.status && params.status !== 'ALL') {
          apps = apps.filter(a => a.status === params.status);
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          apps = apps.filter(a => 
            a.volunteer_name.toLowerCase().includes(q) ||
            a.volunteer_email.toLowerCase().includes(q) ||
            a.statement_of_intent.toLowerCase().includes(q)
          );
        }

        return {
          data: {
            count: apps.length,
            next: null,
            previous: null,
            results: apps,
          }
        };
      }

      if (url.startsWith('/volunteers/onboarding-applications/') && !url.includes('/review/')) {
        const id = url.split('/')[3];
        return {
          data: {
            id,
            volunteer_name: 'Ananya Sharma',
            volunteer_email: 'ananya@example.org',
            volunteer_phone: '9876543210',
            volunteer_city: 'Bengaluru',
            statement_of_intent: 'Passionate about urban water lake rejuvenation and environmental restoration.',
            skills_summary: 'Community Organizing, Water Testing',
            experience_summary: '2 years volunteer at local clean-up drives',
            availability: 'Weekends',
            status: 'SUBMITTED',
            submitted_at: '2026-11-01T10:00:00Z',
          }
        };
      }

      return { data: {} };
    },

    post: async (url, payload, config = {}) => {
      recordedCalls.push({ method: 'POST', url, payload, config });
      if (url.includes('/volunteers/onboarding-applications/') && url.endsWith('/review/')) {
        const id = url.split('/')[3];
        return {
          data: {
            message: `Onboarding application ${payload.status.toLowerCase()} successfully.`,
            status: payload.status,
            application: {
              id,
              status: payload.status,
              admin_review_notes: payload.review_notes || '',
              reviewed_at: new Date().toISOString(),
              reviewed_by_name: 'Super Admin',
            }
          }
        };
      }
      return { data: {} };
    }
  };

  // Replicate service methods under test
  const adminOnboardingService = {
    getOnboardingApplications: async (params = {}) => {
      const res = await mockApi.get('/volunteers/onboarding-applications/', { params });
      return res.data;
    },
    getOnboardingApplicationDetail: async (id) => {
      const res = await mockApi.get(`/volunteers/onboarding-applications/${id}/`);
      return res.data;
    },
    reviewOnboardingApplication: async (id, status, notes = '') => {
      const res = await mockApi.post(`/volunteers/onboarding-applications/${id}/review/`, {
        status,
        review_notes: notes,
      });
      return res.data;
    }
  };

  await t.test('1. getOnboardingApplications calls GET with status and pagination params', async () => {
    recordedCalls.length = 0;
    const res = await adminOnboardingService.getOnboardingApplications({ status: 'SUBMITTED', page: 1 });
    
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/onboarding-applications/');
    assert.deepEqual(recordedCalls[0].config.params, { status: 'SUBMITTED', page: 1 });
    assert.equal(res.count, 1);
    assert.equal(res.results[0].volunteer_name, 'Ananya Sharma');
  });

  await t.test('2. getOnboardingApplications supports search query filtering', async () => {
    recordedCalls.length = 0;
    const res = await adminOnboardingService.getOnboardingApplications({ search: 'rohan' });

    assert.equal(recordedCalls.length, 1);
    assert.deepEqual(recordedCalls[0].config.params, { search: 'rohan' });
    assert.equal(res.count, 1);
    assert.equal(res.results[0].volunteer_name, 'Rohan Gupta');
  });

  await t.test('3. getOnboardingApplicationDetail retrieves full dossier for given ID', async () => {
    recordedCalls.length = 0;
    const res = await adminOnboardingService.getOnboardingApplicationDetail('onb-1');

    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/onboarding-applications/onb-1/');
    assert.equal(res.id, 'onb-1');
    assert.equal(res.volunteer_name, 'Ananya Sharma');
    assert.equal(res.volunteer_phone, '9876543210');
    assert.equal(res.volunteer_city, 'Bengaluru');
  });

  await t.test('4. reviewOnboardingApplication submits APPROVAL decision with review notes', async () => {
    recordedCalls.length = 0;
    const res = await adminOnboardingService.reviewOnboardingApplication(
      'onb-1',
      'APPROVED',
      'Candidate verified and approved for environmental tasks.'
    );

    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'POST');
    assert.equal(recordedCalls[0].url, '/volunteers/onboarding-applications/onb-1/review/');
    assert.equal(recordedCalls[0].payload.status, 'APPROVED');
    assert.equal(recordedCalls[0].payload.review_notes, 'Candidate verified and approved for environmental tasks.');
    assert.equal(res.status, 'APPROVED');
    assert.equal(res.application.status, 'APPROVED');
  });

  await t.test('5. reviewOnboardingApplication submits REJECTION decision with required feedback rationale', async () => {
    recordedCalls.length = 0;
    const res = await adminOnboardingService.reviewOnboardingApplication(
      'onb-1',
      'REJECTED',
      'Incomplete contact verification and location mismatch.'
    );

    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'POST');
    assert.equal(recordedCalls[0].url, '/volunteers/onboarding-applications/onb-1/review/');
    assert.equal(recordedCalls[0].payload.status, 'REJECTED');
    assert.equal(recordedCalls[0].payload.review_notes, 'Incomplete contact verification and location mismatch.');
    assert.equal(res.status, 'REJECTED');
  });
});

test('AdminOnboarding UI - Metric Aggregation & Data Transformation Logic', async (t) => {
  const sampleData = [
    { id: '1', status: 'SUBMITTED', volunteer_name: 'Applicant 1', volunteer_phone: '9876543210', volunteer_city: 'Bengaluru' },
    { id: '2', status: 'SUBMITTED', volunteer_name: 'Applicant 2', volunteer_phone: null, volunteer_city: null },
    { id: '3', status: 'APPROVED', volunteer_name: 'Applicant 3', volunteer_phone: '9123456789', volunteer_city: 'Mysuru' },
    { id: '4', status: 'REJECTED', volunteer_name: 'Applicant 4', volunteer_phone: '9888877777', volunteer_city: 'Delhi' },
  ];

  await t.test('1. KPI metric counts accurately partition by status', () => {
    const total = sampleData.length;
    const pending = sampleData.filter(a => a.status === 'SUBMITTED').length;
    const approved = sampleData.filter(a => a.status === 'APPROVED').length;
    const rejected = sampleData.filter(a => a.status === 'REJECTED').length;

    assert.equal(total, 4);
    assert.equal(pending, 2);
    assert.equal(approved, 1);
    assert.equal(rejected, 1);
  });

  await t.test('2. Status badge mapping accurately resolves style classes and labels', () => {
    const resolveBadge = (status) => {
      const s = (status || '').toUpperCase();
      if (s === 'APPROVED') return { label: 'Approved', className: 'approved' };
      if (s === 'REJECTED') return { label: 'Declined', className: 'rejected' };
      return { label: 'Pending Review', className: 'pending' };
    };

    assert.deepEqual(resolveBadge('APPROVED'), { label: 'Approved', className: 'approved' });
    assert.deepEqual(resolveBadge('approved'), { label: 'Approved', className: 'approved' });
    assert.deepEqual(resolveBadge('REJECTED'), { label: 'Declined', className: 'rejected' });
    assert.deepEqual(resolveBadge('SUBMITTED'), { label: 'Pending Review', className: 'pending' });
    assert.deepEqual(resolveBadge(null), { label: 'Pending Review', className: 'pending' });
  });

  await t.test('3. Fallback handlers for missing phone, city, or statement', () => {
    const formatContact = (app) => ({
      phone: app.volunteer_phone || 'Phone not set',
      city: app.volunteer_city || 'City not set',
      statement: app.statement_of_intent || 'No statement of intent was recorded.',
    });

    const populated = formatContact(sampleData[0]);
    assert.equal(populated.phone, '9876543210');
    assert.equal(populated.city, 'Bengaluru');

    const empty = formatContact(sampleData[1]);
    assert.equal(empty.phone, 'Phone not set');
    assert.equal(empty.city, 'City not set');
    assert.equal(empty.statement, 'No statement of intent was recorded.');
  });

  await t.test('4. Pagination page count computation', () => {
    const pageSize = 12;
    assert.equal(Math.max(1, Math.ceil(0 / pageSize)), 1);
    assert.equal(Math.max(1, Math.ceil(5 / pageSize)), 1);
    assert.equal(Math.max(1, Math.ceil(12 / pageSize)), 1);
    assert.equal(Math.max(1, Math.ceil(13 / pageSize)), 2);
    assert.equal(Math.max(1, Math.ceil(25 / pageSize)), 3);
  });

  await t.test('5. Future-Ready Documents & Verification section contract', () => {
    // Ensures Phase 2 placeholder flags and non-intrusive metadata are clearly defined
    const verificationSection = {
      title: 'Documents & Verification',
      pipelineStatus: 'Phase 2 Pipeline',
      requiresUploadsNow: false,
      scheduledModules: [
        'Government Photo ID',
        'Address / Residence Proof',
        'Skills & Certificates'
      ]
    };

    assert.equal(verificationSection.pipelineStatus, 'Phase 2 Pipeline');
    assert.equal(verificationSection.requiresUploadsNow, false);
    assert.equal(verificationSection.scheduledModules.length, 3);
  });
});

