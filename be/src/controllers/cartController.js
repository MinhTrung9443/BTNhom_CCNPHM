import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { couponService } from '../services/coupon.service.js';
import { loyaltyPointsService } from '../services/loyaltyPoints.service.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

export const upsertCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

      if (itemIndex > -1) {
        let newQuantity = cart.items[itemIndex].quantity + quantity;
        if (newQuantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = newQuantity;
        }
      } else {
        cart.items.push({ productId, quantity, price: product.price });
      }
    } else {
      cart = new Cart({
        userId,
        items: [{ productId, quantity, price: product.price }]
      });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.productId');

    res.status(200).json(populatedCart);

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) {
      return res.status(200).json({ userId: req.user.id, items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeItemFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: productId } } },
      { new: true }
    ).populate({
      path: 'items.productId',
      select: 'name price images discount',
    });

    if (!updatedCart) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json(updatedCart);

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// === COUPON FUNCTIONALITY ===

export const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user.id;

    if (!couponCode) {
      return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Calculate cart total
    let cartTotal = 0;
    const cartItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const itemTotal = item.quantity * (product.price - (product.discount || 0));
        cartTotal += itemTotal;
        cartItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }
    }

    // Validate coupon
    const coupon = await couponService.validateCoupon(couponCode, userId, cartItems);

    // Calculate discount
    const discountResult = await couponService.calculateDiscount(coupon, cartTotal, cartItems);

    // Update cart with coupon
    cart.appliedCoupon = {
      code: coupon.code,
      discountAmount: discountResult.discountAmount,
      finalAmount: discountResult.finalAmount,
      message: discountResult.message
    };

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId');

    res.json({
      success: true,
      message: discountResult.message,
      data: populatedCart
    });

  } catch (error) {
    logger.error(`Lỗi apply coupon: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const removeCoupon = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    cart.appliedCoupon = null;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId');

    res.json({
      success: true,
      message: 'Đã xóa mã giảm giá',
      data: populatedCart
    });

  } catch (error) {
    logger.error(`Lỗi remove coupon: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

export const getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's cart to check applicable products
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    const cartItems = cart ? cart.items : [];

    const availableCoupons = await couponService.getAvailableCoupons(userId, cartItems);

    res.json({
      success: true,
      message: 'Lấy danh sách mã giảm giá thành công',
      data: availableCoupons
    });

  } catch (error) {
    logger.error(`Lỗi get available coupons: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// === LOYALTY POINTS FUNCTIONALITY ===

export const getUserLoyaltyPoints = async (req, res) => {
  try {
    const userId = req.user.id;

    const availablePoints = await loyaltyPointsService.getUserAvailablePoints(userId);
    const redemptionOptions = loyaltyPointsService.getRedemptionOptions(availablePoints);

    res.json({
      success: true,
      message: 'Lấy thông tin điểm thành công',
      data: {
        availablePoints,
        redemptionOptions
      }
    });

  } catch (error) {
    logger.error(`Lỗi get user loyalty points: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const redeemPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pointsToRedeem, discountValue } = req.body;

    if (!pointsToRedeem || !discountValue) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Redeem points
    const transaction = await loyaltyPointsService.redeemPointsForDiscount(
      userId,
      pointsToRedeem,
      discountValue
    );

    // Get updated points
    const availablePoints = await loyaltyPointsService.getUserAvailablePoints(userId);

    res.json({
      success: true,
      message: `Đã đổi ${pointsToRedeem} điểm thành ${discountValue.toLocaleString('vi-VN')} VNĐ`,
      data: {
        transaction,
        availablePoints
      }
    });

  } catch (error) {
    logger.error(`Lỗi redeem points: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPointsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const history = await loyaltyPointsService.getUserPointsHistory(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      message: 'Lấy lịch sử điểm thành công',
      data: history
    });

  } catch (error) {
    logger.error(`Lỗi get points history: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};
