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
};

export default dashboardService;