import mongoose from "mongoose";

const loyaltyPointsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    transactionType: {
      type: String,
      enum: ["earned", "redeemed", "refund"],
      required: true
    },
//     Ý nghĩa từng giá trị:

// "earned" → Điểm người dùng nhận được (ví dụ mua hàng được 1% giá trị đơn, điểm danh).
// "redeemed" → Điểm người dùng sử dụng để đổi lấy ưu đãi/giảm giá.
// "refund" → Điểm trả lại do hoàn đơn, hủy giao dịch, hoặc điều chỉnh.
    description: {
      type: String,
      required: true,
      trim: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },
    pointsValue: {
      type: Number, // monetary value of points (for redemption)
      default: null
    },
    expiryDate: {
      type: Date,
      default: null // null means never expires
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed // for additional data
    }
  },
  { timestamps: true }
);

// Indexes for better performance
loyaltyPointsSchema.index({ userId: 1, createdAt: -1 });
loyaltyPointsSchema.index({ transactionType: 1 });
loyaltyPointsSchema.index({ expiryDate: 1 });

// Virtual for checking if points are expired
loyaltyPointsSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});


export default mongoose.model("LoyaltyPoints", loyaltyPointsSchema);
