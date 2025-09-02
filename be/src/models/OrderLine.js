import mongoose from "mongoose";

const orderLineSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: { type: String, required: true },
    productImage: { type: String },
    productPrice: { type: Number, required: true },

    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("OrderLine", orderLineSchema);
