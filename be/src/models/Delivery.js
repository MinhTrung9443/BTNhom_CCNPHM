import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["express", "regular", "standard"],
    default: "regular",
    required: true
  },
  name: {
    type: String,
    required: true,
    enum: ["Giao hỏa tốc", "Giao thường", "Giao chuẩn"],
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
    enum: [
      "Giao hàng trong vòng 24 giờ.",
      "Giao hàng trong 3-5 ngày làm việc.",
      "Giao hàng trong 5-7 ngày làm việc.",
    ],
    trim: true
  },
  estimatedDays: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for better performance
deliverySchema.index({ type: 1 });
deliverySchema.index({ isActive: 1 });
deliverySchema.index({ price: 1 });

export default mongoose.model("Delivery", deliverySchema);
