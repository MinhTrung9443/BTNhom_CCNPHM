import * as paymentService from "../services/payment.service.js";

const preview = async (req, res) => {
  const { products } = req.body; // Nhận danh sách sản phẩm từ FE
  const availableProducts = await paymentService.checkProductsAvailability(
    products
  );
  res.status(200).json({ availableProducts });
};

const payment = async (req, res) => {
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

  console.log(req.body);

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
};

const getDelivery = async (req, res) => {
  const deliveries = await paymentService.getDeliveryOptions();
  res.status(200).json({ success: true, data: deliveries });
};

export { preview, payment, getDelivery };
