import { couponService } from "../services/coupon.service.js";
import AppError from "../utils/AppError.js";
import Coupon from "../models/Coupon.js";

export const couponController = {
  // Validate coupon code
  async validateCoupon(req, res, next) {
    try {
      const { couponCode } = req.body;
      const userId = req.user._id;
      const { cartItems } = req.body;

      if (!couponCode) {
        throw new AppError('Mã giảm giá không được để trống', 400);
      }

      const coupon = await couponService.validateCoupon(couponCode, userId, cartItems);

      res.status(200).json({
        success: true,
        message: 'Mã giảm giá hợp lệ',
        data: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minimumOrderValue: coupon.minimumOrderValue,
          maximumDiscountAmount: coupon.maximumDiscountAmount
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Calculate discount for cart
  async calculateDiscount(req, res, next) {
    try {
      const { couponCode, cartTotal, cartItems } = req.body;
      const userId = req.user._id;

      if (!couponCode || !cartTotal) {
        throw new AppError('Thiếu thông tin mã giảm giá hoặc tổng giá trị giỏ hàng', 400);
      }

      // First validate the coupon
      const coupon = await couponService.validateCoupon(couponCode, userId, cartItems);

      // Then calculate discount
      const discountResult = await couponService.calculateDiscount(coupon, cartTotal, cartItems);

      res.status(200).json({
        success: true,
        data: discountResult
      });
    } catch (error) {
      next(error);
    }
  },

  // Get available coupons for user
  async getAvailableCoupons(req, res, next) {
    try {
      const userId = req.user._id;
      const { cartItems } = req.query;

      let parsedCartItems = [];
      if (cartItems) {
        try {
          parsedCartItems = JSON.parse(cartItems);
        } catch (e) {
          // If parsing fails, use empty array
        }
      }

      const coupons = await couponService.getAvailableCoupons(userId, parsedCartItems);

      const formattedCoupons = coupons.map(coupon => ({
        _id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderValue: coupon.minimumOrderValue,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
        endDate: coupon.endDate,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        userUsageLimit: coupon.userUsageLimit
      }));

      res.status(200).json({
        success: true,
        data: formattedCoupons,
        count: formattedCoupons.length
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Create new coupon
  async createCoupon(req, res, next) {
    try {
      const {
        code,
        description,
        discountType,
        discountValue,
        minimumOrderValue,
        maximumDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        userUsageLimit,
        isPublic,
        allowedUsers,
        applicableProducts,
        applicableCategories,
        excludedProducts,
        excludedCategories
      } = req.body;

      const createdBy = req.user._id;

      // Validate required fields
      if (!code || !description || !discountType || !discountValue || !startDate || !endDate) {
        throw new AppError('Thiếu thông tin bắt buộc', 400);
      }

      // Validate discount type and value
      if (!['percentage', 'fixed'].includes(discountType)) {
        throw new AppError('Loại giảm giá không hợp lệ', 400);
      }

      if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
        throw new AppError('Giá trị giảm giá phần trăm phải từ 1 đến 100', 400);
      }

      if (discountType === 'fixed' && discountValue <= 0) {
        throw new AppError('Giá trị giảm giá cố định phải lớn hơn 0', 400);
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        throw new AppError('Ngày kết thúc phải sau ngày bắt đầu', 400);
      }

      // Check if coupon code already exists
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        throw new AppError('Mã giảm giá đã tồn tại', 409);
      }

      const newCoupon = new Coupon({
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minimumOrderValue: minimumOrderValue || 0,
        maximumDiscountAmount,
        startDate: start,
        endDate: end,
        usageLimit,
        userUsageLimit: userUsageLimit || 1,
        isPublic: isPublic !== false, // Default to true
        allowedUsers: allowedUsers || [],
        applicableProducts: applicableProducts || [],
        applicableCategories: applicableCategories || [],
        excludedProducts: excludedProducts || [],
        excludedCategories: excludedCategories || [],
        createdBy
      });

      await newCoupon.save();

      res.status(201).json({
        success: true,
        message: 'Tạo mã giảm giá thành công',
        data: newCoupon
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Get all coupons with pagination
  async getAllCoupons(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = {};
      
      // Filter by status
      if (req.query.status === 'active') {
        filter.isActive = true;
        filter.startDate = { $lte: new Date() };
        filter.endDate = { $gte: new Date() };
      } else if (req.query.status === 'expired') {
        filter.endDate = { $lt: new Date() };
      } else if (req.query.status === 'inactive') {
        filter.isActive = false;
      }

      // Search by code or description
      if (req.query.search) {
        filter.$or = [
          { code: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const [coupons, total] = await Promise.all([
        Coupon.find(filter)
          .populate('createdBy', 'name email')
          .populate('applicableProducts', 'name')
          .populate('applicableCategories', 'name')
          .populate('excludedProducts', 'name')
          .populate('excludedCategories', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Coupon.countDocuments(filter)
      ]);

      res.status(200).json({
        success: true,
        data: coupons,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Get coupon by ID
  async getCouponById(req, res, next) {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findById(id)
        .populate('createdBy', 'name email')
        .populate('applicableProducts', 'name slug price')
        .populate('applicableCategories', 'name')
        .populate('excludedProducts', 'name slug price')
        .populate('excludedCategories', 'name')
        .populate('usageHistory.userId', 'name email')
        .populate('usageHistory.orderId', 'orderNumber');

      if (!coupon) {
        throw new AppError('Không tìm thấy mã giảm giá', 404);
      }

      res.status(200).json({
        success: true,
        data: coupon
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Update coupon
  async updateCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        throw new AppError('Không tìm thấy mã giảm giá', 404);
      }

      // Don't allow updating code if coupon has been used
      if (updateData.code && coupon.usedCount > 0) {
        throw new AppError('Không thể thay đổi mã giảm giá đã được sử dụng', 400);
      }

      // Validate discount type and value if provided
      if (updateData.discountType && !['percentage', 'fixed'].includes(updateData.discountType)) {
        throw new AppError('Loại giảm giá không hợp lệ', 400);
      }

      if (updateData.discountValue) {
        const discountType = updateData.discountType || coupon.discountType;
        if (discountType === 'percentage' && (updateData.discountValue <= 0 || updateData.discountValue > 100)) {
          throw new AppError('Giá trị giảm giá phần trăm phải từ 1 đến 100', 400);
        }
        if (discountType === 'fixed' && updateData.discountValue <= 0) {
          throw new AppError('Giá trị giảm giá cố định phải lớn hơn 0', 400);
        }
      }

      // Validate dates if provided
      if (updateData.startDate || updateData.endDate) {
        const startDate = updateData.startDate ? new Date(updateData.startDate) : coupon.startDate;
        const endDate = updateData.endDate ? new Date(updateData.endDate) : coupon.endDate;
        
        if (startDate >= endDate) {
          throw new AppError('Ngày kết thúc phải sau ngày bắt đầu', 400);
        }
      }

      Object.assign(coupon, updateData);
      await coupon.save();

      res.status(200).json({
        success: true,
        message: 'Cập nhật mã giảm giá thành công',
        data: coupon
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Delete coupon
  async deleteCoupon(req, res, next) {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        throw new AppError('Không tìm thấy mã giảm giá', 404);
      }

      // Don't allow deleting coupon that has been used
      if (coupon.usedCount > 0) {
        throw new AppError('Không thể xóa mã giảm giá đã được sử dụng', 400);
      }

      await Coupon.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Xóa mã giảm giá thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Toggle coupon status
  async toggleCouponStatus(req, res, next) {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        throw new AppError('Không tìm thấy mã giảm giá', 404);
      }

      coupon.isActive = !coupon.isActive;
      await coupon.save();

      res.status(200).json({
        success: true,
        message: `${coupon.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} mã giảm giá thành công`,
        data: { isActive: coupon.isActive }
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Get coupon statistics
  async getCouponStats(req, res, next) {
    try {
      const stats = await couponService.getCouponStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Get coupon usage history
  async getCouponUsageHistory(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        throw new AppError('Không tìm thấy mã giảm giá', 404);
      }

      const skip = (page - 1) * limit;
      const usageHistory = coupon.usageHistory
        .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt))
        .slice(skip, skip + limit);

      // Populate user and order information
      await coupon.populate({
        path: 'usageHistory.userId',
        select: 'name email'
      });

      await coupon.populate({
        path: 'usageHistory.orderId',
        select: 'orderNumber totalAmount'
      });

      const total = coupon.usageHistory.length;

      res.status(200).json({
        success: true,
        data: usageHistory,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
