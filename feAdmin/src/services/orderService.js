import api from './apiService'

const orderService = {
  getAllOrders: (params = {}) => {
    return api.get('/orders', { params })
  },

  getOrderDetail: (orderId) => {
    return api.get(`/orders/${orderId}`)
  },

  updateOrderStatus: (orderId, status, description) => {
    return api.patch(`/orders/${orderId}/status`, { status, description })
  },

  addOrderNote: (orderId, description, metadata = {}) => {
    return api.post(`/orders/${orderId}/notes`, { description, metadata })
  },

  getOrderStats: () => {
    return api.get('/orders/stats')
  },
}

export default orderService