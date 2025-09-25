import * as reviewService from '../services/review.service.js';
import { AppError } from '../utils/AppError.js';

const createReview = async (req, res, next) => {
  const { productId, orderId, rating, comment } = req.body;
  const userId = req.user._id;

  const { review, voucher } = await reviewService.createReview(userId, orderId, productId, rating, comment);

  res.status(201).json({
    success: true,
    message: 'Đánh giá của bạn đã được ghi nhận. Cảm ơn bạn đã chia sẻ!',
    review,
    voucher,
  });
};

const getProductReviews = async (req, res, next) => {
  const { productId } = req.params;
  const reviews = await reviewService.getProductReviews(productId);
  res.status(200).json({ success: true, reviews });
};

const getUserReviews = async (req, res, next) => {
  const userId = req.user._id;
  const reviews = await reviewService.getUserReviews(userId);
  res.status(200).json({ success: true, reviews });
};

const updateReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  const review = await reviewService.updateReview(reviewId, userId, rating, comment);

  res.status(200).json({ success: true, message: 'Đánh giá đã được cập nhật.', review });
};

export { createReview, getProductReviews, getUserReviews, updateReview };