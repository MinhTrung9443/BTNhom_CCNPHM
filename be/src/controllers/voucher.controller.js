//voucher.controller.js
import voucherService from "../services/voucher.service.js";

export const voucherController = {
  getMyVouchers: async (req, res, next) => {
    const userId = req.user.id;
    const vouchers = await voucherService.getMyVouchers(userId);
    res.json({
        success: true,
        message: 'Lấy danh sách voucher thành công.',
        data: vouchers,
    });
  },

  getApplicableVouchers: async (req, res, next) => {
      const userId = req.user.id;
      const { orderLines } = req.body;
      const vouchers = await voucherService.getApplicableVouchers(userId, orderLines);
      res.json({
        success: true,
        message: 'Lấy danh sách voucher có thể áp dụng thành công.',
        data: vouchers,
      });
  },
};
