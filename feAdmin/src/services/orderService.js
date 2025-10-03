import api from './apiService'

const orderService = {
  getAllOrders: (params = {}) => {
    return api.get('/admin/orders', { params })
  },

  getOrderById: (orderId) => {
    return api.get(`/admin/orders/${orderId}`);
  },

  updateOrderStatus: (orderId, status, metadata = {}) => {
    // Chỉ gửi reason nếu có giá trị
    const payload = { status };
    if (metadata.reason && metadata.reason.trim()) {
      payload.reason = metadata.reason.trim();
    }
    // Thêm các metadata khác nếu có
    Object.keys(metadata).forEach(key => {
      if (key !== 'reason' && metadata[key] !== undefined && metadata[key] !== '') {
        payload[key] = metadata[key];
      }
    });
    return api.patch(`/admin/orders/${orderId}/status`, payload);
  },

  addOrderNote: (orderId, description, metadata = {}) => {
    return api.post(`/admin/orders/${orderId}/notes`, { description, metadata })
  },

  getOrderStats: () => {
    return api.get('/admin/orders/stats')
  },

  getCancellationRequests: (params = {}) => {
    return api.get('/admin/orders/cancellation-requests', { params })
  },

  approveCancellation: (orderId) => {
    return api.patch(`/admin/orders/${orderId}/approve-cancellation`)
  },

  getPendingReturns: (params = {}) => {
    return api.get('/admin/orders/pending-returns', { params })
  },

  approveReturn: (orderId) => {
    return api.patch(`/admin/orders/${orderId}/approve-return`)
  },
}

export default orderService