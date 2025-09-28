import api from './apiService'

const productService = {
  getAllProducts: (params = {}) => {
    return api.get('/admin/products', { params })
  },

  getProductById: (productId) => {
    return api.get(`/products/${productId}`)
  },

  createProduct: (productData) => {
    return api.post('/products', productData)
  },

  updateProduct: (productId, productData) => {
    return api.put(`/admin/products/${productId}`, productData)
  },

  deleteProduct: (productId) => {
    return api.delete(`/admin/products/${productId}`)
  },

  getCategories: () => {
    return api.get('/categories')
  },

  createCategory: (categoryData) => {
    return api.post('/categories', categoryData)
  },

  updateCategory: (categoryId, categoryData) => {
    return api.put(`/categories/${categoryId}`, categoryData)
  },

  deleteCategory: (categoryId) => {
    return api.delete(`/categories/${categoryId}`)
  },

  uploadImages: (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
}

export default productService