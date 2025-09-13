import axios from 'axios';

const apiService = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setupAxiosInterceptors = (store) => {
  apiService.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.user?.token;

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default apiService;