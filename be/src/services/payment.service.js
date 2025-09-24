import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Payment from "../models/Payment.js";
import Delivery from "../models/Delivery.js";
import { loyaltyPointsService } from "./loyaltyPoints.service.js";
import logger from "../utils/logger.js";

// Lấy thông tin đơn vị vận chuyển
export const getDeliveryOptions = async () => {
  return await Delivery.find({});
};

// Kiểm tra tồn kho cho preview
export const checkProductsAvailability = async (products) => {
  const result = [];
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (product && product.stock >= item.quantity) {
      result.push({
        ...item,
        available: true,
        stock: product.stock,
        product: product,
      });
    } else {
      result.push({
        ...item,
        available: false,
        stock: product ? product.stock : 0,
        product: product,
      });
    }
  }
  return result;
};

// Xử lý payment theo từng loại
export const createOrder = async ({
  userId,
  orderLines,
  shippingAddress,
  phoneNumber,
  recipientName,
  notes,
  paymentMethod,
  totalAmount,
  deliveryId,
  voucherCode = null,
  discountAmount = 0,
}) => {
  switch (paymentMethod) {
    case "COD":
      return await handleCODPayment({
        userId,
        orderLines,
        shippingAddress,
        phoneNumber,
        recipientName,
        notes,
        totalAmount,
        deliveryId,
        voucherCode,
        discountAmount,
      });
    // case "vnpay":
    //   return await handleVNPAYPayment(...);
    // case "momo":
    //   return await handleMOMOPayment(...);
    default:
      throw new Error("Phương thức thanh toán không hợp lệ hoặc chưa hỗ trợ.");
  }
};

// Hàm xử lý thanh toán COD
const handleCODPayment = async ({
  userId,
  orderLines,
  shippingAddress,
  phoneNumber,
  recipientName,
  notes,
  totalAmount,
  deliveryId,
  voucherCode = null,
  discountAmount = 0,
}) => {
  // Kiểm tra tồn kho lần cuối trước khi tạo đơn hàng
  for (const ol of orderLines) {
    const product = await Product.findById(ol.productId);
    if (!product || product.stock < ol.quantity) {
      throw new Error(`Sản phẩm ${ol.productName} không đủ hàng.`);
    }
  }

  // Tạo phương thức thanh toán
  const payment = await Payment.create({
    userId,
    amount: totalAmount,
    paymentMethod: "COD",
    status: "pending",
  });

  // Tạo đơn hàng với thông tin voucher
  const orderData = {
    userId,
    orderLines,
    shippingAddress,
    phoneNumber,
    recipientName,
    notes,
    totalAmount,
    status: "pending",
    paymentId: payment._id,
    deliveryId: deliveryId,
  };

  // Thêm thông tin voucher nếu có
  if (voucherCode && discountAmount > 0) {
    orderData.voucherCode = voucherCode;
    orderData.discountAmount = discountAmount;
  }

  const order = await Order.create(orderData);

  // Giảm tồn kho sản phẩm
  for (const ol of orderLines) {
    await Product.updateOne(
      { _id: ol.productId },
      { $inc: { stock: -ol.quantity } }
    );
  }

  // Loại bỏ sản phẩm đã mua khỏi giỏ hàng
  await Cart.updateOne(
    { userId },
    {
      $pull: {
        items: {
          productId: { $in: orderLines.map((ol) => ol.productId) },
        },
      },
    }
  );

  // === LOYALTY POINTS INTEGRATION ===
  try {
    // Award loyalty points for the completed order
    await loyaltyPointsService.awardPointsForOrder(
      userId,
      order._id,
      totalAmount,
      `Đặt hàng thành công - ${orderLines.length} sản phẩm`
    );

    logger.info(`Awarded loyalty points for order ${order._id} by user ${userId}`);
  } catch (error) {
    logger.error(`Failed to award loyalty points for order ${order._id}: ${error.message}`);
    // Don't fail the order creation if loyalty points awarding fails
  }

  return order;
};
