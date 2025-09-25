import apiClient from './apiClient';

/**
 * Get user's cart
 * @returns {Promise} Cart data with items
 */
export const getCart = async () => {
  const response = await apiClient.get('/cart');
  return response.data;
};

/**
 * Add item to cart or update quantity if exists
 * @param {Object} itemData - { productId, quantity }
 * @returns {Promise} Success message
 */
export const addToCart = async (itemData) => {
  const response = await apiClient.post('/cart/items', itemData);
  return response.data;
};

/**
 * Update item quantity in cart
 * @param {Object} itemData - { productId, quantity }
 * @returns {Promise} Success message
 */
export const updateCartItem = async (itemData) => {
  const response = await apiClient.put('/cart/items', itemData);
  return response.data;
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID to remove
 * @returns {Promise} Success message
 */
export const removeFromCart = async (productId) => {
  const response = await apiClient.delete(`/cart/items/${productId}`);
  return response.data;
};

/**
 * Clear entire cart
 * @returns {Promise} Success message
 */
export const clearCart = async () => {
  const response = await apiClient.delete('/cart');
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

export default cartService;