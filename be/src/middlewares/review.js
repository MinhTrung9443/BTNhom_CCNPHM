import { Order, Review } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const validatePurchase = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({
      'userId': userId,
      'orderLines.productId': productId,
      status: 'delivered',
    });

    if (!order) {
      throw new AppError('Bạn phải mua sản phẩm này để được đánh giá.', 403);
    }
    req.order = order;
    next();
  } catch (error) {
    next(error);
  }
};

const checkDuplicate = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;
    const orderId = req.order._id;

    const existingReview = await Review.findOne({ userId, productId, orderId });
    if (existingReview) {
      throw new AppError('Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi.', 409);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { validatePurchase, checkDuplicate };