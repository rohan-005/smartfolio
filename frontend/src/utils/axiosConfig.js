import axios from 'axios';

// For Vite projects, use import.meta.env
let API_URL = import.meta.env.VITE_API_URL || 'https://smartfoliobackend.vercel.app/api';
// Normalize: ensure the base URL ends with /api so front-end calls go to /api/...
API_URL = API_URL ? API_URL.replace(/\/+$/, '') : API_URL; // trim trailing slashes
if (API_URL && !API_URL.endsWith('/api')) {
  API_URL = API_URL + '/api';
}
console.log('API URL:', API_URL); // For debugging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;