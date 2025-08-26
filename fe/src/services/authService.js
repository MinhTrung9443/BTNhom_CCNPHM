import apiClient from './apiClient';

/**
 * Auth Service - xử lý các API liên quan đến authentication
 */
const authService = {
  /**
   * Gửi yêu cầu quên mật khẩu
   * @param {string} email - Email của người dùng
   * @returns {Promise} Response từ API
   */
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đặt lại mật khẩu mới
   * @param {string} token - Reset token từ URL
   * @param {string} password - Mật khẩu mới
   * @param {string} passwordConfirm - Xác nhận mật khẩu
   * @returns {Promise} Response từ API
   */
  resetPassword: async (token, password, passwordConfirm) => {
    try {
      const response = await apiClient.post(`/auth/reset-password/${token}`, {
        password,
        passwordConfirm
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng nhập
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} Response từ API
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng ký
   * @param {Object} userData - Thông tin đăng ký
   * @returns {Promise} Response từ API
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xác thực OTP
   * @param {Object} otpData - Dữ liệu xác thực OTP
   * @returns {Promise} Response từ API
   */
  verifyOTP: async (email, otp) => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { email, otp });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng xuất
   * @returns {Promise} Response từ API
   */
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      localStorage.removeItem('accessToken');
      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      throw error;
    }
  },

  /**
   * Lấy thông tin profile
   * @returns {Promise} Response từ API
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
