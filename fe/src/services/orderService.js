import apiClient from './apiClient';

/**
 * Preview order with current selections
 * @param {object} orderData - Order preview data
 * @param {array} orderData.orderLines - Array of product selections [{productId, quantity}]
 * @param {object} orderData.shippingAddress - Optional delivery address {province, district, ward, street, phoneNumber, recipientName}
 * @param {string} orderData.voucherCode - Optional discount code
 * @param {string} orderData.shippingMethod - Optional shipping preference (express, regular, standard)
 * @param {object} orderData.payment - Optional payment method object
 * @param {string} orderData.payment.paymentMethod - Payment method (VNPAY, COD, BANK)
 * @param {number} orderData.pointsToApply - Optional loyalty points amount
 * @returns {Promise<{success: boolean, message: string, data: {previewOrder: object}}>}
 */
export const previewOrder = async (orderData) => {
  const response = await apiClient.post('/orders/preview', orderData);
  return response.data;
};

/**
 * Create final order with confirmed details
 * @param {object} orderData - Complete order data with previewOrder
 * @param {object} orderData.previewOrder - The complete preview order object from preview API
 * @param {array} orderData.previewOrder.orderLines - Array with full product details
 * @param {object} orderData.previewOrder.shippingAddress - Complete shipping address
 * @param {number} orderData.previewOrder.subtotal - Subtotal amount
 * @param {string} orderData.previewOrder.shippingMethod - Shipping method
 * @param {number} orderData.previewOrder.shippingFee - Shipping fee
 * @param {number} orderData.previewOrder.discount - Discount amount
 * @param {number} orderData.previewOrder.pointsApplied - Points applied
 * @param {number} orderData.previewOrder.totalAmount - Total amount
 * @param {string|null} orderData.previewOrder.voucherCode - Voucher code or null
 * @returns {Promise<{success: boolean, message: string, data: object}>}
 */
export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

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