import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ri_access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ============================================================
// AUTH SERVICE
// ============================================================

export const authService = {

  // Login - Step 1
  // Password is checked and OTP is sent to email.
  login: async (identifier, password) => {
    const res = await api.post('/auth/login/', {
      identifier,
      password,
    });

    // DO NOT save JWT here.
    // JWT is returned only after login OTP verification.

    return res.data;
  },


  // Login OTP - Step 2
  // Verify the OTP received by email.
  verifyLoginOTP: async (identifier, code) => {
    const res = await api.post(
      '/auth/login/verify-otp/',
      {
        identifier,
        code,
      }
    );

    // JWT tokens are returned after successful OTP verification
    if (res.data.access) {
      localStorage.setItem(
        'ri_access_token',
        res.data.access
      );

      localStorage.setItem(
        'ri_refresh_token',
        res.data.refresh
      );

      localStorage.setItem(
        'ri_user',
        JSON.stringify(res.data.user)
      );
    }

    return res.data;
  },


  // Register
  register: async (userData) => {
    const res = await api.post(
      '/auth/register/',
      userData
    );

    // Registration only sends the OTP.
    // JWT tokens are received after OTP verification.
    return res.data;
  },


  // Verify Registration OTP
  verifyOTP: async (identifier, code) => {
    const res = await api.post(
      '/auth/verify-otp/',
      {
        identifier,
        code,
      }
    );

    // OTP verification returns JWT tokens
    if (res.data.access) {
      localStorage.setItem(
        'ri_access_token',
        res.data.access
      );

      localStorage.setItem(
        'ri_refresh_token',
        res.data.refresh
      );

      localStorage.setItem(
        'ri_user',
        JSON.stringify(res.data.user)
      );
    }

    return res.data;
  },


  // Resend Registration OTP
  resendOTP: async (identifier) => {
    const res = await api.post(
      '/auth/resend-otp/',
      {
        identifier,
      }
    );

    return res.data;
  },


  // Get interests
  getInterests: async () => {
    const res = await api.get(
      '/auth/interests/'
    );

    return res.data.results || res.data;
  },


  // Get current user from backend
  getMe: async () => {
    const res = await api.get(
      '/auth/me/'
    );

    localStorage.setItem(
      'ri_user',
      JSON.stringify(res.data)
    );

    return res.data;
  },


  // Logout
  logout: () => {
    localStorage.removeItem(
      'ri_access_token'
    );

    localStorage.removeItem(
      'ri_refresh_token'
    );

    localStorage.removeItem(
      'ri_user'
    );
  },


  // Get currently stored user
  getCurrentUser: () => {
    const userStr = localStorage.getItem(
      'ri_user'
    );

    return userStr
      ? JSON.parse(userStr)
      : null;
  },


  // Check whether user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem(
      'ri_access_token'
    );
  },
};


// ============================================================
// IMPACT SERVICE
// ============================================================

export const impactService = {

  getStatistics: async () => {
    const res = await api.get(
      '/impact/statistics/'
    );

    return res.data.results || res.data;
  },

  getAreas: async () => {
    const res = await api.get(
      '/impact/areas/'
    );

    return res.data.results || res.data;
  },

  getAreaDetail: async (slug) => {
    const res = await api.get(
      `/impact/areas/${slug}/`
    );

    return res.data;
  },

  getReports: async () => {
    const res = await api.get(
      '/impact/reports/'
    );

    return res.data.results || res.data;
  },
};


// ============================================================
// PROJECT SERVICE
// ============================================================

export const projectService = {

  getProjects: async (params = {}) => {
    const res = await api.get(
      '/projects/',
      { params }
    );

    return res.data.results || res.data;
  },

  getProjectDetail: async (slug) => {
    const res = await api.get(
      `/projects/${slug}/`
    );

    return res.data;
  },

  getCategories: async () => {
    const res = await api.get(
      '/projects/categories/'
    );

    return res.data.results || res.data;
  },
};


// ============================================================
// EVENT SERVICE
// ============================================================

export const eventService = {

  getEvents: async (params = {}) => {
    const res = await api.get(
      '/events/',
      { params }
    );

    return res.data.results || res.data;
  },

  getEventDetail: async (slug) => {
    const res = await api.get(
      `/events/${slug}/`
    );

    return res.data;
  },

  registerEvent: async (slug, data) => {
    const res = await api.post(
      `/events/${slug}/register/`,
      data
    );

    return res.data;
  },
};


// ============================================================
// STORY SERVICE
// ============================================================

export const storyService = {

  getStories: async (params = {}) => {
    const res = await api.get(
      '/stories/',
      { params }
    );

    return res.data.results || res.data;
  },

  getStoryDetail: async (slug) => {
    const res = await api.get(
      `/stories/${slug}/`
    );

    return res.data;
  },
};


// ============================================================
// GALLERY SERVICE
// ============================================================

export const galleryService = {

  getAlbums: async () => {
    const res = await api.get(
      '/gallery/albums/'
    );

    return res.data.results || res.data;
  },

  getItems: async (params = {}) => {
    const res = await api.get(
      '/gallery/items/',
      { params }
    );

    return res.data.results || res.data;
  },
};


// ============================================================
// VOLUNTEER SERVICE
// ============================================================

export const volunteerService = {

  getOpportunities: async (params = {}) => {
    const res = await api.get(
      '/volunteers/opportunities/',
      { params }
    );

    return res.data.results || res.data;
  },

  getInterests: async () => {
    const res = await api.get(
      '/volunteers/interests/'
    );

    return res.data.results || res.data;
  },

  createProfile: async (profileData) => {
    const res = await api.post(
      '/volunteers/profiles/',
      profileData
    );

    return res.data;
  },

  apply: async (applicationData) => {
    const res = await api.post(
      '/volunteers/applications/',
      applicationData
    );

    return res.data;
  },
};


// ============================================================
// DONATION SERVICE
// ============================================================

export const donationService = {

  getCampaigns: async () => {
    const res = await api.get(
      '/donations/campaigns/'
    );

    return res.data.results || res.data;
  },

  processDonation: async (donationData) => {
    const res = await api.post(
      '/donations/process/',
      donationData
    );

    return res.data;
  },

  lookupReceipt: async (receiptNumber) => {
    const res = await api.get(
      `/donations/receipt/${receiptNumber}/`
    );

    return res.data;
  },
};


// ============================================================
// PARTNER SERVICE
// ============================================================

export const partnerService = {

  getPartners: async () => {
    const res = await api.get(
      '/partners/'
    );

    return res.data.results || res.data;
  },

  submitEnquiry: async (enquiryData) => {
    const res = await api.post(
      '/partners/enquiries/',
      enquiryData
    );

    return res.data;
  },
};


// ============================================================
// CAREER SERVICE
// ============================================================

export const careerService = {

  getJobs: async () => {
    const res = await api.get(
      '/careers/'
    );

    return res.data.results || res.data;
  },

  applyJob: async (formData) => {
    const res = await api.post(
      '/careers/applications/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return res.data;
  },
};


// ============================================================
// CONTACT SERVICE
// ============================================================

export const contactService = {

  submitEnquiry: async (enquiryData) => {
    const res = await api.post(
      '/contact/enquiries/',
      enquiryData
    );

    return res.data;
  },

  subscribeNewsletter: async (email) => {
    const res = await api.post(
      '/contact/newsletter/subscribe/',
      { email }
    );

    return res.data;
  },
};


// ============================================================
// ADMIN SERVICE
// ============================================================

export const adminService = {

  getDashboardStats: async () => {
    const res = await api.get(
      '/admin/dashboard/stats/'
    );

    return res.data;
  },

  getUsers: async () => {
    const res = await api.get(
      '/auth/admin/users/'
    );

    return res.data.results || res.data;
  },

  getVolunteers: async () => {
    const res = await api.get(
      '/volunteers/profiles/'
    );

    return res.data.results || res.data;
  },

  getApplications: async () => {
    const res = await api.get(
      '/volunteers/applications/'
    );

    return res.data.results || res.data;
  },

  updateApplicationStatus: async (
    id,
    status,
    notes = ''
  ) => {
    const res = await api.post(
      `/volunteers/applications/${id}/update_status/`,
      {
        status,
        review_notes: notes,
      }
    );

    return res.data;
  },

  getDonations: async () => {
    const res = await api.get(
      '/donations/history/'
    );

    return res.data.results || res.data;
  },

  getEnquiries: async () => {
    const res = await api.get(
      '/contact/enquiries/'
    );

    return res.data.results || res.data;
  },
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;