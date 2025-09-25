import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import LoyaltyPoints from "../models/LoyaltyPoints.js";
import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";

export const adminController = {
  // User Management
  getAllUsers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, role } = req.query;
      const skip = (page - 1) * limit;

      let filter = {};
      if (search) {
        filter = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        };
      }
      if (role) {
        filter.role = role;
      }

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('vouchers', 'code discountValue'),
        User.countDocuments(filter)
      ]);

      res.json({
        success: true,
        message: 'Lấy danh sách người dùng thành công',
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        data: users
      });
    } catch (error) {
      logger.error(`Lỗi lấy danh sách người dùng: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId)
        .select('-password')
        .populate('vouchers', 'code discountValue')
        .populate('favorites', 'name price images');

      if (!user) {
        return next(new AppError('Không tìm thấy người dùng', 404));
      }

      res.json({
        success: true,
        message: 'Lấy thông tin người dùng thành công',
        data: user
      });
    } catch (error) {
      logger.error(`Lỗi lấy thông tin người dùng: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  updateUserRole: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['user', 'admin'].includes(role)) {
        return next(new AppError('Role không hợp lệ', 400));
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return next(new AppError('Không tìm thấy người dùng', 404));
      }

      res.json({
        success: true,
        message: 'Cập nhật role người dùng thành công',
        data: user
      });
    } catch (error) {
      logger.error(`Lỗi cập nhật role người dùng: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return next(new AppError('Không tìm thấy người dùng', 404));
      }

      res.json({
        success: true,
        message: 'Xóa người dùng thành công'
      });
    } catch (error) {
      logger.error(`Lỗi xóa người dùng: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  getUserStats: async (req, res, next) => {
    try {
      const [totalUsers, adminUsers, regularUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'user' })
      ]);

      const recentUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      res.json({
        success: true,
        message: 'Lấy thống kê người dùng thành công',
        data: {
          totalUsers,
          adminUsers,
          regularUsers,
          recentUsers
        }
      });
    } catch (error) {
      logger.error(`Lỗi lấy thống kê người dùng: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  // Coupon Management
  getAllCoupons: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status, type } = req.query;
      const skip = (page - 1) * limit;

      let filter = {};
      if (status === 'active') {
        filter.isActive = true;
        filter.startDate = { $lte: new Date() };
        filter.endDate = { $gte: new Date() };
      } else if (status === 'expired') {
        filter.endDate = { $lt: new Date() };
      } else if (status === 'inactive') {
        filter.isActive = false;
      }

      if (type) {
        filter.discountType = type;
      }

      const [coupons, total] = await Promise.all([
        Coupon.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'name email')
          .populate('applicableProducts', 'name')
          .populate('applicableCategories', 'name'),
        Coupon.countDocuments(filter)
      ]);

      res.json({
        success: true,
        message: 'Lấy danh sách mã giảm giá thành công',
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCoupons: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        data: coupons
      });
    } catch (error) {
      logger.error(`Lỗi lấy danh sách mã giảm giá: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  createCoupon: async (req, res, next) => {
    try {
      const couponData = {
        ...req.body,
        createdBy: req.user._id
      };

      const coupon = await Coupon.create(couponData);

      await coupon.populate('createdBy', 'name email');
      await coupon.populate('applicableProducts', 'name');
      await coupon.populate('applicableCategories', 'name');

      res.status(201).json({
        success: true,
        message: 'Tạo mã giảm giá thành công',
        data: coupon
      });
    } catch (error) {
      logger.error(`Lỗi tạo mã giảm giá: ${error.message}`);
      next(new AppError(error.message, 400));
    }
  },

  updateCoupon: async (req, res, next) => {
    try {
      const { couponId } = req.params;

      const coupon = await Coupon.findByIdAndUpdate(
        couponId,
        req.body,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email')
       .populate('applicableProducts', 'name')
       .populate('applicableCategories', 'name');

      if (!coupon) {
        return next(new AppError('Không tìm thấy mã giảm giá', 404));
      }

      res.json({
        success: true,
        message: 'Cập nhật mã giảm giá thành công',
        data: coupon
      });
    } catch (error) {
      logger.error(`Lỗi cập nhật mã giảm giá: ${error.message}`);
      next(new AppError(error.message, 400));
    }
  },

  deleteCoupon: async (req, res, next) => {
    try {
      const { couponId } = req.params;

      const coupon = await Coupon.findByIdAndDelete(couponId);

      if (!coupon) {
        return next(new AppError('Không tìm thấy mã giảm giá', 404));
      }

      res.json({
        success: true,
        message: 'Xóa mã giảm giá thành công'
      });
    } catch (error) {
      logger.error(`Lỗi xóa mã giảm giá: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  getCouponStats: async (req, res, next) => {
    try {
      const [totalCoupons, activeCoupons, expiredCoupons, percentageCoupons, fixedCoupons] = await Promise.all([
        Coupon.countDocuments(),
        Coupon.countDocuments({
          isActive: true,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }),
        Coupon.countDocuments({ endDate: { $lt: new Date() } }),
        Coupon.countDocuments({ discountType: 'percentage' }),
        Coupon.countDocuments({ discountType: 'fixed' })
      ]);

      res.json({
        success: true,
        message: 'Lấy thống kê mã giảm giá thành công',
        data: {
          totalCoupons,
          activeCoupons,
          expiredCoupons,
          percentageCoupons,
          fixedCoupons
        }
      });
    } catch (error) {
      logger.error(`Lỗi lấy thống kê mã giảm giá: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  // Loyalty Points Management
  getAllLoyaltyPoints: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, userId, type } = req.query;
      const skip = (page - 1) * limit;

      let filter = {};
      if (userId) filter.userId = userId;
      if (type) filter.transactionType = type;

      const [transactions, total] = await Promise.all([
        LoyaltyPoints.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('userId', 'name email')
          .populate('orderId', 'totalAmount status')
          .populate('couponId', 'code name'),
        LoyaltyPoints.countDocuments(filter)
      ]);

      res.json({
        success: true,
        message: 'Lấy lịch sử điểm thành công',
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        data: transactions
      });
    } catch (error) {
      logger.error(`Lỗi lấy lịch sử điểm: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  getUserLoyaltyPoints: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const totalPoints = await LoyaltyPoints.getUserTotalPoints(userId);

      const history = await LoyaltyPoints.getUserPointsHistory(userId, 1, 50);

      res.json({
        success: true,
        message: 'Lấy thông tin điểm thành công',
        data: {
          userId,
          totalPoints,
          history: history.transactions,
          pagination: history.pagination
        }
      });
    } catch (error) {
      logger.error(`Lỗi lấy thông tin điểm: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  adjustUserPoints: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { points, transactionType, description, metadata } = req.body;

      if (!['bonus', 'refund'].includes(transactionType)) {
        return next(new AppError('Loại giao dịch không hợp lệ', 400));
      }

      const transaction = await LoyaltyPoints.create({
        userId,
        points: Math.abs(points),
        transactionType,
        description,
        metadata: { ...metadata, adjustedBy: req.user._id }
      });

      await transaction.populate('userId', 'name email');

      res.json({
        success: true,
        message: 'Điều chỉnh điểm thành công',
        data: transaction
      });
    } catch (error) {
      logger.error(`Lỗi điều chỉnh điểm: ${error.message}`);
      next(new AppError(error.message, 400));
    }
  },

  expirePoints: async (req, res, next) => {
    try {
      const expiredCount = await LoyaltyPoints.expirePoints();

      res.json({
        success: true,
        message: `Đã hết hạn ${expiredCount} điểm`,
        data: { expiredCount }
      });
    } catch (error) {
      logger.error(`Lỗi hết hạn điểm: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  getLoyaltyStats: async (req, res, next) => {
    try {
      const [totalTransactions, totalEarned, totalRedeemed] = await Promise.all([
        LoyaltyPoints.countDocuments(),
        LoyaltyPoints.aggregate([
          { $match: { transactionType: { $in: ['earned', 'bonus', 'refund'] } } },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]),
        LoyaltyPoints.aggregate([
          { $match: { transactionType: 'redeemed' } },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ])
      ]);

      const earned = totalEarned[0]?.total || 0;
      const redeemed = totalRedeemed[0]?.total || 0;

      res.json({
        success: true,
        message: 'Lấy thống kê điểm thành công',
        data: {
          totalTransactions,
          totalEarned: earned,
          totalRedeemed: redeemed,
          netPoints: earned - redeemed
        }
      });
    } catch (error) {
      logger.error(`Lỗi lấy thống kê điểm: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  }
};
