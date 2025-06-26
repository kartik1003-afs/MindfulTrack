import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api';

const useJournalStore = create((set, get) => ({
  entries: [],
  weeklySummary: null,
  isLoading: false,
  error: null,

  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/journal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ entries: response.data, isLoading: false });
    } catch (error) {
      console.error('Fetch Entries Error:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch entries', isLoading: false });
    }
  },

  createEntry: async (content) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      console.log('Creating entry with token:', token);
      const response = await axios.post(
        `${API_URL}/journal`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Entry created:', response.data);
      set(state => ({
        entries: [response.data, ...state.entries],
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Create Entry Error:', error);
      set({ error: error.response?.data?.message || 'Failed to create entry', isLoading: false });
      return null;
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/journal/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set(state => ({
        entries: state.entries.filter(entry => entry._id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete entry', isLoading: false });
      return false;
    }
  },

  fetchWeeklySummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/journal/weekly-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ weeklySummary: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch weekly summary', isLoading: false });
    }
  },

  getMoodDistribution: () => {
    const entries = get().entries;
    const distribution = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});
    return distribution;
  },

  getSentimentTrend: () => {
    const entries = get().entries;
    return entries.map(entry => ({
      date: new Date(entry.createdAt).toLocaleDateString(),
      score: entry.sentimentScore
    }));
  }
}));

export default useJournalStore; 