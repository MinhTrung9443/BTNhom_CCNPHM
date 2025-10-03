import mongoose from "mongoose";

const viewHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
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

// Compound index for unique view per user per product at specific time
viewHistorySchema.index({ userId: 1, productId: 1, viewedAt: -1 });

export default mongoose.model("ViewHistory", viewHistorySchema);
