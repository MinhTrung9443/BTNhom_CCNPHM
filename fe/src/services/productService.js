import apiClient from './apiClient';

export const productService = {
  // Get latest products với phân trang
  getLatestProducts: async (page = 1, limit = 8) => {
    try {
      const response = await apiClient.get(`/products/latest?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest products:', error);
      throw error;
    }
  },

  // Get best seller products với phân trang
  getBestSellerProducts: async (page = 1, limit = 4) => {
    try {
      const response = await apiClient.get(`/products/bestsellers?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bestseller products:', error);
      throw error;
    }
  },

  // Get most viewed products với phân trang
  getMostViewedProducts: async (page = 1, limit = 4) => {
    try {
      const response = await apiClient.get(`/products/most-viewed?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching most viewed products:', error);
      throw error;
    }
  },

  // Get top discount products với phân trang
  getTopDiscountProducts: async (page = 1, limit = 4) => {
    try {
      const response = await apiClient.get(`/products/top-discounts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top discount products:', error);
      throw error;
    }
  },

  // Get all products with pagination
  getAllProducts: async (page = 1, limit = 12, search = '', category = '') => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await apiClient.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },
  getRelatedProducts: async (productId) => {
    try {
      const response = await apiClient.get(`/products/${productId}/related`);
      return response.data;
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
  },
  logProductView: (productId) => {
    return apiClient.post(`/products/${productId}/view`);
  },

  getProductsByIds: (ids) => apiClient.post('/products/by-ids', { ids }),

};