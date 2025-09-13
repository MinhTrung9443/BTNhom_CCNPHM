import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Payment from "../models/Payment.js";
import Delivery from "../models/Delivery.js";

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

  // Tạo đơn hàng
  const order = await Order.create({
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
  });

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

  return order;
};
