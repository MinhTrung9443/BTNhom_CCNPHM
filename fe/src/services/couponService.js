import apiService from './apiService';

const couponService = {
  // Validate voucher code
  validateVoucher: async (voucherCode, cartItems = []) => {
    try {
      const response = await apiService.post('/voucher/validate', {
        code: voucherCode,
        cartItems: cartItems
      });

      return {
        valid: true,
        discountAmount: response.data.discountAmount,
        discountType: response.data.discountType,
        message: response.data.message,
        coupon: response.data.coupon
      };
    } catch (error) {
      return {
        valid: false,
        message: error.response?.data?.message || 'Mã voucher không hợp lệ'
      };
    }
  },

  // Get available vouchers for user
  getAvailableVouchers: async (userId) => {
    try {
      const response = await apiService.get('/voucher/voucher-available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available vouchers:', error);
      return [];
    }
  },

  // Apply voucher to order
  applyVoucherToOrder: async (orderId, voucherCode, discountAmount) => {
    try {
      const response = await apiService.post(`/orders/${orderId}/apply-voucher`, {
        voucherCode,
        discountAmount
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lỗi khi áp dụng voucher');
    }
  }
};

export default couponService;
