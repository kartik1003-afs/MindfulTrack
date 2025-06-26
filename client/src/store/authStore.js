import { create } from 'zustand';
import axios from 'axios';

// Use the proxy URL
const API_URL = '/api';

// Add axios interceptor for debugging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    return Promise.reject(error);
  }
);

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, token, refreshToken, isAuthenticated: true, error: null });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('Login response:', response.data);
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      set({ 
        error: error.response?.data?.message || 'Login failed. Please check your credentials.', 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Attempting registration with:', { name, email });
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      console.log('Registration response:', response.data);
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      set({ 
        error: error.response?.data?.message || 'Registration failed. Please try again.', 
        isLoading: false 
      });
      return false;
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
      const { accessToken } = response.data;
      localStorage.setItem('token', accessToken);
      set({ token: accessToken });
      return true;
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message);
      set({ error: 'Session expired', isAuthenticated: false });
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return false;
    }
  },
}));

export default useAuthStore; 