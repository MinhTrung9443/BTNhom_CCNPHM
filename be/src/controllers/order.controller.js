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

  const result = await OrderService.getUserOrders(
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

  const order = await OrderService.getOrderDetail(orderId, userId);

  res.json({
    success: true,
    message: 'Lấy chi tiết đơn hàng thành công',
    data: order
  });
};

export const getOrderByAdmin = async (req, res, next) => {
    const { orderId } = req.params;
    const order = await OrderService.getOrderByIdForAdmin(orderId);
    res.json({
      success: true,
      message: 'Lấy thông tin đơn hàng thành công.',
      data: order
    });
};

export const getUserOrderStats = async (req, res, next) => {
  const userId = req.user._id;
  const stats = await OrderService.getOrderStats(userId);

  res.json({
    success: true,
    message: 'Lấy thống kê đơn hàng thành công',
    data: stats
  });
};
