import Product from "../models/Product.js";
import Order, { ORDER_STATUS } from "../models/Order.js";
import Cart from "../models/Cart.js";
import Payment from "../models/Payment.js";
import Delivery from "../models/Delivery.js";
import Voucher from "../models/Voucher.js";

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
      });
    } else {
      result.push({
        ...item,
        available: false,
        stock: product ? product.stock : 0,
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
  selectedVoucher,
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
        selectedVoucher,
      });
    // case "VNPAY":
    //   return await handleVNPAYPayment(...);
    // case "BANK":
    //   return await handleBankPayment(...);
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
  selectedVoucher,
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
    voucher: selectedVoucher ? selectedVoucher._id : null,
    totalAmount,
    status: ORDER_STATUS.NEW,
    paymentId: payment._id,
    payment: {
      paymentMethod: "COD",
      status: "pending",
    },
    deliveryId,
    timeline: [
      {
        status: ORDER_STATUS.NEW,
        description: "Đơn hàng mới được tạo",
        performedBy: {
          userId,
          userType: "user",
        },
        timestamp: new Date(),
      },
    ],
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

  // Cập nhật voucher đã sử dụng nếu có
  if (selectedVoucher) {
    await Voucher.updateOne(
      { _id: selectedVoucher._id },
      { $set: { isUsed: true } }
    );
  }

  return order;
};
