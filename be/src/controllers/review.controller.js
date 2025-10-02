import * as reviewService from "../services/review.service.js";
import { AppError } from "../utils/AppError.js";

const createReview = async (req, res, next) => {
  const { productId, orderId, rating, comment } = req.body;
  const userId = req.user._id;

  const { review, voucher } = await reviewService.createReview(userId, orderId, productId, rating, comment);

  res.status(201).json({
    success: true,
    message: "Đánh giá của bạn đã được ghi nhận. Cảm ơn bạn đã chia sẻ!",
    review,
    voucher,
  });
};

const getProductReviews = async (req, res, next) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await reviewService.getProductReviews(productId, page, limit);

  res.status(200).json({
    success: true,
    message: "Lấy đánh giá thành công",
    data: result,
  });
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

  res.status(200).json({ success: true, message: "Đánh giá đã được cập nhật.", review });
};

const getExistingReview = async (req, res, next) => {
  const { productId, orderId } = req.query;
  const userId = req.user._id;

  if (!productId || !orderId) {
    throw new AppError(400, "Thiếu thông tin productId hoặc orderId");
  }

  const existingReview = await reviewService.getExistingReview(userId, productId, orderId);

  if (existingReview) {
    res.status(200).json({
      success: true,
      message: "Đã tìm thấy đánh giá",
      data: existingReview,
    });
  } else {
    res.status(200).json({
      success: true,
      message: "Chưa có đánh giá",
      data: null,
    });
  }
};

export { createReview, getProductReviews, getUserReviews, updateReview, getExistingReview };
