import apiClient from './apiClient';

/**
 * Get user's current loyalty points
 * @returns {Promise<{success: boolean, data: {loyaltyPoints: number}}>}
 */
export const getUserLoyaltyPoints = async () => {
  const response = await apiClient.get('/users/loyalty-points');
  return response.data;
};

/**
 * Get loyalty points history/transactions
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<{success: boolean, data: array, pagination: object}>}
 */
export const getLoyaltyPointsHistory = async (params = {}) => {
  const { page = 1, limit = 10 } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await apiClient.get(`/users/loyalty-points/history?${queryParams.toString()}`);
  return response.data;
};

/**
 * Apply loyalty points to order (this might be handled in order preview)
 * @param {number} points - Points to apply
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const applyLoyaltyPoints = async (points) => {
  const response = await apiClient.post('/users/loyalty-points/apply', { points });
  return response.data;
};

const loyaltyService = {
  getUserLoyaltyPoints,
  getLoyaltyPointsHistory,
  applyLoyaltyPoints
};

export default loyaltyService;