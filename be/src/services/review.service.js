import { Review, Product, Voucher, Order } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

const generateReviewVoucher = async (userId, reviewId) => {
  const voucherCode = `REVIEW_${Date.now()}`;
  const voucher = new Voucher({
    code: voucherCode,
    discountValue: 5, // 5%
    userId,
    minPurchaseAmount: 100000,
    maxDiscountAmount: 50000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    source: "review",
    sourceId: reviewId,
  });
  await voucher.save();
  return voucher;
};

const calculateProductRating = async (productId) => {
  const reviews = await Review.find({ productId, isApproved: true });
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
    const averageRating = totalRating / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      averageRating: averageRating.toFixed(1),
      totalReviews: reviews.length,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

const createReview = async (userId, orderId, productId, rating, comment) => {
  // 1. Validate Purchase: Check if the order exists, belongs to the user, is delivered, and contains the product.
  const order = await Order.findOne({
    _id: orderId,
    userId: userId,
    status: "completed",
    "orderLines.productId": productId,
  });

  if (!order) {
    throw new AppError("Đơn hàng không hợp lệ hoặc bạn không thể đánh giá sản phẩm từ đơn hàng này.", 403);
  }

  // 2. Check for Duplicate Review for the same product in the same order
  const existingReview = await Review.findOne({ userId, productId, orderId });
  if (existingReview) {
    throw new AppError("Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi.", 409);
  }

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

  return { review, voucher };
};

const getProductReviews = async (productId) => {
  return Review.find({ productId, isApproved: true }).populate("userId", "name avatar").sort({ createdAt: -1 });
};

const getUserReviews = async (userId) => {
  return Review.find({ userId }).populate("productId", "name images").sort({ createdAt: -1 });
};

const updateReview = async (reviewId, userId, rating, comment) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError("Không tìm thấy đánh giá.", 404);
  }

  if (review.userId.toString() !== userId.toString()) {
    throw new AppError("Bạn không có quyền chỉnh sửa đánh giá này.", 403);
  }

  if (review.editCount > 0) {
    throw new AppError("Bạn chỉ có thể chỉnh sửa đánh giá này một lần.", 403);
  }

  // Optional: Add a time limit for editing
  const now = new Date();
  const reviewDate = new Date(review.createdAt);
  const diffDays = Math.ceil(Math.abs(now - reviewDate) / (1000 * 60 * 60 * 24));
  if (diffDays > 30) {
    throw new AppError("Bạn không thể chỉnh sửa đánh giá sau 30 ngày.", 403);
  }

  review.rating = rating;
  review.comment = comment;
  review.editCount += 1;
  await review.save();
  await calculateProductRating(review.productId);

  return review;
};

const getExistingReview = async (userId, productId, orderId) => {
  // Chỉ tìm đánh giá của người dùng hiện tại cho sản phẩm và đơn hàng cụ thể
  const existingReview = await Review.findOne({
    userId: userId,
    productId: productId,
    orderId: orderId,
  }).populate("productId", "name images");

  return existingReview;
};

export { generateReviewVoucher, calculateProductRating, createReview, getProductReviews, getUserReviews, updateReview, getExistingReview };
