import { Review, Product, Voucher, UserVoucher, Order } from "../models/index.js";
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

  // Tạo record trong UserVoucher để gán quyền sở hữu cho user
  const userVoucher = new UserVoucher({
    userId,
    voucherId: voucher._id,
    isUsed: false,
  });
  await userVoucher.save();

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

  // 3. Kiểm tra thời gian nhận hàng để xác định có được nhận mã giảm giá không
  // Ưu tiên lấy từ deliveredAt, nếu không có thì lấy từ timeline
  let deliveryDate = order.deliveredAt;
  
  if (!deliveryDate && order.timeline && order.timeline.length > 0) {
    // Tìm entry DELIVERED hoặc COMPLETED trong timeline
    const deliveredEntry = order.timeline.find(
      entry => entry.status === 'delivered' || entry.status === 'completed'
    );
    if (deliveredEntry) {
      deliveryDate = deliveredEntry.timestamp;
    }
  }

  let voucher = null;
  let voucherEligibilityMessage = "";
  const isEligibleForVoucher = deliveryDate && (Date.now() - new Date(deliveryDate).getTime()) <= 30 * 24 * 60 * 60 * 1000;

  if (isEligibleForVoucher) {
    // Đánh giá trong vòng 30 ngày - được nhận mã giảm giá
    voucher = await generateReviewVoucher(userId, review._id);
    review.voucherGenerated = true;
    review.voucherCode = voucher.code;
    voucherEligibilityMessage = "Bạn đã nhận được mã giảm giá vì đánh giá trong vòng 30 ngày kể từ khi nhận hàng!";
  } else {
    // Đánh giá sau 30 ngày hoặc không xác định được ngày giao hàng - không được nhận mã
    review.voucherGenerated = false;
    if (deliveryDate) {
      const daysElapsed = Math.floor((Date.now() - new Date(deliveryDate).getTime()) / (24 * 60 * 60 * 1000));
      voucherEligibilityMessage = `Rất tiếc, bạn không được nhận mã giảm giá vì đã quá 30 ngày kể từ khi nhận hàng (đã ${daysElapsed} ngày).`;
    } else {
      voucherEligibilityMessage = "Rất tiếc, không thể xác định thời gian nhận hàng để cấp mã giảm giá.";
    }
  }

  await review.save();
  await calculateProductRating(productId);

  return { review, voucher, voucherEligibilityMessage, isEligibleForVoucher };
};

const getProductReviews = async (productId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Get reviews with pagination
  const reviews = await Review.find({ productId, isApproved: true })
    .populate("userId", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const totalReviews = await Review.countDocuments({ productId, isApproved: true });

  // Calculate summary statistics
  const allReviews = await Review.find({ productId, isApproved: true });
  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

  // Rating distribution
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allReviews.forEach((review) => {
    ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
  });

  // Pagination info
  const totalPages = Math.ceil(totalReviews / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages,
      totalReviews,
      hasNext,
      hasPrev,
      limit,
    },
    summary: {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: allReviews.length,
      ratingDistribution,
    },
  };
};

const getUserReviews = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Get reviews with pagination
  const reviews = await Review.find({ userId, isActive: true })
    .populate("productId", "name images slug")
    .populate("orderId", "orderNumber")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const totalReviews = await Review.countDocuments({ userId, isActive: true });

  // Pagination info
  const totalPages = Math.ceil(totalReviews / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages,
      totalReviews,
      hasNext,
      hasPrev,
      limit,
    },
  };
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
