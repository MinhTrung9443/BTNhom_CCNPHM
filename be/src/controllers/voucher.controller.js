//voucher.controller.js
import voucherService from "../services/voucher.service.js";

export const voucherController = {
  getAvailableVouchers: async (req, res) => {
    try {
      const userId = req.user.id;
      const totalAmount = req.query.totalAmount;
      console.log(
        "Fetching vouchers for user:",
        userId,
        "with totalAmount:",
        totalAmount
      );
      const vouchers = await voucherService.getAvailableVouchers(
        userId,
        totalAmount
      );
      res.json(vouchers);
    } catch (error) {
      console.error("Error fetching available vouchers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
