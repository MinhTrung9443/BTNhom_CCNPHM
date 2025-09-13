import apiClient from './apiClient';

/**
 * Get the current user's orders
 * @param {object} params - Query parameters
 * @param {number} params.page - Current page (default: 1)
 * @param {number} params.limit - Number of orders per page (default: 10)
 * @param {string} params.status - Order status (new, confirmed, preparing, shipping, delivered, cancelled, cancellation_requested)
 * @param {string} params.search - Search keyword
 * @returns {Promise<{data: object[], pagination: object}>}
 */
export const getUserOrders = async (params = {}) => {
  const { page = 1, limit = 10, status, search } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) queryParams.append('status', status);
  if (search) queryParams.append('search', search);

  const response = await apiClient.get(`/orders/my?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get order details
 * @param {string} orderId - The ID of the order
 * @returns {Promise<{data: object}>}
 */
export const getOrderDetail = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Get the current user's order statistics
 * @returns {Promise<{data: object}>}
 */
export const getUserOrderStats = async () => {
  const response = await apiClient.get('/orders/my/stats');
  return response.data;
};

/**
 * Cancel an order
 * @param {string} orderId - The ID of the order
 * @returns {Promise<{data: object}>}
 */
export const cancelOrder = async (orderId) => {
  const response = await apiClient.patch(`/orders/${orderId}/cancel`);
  return response.data;
};