import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { 
        type: Number, 
        required: true, 
        min: 1 
      }
    },
  ]
}, { timestamps: true });

// Indexes for better performance
cartSchema.index({ "items.productId": 1 });
cartSchema.index({ isActive: 1 });

export default mongoose.model("Cart", cartSchema);
