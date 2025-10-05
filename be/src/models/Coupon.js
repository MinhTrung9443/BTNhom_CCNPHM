import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
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
    default: null
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
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
    default: 1 // How many times each user can use this coupon
  },
  usageHistory: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    discountAmount: {
      type: Number,
      required: true
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true // If false, only specific users can use
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual field to check if coupon is valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if coupon can be used by a specific user
couponSchema.methods.canBeUsedByUser = function(userId) {
  if (!this.isValid) return false;
  
  // Check if user is allowed (if not public)
  if (!this.isPublic && !this.allowedUsers.includes(userId)) {
    return false;
  }
  
  // Check user usage limit
  const userUsageCount = this.usageHistory.filter(
    usage => usage.userId.toString() === userId.toString()
  ).length;
  
  return userUsageCount < this.userUsageLimit;
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(cartTotal, products = []) {
  let applicableAmount = cartTotal;
  
  // If specific products or categories are set, calculate applicable amount
  if (this.applicableProducts.length > 0 || this.applicableCategories.length > 0) {
    applicableAmount = 0;
    
    products.forEach(product => {
      let isApplicable = false;
      
      // Check if product is in applicable products
      if (this.applicableProducts.length > 0) {
        isApplicable = this.applicableProducts.some(
          ap => ap._id.toString() === product.productId.toString()
        );
      }
      
      // Check if product category is in applicable categories
      if (!isApplicable && this.applicableCategories.length > 0) {
        isApplicable = this.applicableCategories.some(
          ac => ac._id.toString() === product.category.toString()
        );
      }
      
      // If no specific products/categories set, all products are applicable
      if (this.applicableProducts.length === 0 && this.applicableCategories.length === 0) {
        isApplicable = true;
      }
      
      // Check if product is excluded
      const isExcluded = this.excludedProducts.some(
        ep => ep._id.toString() === product.productId.toString()
      ) || this.excludedCategories.some(
        ec => ec._id.toString() === product.category.toString()
      );
      
      if (isApplicable && !isExcluded) {
        applicableAmount += product.price * product.quantity;
      }
    });
  }
  
  if (applicableAmount < this.minimumOrderValue) {
    return 0;
  }
  
  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = (applicableAmount * this.discountValue) / 100;
    
    // Apply maximum discount limit if set
    if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
      discountAmount = this.maximumDiscountAmount;
    }
  } else if (this.discountType === 'fixed') {
    discountAmount = Math.min(this.discountValue, applicableAmount);
  }
  
  return Math.round(discountAmount);
};

// Method to use coupon
couponSchema.methods.useCoupon = async function(userId, orderId, discountAmount) {
  if (!this.canBeUsedByUser(userId)) {
    throw new Error('Coupon cannot be used by this user');
  }
  
  this.usageHistory.push({
    userId,
    orderId,
    discountAmount
  });
  
  this.usedCount += 1;
  
  await this.save();
  return this;
};

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ 'usageHistory.userId': 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
