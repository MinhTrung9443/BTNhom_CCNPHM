import api from './apiService';

const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

const getUserReviews = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};

const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

const getEligibleProducts = async (userId) => {
  const response = await api.get(`/reviews/eligible-products/${userId}`);
  return response.data;
};

export { getProductReviews, createReview, getUserReviews, updateReview, getEligibleProducts };