import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACK_END_SERVER_URL || 'http://localhost:3000', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: attach token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
