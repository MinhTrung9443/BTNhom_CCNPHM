import LoyaltyPoints from '../models/LoyaltyPoints.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

export const loyaltyPointsService = {
  // Calculate points to earn based on order amount
  calculatePointsToEarn: (orderAmount, pointsRate = 0.01) => {
    // Default: 1 point per 100 VNĐ spent
    return Math.floor(orderAmount * pointsRate);
  },

  // Award points for completed order
  awardPointsForOrder: async (userId, orderId, orderAmount, description = null) => {
    try {
      const pointsToEarn = loyaltyPointsService.calculatePointsToEarn(orderAmount);

      if (pointsToEarn <= 0) {
        logger.info(`No points to award for order ${orderId}`);
        return null;
      }

      const transaction = await LoyaltyPoints.earnPoints(
        userId,
        pointsToEarn,
        description || `Đặt hàng #${orderId} - ${orderAmount.toLocaleString('vi-VN')} VNĐ`,
        orderId,
        { orderAmount }
      );

      logger.info(`Awarded ${pointsToEarn} points to user ${userId} for order ${orderId}`);
      return transaction;
    } catch (error) {
      logger.error(`Lỗi award points for order: ${error.message}`);
      throw new AppError('Lỗi thưởng điểm cho đơn hàng', 500);
    }
  },

  // Redeem points for discount
  redeemPointsForDiscount: async (userId, pointsToRedeem, discountValue, couponId = null) => {
    try {
      const userTotalPoints = await LoyaltyPoints.getUserTotalPoints(userId);

      if (userTotalPoints < pointsToRedeem) {
        throw new AppError('Không đủ điểm để đổi', 400);
      }

      const transaction = await LoyaltyPoints.redeemPoints(
        userId,
        pointsToRedeem,
        `Đổi ${pointsToRedeem} điểm thành ${discountValue.toLocaleString('vi-VN')} VNĐ`,
        discountValue,
        couponId,
        { discountValue }
      );

      logger.info(`User ${userId} redeemed ${pointsToRedeem} points for ${discountValue} VNĐ`);
      return transaction;
    } catch (error) {
      logger.error(`Lỗi redeem points: ${error.message}`);
      throw error;
    }
  },

  // Get user's available points
  getUserAvailablePoints: async (userId) => {
    try {
      const result = await LoyaltyPoints.aggregate([
        {
          $match: {
            userId,
            $or: [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }],
          },
        },
        {
          $group: {
            _id: '$userId',
            totalPoints: {
              $sum: {
                $cond: [
                  { $in: ['$transactionType', ['earned', 'bonus', 'refund']] },
                  '$points',
                  { $multiply: ['$points', -1] },
                ],
              },
            },
          },
        },
      ]);
      return result[0]?.totalPoints || 0;
    } catch (error) {
      logger.error(`Lỗi get user available points: ${error.message}`);
      throw new AppError('Lỗi lấy thông tin điểm', 500);
    }
  },

  // Get user's points history with pagination
  getUserPointsHistory: async (userId, page = 1, limit = 10) => {
    try {
      const skip = (page - 1) * limit;
      const history = await LoyaltyPoints.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const total = await LoyaltyPoints.countDocuments({ userId });
      return {
        history,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      logger.error(`Lỗi get user points history: ${error.message}`);
      throw new AppError('Lỗi lấy lịch sử điểm', 500);
    }
  },

  // Get loyalty points statistics
  getLoyaltyStats: async () => {
    try {
      const [
        totalTransactions,
        totalEarned,
        totalRedeemed,
        activeUsers,
        averagePointsPerUser
      ] = await Promise.all([
        LoyaltyPoints.countDocuments(),
        LoyaltyPoints.aggregate([
          { $match: { transactionType: { $in: ['earned', 'bonus', 'refund'] } } },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]),
        LoyaltyPoints.aggregate([
          { $match: { transactionType: 'redeemed' } },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]),
        LoyaltyPoints.distinct('userId'),
        LoyaltyPoints.aggregate([
          {
            $group: {
              _id: '$userId',
              totalPoints: {
                $sum: {
                  $cond: [
                    { $in: ['$transactionType', ['earned', 'bonus', 'refund']] },
                    '$points',
                    { $multiply: ['$points', -1] }
                  ]
                }
              }
            }
          },
          {
            $group: {
              _id: null,
              average: { $avg: '$totalPoints' }
            }
          }
        ])
      ]);

      const earned = totalEarned[0]?.total || 0;
      const redeemed = totalRedeemed[0]?.total || 0;
      const average = averagePointsPerUser[0]?.average || 0;

      return {
        totalTransactions,
        totalEarned: earned,
        totalRedeemed: redeemed,
        netPoints: earned - redeemed,
        activeUsers: activeUsers.length,
        averagePointsPerUser: Math.round(average)
      };
    } catch (error) {
      logger.error(`Lỗi get loyalty stats: ${error.message}`);
      throw new AppError('Lỗi lấy thống kê điểm', 500);
    }
  },

  // Expire old points
  expireOldPoints: async () => {
    try {
      const expiredCount = await LoyaltyPoints.expirePoints();
      logger.info(`Expired ${expiredCount} loyalty points`);
      return expiredCount;
    } catch (error) {
      logger.error(`Lỗi expire old points: ${error.message}`);
      throw new AppError('Lỗi hết hạn điểm', 500);
    }
  },

  // Bonus points for special actions
  awardBonusPoints: async (userId, points, reason, metadata = {}) => {
    try {
      const transaction = await LoyaltyPoints.create({
        userId,
        points,
        transactionType: 'bonus',
        description: reason,
        metadata: { ...metadata, bonus: true }
      });

      logger.info(`Awarded ${points} bonus points to user ${userId} for: ${reason}`);
      return transaction;
    } catch (error) {
      logger.error(`Lỗi award bonus points: ${error.message}`);
      throw new AppError('Lỗi thưởng điểm thưởng', 500);
    }
  },

  // Refund points for cancelled order
  refundPointsForOrder: async (userId, orderId, pointsToRefund, reason = null) => {
    try {
      const transaction = await LoyaltyPoints.create({
        userId,
        points: pointsToRefund,
        transactionType: 'refund',
        description: reason || `Hoàn điểm cho đơn hàng #${orderId}`,
        orderId,
        metadata: { refund: true }
      });

      logger.info(`Refunded ${pointsToRefund} points to user ${userId} for order ${orderId}`);
      return transaction;
    } catch (error) {
      logger.error(`Lỗi refund points: ${error.message}`);
      throw new AppError('Lỗi hoàn điểm', 500);
    }
  },

  // Get points redemption options
  getRedemptionOptions: (availablePoints) => {
    const options = [
      { points: 100, discount: 10000, label: '100 điểm = 10,000 VNĐ' },
      { points: 200, discount: 25000, label: '200 điểm = 25,000 VNĐ' },
      { points: 500, discount: 70000, label: '500 điểm = 70,000 VNĐ' },
      { points: 1000, discount: 150000, label: '1000 điểm = 150,000 VNĐ' },
      { points: 2000, discount: 320000, label: '2000 điểm = 320,000 VNĐ' }
    ];

    return options.filter(option => option.points <= availablePoints);
  },

  // Daily check-in functionality
  dailyCheckin: async (userId) => {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError('Không tìm thấy người dùng', 404);
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Check if user already checked in today
      if (user.lastCheckinDate) {
        const lastCheckin = new Date(user.lastCheckinDate);
        const lastCheckinDay = new Date(lastCheckin.getFullYear(), lastCheckin.getMonth(), lastCheckin.getDate());

        if (lastCheckinDay.getTime() === today.getTime()) {
          throw new AppError('Bạn đã điểm danh hôm nay rồi', 400);
        }
      }

      // Calculate points based on day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const dayOfWeek = now.getDay();
      const pointsToAward = dayOfWeek === 0 ? 200 : 100;

      // Calculate expiry date (last day of next month)
      const expiryDate = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);

      // Check consecutive days
      let consecutiveDays = 1;
      if (user.lastCheckinDate) {
        const lastCheckin = new Date(user.lastCheckinDate);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastCheckinDay = new Date(lastCheckin.getFullYear(), lastCheckin.getMonth(), lastCheckin.getDate());
      }

      // Create loyalty points transaction
      const transaction = await LoyaltyPoints.create({
        userId,
        points: pointsToAward,
        transactionType: 'bonus',
        description: `Điểm danh ngày ${now.toLocaleDateString('vi-VN')} - ${dayOfWeek === 0 ? 'Chủ nhật' : 'Thứ ' + (dayOfWeek + 1)}`,
        expiryDate,
        metadata: {
          checkin: true,
          dayOfWeek,
          consecutiveDays
        }
      });

      // Update user
      user.lastCheckinDate = now;
      user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsToAward;
      await user.save();

      const totalPoints = await loyaltyPointsService.getUserAvailablePoints(userId);

      logger.info(`User ${userId} checked in and received ${pointsToAward} points`);

      return {
        points: pointsToAward,
        totalPoints,
        expiryDate,
        consecutiveDays,
        nextCheckinDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      logger.error(`Lỗi daily checkin: ${error.message}`);
      throw error;
    }
  },

  // Get check-in status
  getCheckinStatus: async (userId) => {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError('Không tìm thấy người dùng', 404);
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let canCheckin = true;

      if (user.lastCheckinDate) {
        const lastCheckin = new Date(user.lastCheckinDate);
        const lastCheckinDay = new Date(lastCheckin.getFullYear(), lastCheckin.getMonth(), lastCheckin.getDate());

        if (lastCheckinDay.getTime() === today.getTime()) {
          canCheckin = false;
        }
      }

      const nextCheckinDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      return {
        canCheckin,
        lastCheckinDate: user.lastCheckinDate,
        nextCheckinDate,
      };
    } catch (error) {
      logger.error(`Lỗi get checkin status: ${error.message}`);
      throw error;
    }
  }
};
