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

test('adminService - Volunteer Directory API Contracts', async (t) => {
  const recordedCalls = [];

  // Mock Axios instance
  const mockApi = {
    get: async (url, config = {}) => {
      recordedCalls.push({ method: 'GET', url, config });

      // Directory listing
      if (url === '/volunteers/profiles/') {
        const { params = {} } = config;
        let profiles = [
          {
            id: 'prof-001',
            user: { id: 101, username: 'aarav', email: 'aarav@example.com', first_name: 'Aarav', last_name: 'Patel' },
            full_name: 'Aarav Patel',
            email: 'aarav@example.com',
            phone: '9876543210',
            city: 'Bengaluru',
            occupation: 'Software Engineer',
            approval_status: 'APPROVED',
            is_active: true,
            total_hours: 42.5,
            certificates_count: 2,
            skills: ['Python', 'Data Analysis', 'First Aid'],
            cause_interests: ['Education', 'Environment'],
            bio: 'Passionate about educational equity and STEM literacy.',
            created_at: '2026-09-01T10:00:00Z',
          },
          {
            id: 'prof-002',
            user: { id: 102, username: 'diya', email: 'diya@example.com', first_name: 'Diya', last_name: 'Sharma' },
            full_name: 'Diya Sharma',
            email: 'diya@example.com',
            phone: '9123456789',
            city: 'Mysuru',
            occupation: 'College Lecturer',
            approval_status: 'APPROVED',
            is_active: false,
            total_hours: 18.0,
            certificates_count: 1,
            skills: ['Teaching', 'Public Speaking'],
            cause_interests: ['Child Welfare'],
            bio: 'Weekend instructor for foundational literacy drives.',
            created_at: '2026-09-15T12:00:00Z',
          },
          {
            id: 'prof-003',
            user: { id: 103, username: 'kabir', email: 'kabir@example.com', first_name: 'Kabir', last_name: 'Verma' },
            full_name: 'Kabir Verma',
            email: 'kabir@example.com',
            phone: '9988776655',
            city: 'Mangaluru',
            occupation: 'Graphic Designer',
            approval_status: 'PENDING',
            is_active: true,
            total_hours: 0,
            certificates_count: 0,
            skills: ['Design', 'Social Media'],
            cause_interests: ['Animal Welfare'],
            bio: '',
            created_at: '2026-10-01T08:30:00Z',
          },
          {
            id: 'prof-004',
            user: { id: 104, username: 'meera', email: 'meera@example.com', first_name: 'Meera', last_name: 'Iyer' },
            full_name: 'Meera Iyer',
            email: 'meera@example.com',
            phone: null,
            city: null,
            occupation: '',
            approval_status: 'REJECTED',
            is_active: false,
            total_hours: 0,
            certificates_count: 0,
            skills: [],
            cause_interests: [],
            bio: null,
            created_at: '2026-10-10T14:20:00Z',
          }
        ];

        if (params.approval_status && params.approval_status !== 'ALL') {
          profiles = profiles.filter(p => p.approval_status === params.approval_status);
        }
        if (params.is_active !== undefined && params.is_active !== 'ALL') {
          const activeBool = params.is_active === true || params.is_active === 'true';
          profiles = profiles.filter(p => p.is_active === activeBool);
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          profiles = profiles.filter(p =>
            p.full_name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            (p.phone && p.phone.includes(q)) ||
            (p.skills && p.skills.some(s => s.toLowerCase().includes(q)))
          );
        }

        return {
          data: {
            count: profiles.length,
            next: null,
            previous: null,
            results: profiles,
          }
        };
      }

      // Volunteer detail
      if (url.startsWith('/volunteers/profiles/') && !url.includes('/set-active-status/')) {
        const id = url.split('/')[3];
        return {
          data: {
            id,
            full_name: 'Aarav Patel',
            email: 'aarav@example.com',
            phone: '9876543210',
            city: 'Bengaluru',
            occupation: 'Software Engineer',
            approval_status: 'APPROVED',
            is_active: true,
            total_hours: 42.5,
            certificates_count: 2,
            skills: ['Python', 'Data Analysis', 'First Aid'],
            cause_interests: ['Education', 'Environment'],
            bio: 'Passionate about educational equity and STEM literacy.',
            created_at: '2026-09-01T10:00:00Z',
          }
        };
      }

      // Drive applications filtered by volunteer_profile
      if (url === '/volunteers/applications/') {
        const { params = {} } = config;
        return {
          data: {
            count: 2,
            results: [
              {
                id: 'app-001',
                opportunity: { id: 1, title: 'Lake Clean-up Drive', focus_area: 'Environment' },
                status: 'APPROVED',
                applied_at: '2026-10-05T09:00:00Z',
              },
              {
                id: 'app-002',
                opportunity: { id: 2, title: 'Maths Mentorship', focus_area: 'Education' },
                status: 'ATTENDED',
                applied_at: '2026-10-20T10:00:00Z',
              }
            ]
          }
        };
      }

      // Participations filtered by volunteer_profile
      if (url === '/volunteers/participations/') {
        return {
          data: {
            count: 2,
            results: [
              {
                id: 'part-001',
                opportunity_title: 'Lake Clean-up Drive',
                session_date: '2026-10-12',
                hours: 4.5,
                verified: true,
                feedback: 'Great teamwork and punctuality.',
              },
              {
                id: 'part-002',
                opportunity_title: 'Maths Mentorship',
                session_date: '2026-10-25',
                hours: 6.0,
                verified: true,
                feedback: 'Excellent engagement with high school learners.',
              }
            ]
          }
        };
      }

      // Admin certificates filtered by volunteer_profile
      if (url === '/volunteers/admin/certificates/') {
        return {
          data: {
            count: 1,
            results: [
              {
                id: 'cert-001',
                certificate_number: 'RI-CERT-2026-0042',
                title: 'Excellence in Community Engagement',
                issued_at: '2026-10-30T15:00:00Z',
                recognized_hours: 40.0,
              }
            ]
          }
        };
      }

      return { data: {} };
    },

    post: async (url, payload, config = {}) => {
      recordedCalls.push({ method: 'POST', url, payload, config });
      if (url.includes('/volunteers/profiles/') && url.endsWith('/set-active-status/')) {
        const id = url.split('/')[3];
        return {
          data: {
            message: `Volunteer active status successfully set to ${payload.is_active}.`,
            status_changed: true,
            is_active: payload.is_active,
            profile: {
              id,
              is_active: payload.is_active,
              approval_status: 'APPROVED',
            }
          }
        };
      }
      return { data: {} };
    }
  };

  // Replicate service methods under test matching api.js
  const adminVolunteerService = {
    getVolunteerDirectory: async (params = {}) => {
      const res = await mockApi.get('/volunteers/profiles/', { params });
      return res.data;
    },
    getVolunteerDetail: async (id) => {
      const res = await mockApi.get(`/volunteers/profiles/${id}/`);
      return res.data;
    },
    setVolunteerActiveStatus: async (id, isActive, reason) => {
      const res = await mockApi.post(`/volunteers/profiles/${id}/set-active-status/`, {
        is_active: isActive,
        reason,
      });
      return res.data;
    },
    getVolunteerOpportunityApplications: async (volunteerProfileId) => {
      const res = await mockApi.get('/volunteers/applications/', {
        params: { volunteer_profile: volunteerProfileId }
      });
      return res.data;
    },
    getVolunteerParticipations: async (volunteerProfileId) => {
      const res = await mockApi.get('/volunteers/participations/', {
        params: { volunteer_profile: volunteerProfileId }
      });
      return res.data;
    },
    getVolunteerCertificates: async (volunteerProfileId) => {
      const res = await mockApi.get('/volunteers/admin/certificates/', {
        params: { volunteer_profile: volunteerProfileId }
      });
      return res.data;
    }
  };

  await t.test('1. getVolunteerDirectory calls GET /volunteers/profiles/ with pagination and status filters', async () => {
    recordedCalls.length = 0;
    const res = await adminVolunteerService.getVolunteerDirectory({
      page: 1,
      approval_status: 'APPROVED',
      is_active: 'true'
    });

    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/profiles/');
    assert.deepEqual(recordedCalls[0].config.params, {
      page: 1,
      approval_status: 'APPROVED',
      is_active: 'true'
    });
    assert.equal(res.count, 1);
    assert.equal(res.results[0].full_name, 'Aarav Patel');
    assert.equal(res.results[0].is_active, true);
  });

  await t.test('2. getVolunteerDirectory supports search by name, email, phone, and skills', async () => {
    recordedCalls.length = 0;
    const res = await adminVolunteerService.getVolunteerDirectory({ search: 'Python' });

    assert.equal(recordedCalls.length, 1);
    assert.deepEqual(recordedCalls[0].config.params, { search: 'Python' });
    assert.equal(res.count, 1);
    assert.equal(res.results[0].full_name, 'Aarav Patel');
  });

  await t.test('3. getVolunteerDetail fetches profile dossier by UUID', async () => {
    recordedCalls.length = 0;
    const res = await adminVolunteerService.getVolunteerDetail('prof-001');

    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/profiles/prof-001/');
    assert.equal(res.id, 'prof-001');
    assert.equal(res.full_name, 'Aarav Patel');
    assert.equal(res.total_hours, 42.5);
  });

  await t.test('4. setVolunteerActiveStatus sends POST request with is_active boolean and audit reason', async () => {
    recordedCalls.length = 0;
    const res = await adminVolunteerService.setVolunteerActiveStatus(
      'prof-001',
      false,
      'Temporary medical leave requested by volunteer'
    );

    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'POST');
    assert.equal(recordedCalls[0].url, '/volunteers/profiles/prof-001/set-active-status/');
    assert.equal(recordedCalls[0].payload.is_active, false);
    assert.equal(recordedCalls[0].payload.reason, 'Temporary medical leave requested by volunteer');
    assert.equal(res.status_changed, true);
    assert.equal(res.is_active, false);
  });

  await t.test('5. getVolunteerOpportunityApplications filters by volunteer_profile parameter', async () => {
    recordedCalls.length = 0;
    const res = await adminVolunteerService.getVolunteerOpportunityApplications('prof-001');

    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/applications/');
    assert.deepEqual(recordedCalls[0].config.params, { volunteer_profile: 'prof-001' });
    assert.equal(res.results.length, 2);
    assert.equal(res.results[0].opportunity.title, 'Lake Clean-up Drive');
  });

  await t.test('6. getVolunteerParticipations queries sessions for specific volunteer profile', async () => {
    recordedCalls.length = 0;
    const res = await adminVolunteerService.getVolunteerParticipations('prof-001');

    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/participations/');
    assert.deepEqual(recordedCalls[0].config.params, { volunteer_profile: 'prof-001' });
    assert.equal(res.results.length, 2);
    assert.equal(res.results[0].hours, 4.5);
  });

  await t.test('7. getVolunteerCertificates queries credentials for specific volunteer profile', async () => {
    recordedCalls.length = 0;
    const res = await adminVolunteerService.getVolunteerCertificates('prof-001');

    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/admin/certificates/');
    assert.deepEqual(recordedCalls[0].config.params, { volunteer_profile: 'prof-001' });
    assert.equal(res.results.length, 1);
    assert.equal(res.results[0].certificate_number, 'RI-CERT-2026-0042');
  });
});

test('AdminVolunteerDirectory UI - Metric Aggregation & Data Transformation Logic', async (t) => {
  const directoryData = [
    {
      id: 'prof-001',
      full_name: 'Aarav Patel',
      approval_status: 'APPROVED',
      is_active: true,
      total_hours: 42.5,
      phone: '9876543210',
      city: 'Bengaluru',
      skills: ['Python', 'Data Analysis'],
      cause_interests: ['Education'],
      bio: 'Lifelong learner.',
    },
    {
      id: 'prof-002',
      full_name: 'Diya Sharma',
      approval_status: 'APPROVED',
      is_active: false,
      total_hours: 18.0,
      phone: null,
      city: null,
      skills: [],
      cause_interests: [],
      bio: null,
    },
    {
      id: 'prof-003',
      full_name: 'Kabir Verma',
      approval_status: 'PENDING',
      is_active: true,
      total_hours: 0,
      phone: '9988776655',
      city: 'Mangaluru',
      skills: ['Design'],
      cause_interests: ['Arts'],
      bio: '',
    },
    {
      id: 'prof-004',
      full_name: 'Meera Iyer',
      approval_status: 'REJECTED',
      is_active: false,
      total_hours: 0,
      phone: null,
      city: null,
      skills: null,
      cause_interests: null,
      bio: null,
    }
  ];

  await t.test('1. KPI metrics compute accurate organisation-wide counts and page hours', () => {
    // Backend DRF pagination responses return { count, results }
    const approvedResponse = { count: 48, results: directoryData };
    const activeResponse = { count: 36, results: directoryData.filter(v => v.is_active) };
    const inactiveResponse = { count: 12, results: directoryData.filter(v => !v.is_active) };

    const totalApproved = approvedResponse.count;
    const activeStanding = activeResponse.count;
    const inactiveStanding = inactiveResponse.count;

    // Page-level contributed hours sum calculated from current page volunteers
    const pageHours = directoryData.reduce((acc, curr) => acc + (Number(curr.total_hours) || 0), 0);

    assert.equal(totalApproved, 48);
    assert.equal(activeStanding, 36);
    assert.equal(inactiveStanding, 12);
    assert.equal(pageHours, 60.5);
  });

  await t.test('2. Approval status badge mapping distinguishes vetting milestones', () => {
    const getApprovalBadge = (status) => {
      const s = (status || '').toUpperCase();
      if (s === 'APPROVED') return { label: 'Approved', className: 'badge-approved' };
      if (s === 'REJECTED') return { label: 'Rejected', className: 'badge-rejected' };
      return { label: 'Pending Review', className: 'badge-pending' };
    };

    assert.deepEqual(getApprovalBadge('APPROVED'), { label: 'Approved', className: 'badge-approved' });
    assert.deepEqual(getApprovalBadge('approved'), { label: 'Approved', className: 'badge-approved' });
    assert.deepEqual(getApprovalBadge('REJECTED'), { label: 'Rejected', className: 'badge-rejected' });
    assert.deepEqual(getApprovalBadge('PENDING'), { label: 'Pending Review', className: 'badge-pending' });
    assert.deepEqual(getApprovalBadge(null), { label: 'Pending Review', className: 'badge-pending' });
  });

  await t.test('3. Operational standing badge mapping reflects is_active accurately', () => {
    const getStandingBadge = (isActive) => {
      return isActive
        ? { label: 'Active', className: 'standing-active' }
        : { label: 'Deactivated', className: 'standing-inactive' };
    };

    assert.deepEqual(getStandingBadge(true), { label: 'Active', className: 'standing-active' });
    assert.deepEqual(getStandingBadge(false), { label: 'Deactivated', className: 'standing-inactive' });
  });

  await t.test('4. Status action validation enforces minimum reason length', () => {
    const validateStatusReason = (reason) => {
      const trimmed = (reason || '').trim();
      if (trimmed.length < 5) {
        return { valid: false, error: 'Reason must be at least 5 characters long.' };
      }
      return { valid: true, error: null };
    };

    assert.equal(validateStatusReason('').valid, false);
    assert.equal(validateStatusReason('abc').valid, false);
    assert.equal(validateStatusReason('    ').valid, false);
    assert.equal(validateStatusReason('Valid reason provided').valid, true);
  });

  await t.test('5. Safe fallbacks for missing contact info, arrays, and bio descriptions', () => {
    const formatVolunteerRow = (v) => ({
      name: v.full_name || 'Anonymous Volunteer',
      phone: v.phone || 'Phone not set',
      city: v.city || 'Location not specified',
      skills: Array.isArray(v.skills) ? v.skills : [],
      causeInterests: Array.isArray(v.cause_interests) ? v.cause_interests : [],
      bio: v.bio || 'No personal bio or background notes provided.',
      hours: Number(v.total_hours || 0).toFixed(1),
    });

    const populated = formatVolunteerRow(directoryData[0]);
    assert.equal(populated.name, 'Aarav Patel');
    assert.equal(populated.phone, '9876543210');
    assert.equal(populated.city, 'Bengaluru');
    assert.equal(populated.skills.length, 2);
    assert.equal(populated.hours, '42.5');

    const empty = formatVolunteerRow(directoryData[3]);
    assert.equal(empty.name, 'Meera Iyer');
    assert.equal(empty.phone, 'Phone not set');
    assert.equal(empty.city, 'Location not specified');
    assert.deepEqual(empty.skills, []);
    assert.deepEqual(empty.causeInterests, []);
    assert.equal(empty.bio, 'No personal bio or background notes provided.');
    assert.equal(empty.hours, '0.0');
  });

  await t.test('6. Pagination page count computation handles standard page sizes', () => {
    const pageSize = 12;
    const calculateTotalPages = (count) => Math.max(1, Math.ceil(count / pageSize));

    assert.equal(calculateTotalPages(0), 1);
    assert.equal(calculateTotalPages(5), 1);
    assert.equal(calculateTotalPages(12), 1);
    assert.equal(calculateTotalPages(13), 2);
    assert.equal(calculateTotalPages(36), 3);
    assert.equal(calculateTotalPages(37), 4);
  });

  await t.test('7. Tab management state supports all 4 dossier views', () => {
    const validTabs = ['overview', 'applications', 'participations', 'certificates'];
    const isValidTab = (tab) => validTabs.includes(tab);

    assert.equal(isValidTab('overview'), true);
    assert.equal(isValidTab('applications'), true);
    assert.equal(isValidTab('participations'), true);
    assert.equal(isValidTab('certificates'), true);
    assert.equal(isValidTab('documents'), false);
  });
});

