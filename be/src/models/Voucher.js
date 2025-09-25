import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 20
  },
  discountValue: { 
    type: Number, 
    required: true,
    min: 0
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage"
  },
  type: {
    type: String,
    enum: ["public", "personal"],
    default: "personal"
  },
  // --- Dành cho voucher 'public' ---
  globalUsageLimit: {
    type: Number,
    min: 0,
    default: null // null means unlimited
  },
  currentUsage: {
    type: Number,
    min: 0,
    default: 0
  },
  // --- Dành cho voucher 'personal' ---
  userUsageLimit: {
    type: Number,
    min: 1,
    default: 1 // Default: user can use once
  },
  minPurchaseAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  maxDiscountAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  source: {
    type: String,
    enum: ["admin", "review", "promotion"],
    default: "admin"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // --- Áp dụng cho sản phẩm và danh mục ---
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }],
  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }]
}, { timestamps: true });

// Indexes for better performance
voucherSchema.index({ userId: 1 });
voucherSchema.index({ isUsed: 1 });
voucherSchema.index({ isActive: 1 });
voucherSchema.index({ startDate: 1, endDate: 1 });
voucherSchema.index({ source: 1 });
voucherSchema.index({ type: 1 });

// Compound indexes
voucherSchema.index({ userId: 1, isUsed: 1, isActive: 1 });
voucherSchema.index({ startDate: 1, endDate: 1, isActive: 1 });
voucherSchema.index({ type: 1, isActive: 1 });
voucherSchema.index({ type: 1, globalUsageLimit: 1, currentUsage: 1 });

export default mongoose.model("Voucher", voucherSchema);
