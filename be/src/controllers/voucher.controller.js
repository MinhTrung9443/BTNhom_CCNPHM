//voucher.controller.js
import voucherService from "../services/voucher.service.js";

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
};
