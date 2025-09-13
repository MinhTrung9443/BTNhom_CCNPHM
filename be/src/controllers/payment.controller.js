import * as paymentService from "../services/payment.service.js";

const preview = async (req, res) => {
  try {
    const { products } = req.body; // Nhận danh sách sản phẩm từ FE
    const availableProducts = await paymentService.checkProductsAvailability(
      products
    );
    res.status(200).json({ availableProducts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra tồn kho sản phẩm.",
      error: error.message,
    });
  }
};

const payment = async (req, res) => {
  try {
    const {
      orderLines,
      shippingAddress,
      phoneNumber,
      recipientName,
      notes,
      paymentMethod,
      totalAmount,
      deliveryId,
    } = req.body;
    const userId = req.user._id;

    // Gọi service để tạo đơn hàng
    const order = await paymentService.createOrder({
      userId,
      orderLines,
      shippingAddress,
      phoneNumber,
      recipientName,
      notes,
      paymentMethod,
      totalAmount,
      deliveryId,
    });

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xử lý thanh toán.",
      error: error.message,
    });
  }
};

const getDelivery = async (req, res) => {
  try {
    const deliveries = await paymentService.getDeliveryOptions();
    res.status(200).json({ success: true, data: deliveries });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin giao hàng.",
      error: error.message,
    });
  }
};

export { preview, payment, getDelivery };
