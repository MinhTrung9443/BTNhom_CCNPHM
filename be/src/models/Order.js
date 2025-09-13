import mongoose from "mongoose";

const orderLineSchema = new mongoose.Schema(
  {
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
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "packed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
    },
    orderLines: [orderLineSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    recipientName: { type: String, required: true },
    notes: { type: String },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
