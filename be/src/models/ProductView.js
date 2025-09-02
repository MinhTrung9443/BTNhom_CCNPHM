import mongoose from "mongoose";

const productViewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // có thể null
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewCount: { type: Number, default: 1 },
    lastViewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("ProductView", productViewSchema);
