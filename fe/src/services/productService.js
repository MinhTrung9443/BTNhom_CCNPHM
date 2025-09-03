import apiClient from './apiClient';

export const productService = {
  // Get latest products (8 sản phẩm mới nhất)
  getLatestProducts: async () => {
    try {
      const response = await apiClient.get('/products/latest');
      return response.data;
    } catch (error) {
      console.error('Error fetching latest products:', error);
      throw error;
    }
  },

  // Get best seller products (6 sản phẩm bán chạy)
  getBestSellerProducts: async () => {
    try {
      const response = await apiClient.get('/products/bestsellers');
      return response.data;
    } catch (error) {
      console.error('Error fetching bestseller products:', error);
      throw error;
    }
  },

  // Get most viewed products (8 sản phẩm được xem nhiều)
  getMostViewedProducts: async () => {
    try {
      const response = await apiClient.get('/products/most-viewed');
      return response.data;
    } catch (error) {
      console.error('Error fetching most viewed products:', error);
      throw error;
    }
  },

  // Get top discount products (4 sản phẩm khuyến mãi cao)
  getTopDiscountProducts: async () => {
    try {
      const response = await apiClient.get('/products/top-discounts');
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
  }
};