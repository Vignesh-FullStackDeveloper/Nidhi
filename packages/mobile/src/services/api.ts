import axios from 'axios';

// Replace with your actual API URL
// For Android emulator: http://10.0.2.2:3001/api
// For iOS simulator: http://localhost:3001/api
// For physical device: http://YOUR_IP:3001/api
const API_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;

