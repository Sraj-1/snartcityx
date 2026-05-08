import { create } from 'zustand';
import { authAPI } from '../api/client.js';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  loading: false,
  error: null,

  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      set({ user: response.data.user, token: response.data.token, loading: false });
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Login failed';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.register({ name, email, password, confirmPassword: password });
      set({ user: response.data.user, token: response.data.token, loading: false });
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Registration failed';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authAPI.logout();
      set({ user: null, token: null, loading: false });
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if request fails
      set({ user: null, token: null, loading: false });
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.updateProfile(data);
      set({ user: response.data, loading: false });
      localStorage.setItem('user', JSON.stringify(response.data));
      return response;
    } catch (error) {
      set({ error: error.message || 'Update failed', loading: false });
      throw error;
    }
  },

  isAuthenticated: () => {
    const state = useAuthStore.getState();
    return !!state.token && !!state.user;
  },

  clearError: () => set({ error: null }),
}));
