import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create configured Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Standardize errors: every rejection carries .message, .status and
// .isNetworkError so the UI can distinguish "backend unreachable" from a real
// API error. There are deliberately NO offline data fallbacks here — the
// previous version silently served fabricated events/rosters/passes when the
// backend was slow or down, which looked identical to real data.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response;
    const message =
      error.response?.data?.message ||
      (isNetworkError
        ? 'Cannot reach the CampusConnect server. Check your connection and try again.'
        : error.message || 'Request failed');

    const normalized = new Error(message);
    normalized.isNetworkError = isNetworkError;
    normalized.status = error.response?.status;

    // Session expired or revoked mid-flight: let AuthContext reset the stale
    // local identity so the UI never shows a "logged in" user the server rejects.
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(normalized);
  }
);

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
export const authApi = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (dataOrName, maybeEmail, maybePassword) => {
    const payload =
      typeof dataOrName === 'object'
        ? dataOrName
        : { name: dataOrName, email: maybeEmail, password: maybePassword };
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  logout: async () => {
    try {
      const res = await api.post('/auth/logout');
      return res.data;
    } catch {
      // Logout is best-effort; the local session is cleared regardless.
      return { success: true };
    }
  },

  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data.user;
    } catch (err) {
      if (err.status === 401) return null; // explicitly signed out
      throw err; // network/server issues must surface, not masquerade as logout
    }
  },
};

// -------------------------------------------------------------
// Events Endpoints
// -------------------------------------------------------------
export const eventApi = {
  getEvents: async (params = {}) => {
    const res = await api.get('/events', { params });
    return res.data.data;
  },

  getEventById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data.data;
  },

  createEvent: async (eventData) => {
    const res = await api.post('/events', eventData);
    return res.data.data;
  },

  updateEvent: async (id, eventData) => {
    const res = await api.put(`/events/${id}`, eventData);
    return res.data.data;
  },

  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
};

// -------------------------------------------------------------
// Registrations Endpoints (Student)
// -------------------------------------------------------------
export const registrationApi = {
  registerForEvent: async (eventId) => {
    const res = await api.post(`/registrations/${eventId}`);
    return res.data;
  },

  getMyRegistrations: async () => {
    const res = await api.get('/registrations/my');
    return res.data.data;
  },

  cancelRegistration: async (eventId) => {
    const res = await api.delete(`/registrations/${eventId}`);
    return res.data;
  },
};

// -------------------------------------------------------------
// Administrator Endpoints
// -------------------------------------------------------------
export const adminApi = {
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data.stats;
  },

  getEventParticipants: async (eventId) => {
    const res = await api.get(`/admin/events/${eventId}/participants`);
    return res.data;
  },

  toggleCheckIn: async (registrationId) => {
    const res = await api.patch(`/admin/registrations/${registrationId}/checkin`);
    return res.data;
  },
};
