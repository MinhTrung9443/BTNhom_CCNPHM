import apiService from './apiService.js';
import apiClient from './apiClient.js';

export const couponService = {
  // Get user's available vouchers for order preview
  getUserVouchers: async () => {
    try {
      const response = await apiClient.get('/vouchers/my-vouchers');
      return response;
    } catch (error) {
      console.error('Error fetching user vouchers:', error);
      throw error;
    }
  },
  
  getApplicableVouchers: async (payload) => {
    try {
      const response = await apiClient.post('/vouchers/applicable-vouchers', payload);
      return response.data; // Return data directly
    } catch (error) {
      console.error('Error fetching applicable vouchers:', error);
      throw error;
    }
  },

  // Validate voucher against order total
  validateVoucher: async (voucherCode, orderTotal) => {
    try {
      const response = await apiClient.post('/vouchers/validate', {
        code: voucherCode,
        orderTotal
      });
      return response.data;
    } catch (error) {
      console.error('Error validating voucher:', error);
      throw error;
    }
  },
  // Get all coupons with pagination and filters
  getAllCoupons: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/coupons', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  },

  // Create a new coupon
  createCoupon: async (couponData) => {
    try {
      const response = await apiService.post('/admin/coupons', couponData);
      return response.data;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  // Update an existing coupon
  updateCoupon: async (couponId, couponData) => {
    try {
      const response = await apiService.put(`/admin/coupons/${couponId}`, couponData);
      return response.data;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  // Delete a coupon
  deleteCoupon: async (couponId) => {
    try {
      const response = await apiService.delete(`/admin/coupons/${couponId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  },

  // Get coupon statistics
  getCouponStats: async () => {
    try {
      const response = await apiService.get('/admin/coupons/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching coupon stats:', error);
      throw error;
    }
  },
};

// Export default for consistency with other services
export default couponService;
