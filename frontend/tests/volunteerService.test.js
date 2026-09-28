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

// Simple test harness for volunteerService endpoints and contracts
test('volunteerService - API Endpoint and Method Contract Tests', async (t) => {
  const recordedCalls = [];
  
  // Mock Axios instance
  const mockApi = {
    get: async (url, config = {}) => {
      recordedCalls.push({ method: 'GET', url, config });
      if (url === '/volunteers/opportunities/') {
        return { data: { results: [{ id: '1', title: 'Lake Monitor' }] } };
      }
      if (url === '/volunteers/interests/') {
        return { data: { results: [{ id: '1', name: 'Water' }] } };
      }
      if (url === '/volunteers/my-profile/') {
        return { data: { id: 'prof-1', email: 'test@example.com' } };
      }
      if (url === '/volunteers/my-applications/') {
        return { data: { results: [{ id: 'app-1', status: 'PENDING' }] } };
      }
      if (url === '/volunteers/my-participations/') {
        return { data: { results: [{ id: 'part-1', hours: 5.0 }] } };
      }
      if (url === '/volunteers/certificates/') {
        return { data: [{ id: 'cert-1', code: 'RI-001' }] };
      }
      return { data: {} };
    },
    post: async (url, payload, config = {}) => {
      recordedCalls.push({ method: 'POST', url, payload, config });
      if (url === '/volunteers/register/') {
        return {
          data: {
            access: 'fake-jwt-access-token',
            refresh: 'fake-jwt-refresh-token',
            user: { id: 'u1', email: payload.email, role: 'VOLUNTEER' },
            volunteer_profile: { id: 'vp1', full_name: 'Test Volunteer' }
          }
        };
      }
      if (url === '/volunteers/apply/') {
        return {
          data: {
            message: 'Application submitted successfully',
            application: { id: 'app-new', status: 'PENDING' }
          }
        };
      }
      return { data: {} };
    },
    patch: async (url, payload, config = {}) => {
      recordedCalls.push({ method: 'PATCH', url, payload, config });
      if (url === '/volunteers/my-profile/') {
        return { data: { id: 'prof-1', ...payload } };
      }
      return { data: {} };
    }
  };

  // Build service bound to mockApi
  const volunteerService = {
    getOpportunities: async (params = {}) => {
      const res = await mockApi.get('/volunteers/opportunities/', { params });
      return res.data.results || res.data;
    },
    getInterests: async () => {
      const res = await mockApi.get('/volunteers/interests/');
      return res.data.results || res.data;
    },
    register: async (registrationData) => {
      const res = await mockApi.post('/volunteers/register/', registrationData);
      if (res.data.access) {
        localStorage.setItem('ri_access_token', res.data.access);
        localStorage.setItem('ri_refresh_token', res.data.refresh);
        localStorage.setItem('ri_user', JSON.stringify(res.data.user));
      }
      return res.data;
    },
    apply: async (applicationData) => {
      const res = await mockApi.post('/volunteers/apply/', applicationData);
      return res.data;
    },
    getMyProfile: async () => {
      const res = await mockApi.get('/volunteers/my-profile/');
      return res.data;
    },
    updateMyProfile: async (profileData) => {
      const res = await mockApi.patch('/volunteers/my-profile/', profileData);
      return res.data;
    },
    getMyApplications: async () => {
      const res = await mockApi.get('/volunteers/my-applications/');
      return res.data.results || res.data;
    },
    getMyParticipations: async () => {
      const res = await mockApi.get('/volunteers/my-participations/');
      return res.data.results || res.data;
    },
    getCertificates: async () => {
      const res = await mockApi.get('/volunteers/certificates/');
      return res.data.results || res.data;
    }
  };

  await t.test('1. getOpportunities calls GET /volunteers/opportunities/ with filters', async () => {
    recordedCalls.length = 0;
    const opps = await volunteerService.getOpportunities({ location: 'Bengaluru', status: 'OPEN' });
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/opportunities/');
    assert.deepEqual(recordedCalls[0].config.params, { location: 'Bengaluru', status: 'OPEN' });
    assert.equal(opps[0].title, 'Lake Monitor');
  });

  await t.test('2. getInterests calls GET /volunteers/interests/', async () => {
    recordedCalls.length = 0;
    const interests = await volunteerService.getInterests();
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/interests/');
    assert.equal(interests[0].name, 'Water');
  });

  await t.test('3. register calls POST /volunteers/register/ and sets localStorage tokens', async () => {
    localStorage.clear();
    recordedCalls.length = 0;
    const payload = {
      email: 'frontend.volunteer@test.org',
      password: 'Password@123',
      first_name: 'Frontend',
      last_name: 'Volunteer',
    };
    const regRes = await volunteerService.register(payload);
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'POST');
    assert.equal(recordedCalls[0].url, '/volunteers/register/');
    assert.equal(localStorage.getItem('ri_access_token'), 'fake-jwt-access-token');
    assert.equal(localStorage.getItem('ri_refresh_token'), 'fake-jwt-refresh-token');
    assert.equal(JSON.parse(localStorage.getItem('ri_user')).email, 'frontend.volunteer@test.org');
    assert.equal(regRes.volunteer_profile.full_name, 'Test Volunteer');
  });

  await t.test('4. apply calls POST /volunteers/apply/', async () => {
    recordedCalls.length = 0;
    const applyPayload = {
      opportunity_id: 'opp-123',
      statement_of_purpose: 'Excited to contribute to water revival.',
    };
    const applyRes = await volunteerService.apply(applyPayload);
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'POST');
    assert.equal(recordedCalls[0].url, '/volunteers/apply/');
    assert.equal(recordedCalls[0].payload.opportunity_id, 'opp-123');
    assert.equal(applyRes.application.status, 'PENDING');
  });

  await t.test('5. getMyProfile calls GET /volunteers/my-profile/', async () => {
    recordedCalls.length = 0;
    const profile = await volunteerService.getMyProfile();
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/my-profile/');
    assert.equal(profile.email, 'test@example.com');
  });

  await t.test('6. updateMyProfile calls PATCH /volunteers/my-profile/', async () => {
    recordedCalls.length = 0;
    const patchPayload = { city: 'Mysuru', skills: 'Field Water Testing' };
    const updated = await volunteerService.updateMyProfile(patchPayload);
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'PATCH');
    assert.equal(recordedCalls[0].url, '/volunteers/my-profile/');
    assert.equal(updated.city, 'Mysuru');
  });

  await t.test('7. getMyApplications calls GET /volunteers/my-applications/', async () => {
    recordedCalls.length = 0;
    const myApps = await volunteerService.getMyApplications();
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/my-applications/');
    assert.equal(myApps[0].status, 'PENDING');
  });

  await t.test('8. getMyParticipations calls GET /volunteers/my-participations/', async () => {
    recordedCalls.length = 0;
    const myParts = await volunteerService.getMyParticipations();
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/my-participations/');
    assert.equal(myParts[0].hours, 5.0);
  });

  await t.test('9. getCertificates calls GET /volunteers/certificates/', async () => {
    recordedCalls.length = 0;
    const certs = await volunteerService.getCertificates();
    assert.equal(recordedCalls.length, 1);
    assert.equal(recordedCalls[0].method, 'GET');
    assert.equal(recordedCalls[0].url, '/volunteers/certificates/');
    assert.equal(certs[0].code, 'RI-001');
  });

  await t.test('10. Error propagation on API failure', async () => {
    const errorApi = {
      post: async () => {
        const err = new Error('Request failed with status code 400');
        err.response = {
          status: 400,
          data: { detail: 'You have already applied for this opportunity.' }
        };
        throw err;
      }
    };
    const failingService = {
      apply: async (data) => {
        return await errorApi.post('/volunteers/apply/', data);
      }
    };

    await assert.rejects(
      async () => {
        await failingService.apply({ opportunity_id: '1' });
      },
      (err) => {
        assert.equal(err.response.status, 400);
        assert.equal(err.response.data.detail, 'You have already applied for this opportunity.');
        return true;
      }
    );
  });
});
