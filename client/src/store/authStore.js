// import { create } from 'zustand';
// import axios from 'axios';

// // Use the proxy URL
// const API_URL = '/api';

// // Add axios interceptor for debugging
// axios.interceptors.request.use(request => {
//   console.log('Starting Request:', {
//     url: request.url,
//     method: request.method,
//     headers: request.headers,
//     data: request.data
//   });
//   return request;
// });

// axios.interceptors.response.use(
//   response => {
//     console.log('Response:', {
//       status: response.status,
//       data: response.data,
//       headers: response.headers
//     });
//     return response;
//   },
//   error => {
//     console.error('Response Error:', {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message,
//       config: {
//         url: error.config?.url,
//         method: error.config?.method,
//         headers: error.config?.headers,
//         data: error.config?.data
//       }
//     });
//     return Promise.reject(error);
//   }
// );

// const useAuthStore = create((set) => ({
//   user: null,
//   token: localStorage.getItem('token'),
//   refreshToken: localStorage.getItem('refreshToken'),
//   isAuthenticated: !!localStorage.getItem('token'),
//   isLoading: false,
//   error: null,

//   setAuth: (user, token, refreshToken) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('refreshToken', refreshToken);
//     set({ user, token, refreshToken, isAuthenticated: true, error: null });
//   },

//   logout: () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('refreshToken');
//     set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
//   },

//   login: async (email, password) => {
//     set({ isLoading: true, error: null });
//     try {
//       console.log('Attempting login with:', { email });
//       const response = await axios.post(`${API_URL}/auth/login`, { email, password });
//       console.log('Login response:', response.data);
//       const { user, accessToken, refreshToken } = response.data;
//       localStorage.setItem('token', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       set({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false });
//       return true;
//     } catch (error) {
//       console.error('Login error:', error.response?.data || error.message);
//       set({ 
//         error: error.response?.data?.message || 'Login failed. Please check your credentials.', 
//         isLoading: false 
//       });
//       return false;
//     }
//   },

//   register: async (name, email, password) => {
//     set({ isLoading: true, error: null });
//     try {
//       console.log('Attempting registration with:', { name, email });
//       const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
//       console.log('Registration response:', response.data);
//       const { user, accessToken, refreshToken } = response.data;
//       localStorage.setItem('token', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       set({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false });
//       return true;
//     } catch (error) {
//       console.error('Registration error:', error.response?.data || error.message);
//       set({ 
//         error: error.response?.data?.message || 'Registration failed. Please try again.', 
//         isLoading: false 
//       });
//       return false;
//     }
//   },

//   refreshAccessToken: async () => {
//     const refreshToken = localStorage.getItem('refreshToken');
//     if (!refreshToken) return false;

//     try {
//       const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
//       const { accessToken } = response.data;
//       localStorage.setItem('token', accessToken);
//       set({ token: accessToken });
//       return true;
//     } catch (error) {
//       console.error('Token refresh error:', error.response?.data || error.message);
//       set({ error: 'Session expired', isAuthenticated: false });
//       localStorage.removeItem('token');
//       localStorage.removeItem('refreshToken');
//       return false;
//     }
//   },
// }));

// export default useAuthStore; 













import { create } from 'zustand';
import axios from 'axios';

// Use env variable or fallback to localhost:5000
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // If using cookies/tokens
});

// Debug logging for all requests
api.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.baseURL + request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

api.interceptors.response.use(
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
      message: error.message
    });
    return Promise.reject(error);
  }
);

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token') && !!localStorage.getItem('user'),
  isLoading: false,
  error: null,

  // Initialize authentication state on app load
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        set({ 
          user: parsedUser, 
          token, 
          refreshToken, 
          isAuthenticated: true 
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        set({ 
          user: null, 
          token: null, 
          refreshToken: null, 
          isAuthenticated: false 
        });
      }
    } else {
      // Clear incomplete auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      set({ 
        user: null, 
        token: null, 
        refreshToken: null, 
        isAuthenticated: false 
      });
    }
  },

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, refreshToken, isAuthenticated: true, error: null });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  login: async (email, password, useOTP = false) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Attempting login with:', { email, useOTP });
      const { data } = await api.post('/auth/login', { email, password, useOTP });
      
      if (useOTP && data.otpSent) {
        set({ isLoading: false });
        return { success: true, otpSent: true };
      }
      
      const { user, accessToken, refreshToken } = data;
      
      // Store all auth data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      return { success: true, otpSent: false };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed. Please check your credentials.',
        isLoading: false
      });
      return { success: false };
    }
  },

  register: async (name, email, password, useOTP = false) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Attempting registration with:', { name, email, useOTP });
      const { data } = await api.post('/auth/register', { name, email, password, useOTP });
      
      if (useOTP && data.otpSent) {
        set({ isLoading: false });
        return { success: true, otpSent: true };
      }
      
      const { user, accessToken, refreshToken } = data;
      
      // Store all auth data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      return { success: true, otpSent: false };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed. Please try again.',
        isLoading: false
      });
      return { success: false };
    }
  },

  verifyOTP: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Verifying OTP for:', { email });
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      const { user, accessToken, refreshToken } = data;
      
      // Store all auth data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Invalid OTP. Please try again.',
        isLoading: false
      });
      return false;
    }
  },

  resendOTP: async (email) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Resending OTP to:', { email });
      await api.post('/auth/resend-otp', { email });
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to resend OTP. Please try again.',
        isLoading: false
      });
      return false;
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const { data } = await api.post('/auth/refresh-token', { refreshToken });
      localStorage.setItem('token', data.accessToken);
      set({ token: data.accessToken });
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear all auth data on refresh failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ 
        user: null, 
        token: null, 
        refreshToken: null, 
        isAuthenticated: false, 
        error: 'Session expired' 
      });
      return false;
    }
  },
}));

export default useAuthStore;
