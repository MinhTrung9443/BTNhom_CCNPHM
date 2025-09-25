import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ["VNPAY", "COD", "BANK", "MOMO"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled", "refunded"],
    default: "pending",
  },
  transactionId: { 
    type: String,
    sparse: true // Allows multiple null values
  },
  paymentDate: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundDate: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // for additional payment gateway data
  }
}, { timestamps: true });

// Indexes for better performance
paymentSchema.index({ userId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ createdAt: -1 });

// Compound indexes
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ orderId: 1, status: 1 });

export default mongoose.model("Payment", paymentSchema);
