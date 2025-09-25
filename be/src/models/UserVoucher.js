import mongoose from "mongoose";

const userVoucherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  }
}, { timestamps: true });

// Indexes for better performance
userVoucherSchema.index({ userId: 1 });
userVoucherSchema.index({ voucherId: 1 });
userVoucherSchema.index({ isUsed: 1 });

userVoucherSchema.index({ orderId: 1 });

// Unique constraint to prevent duplicate voucher assignments
userVoucherSchema.index({ userId: 1, voucherId: 1 }, { unique: true });

export default mongoose.model("UserVoucher", userVoucherSchema);