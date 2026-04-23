import axios from 'axios';
import { useAuth } from './store';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const auth = useAuth();
  if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      const auth = useAuth();
      auth.logout();
    }
    return Promise.reject(e);
  }
);

export default api;
