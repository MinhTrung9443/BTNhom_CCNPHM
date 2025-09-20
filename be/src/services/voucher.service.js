// voucher.service.js

import Voucher from "../models/Voucher.js";
import mongoose from "mongoose";

const voucherService = {
  getAvailableVouchers: async (userId, totalAmount) => {
    // Lấy ngày hiện tại
    const currentDate = new Date();
    const vouchers = await Voucher.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      minPurchaseAmount: { $lte: totalAmount },
      isUsed: false,
    });
    return vouchers;
  },
};

export default voucherService;
