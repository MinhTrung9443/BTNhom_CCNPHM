// src/services/api.js
import axios from 'axios';

// Cấu hình base URL cho API
const API_BASE_URL = 'http://localhost:3000/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token vào headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Đăng ký
  register: (userData) => api.post('/auth/register', userData),
  
  // Đăng nhập
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Xác thực email
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  
  // Gửi lại mã xác thực
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  
  // Lấy thông tin profile
  getProfile: () => api.get('/auth/profile'),
  
  // Cập nhật profile
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Đổi mật khẩu
  changePassword: (data) => api.put('/auth/change-password', data),
  
  // Test token
  testToken: () => api.get('/auth/test-token'),
  
  // Health check
  healthCheck: () => api.get('/auth/health'),
};

export default api;
