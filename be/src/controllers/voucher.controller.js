//voucher.controller.js
import voucherService from "../services/voucher.service.js";
import { couponService } from "../services/coupon.service.js";

export const voucherController = {
  getAvailableVouchers: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const totalAmount = req.body.totalAmount;
      const vouchers = await voucherService.getAvailableVouchers(
        userId,
        totalAmount
      );
      res.json(vouchers);
    } catch (error) {
      next(error);
    }
  },

  validateVoucher: async (req, res, next) => {
    try {
      const { code, cartItems } = req.body;
      const userId = req.user.id;

      // Use the existing coupon service to validate
      const coupon = await couponService.validateCoupon(code, userId, cartItems);

      // Calculate discount
      const cartTotal = cartItems.reduce((acc, item) => {
        return acc + (item.productId.price * item.quantity);
      }, 0);

      const discountResult = await couponService.calculateDiscount(coupon, cartTotal, cartItems);

      res.json({
        valid: true,
        coupon: coupon,
        discountAmount: discountResult.discountAmount,
        discountType: coupon.discountType,
        message: discountResult.message
      });
    } catch (error) {
      res.status(400).json({
        valid: false,
        message: error.message
      });
    }
  },
};
