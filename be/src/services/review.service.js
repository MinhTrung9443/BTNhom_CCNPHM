import { Review, Product, Voucher, Order } from '../models/index.js';

const getEligibleProducts = async (userId) => {
  const orders = await Order.find({ 'user.userId': userId, status: 'delivered' }).populate('items.productId');

  const eligibleProducts = [];
  const reviewedProductIds = new Set();

  const reviews = await Review.find({ userId });
  reviews.forEach(review => reviewedProductIds.add(review.productId.toString()));

  orders.forEach(order => {
    order.items.forEach(item => {
      if (!reviewedProductIds.has(item.productId._id.toString())) {
        eligibleProducts.push({
          orderId: order._id,
          product: item.productId
        });
        reviewedProductIds.add(item.productId._id.toString());
      }
    });
  });

  return eligibleProducts;
};

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
    source: 'review',
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

export { generateReviewVoucher, calculateProductRating, getEligibleProducts };