import api from './apiService'

const orderService = {
  getAllOrders: (params = {}) => {
    return api.get('/admin/orders', { params })
  },

  getOrderDetail: (orderId) => {
    return api.get(`/admin/orders/${orderId}`)
  },

  updateOrderStatus: (orderId, status, description) => {
    return api.patch(`/admin/orders/${orderId}/status`, { status, description })
  },

  addOrderNote: (orderId, description, metadata = {}) => {
    return api.post(`/admin/orders/${orderId}/notes`, { description, metadata })
  },

  getOrderStats: () => {
    return api.get('/admin/orders/stats')
  },
}

export default orderService