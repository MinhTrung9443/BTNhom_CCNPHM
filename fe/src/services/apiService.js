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
      console.log('Redux state:', store.getState());
      const state = store.getState();
      const token = state.user?.accessToken;

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.log('No token found in Redux state');
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default apiService;