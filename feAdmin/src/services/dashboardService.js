import api from './apiService'

const dashboardService = {
  getDashboardStats: () => {
    return api.get('/dashboard/stats')
  },

  getRecentOrders: (limit = 10) => {
    return api.get(`/dashboard/recent-orders?limit=${limit}`)
  },

  getSalesChart: (period = '7d') => {
    return api.get(`/dashboard/sales-chart?period=${period}`)
  },

  getTopProducts: (limit = 5) => {
    return api.get(`/dashboard/top-products?limit=${limit}`)
  },

  getUserGrowth: (period = '30d') => {
    return api.get(`/dashboard/user-growth?period=${period}`)
  },
}

export default dashboardService