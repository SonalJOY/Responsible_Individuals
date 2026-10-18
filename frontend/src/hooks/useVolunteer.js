import { useState, useEffect, useCallback } from 'react';
import { volunteerService } from '../services/api';

/**
 * Hook to manage volunteer opportunities with backend-driven filtering and refresh capabilities.
 */
export function useVolunteerOpportunities(initialFilters = {}) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchOpportunities = useCallback(async (activeFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      // Build clean query params object
      const params = {};
      Object.keys(activeFilters).forEach((key) => {
        const val = activeFilters[key];
        if (val !== '' && val !== null && val !== undefined && val !== 'ALL') {
          params[key] = val;
        }
      });

      const data = await volunteerService.getOpportunities(params);
      setOpportunities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching volunteer opportunities:', err);
      setError(err?.response?.data?.detail || 'Failed to load volunteer opportunities. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const updateFilters = (newFilterPartial) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilterPartial };
      return updated;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    opportunities,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchOpportunities,
  };
}

/**
 * Hook to fetch and provide available volunteer interest categories.
 */
export function useVolunteerInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadInterests() {
      try {
        const data = await volunteerService.getInterests();
        if (isMounted) {
          setInterests(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching volunteer interests:', err);
          setError('Could not load interests taxonomy.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadInterests();
    return () => {
      isMounted = false;
    };
  }, []);

  return { interests, loading, error };
}

/**
 * Hook to manage authenticated volunteer profile retrieval and updates.
 */
export function useVolunteerProfile(user) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await volunteerService.getMyProfile();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching volunteer profile:', err);
      setError('Failed to retrieve volunteer profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates) => {
    try {
      const updated = await volunteerService.updateMyProfile(updates);
      setProfile(updated);
      return updated;
    } catch (err) {
      console.error('Error updating volunteer profile:', err);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    refetchProfile: fetchProfile,
    updateProfile,
  };
}

/**
 * Hook to manage application submission, validation, and error reporting.
 */
export function useVolunteerApplication() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successApplication, setSuccessApplication] = useState(null);

  const parseErrorMessage = (err) => {
    if (!err?.response) {
      return 'Network error: Unable to reach the server. Please check your internet connection.';
    }

    const { data, status } = err.response;

    if (status === 401) {
      return 'Authentication required. Please sign in to submit your volunteer application.';
    }

    if (data?.detail) {
      return data.detail;
    }

    if (data?.opportunity) {
      return Array.isArray(data.opportunity) ? data.opportunity[0] : data.opportunity;
    }

    if (data?.email) {
      return Array.isArray(data.email) ? data.email[0] : data.email;
    }

    if (data?.password) {
      return Array.isArray(data.password) ? data.password[0] : data.password;
    }

    if (typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      const val = data[firstKey];
      if (Array.isArray(val) && val.length > 0) {
        return `${firstKey}: ${val[0]}`;
      }
      if (typeof val === 'string') {
        return `${firstKey}: ${val}`;
      }
    }

    return 'Something went wrong while processing your application. Please try again.';
  };

  const applyAsAuthenticated = async (applicationPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await volunteerService.apply(applicationPayload);
      setSuccessApplication(res.application || res);
      return res;
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const registerAndApply = async (registrationPayload, applicationPayload, registerFn) => {
    setSubmitting(true);
    setError(null);
    try {
      // 1. Register and authenticate user atomically
      await registerFn(registrationPayload);

      // 2. Submit application as newly authenticated user
      const res = await volunteerService.apply(applicationPayload);
      setSuccessApplication(res.application || res);
      return res;
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setError(null);
    setSubmitting(false);
    setSuccessApplication(null);
  };

  return {
    submitting,
    error,
    successApplication,
    applyAsAuthenticated,
    registerAndApply,
    reset,
    setError,
  };
}

/**
 * Hook to manage and retrieve authenticated volunteer's submitted applications.
 */
export function useMyVolunteerApplications(user) {
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);

  const fetchMyApplications = useCallback(async () => {
    if (!user) {
      setMyApplications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await volunteerService.getMyApplications();
      setMyApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching my volunteer applications:', err);
      setError('Failed to retrieve your submitted applications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyApplications();
  }, [fetchMyApplications]);

  return {
    myApplications,
    loading,
    error,
    refetchApplications: fetchMyApplications,
  };
}

