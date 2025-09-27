import api from './apiService'

const orderService = {
  getAllOrders: (params = {}) => {
    return api.get('/admin/orders', { params })
  },

  getOrderById: (orderId) => {
    return api.get(`/admin/orders/${orderId}`);
  },

  updateOrderStatus: (orderId, status, metadata = {}) => {
    return api.patch(`/admin/orders/${orderId}/status`, { status, ...metadata });
  },

  addOrderNote: (orderId, description, metadata = {}) => {
    return api.post(`/admin/orders/${orderId}/notes`, { description, metadata })
  },

  getOrderStats: () => {
    return api.get('/admin/orders/stats')
  },
}

export default orderService