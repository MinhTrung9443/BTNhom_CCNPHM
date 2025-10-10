import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["express", "standard"],
    default: "standard",
    required: true
  },
  name: {
    type: String,
    required: true,
    enum: ["Giao hỏa tốc", "Giao tiêu chuẩn"],
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  estimatedDays: {
    type: Number,
    required: true,
    min: 1
  }
}, { timestamps: true });

// Indexes for better performance
deliverySchema.index({ type: 1 });
deliverySchema.index({ price: 1 });

export default mongoose.model("Delivery", deliverySchema);
