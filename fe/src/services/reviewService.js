import api from './apiService';

const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

const getUserReviews = async () => {
  const response = await api.get('/reviews/me');
  return response.data;
};

const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};


export { getProductReviews, createReview, getUserReviews, updateReview };