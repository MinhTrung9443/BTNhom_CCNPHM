import mongoose from "mongoose";

const productViewSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User"
    }, // có thể null cho anonymous users
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewCount: { 
      type: Number, 
      default: 1,
      min: 1
    },
    lastViewedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Indexes for better performance
productViewSchema.index({ productId: 1 });
productViewSchema.index({ userId: 1 });

// Compound indexes
productViewSchema.index({ productId: 1, userId: 1 });
productViewSchema.index({ productId: 1, lastViewedAt: -1 });

export default mongoose.model("ProductView", productViewSchema);
