import User from "../models/User.js";
// import Coupon from "../models/Coupon.js";
import LoyaltyPoints from "../models/LoyaltyPoints.js";
import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";
import * as orderService from "../services/order.service.js";
import * as adminService from '../services/admin.service.js';
import * as loyaltyService from '../services/loyalty.service.js';
import voucherService from '../services/voucher.service.js';
import { getAllUsersForChat } from "../services/user.service.js";

export const adminController = {
  // User Management
  getUsersForChat: async (req, res, next) => {
    try {
      const { page = 1, limit = 15 } = req.query;
      const result = await getAllUsersForChat({ 
        page: parseInt(page),
        limit: parseInt(limit)
      });
      res.json({
        success: true,
        message: "Lấy danh sách người dùng cho chat thành công",
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },
  getAllUsers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, role } = req.query;
      const skip = (page - 1) * limit;

      // Luôn loại bỏ admin khỏi danh sách quản lý
      let filter = { role: { $ne: "admin" } };
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }
      
      // Nếu có filter role cụ thể và không phải admin
      if (role && role !== "admin") {
        filter.role = role;
      }

      const [users, total] = await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(filter),
      ]);

      res.json({
        success: true,
        message: "Lấy danh sách người dùng thành công",
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        data: users,
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
        .select("-password");

      if (!user) {
        return next(new AppError("Không tìm thấy người dùng", 404));
      }

      res.json({
        success: true,
        message: "Lấy thông tin người dùng thành công",
        data: user,
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

      if (!["user", "admin"].includes(role)) {
        return next(new AppError("Role không hợp lệ", 400));
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return next(new AppError("Không tìm thấy người dùng", 404));
      }

      res.json({
        success: true,
        message: "Cập nhật role người dùng thành công",
        data: user,
      });
    } catch (error) {
      logger.error(`Lỗi cập nhật role người dùng: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  toggleUserStatus: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return next(new AppError("Không tìm thấy người dùng", 404));
      }

      // Toggle the isActive status
      user.isActive = !user.isActive;
      await user.save();

      res.json({
        success: true,
        message: user.isActive 
          ? "Kích hoạt tài khoản thành công" 
          : "Vô hiệu hóa tài khoản thành công",
        data: {
          userId: user._id,
          isActive: user.isActive
        }
      });
    } catch (error) {
      logger.error(`Lỗi thay đổi trạng thái người dùng: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  getUserStats: async (req, res, next) => {
    try {
      // Chỉ thống kê user thường, không bao gồm admin
      const [totalUsers, regularUsers] = await Promise.all([
        User.countDocuments({ role: { $ne: "admin" } }),
        User.countDocuments({ role: "user" }),
      ]);

      const recentUsers = await User.countDocuments({
        role: { $ne: "admin" },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });

      res.json({
        success: true,
        message: "Lấy thống kê người dùng thành công",
        data: {
          totalUsers,
          regularUsers,
          recentUsers,
        },
      });
    } catch (error) {
      logger.error(`Lỗi lấy thống kê người dùng: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  getAllLoyaltyPoints: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, userId, type } = req.query;

      // Sử dụng lại service đã được chuẩn hóa
      const result = await loyaltyService.getLoyaltyHistory(userId, type, page, limit);

      res.json({
        success: true,
        message: "Lấy lịch sử điểm thành công",
        pagination: {
          currentPage: result.meta.currentPage,
          totalPages: result.meta.totalPages,
          totalTransactions: result.meta.totalRecords,
          hasNext: result.meta.currentPage < result.meta.totalPages,
          hasPrev: result.meta.currentPage > 1,
        },
        data: result.data,
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
        message: "Lấy thông tin điểm thành công",
        data: {
          userId,
          totalPoints,
          history: history.transactions,
          pagination: history.pagination,
        },
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

      if (!["earned", "refund"].includes(transactionType)) {
        return next(new AppError("Loại giao dịch không hợp lệ", 400));
      }

      const transaction = await LoyaltyPoints.create({
        userId,
        points: Math.abs(points),
        transactionType,
        description,
        metadata: { ...metadata, adjustedBy: req.user._id },
      });

      await transaction.populate("userId", "name email");

      res.json({
        success: true,
        message: "Điều chỉnh điểm thành công",
        data: transaction,
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
        data: { expiredCount },
      });
    } catch (error) {
      logger.error(`Lỗi hết hạn điểm: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  getLoyaltyStats: async (req, res, next) => {
    try {
      const [totalTransactions, totalEarned, totalRedeemed] = await Promise.all(
        [
          LoyaltyPoints.countDocuments(),
          LoyaltyPoints.aggregate([
            {
              $match: {
                transactionType: { $in: ["earned", "refund"] },
              },
            },
            { $group: { _id: null, total: { $sum: "$points" } } },
          ]),
          LoyaltyPoints.aggregate([
            { $match: { transactionType: "redeemed" } },
            { $group: { _id: null, total: { $sum: "$points" } } },
          ]),
        ]
      );

      const earned = totalEarned[0]?.total || 0;
      const redeemed = totalRedeemed[0]?.total || 0;

      res.json({
        success: true,
        message: "Lấy thống kê điểm thành công",
        data: {
          totalTransactions,
          totalEarned: earned,
          totalRedeemed: redeemed,
          netPoints: earned - redeemed,
        },
      });
    } catch (error) {
      logger.error(`Lỗi lấy thống kê điểm: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  },

  updateOrderStatus: async (req, res) => {
    const { orderId } = req.params;
    const { status, ...metadata } = req.body;

    const updatedOrder = await orderService.updateOrderStatusByAdmin(
      orderId,
      status,
      metadata
    );

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công.",
      data: updatedOrder,
    });
  },

  // === NEW DASHBOARD CONTROLLERS ===

  getCashFlowStats: async (req, res, next) => {
    try {
      const stats = await adminService.getCashFlowStats();
      res.json({
        success: true,
        message: "Lấy thống kê dòng tiền thành công.",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  getTopSellingProducts: async (req, res, next) => {
    try {
      const topProducts = await adminService.getTopSellingProducts(10); // Lấy top 10
      res.json({
        success: true,
        message: "Lấy danh sách sản phẩm bán chạy nhất thành công.",
        data: topProducts,
      });
    } catch (error) {
      next(error);
    }
  },

  getDeliveredOrders: async (req, res, next) => {
    try {
      const { page = 1, limit = 5 } = req.query;
      const result = await adminService.getDeliveredOrders({ page, limit });
      res.json({
        success: true,
        message: "Lấy danh sách đơn hàng đã giao thành công.",
        data: result.orders,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  getDashboardStats: async (req, res, next) => {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({
        success: true,
        message: "Lấy thống kê tổng quan thành công.",
        data: stats,
      });
    } catch (error)
    {
      next(error);
    }
  },
  getAllProductsForAdmin: async (req, res, next) => {
    try {
      const result = await adminService.getAllProductsForAdmin(req.query);
      res.json({
        success: true,
        message: "Lấy danh sách sản phẩm cho admin thành công.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getSalesChartData: async (req, res, next) => {
    try {
      const { period = '7d' } = req.query;
      const data = await adminService.getSalesChartData(period);
      res.json({
        success: true,
        message: 'Lấy dữ liệu biểu đồ doanh thu thành công.',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Voucher Management
  getVouchers: async (req, res, next) => {
    try {
      const filters = req.query;
      const result = await voucherService.getAdminVouchers(filters);
      res.json({
        success: true,
        message: "Vouchers retrieved successfully",
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  getVoucherById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await voucherService.getAdminVoucherById(id);
      res.json({
        success: true,
        message: "Voucher retrieved successfully",
        data: {
          voucher: result.voucher,
          usageStats: result.usageStats
        }
      });
    } catch (error) {
      next(error);
    }
  },

  deactivateVoucher: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await voucherService.deactivateVoucher(id);
      res.json({
        success: true,
        message: "Voucher deactivated successfully",
        data: {
          reclaimedUses: result.reclaimedUses
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getOrdersWithCancellationRequests: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await orderService.getOrdersWithCancellationRequests(parseInt(page), parseInt(limit));
      res.json({
        success: true,
        message: "Lấy danh sách đơn hàng yêu cầu hủy thành công.",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  approveCancellationRequest: async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const adminId = req.user._id;
      const updatedOrder = await orderService.approveCancellationRequest(orderId, adminId);
      res.json({
        success: true,
        message: "Đã chấp nhận yêu cầu hủy đơn hàng thành công.",
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  },

  searchUsers: async (req, res, next) => {
    try {
      const { q } = req.query;
      const users = await adminService.searchUsers(q);
      res.json({
        success: true,
        message: "Search successful",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },
};
