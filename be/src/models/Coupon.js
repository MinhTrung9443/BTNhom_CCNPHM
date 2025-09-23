import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0
    },
    maximumDiscountAmount: {
      type: Number,
      default: null // null means no limit
    },
    usageLimit: {
      type: Number,
      default: null // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0
    },
    userUsageLimit: {
      type: Number,
      default: 1 // how many times each user can use this coupon
    },
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }], // empty array means applicable to all products
    applicableCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }], // empty array means applicable to all categories
    excludedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }], // products that cannot use this coupon
    excludedCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }], // categories that cannot use this coupon
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPublic: {
      type: Boolean,
      default: true // if false, only specific users can use it
    },
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }], // if not public, only these users can use it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    usageHistory: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
      },
      usedAt: {
        type: Date,
        default: Date.now
      },
      discountAmount: {
        type: Number,
        required: true
      }
    }]
  },
  { timestamps: true }
);

// Indexes for better performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ isPublic: 1 });

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.endDate;
});

// Virtual for checking if coupon is valid (active, not expired, within usage limits)
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive &&
         now >= this.startDate &&
         now <= this.endDate &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if coupon can be used by a specific user
couponSchema.methods.canBeUsedByUser = function(userId) {
  if (!this.isPublic && !this.allowedUsers.includes(userId)) {
    return false;
  }

  const userUsageCount = this.usageHistory.filter(
    usage => usage.userId.toString() === userId.toString()
  ).length;

  return userUsageCount < this.userUsageLimit;
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount, products = []) {
  if (!this.isValid) {
    return 0;
  }

  // Check minimum order value
  if (orderAmount < this.minimumOrderValue) {
    return 0;
  }

  // Check if products are applicable
  if (this.applicableProducts.length > 0 || this.excludedProducts.length > 0) {
    const productIds = products.map(p => p.productId?.toString());
    const hasExcludedProduct = productIds.some(id =>
      this.excludedProducts.some(ep => ep.toString() === id)
    );

    if (hasExcludedProduct) {
      return 0;
    }

    if (this.applicableProducts.length > 0) {
      const hasApplicableProduct = productIds.some(id =>
        this.applicableProducts.some(ap => ap.toString() === id)
      );

      if (!hasApplicableProduct) {
        return 0;
      }
    }
  }

  let discountAmount = 0;

  if (this.discountType === "percentage") {
    discountAmount = (orderAmount * this.discountValue) / 100;
  } else {
    discountAmount = this.discountValue;
  }

  // Apply maximum discount limit
  if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
    discountAmount = this.maximumDiscountAmount;
  }

  return discountAmount;
};

// Method to use coupon
couponSchema.methods.useCoupon = function(userId, orderId, discountAmount) {
  this.usedCount += 1;
  this.usageHistory.push({
    userId,
    orderId,
    discountAmount
  });

  return this.save();
};

export default mongoose.model("Coupon", couponSchema);
