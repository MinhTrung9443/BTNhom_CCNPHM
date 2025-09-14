import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true }
}, { timestamps: true });
cartSchema.virtual('totalPrice').get(function() {
  if (!this.items) return 0;
  return this.items.reduce((total, item) => total + item.quantity * item.price, 0);
});
cartSchema.index({ userId: 1 }, { unique: true });
export default mongoose.model("Cart", cartSchema);