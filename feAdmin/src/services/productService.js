import api from './apiService'

const productService = {
  getAllProducts: (params = {}) => {
    return api.get('/products', { params })
  },

  getProductById: (productId) => {
    return api.get(`/products/${productId}`)
  },

  createProduct: (productData) => {
    return api.post('/products', productData)
  },

  updateProduct: (productId, productData) => {
    return api.put(`/products/${productId}`, productData)
  },

  deleteProduct: (productId) => {
    return api.delete(`/products/${productId}`)
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
}

export default productService