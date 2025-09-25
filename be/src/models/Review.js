import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
      trim: true
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    voucherGenerated: {
      type: Boolean,
      default: false,
    },
    voucherCode: {
      type: String,
    },
    editCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for better performance
reviewSchema.index({ userId: 1 });
reviewSchema.index({ productId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ isActive: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound index for product reviews
reviewSchema.index({ productId: 1, isApproved: 1, isActive: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;