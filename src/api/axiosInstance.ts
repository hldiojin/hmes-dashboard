import axios from 'axios';

// Create base axios instance with common configurations
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.hmes.buubuu.id.vn/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add request interceptor to attach the authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add Authorization header with Bearer token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
