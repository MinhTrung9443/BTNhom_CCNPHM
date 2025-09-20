// voucher.service.js

import Voucher from "../models/Voucher.js";
import mongoose from "mongoose";

const voucherService = {
  getAvailableVouchers: async (userId, totalAmount) => {
    // Lấy ngày hiện tại
    const vouchers = await Voucher.find({
      userId: userId,
      minPurchaseAmount: { $lte: totalAmount },
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isUsed: false,
    });
    console.log("Available Vouchers:", vouchers);
    return vouchers;
  },
};

export default voucherService;
