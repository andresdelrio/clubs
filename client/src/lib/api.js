import axios from 'axios';

let adminCodeRef = null;

export const setAdminAuthCode = (code) => {
  adminCodeRef = code || null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const mutableConfig = { ...config };
  if (adminCodeRef) {
    mutableConfig.headers = {
      ...mutableConfig.headers,
      Authorization: `Bearer ${adminCodeRef}`,
    };
  }
  return mutableConfig;
});

export default api;

