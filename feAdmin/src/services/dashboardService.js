import api from './apiService';

const dashboardService = {
  getDashboardStats: () => {
    return api.get('/admin/dashboard/stats');
  },
  // ... các hàm hiện có ...

  // === NEW FUNCTIONS ===
  getCashFlowStats: () => {
    return api.get('/admin/dashboard/cash-flow');
  },

  getTopProducts: () => {
    return api.get('/admin/dashboard/top-products');
  },

  getDeliveredOrders: (params = {}) => {
    return api.get('/admin/dashboard/delivered-orders', { params });
  },

  getSalesChart: (period = '7d') => {
    return api.get(`/admin/dashboard/sales-chart?period=${period}`);
  },
};

export default dashboardService;