import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

if (!VITE_API_URL) {
  console.error("CRITICAL ERROR: VITE_API_URL environment variable is missing. Please configure it in .env or Vercel Environment Variables.");
}

export const API_BASE_URL = VITE_API_URL;
export const STATIC_BASE_URL = API_BASE_URL ? API_BASE_URL.replace(/\/api$/, '') : '';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luna_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
