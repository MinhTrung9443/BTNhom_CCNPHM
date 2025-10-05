import * as OrderService from "../services/order.service.js";

export const previewOrder = async (req, res) => {
  const result = await OrderService.previewOrder(req.user._id, req.body);
  res.json({
    success: true,
    message: "Xem trước đơn hàng thành công.",
    data: result,
  });
};

export const placeOrder = async (req, res) => {
  const order = await OrderService.placeOrder(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: "Đặt hàng thành công.",
    data: order,
  });
};

export const handleMomoCallback = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const result = await OrderService.handleMomoCallback(orderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleMomoReturn = async (req, res) => {
  try {
    const { orderId, resultCode, amount, transId, message } = req.body;
    const userId = req.user._id;

    console.log(`MoMo return for order ${orderId}: resultCode=${resultCode}`);

    const updatedOrder = await OrderService.updateMomoPaymentFromReturn(orderId, userId, {
      resultCode: parseInt(resultCode),
      transactionId: transId,
      amount: amount,
      message: message,
    });

    res.json({
      success: true,
      message: "Cập nhật trạng thái thanh toán thành công.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("MoMo return error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi cập nhật trạng thái thanh toán.",
    });
  }
};

export const placeMomoOrder = async (req, res) => {
  const result = await OrderService.placeMomoOrder(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: "Đặt hàng MoMo thành công.",
    data: result,
  });
};
export const getUserOrders = async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status, search } = req.query;
  const result = await OrderService.getUserOrders(userId, parseInt(page), parseInt(limit), status, search);

  res.json({
    success: true,
    message: "Lấy danh sách đơn hàng thành công",
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
    message: "Lấy chi tiết đơn hàng thành công",
    data: order,
  });
};

export const getAllOrdersByAdmin = async (req, res) => {
  const { page = 1, limit = 10, status, search, sortBy, sortOrder } = req.query;

  const result = await OrderService.getAllOrders(parseInt(page, 10), parseInt(limit, 10), status, search, sortBy, sortOrder);

  res.json({
    success: true,
    message: "Lấy danh sách tất cả đơn hàng thành công.",
    meta: result.meta,
    data: result.data,
  });
};

export const updateOrderStatusByAdmin = async (req, res) => {
  const { orderId } = req.params;
  const { status, ...metadata } = req.body;

  const updatedOrder = await OrderService.updateOrderStatusByAdmin(orderId, status, metadata);

  res.json({
    success: true,
    message: "Cập nhật trạng thái đơn hàng thành công.",
    data: updatedOrder,
  });
};

export const getOrderByAdmin = async (req, res, next) => {
  const { orderId } = req.params;
  const order = await OrderService.getOrderByIdForAdmin(orderId);
  res.json({
    success: true,
    message: "Lấy thông tin đơn hàng thành công.",
    data: order,
  });
};

export const getUserOrdersByAdmin = async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, status, search } = req.query;

  const result = await OrderService.getUserOrders(userId, parseInt(page), parseInt(limit), status, search);

  res.json({
    success: true,
    message: "Lấy danh sách đơn hàng của người dùng thành công",
    pagination: result.pagination,
    data: result.orders,
  });
};

export const getUserOrderStats = async (req, res, next) => {
  const userId = req.user._id;
  const stats = await OrderService.getOrderStats(userId);

  res.json({
    success: true,
    message: "Lấy thống kê đơn hàng thành công",
    data: stats,
  });
};

export const requestReturn = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const updatedOrder = await OrderService.requestReturn(userId, orderId, reason);

  res.json({
    success: true,
    message: "Yêu cầu trả hàng của bạn đã được gửi.",
    data: updatedOrder,
  });
};

export const approveReturn = async (req, res) => {
  const { orderId } = req.params;

  const updatedOrder = await OrderService.approveReturn(orderId);

  res.json({
    success: true,
    message: "Yêu cầu trả hàng đã được chấp thuận.",
    data: updatedOrder,
  });
};

export const getPendingReturns = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await OrderService.getPendingReturns(parseInt(page, 10), parseInt(limit, 10));

  res.json({
    success: true,
    message: "Lấy danh sách đơn hàng chờ trả hàng/hoàn tiền thành công.",
    meta: result.meta,
    data: result.data,
  });
};

export const confirmOrderReceived = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const updatedOrder = await OrderService.confirmOrderReceived(userId, orderId);

  res.json({
    success: true,
    message: "Xác nhận đã nhận hàng thành công. Cảm ơn bạn đã mua sắm!",
    data: updatedOrder,
  });
};

export const cancelOrderByUser = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const updatedOrder = await OrderService.cancelOrderByUser(userId, orderId, reason);

  res.json({
    success: true,
    message: "Yêu cầu hủy đơn hàng của bạn đã được xử lý.",
    data: updatedOrder,
  });
};
