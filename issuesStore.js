import { create } from 'zustand';
import { issuesAPI } from '../api/client.js';

export const useIssuesStore = create((set, get) => ({
  issues: [],
  currentIssue: null,
  nearbyIssues: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    status: '',
    page: 1,
    limit: 10,
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  fetchIssues: async (filters) => {
    set({ loading: true, error: null });
    try {
      const response = await issuesAPI.getAll(filters || get().filters);
      set({ issues: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch issues', loading: false });
      throw error;
    }
  },

  fetchNearbyIssues: async (lat, lng, params) => {
    set({ loading: true, error: null });
    try {
      const response = await issuesAPI.getNearby(lat, lng, params);
      set({ nearbyIssues: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch nearby issues', loading: false });
      throw error;
    }
  },

  getIssueById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await issuesAPI.getById(id);
      set({ currentIssue: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch issue', loading: false });
      throw error;
    }
  },

  createIssue: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await issuesAPI.create(data);
      set((state) => ({
        issues: [response.data, ...state.issues],
        loading: false,
      }));
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to create issue', loading: false });
      throw error;
    }
  },

  updateIssue: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await issuesAPI.update(id, data);
      set((state) => ({
        issues: state.issues.map((issue) =>
          issue._id === id ? response.data : issue
        ),
        currentIssue: response.data,
        loading: false,
      }));
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to update issue', loading: false });
      throw error;
    }
  },

  deleteIssue: async (id) => {
    set({ loading: true, error: null });
    try {
      await issuesAPI.delete(id);
      set((state) => ({
        issues: state.issues.filter((issue) => issue._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to delete issue', loading: false });
      throw error;
    }
  },

  addComment: async (issueId, text) => {
    set({ loading: true, error: null });
    try {
      const response = await issuesAPI.addComment(issueId, text);
      set((state) => ({
        currentIssue: { ...state.currentIssue, comments: response.data },
        loading: false,
      }));
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to add comment', loading: false });
      throw error;
    }
  },

  upvoteIssue: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await issuesAPI.upvote(id);
      set((state) => ({
        issues: state.issues.map((issue) =>
          issue._id === id ? response.data : issue
        ),
        currentIssue:
          state.currentIssue?._id === id ? response.data : state.currentIssue,
        loading: false,
      }));
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to upvote', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
