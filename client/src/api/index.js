// src/api/index.js
import axios from 'axios';
import { getToken } from '../services/auth';

// Create an Axios instance with common configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://api.productivityassistant.com/v1' 
    : 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/login';
    }
    
    console.error('API Error:', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
);

export default api;

// Re-export all API modules
export * from './goals';
export * from './tasks';
export * from './voice';