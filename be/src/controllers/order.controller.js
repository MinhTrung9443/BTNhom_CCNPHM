import * as OrderStatusService from '../services/orderStatus.service.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

import * as OrderService from '../services/order.service.js';

export const previewOrder = async (req, res) => {
  const result = await OrderService.previewOrder(req.user._id, req.body);
  res.json({
    success: true,
    message: 'Xem trước đơn hàng thành công.',
    data: result,
  });
};

export const placeOrder = async (req, res) => {
  const order = await OrderService.placeOrder(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Đặt hàng thành công.',
    data: order,
  });
};
export const getUserOrders = async (req, res, next) => {
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
};

export const getOrderDetail = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await OrderStatusService.getOrderDetail(orderId, userId);

  res.json({
    success: true,
    message: 'Lấy chi tiết đơn hàng thành công',
    data: order
  });
};

export const getUserOrderStats = async (req, res, next) => {
  const userId = req.user._id;
  const stats = await OrderStatusService.getOrderStats(userId);

  res.json({
    success: true,
    message: 'Lấy thống kê đơn hàng thành công',
    data: stats
  });
};

// === ADMIN FUNCTIONS ===

export const addTimelineNote = async (req, res, next) => {
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
};