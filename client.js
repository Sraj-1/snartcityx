import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUserIssues: (page = 1, limit = 10) =>
    api.get('/auth/my-issues', { params: { page, limit } }),
};

// Issues API endpoints
export const issuesAPI = {
  getAll: (params) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  getNearby: (lat, lng, params) =>
    api.get(`/issues/nearby/${lat}/${lng}`, { params }),
  create: (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('severity', data.severity);
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    formData.append('address', data.address);
    if (data.image) formData.append('image', data.image);

    return api.post('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => api.put(`/issues/${id}`, data),
  delete: (id) => api.delete(`/issues/${id}`),
  addComment: (id, text) => api.post(`/issues/${id}/comments`, { text }),
  upvote: (id) => api.post(`/issues/${id}/upvote`),
  getHeatmapData: () => api.get('/issues/heatmap-data'),
};

// Admin API endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/statistics'),
  getAnalytics: (days = 30) =>
    api.get('/admin/analytics', { params: { days } }),
  getCategoryDistribution: () => api.get('/admin/categories'),
  getHotspots: () => api.get('/admin/hotspots'),
  getUserStats: () => api.get('/admin/users/stats'),
  updateIssueStatus: (id, data) =>
    api.put(`/issues/${id}/status`, data),
  bulkUpdateStatus: (data) => api.put('/admin/issues/bulk-status', data),
};

export default api;
