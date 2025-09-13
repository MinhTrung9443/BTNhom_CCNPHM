import * as OrderStatusService from '../services/orderStatus.service.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, search } = req.query;

    const result = await OrderStatusService.getUserOrders(
      userId,
      parseInt(page),
      parseInt(limit),
      status,
      search
    );

    res.json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      pagination: result.pagination,
      data: result.orders,
    });
  } catch (error) {
    logger.error(`Lỗi lấy danh sách đơn hàng: ${error.message}`);
    next(new AppError(error.message, 400));
  }
};

export const getOrderDetail = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await OrderStatusService.getOrderDetail(orderId, userId);

    res.json({
      success: true,
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order
    });
  } catch (error) {
    logger.error(`Lỗi lấy chi tiết đơn hàng: ${error.message}`);
    next(new AppError(error.message, 400));
  }
};

export const getUserOrderStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const stats = await OrderStatusService.getOrderStats(userId);

    res.json({
      success: true,
      message: 'Lấy thống kê đơn hàng thành công',
      data: stats
    });
  } catch (error) {
    logger.error(`Lỗi lấy thống kê đơn hàng: ${error.message}`);
    next(new AppError(error.message, 400));
  }
};

// === ADMIN FUNCTIONS ===

export const addTimelineNote = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { description, metadata = {} } = req.body;

    if (!description) {
      return next(new AppError('Vui lòng nhập nội dung ghi chú', 400));
    }

    const performedBy = {
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      userType: 'admin'
    };

    const order = await OrderStatusService.addTimelineEntry(
      orderId,
      null, // Không thay đổi status
      description,
      performedBy,
      metadata
    );

    res.json({
      success: true,
      message: 'Thêm ghi chú thành công',
      data: order
    });
  } catch (error) {
    logger.error(`Lỗi thêm ghi chú timeline: ${error.message}`);
    next(new AppError(error.message, 400));
  }
};