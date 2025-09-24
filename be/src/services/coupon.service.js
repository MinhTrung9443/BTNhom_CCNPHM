import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

export const couponService = {
  // Validate coupon for user and cart
  validateCoupon: async (couponCode, userId, cartItems = []) => {
    try {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true
      }).populate('applicableProducts applicableCategories excludedProducts excludedCategories');

      if (!coupon) {
        throw new AppError('Mã giảm giá không tồn tại hoặc không hoạt động', 404);
      }

      // Check if coupon is valid (not expired, within usage limits)
      if (!coupon.isValid) {
        throw new AppError('Mã giảm giá đã hết hạn hoặc không còn hiệu lực', 400);
      }

      // Check user usage limit
      if (!coupon.canBeUsedByUser(userId)) {
        throw new AppError('Bạn đã sử dụng mã giảm giá này quá số lần cho phép', 400);
      }

      // Check if products are applicable
      if (cartItems.length > 0) {
        const productIds = cartItems.map(item => item.productId?.toString());
        const categoryIds = [];

        // Get categories for products in cart
        for (const item of cartItems) {
          const product = await Product.findById(item.productId);
          if (product && product.category) {
            categoryIds.push(product.category.toString());
          }
        }

        // Check excluded products
        const hasExcludedProduct = productIds.some(id =>
          coupon.excludedProducts.some(ep => ep._id.toString() === id)
        );

        if (hasExcludedProduct) {
          throw new AppError('Mã giảm giá không áp dụng cho một số sản phẩm trong giỏ hàng', 400);
        }

        // Check excluded categories
        const hasExcludedCategory = categoryIds.some(id =>
          coupon.excludedCategories.some(ec => ec._id.toString() === id)
        );

        if (hasExcludedCategory) {
          throw new AppError('Mã giảm giá không áp dụng cho một số danh mục sản phẩm trong giỏ hàng', 400);
        }

        // Check applicable products (if specified)
        if (coupon.applicableProducts.length > 0) {
          const hasApplicableProduct = productIds.some(id =>
            coupon.applicableProducts.some(ap => ap._id.toString() === id)
          );

          if (!hasApplicableProduct) {
            throw new AppError('Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng', 400);
          }
        }

        // Check applicable categories (if specified)
        if (coupon.applicableCategories.length > 0) {
          const hasApplicableCategory = categoryIds.some(id =>
            coupon.applicableCategories.some(ac => ac._id.toString() === id)
          );

          if (!hasApplicableCategory) {
            throw new AppError('Mã giảm giá không áp dụng cho danh mục sản phẩm trong giỏ hàng', 400);
          }
        }
      }

      return coupon;
    } catch (error) {
      logger.error(`Lỗi validate coupon: ${error.message}`);
      throw error;
    }
  },

  // Calculate discount amount
  calculateDiscount: async (coupon, cartTotal, cartItems = []) => {
    try {
      // Check minimum order value
      if (cartTotal < coupon.minimumOrderValue) {
        return {
          discountAmount: 0,
          finalAmount: cartTotal,
          message: `Đơn hàng tối thiểu ${coupon.minimumOrderValue.toLocaleString('vi-VN')} VNĐ để sử dụng mã giảm giá`
        };
      }

      // Get products for validation
      const products = [];
      for (const item of cartItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          products.push({
            productId: product._id,
            category: product.category,
            price: product.price,
            quantity: item.quantity
          });
        }
      }

      const discountAmount = coupon.calculateDiscount(cartTotal, products);

      if (discountAmount === 0) {
        return {
          discountAmount: 0,
          finalAmount: cartTotal,
          message: 'Mã giảm giá không áp dụng cho đơn hàng này'
        };
      }

      const finalAmount = Math.max(0, cartTotal - discountAmount);

      return {
        discountAmount,
        finalAmount,
        message: `Áp dụng mã giảm giá thành công: -${discountAmount.toLocaleString('vi-VN')} VNĐ`
      };
    } catch (error) {
      logger.error(`Lỗi calculate discount: ${error.message}`);
      throw new AppError('Lỗi tính toán giảm giá', 500);
    }
  },

  // Apply coupon to order
  applyCouponToOrder: async (coupon, userId, orderId, orderAmount, discountAmount) => {
    try {
      await coupon.useCoupon(userId, orderId, discountAmount);

      logger.info(`Coupon ${coupon.code} applied to order ${orderId} by user ${userId}`);
      return coupon;
    } catch (error) {
      logger.error(`Lỗi apply coupon to order: ${error.message}`);
      throw new AppError('Lỗi áp dụng mã giảm giá', 500);
    }
  },

  // Get available coupons for user
  getAvailableCoupons: async (userId, cartItems = []) => {
    try {
      // Use start of day for current date to avoid timezone issues
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const coupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: endOfDay }, // Allow coupons that start today
        endDate: { $gte: startOfDay }, // Allow coupons that end today
        $or: [
          { isPublic: true },
          { allowedUsers: userId }
        ]
      }).populate('applicableProducts applicableCategories');

      const availableCoupons = [];

      for (const coupon of coupons) {
        try {
          // Check if coupon can be used by this user
          if (!coupon.canBeUsedByUser(userId)) {
            continue;
          }

          // Check if applicable to cart items (if cart is provided)
          if (cartItems.length > 0) {
            const productIds = cartItems.map(item => item.productId?.toString());

            // Check excluded products
            const hasExcludedProduct = productIds.some(id =>
              coupon.excludedProducts.some(ep => ep._id.toString() === id)
            );

            if (hasExcludedProduct) {
              continue;
            }

            // Check applicable products (if specified)
            if (coupon.applicableProducts.length > 0) {
              const hasApplicableProduct = productIds.some(id =>
                coupon.applicableProducts.some(ap => ap._id.toString() === id)
              );

              if (!hasApplicableProduct) {
                continue;
              }
            }
          }

          availableCoupons.push(coupon);
        } catch (error) {
          logger.warn(`Error checking coupon ${coupon.code}: ${error.message}`);
        }
      }

      return availableCoupons;
    } catch (error) {
      logger.error(`Lỗi get available coupons: ${error.message}`);
      throw new AppError('Lỗi lấy danh sách mã giảm giá', 500);
    }
  },

  // Get coupon statistics
  getCouponStats: async () => {
    try {
      const [
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        percentageCoupons,
        fixedCoupons,
        totalUsage,
        totalDiscountAmount
      ] = await Promise.all([
        Coupon.countDocuments(),
        Coupon.countDocuments({
          isActive: true,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }),
        Coupon.countDocuments({ endDate: { $lt: new Date() } }),
        Coupon.countDocuments({ discountType: 'percentage' }),
        Coupon.countDocuments({ discountType: 'fixed' }),
        Coupon.aggregate([
          { $group: { _id: null, total: { $sum: '$usedCount' } } }
        ]),
        Coupon.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ['$usedCount', '$discountValue'] } }
            }
          }
        ])
      ]);

      return {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        percentageCoupons,
        fixedCoupons,
        totalUsage: totalUsage[0]?.total || 0,
        totalDiscountAmount: totalDiscountAmount[0]?.total || 0
      };
    } catch (error) {
      logger.error(`Lỗi get coupon stats: ${error.message}`);
      throw new AppError('Lỗi lấy thống kê mã giảm giá', 500);
    }
  }
};
