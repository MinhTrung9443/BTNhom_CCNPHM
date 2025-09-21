import { Review } from '../models/index.js';
import {
  generateReviewVoucher,
  calculateProductRating,
} from '../services/review.service.js';
import { getEligibleProducts as getEligibleProductsService } from '../services/review.service.js';
import { AppError } from '../utils/AppError.js';

const getEligibleProducts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const products = await getEligibleProductsService(userId);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;
    const orderId = req.order._id;

    const review = new Review({
      userId,
      productId,
      orderId,
      rating,
      comment,
    });

    const voucher = await generateReviewVoucher(userId, review._id);
    review.voucherGenerated = true;
    review.voucherCode = voucher.code;

    await review.save();
    await calculateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Đánh giá của bạn đã được ghi nhận. Cảm ơn bạn đã chia sẻ!',
      review,
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, isApproved: true })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ userId })
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new AppError('Không tìm thấy đánh giá.', 404);
    }

    if (review.userId.toString() !== userId.toString()) {
      throw new AppError('Bạn không có quyền chỉnh sửa đánh giá này.', 403);
    }

    if (review.editCount > 0) {
      throw new AppError('Bạn chỉ có thể chỉnh sửa đánh giá này một lần.', 403);
    }

    // Optional: Add a time limit for editing
    const now = new Date();
    const reviewDate = new Date(review.createdAt);
    const diffDays = Math.ceil(Math.abs(now - reviewDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
        throw new AppError('Bạn không thể chỉnh sửa đánh giá sau 30 ngày.', 403);
    }

    review.rating = rating;
    review.comment = comment;
    review.editCount += 1;
    await review.save();
    await calculateProductRating(review.productId);

    res.status(200).json({ success: true, message: 'Đánh giá đã được cập nhật.', review });
  } catch (error) {
    next(error);
  }
};

export { createReview, getProductReviews, getUserReviews, updateReview, getEligibleProducts };