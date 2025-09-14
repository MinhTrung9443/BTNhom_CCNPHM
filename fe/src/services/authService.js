import apiClient from './apiClient';

/**
 * Auth Service - handles authentication-related APIs
 */
const authService = {
  /**
   * Send a forgot password request
   * @param {string} email - User's email
   * @returns {Promise} API response
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
   * Reset to a new password
   * @param {string} token - Reset token from the URL
   * @param {string} password - New password
   * @param {string} passwordConfirm - Password confirmation
   * @returns {Promise} API response
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
   * Login
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} API response
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
   * Register
   * @param {Object} userData - Registration information
   * @returns {Promise} API response
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
   * Verify OTP
   * @param {string} email
   * @param {string} otp
   * @returns {Promise} API response
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
   * Logout
   * @returns {Promise} API response
   */
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      // Still clear local storage on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * Get user profile
   * @returns {Promise} API response
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