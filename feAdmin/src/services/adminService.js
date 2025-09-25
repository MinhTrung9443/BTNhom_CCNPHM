import api from './apiService'

const adminService = {
  // User Management
  getAllUsers: (params = {}) => {
    return api.get('/admin/users', { params })
  },

  getUserById: (userId) => {
    return api.get(`/admin/users/${userId}`)
  },

  updateUserRole: (userId, role) => {
    return api.patch(`/admin/users/${userId}/role`, { role })
  },

  deleteUser: (userId) => {
    return api.delete(`/admin/users/${userId}`)
  },

  getUserStats: () => {
    return api.get('/admin/users/stats')
  },

  // Coupon Management
  getAllCoupons: (params = {}) => {
    return api.get('/admin/coupons', { params })
  },

  createCoupon: (couponData) => {
    return api.post('/admin/coupons', couponData)
  },

  updateCoupon: (couponId, couponData) => {
    return api.put(`/admin/coupons/${couponId}`, couponData)
  },

  deleteCoupon: (couponId) => {
    return api.delete(`/admin/coupons/${couponId}`)
  },

  getCouponStats: () => {
    return api.get('/admin/coupons/stats')
  },

  // Loyalty Points Management
  getAllLoyaltyPoints: (params = {}) => {
    return api.get('/admin/loyalty-points', { params })
  },

  getUserLoyaltyPoints: (userId) => {
    return api.get(`/admin/loyalty-points/user/${userId}`)
  },

  adjustUserPoints: (userId, pointsData) => {
    return api.post(`/admin/loyalty-points/adjust/${userId}`, pointsData)
  },

  expirePoints: () => {
    return api.post('/admin/loyalty-points/expire')
  },

  getLoyaltyStats: () => {
    return api.get('/admin/loyalty-points/stats')
  },
}

export default adminService