import mongoose from "mongoose";

const loyaltyPointsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    transactionType: {
      type: String,
      enum: ["earned", "redeemed", "expired", "bonus", "refund"],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon"
    },
    pointsValue: {
      type: Number, // monetary value of points (for redemption)
      default: null
    },
    expiryDate: {
      type: Date,
      default: null // null means never expires
    },
    isActive: {
      type: Boolean,
      default: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed // for additional data
    }
  },
  { timestamps: true }
);

// Indexes for better performance
loyaltyPointsSchema.index({ userId: 1, createdAt: -1 });
loyaltyPointsSchema.index({ transactionType: 1 });
loyaltyPointsSchema.index({ expiryDate: 1 });

// Virtual for checking if points are expired
loyaltyPointsSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

// Method to get user's total active points
loyaltyPointsSchema.statics.getUserTotalPoints = async function(userId) {
  const result = await this.aggregate([
    { $match: {
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    }},
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: {
            $cond: [
              { $in: ["$transactionType", ["earned", "bonus", "refund"]] },
              "$points",
              0
            ]
          }
        },
        totalRedeemed: {
          $sum: {
            $cond: [
              { $eq: ["$transactionType", "redeemed"] },
              "$points",
              0
            ]
          }
        }
      }
    }
  ]);

  if (result.length === 0) {
    return 0;
  }

  return Math.max(0, result[0].totalEarned - result[0].totalRedeemed);
};

// Method to expire points
loyaltyPointsSchema.statics.expirePoints = async function() {
  const expiredPoints = await this.updateMany(
    {
      expiryDate: { $lte: new Date() },
      isActive: true,
      transactionType: { $in: ["earned", "bonus", "refund"] }
    },
    {
      $set: {
        isActive: false,
        transactionType: "expired"
      }
    }
  );

  return expiredPoints.modifiedCount;
};

// Method to create points earning transaction
loyaltyPointsSchema.statics.earnPoints = async function(userId, points, description, orderId = null, metadata = {}) {
  const transaction = new this({
    userId,
    points,
    transactionType: "earned",
    description,
    orderId,
    metadata
  });

  return await transaction.save();
};

// Method to create points redemption transaction
loyaltyPointsSchema.statics.redeemPoints = async function(userId, points, description, pointsValue, couponId = null, metadata = {}) {
  const transaction = new this({
    userId,
    points: -points, // negative for redemption
    transactionType: "redeemed",
    description,
    couponId,
    pointsValue,
    metadata
  });

  return await transaction.save();
};

// Method to get user's points history with pagination
loyaltyPointsSchema.statics.getUserPointsHistory = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    this.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('orderId', 'totalAmount status')
      .populate('couponId', 'code name'),
    this.countDocuments({ userId })
  ]);

  return {
    transactions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

export default mongoose.model("LoyaltyPoints", loyaltyPointsSchema);
