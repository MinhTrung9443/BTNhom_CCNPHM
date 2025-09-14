import mongoose from "mongoose";
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
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
cartSchema.virtual("totalPrice").get(function () {
  if (!this.items) return 0;
  return this.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
});
export default mongoose.model("Cart", cartSchema);
