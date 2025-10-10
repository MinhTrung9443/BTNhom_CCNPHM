import mongoose from "mongoose";

const viewHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Cho phép null cho anonymous users
      default: null,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for better performance
viewHistorySchema.index({ userId: 1, viewedAt: -1 });
viewHistorySchema.index({ productId: 1 });
viewHistorySchema.index({ productId: 1, viewedAt: -1 });

// Compound unique index để đảm bảo mỗi user chỉ có 1 record cho mỗi sản phẩm
// Sử dụng sparse index để cho phép nhiều records với userId = null
viewHistorySchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });

export default mongoose.model("ViewHistory", viewHistorySchema);
