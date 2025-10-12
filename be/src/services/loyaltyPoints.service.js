import LoyaltyPoints from '../models/LoyaltyPoints.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

export const loyaltyPointsService = {
  // Tính điểm thưởng dựa trên số tiền đơn hàng
  calculatePointsToEarn: (orderAmount, pointsRate = 0.01) => {
    // Mặc định: 1 điểm cho mỗi 100 VNĐ
    return Math.floor(orderAmount * pointsRate);
  },

  // Thưởng điểm cho đơn hàng đã hoàn thành
  awardPointsForOrder: async (userId, orderId, orderAmount, description = null) => {
    try {
      // if #1: Kiểm tra userId hợp lệ
      if (!userId) {
        logger.warn('Thiếu userId khi thưởng điểm.');
        return null;
      }

      // if #2: Kiểm tra orderId hợp lệ
      if (!orderId) {
        logger.warn('Thiếu orderId khi thưởng điểm.');
        return null;
      }

      // if #3: Kiểm tra orderAmount hợp lệ
      if (orderAmount === null || orderAmount === undefined) {
        logger.warn(`orderAmount không hợp lệ: ${orderAmount}`);
        return null;
      }

      // Tính điểm
      const pointsToEarn = loyaltyPointsService.calculatePointsToEarn(orderAmount);

      // if #4: Nếu không có điểm để thưởng
      if (pointsToEarn <= 0) {
        logger.info(`Không có điểm để thưởng cho đơn hàng ${orderId}`);
        return null;
      } else {
        logger.debug(`Số điểm sẽ thưởng: ${pointsToEarn}`);
      }

      // if #5: Xử lý description
      let finalDescription;
      if (description) {
        finalDescription = description;
      } else {
        finalDescription = `Đặt hàng #${orderId} - ${orderAmount.toLocaleString('vi-VN')} VNĐ`;
      }

      // if #6: Log trước khi thưởng điểm
      if (pointsToEarn > 0) {
        logger.info(`Chuẩn bị thưởng ${pointsToEarn} điểm cho người dùng ${userId}`);
      }

      // Ghi nhận giao dịch thưởng điểm
      const transaction = await LoyaltyPoints.earnPoints(
        userId,
        pointsToEarn,
        finalDescription,
        orderId,
        { orderAmount }
      );

      // if #7: Kiểm tra kết quả trả về từ DB
      if (!transaction) {
        logger.error(`Không thể ghi nhận giao dịch thưởng điểm cho đơn hàng ${orderId}`);
        return null;
      }

      // if #8: Log thành công
      if (transaction) {
        logger.info(`Đã thưởng ${pointsToEarn} điểm cho người dùng ${userId} cho đơn hàng ${orderId}`);
      }

      return transaction;
    } catch (error) {
      logger.error(`Lỗi award points for order: ${error.message}`);
      throw new AppError('Lỗi thưởng điểm cho đơn hàng', 500);
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
  }
};
