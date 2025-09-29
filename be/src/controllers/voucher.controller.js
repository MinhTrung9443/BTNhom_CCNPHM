//voucher.controller.js
import voucherService from "../services/voucher.service.js";

export const voucherController = {
  getMyVouchers: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const vouchers = await voucherService.getMyVouchers(userId);
      res.json({
        success: true,
        message: "Fetched vouchers successfully.",
        data: vouchers,
      });
    } catch (error) {
      next(error);
    }
  },

  getApplicableVouchers: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { orderLines } = req.body;
      const vouchers = await voucherService.getApplicableVouchers(
        userId,
        orderLines
      );
      res.json({
        success: true,
        message: "Fetched applicable vouchers successfully.",
        data: vouchers,
      });
    } catch (error) {
      next(error);
    }
  },

  getAdminVouchers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, type, source, userId, isActive } = req;
      const result = await voucherService.getAdminVouchers({
        page,
        limit,
        type,
        source,
        userId,
        isActive,
      });

      res.json({
        success: true,
        message: "Vouchers retrieved successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  getAdminVoucherById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await voucherService.getAdminVoucherById(id);

      res.json({
        success: true,
        message: "Voucher retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  createVoucher: async (req, res, next) => {
    try {
      const voucher = await voucherService.createAdminVoucher(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo voucher thành công",
        data: voucher,
      });
    } catch (error) {
      next(error);
    }
  },

  updateVoucher: async (req, res, next) => {
    try {
      const { id } = req.params;
      const voucher = await voucherService.updateAdminVoucher(id, req.body);
      res.json({
        success: true,
        message: "Cập nhật voucher thành công",
        data: voucher,
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
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
