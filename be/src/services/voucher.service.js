import { UserVoucher } from "../models/index.js";
import mongoose from "mongoose";


const voucherService = {
  getMyVouchers: async (userId) => {
    const currentDate = new Date();
    const userVouchers = await UserVoucher.find({
      userId: new mongoose.Types.ObjectId(userId),
      isUsed: false,
    }).populate({ path: 'voucherId', select: '-applicableProducts -excludedProducts -applicableCategories -excludedCategories -__v' });
    console.log(userVouchers);

    // Filter out vouchers that are null (dangling reference) or invalid
    const availableVouchers = userVouchers
      .filter(uv => {
        const voucher = uv.voucherId;
        // Ensure voucher exists and is valid
        return (
          voucher &&
          voucher.isActive &&
          voucher.startDate <= currentDate &&
          voucher.endDate >= currentDate
        );
      })
      .map(uv => uv.voucherId); // Extract the populated voucher document

    return availableVouchers;
  },
};

export default voucherService;
