import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to network/connection issues
    if (!error.response) {
      const message = error.code === 'ECONNABORTED' 
        ? 'Request timeout. Please check your connection.' 
        : 'Cannot connect to server. Please ensure the backend is running on http://localhost:5000';
      toast.error(message);
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    const message = error.response?.data?.message || `Error: ${error.response?.status || 'Unknown error'}`;
    // Don't show toast for background requests
    if (!error.config?.silent) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;
