import User from "../models/User.js";
import Product from "../models/Product.js";
import Voucher from "../models/Voucher.js";
import UserVoucher from "../models/UserVoucher.js";
import Delivery from "../models/Delivery.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const calculateShippingFee = async (shippingMethod) => {
  if (!shippingMethod) return 0;

  const deliveryMethod = await Delivery.findOne({
    type: shippingMethod,
    isActive: true,
  }).lean();
  if (!deliveryMethod) {
    logger.warn(
      `Phương thức vận chuyển '${shippingMethod}' không hợp lệ hoặc không hoạt động.`
    );
    return 0; // Hoặc throw lỗi tùy theo yêu cầu nghiệp vụ
  }
  return deliveryMethod.price;
};

export const previewOrder = async (
  userId,
  {
    orderLines,
    shippingAddress,
    voucherCode,
    shippingMethod,
    pointsToApply = 0,
    paymentMethod,
  }
) => {
  if (!orderLines || orderLines.length === 0) {
    throw new AppError("Vui lòng chọn sản phẩm để xem trước", 400);
  }

  let subtotal = 0;
  const unavailableItems = [];
  const processedOrderLines = [];

  for (const line of orderLines) {
    const product = await Product.findById(line.productId).lean();

    if (!product) {
      unavailableItems.push({ ...line, reason: "Sản phẩm không tồn tại" });
      continue;
    }

    if (product.stock < line.quantity) {
      unavailableItems.push({
        ...line,
        reason: `Không đủ hàng (chỉ còn ${product.stock})`,
      });
      continue;
    }

    const discountPerProduct = product.discount || 0;
    const productActualPrice = product.price * (1 - discountPerProduct / 100);
    const lineTotal = productActualPrice * line.quantity;

    subtotal += lineTotal;
    processedOrderLines.push({
      productId: product._id,
      productCode: product.code,
      productName: product.name,
      productImage: product.images[0],
      productPrice: product.price,
      quantity: line.quantity,
      discount: discountPerProduct,
      productActualPrice,
      lineTotal,
    });
  }

  if (unavailableItems.length > 0) {
    throw new AppError("Một số sản phẩm không có sẵn hoặc đã hết hàng", 409, {
      unavailableItems,
    });
  }

  // Phí ship chỉ được tính khi có phương thức vận chuyển
  const shippingFee = shippingMethod
    ? await calculateShippingFee(shippingMethod)
    : null;
  let discount = 0;
  let appliedVoucherCode = null;

  if (voucherCode) {
    const voucher = await Voucher.findOne({
      code: voucherCode,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).lean();

    if (voucher) {
      const userVoucher = await UserVoucher.findOne({
        userId: userId,
        voucherId: voucher._id,
        isUsed: false,
      }).lean();

      if (userVoucher) {
        if (subtotal >= voucher.minPurchaseAmount) {
          discount = voucher.discountValue; // Giả sử giảm giá cố định
          appliedVoucherCode = voucher.code;
        } else {
          throw new AppError(
            `Đơn hàng tối thiểu để áp dụng voucher này là ${voucher.minPurchaseAmount}`,
            400
          );
        }
      } else {
        throw new AppError(
          "Bạn không có quyền sử dụng voucher này hoặc đã sử dụng rồi",
          400
        );
      }
    } else {
      throw new AppError("Voucher không hợp lệ hoặc đã hết hạn", 400);
    }
  }

  let totalAfterVoucher = subtotal + shippingFee - discount;
  let pointsApplied = 0;

  if (pointsToApply > 0) {
    const user = await User.findById(userId).select("loyaltyPoints").lean();
    if (user && user.loyaltyPoints > 0) {
      // 1. Calculate max discount allowed (50% of value, rounded down to nearest 100)
      const maxAllowableDiscount =
        Math.floor((totalAfterVoucher * 0.5) / 100) * 100;

      // 2. Determine points to actually apply
      // It's the minimum of: what user wants to apply, what user has, and the max allowed by the rule
      pointsApplied = Math.min(
        pointsToApply,
        user.loyaltyPoints,
        maxAllowableDiscount
      );
    } else {
      logger.warn(
        `User ${userId} does not have enough loyalty points or tried to apply points with a zero balance.`
      );
    }
  }

  // Since 1 point = 1 VND, pointsApplied is the discount
  const totalAmount = totalAfterVoucher - pointsApplied;

  const preview = {
    orderLines: processedOrderLines,
    shippingAddress: shippingAddress,
    subtotal,
    shippingFee,
    discount,
    shippingMethod: shippingMethod,
    pointsApplied,
    totalAmount,
    voucherCode: appliedVoucherCode,
    paymentMethod: paymentMethod,
  };

  return {
    previewOrder: preview,
  };
};
import Order from "../models/Order.js";

// Internal function to verify the preview and return the trusted server-side version
const _verifyOrderPreview = async (userId, clientPreview) => {
  const { previewOrder: serverPreview } = await previewOrder(userId, {
    orderLines: clientPreview.orderLines,
    shippingAddress: clientPreview.shippingAddress,
    voucherCode: clientPreview.voucherCode,
    shippingMethod: clientPreview.shippingMethod,
    pointsToApply: clientPreview.pointsApplied,
    paymentMethod: clientPreview.paymentMethod, // Pass it through
  });

  const changes = [];

  // 1. Compare top-level numeric fields
  const fieldsToCompare = [
    "subtotal",
    "shippingFee",
    "discount",
    "pointsApplied",
    "totalAmount",
  ];
  for (const field of fieldsToCompare) {
    if (clientPreview[field] !== serverPreview[field]) {
      changes.push({
        field: field,
        oldValue: clientPreview[field],
        newValue: serverPreview[field],
        message: `Giá trị của '${field}' đã thay đổi.`,
      });
    }
  }

  // 2. Deep compare order lines for changes in price, name, etc.
  if (clientPreview.orderLines.length !== serverPreview.orderLines.length) {
    changes.push({
      field: "orderLines",
      message: "Số lượng mặt hàng trong giỏ đã thay đổi.",
    });
  } else {
    clientPreview.orderLines.forEach((clientLine, index) => {
      const serverLine = serverPreview.orderLines.find(
        (sl) => sl.productId.toString() === clientLine.productId.toString()
      );

      if (!serverLine) {
        changes.push({
          field: `orderLines[${index}]`,
          message: `Sản phẩm '${clientLine.productName}' không còn tồn tại trong đơn hàng.`,
        });
        return; // Continue to next clientLine
      }

      // Compare critical fields within each line item
      const lineFields = [
        "productName",
        "productPrice",
        "quantity",
        "lineTotal",
        "productCode",
        "productImage",
        "discount",
        "productActualPrice",
      ];
      for (const field of lineFields) {
        if (clientLine[field] !== serverLine[field]) {
          changes.push({
            field: `orderLines[${index}].${field}`,
            productName: clientLine.productName,
            oldValue: clientLine[field],
            newValue: serverLine[field],
            message: `Trường '${field}' của sản phẩm '${clientLine.productName}' đã thay đổi.`,
          });
        }
      }
    });
  }
  console.log(changes);
  // 3. If any changes were found, throw a detailed error
  if (changes.length > 0) {
    throw new AppError(
      "Một vài sản phẩm trong đơn hàng vừa được cập nhật. Vui lòng thực hiện lại.",
      409
    );
  }

  return serverPreview; // Return the trusted, server-generated preview if everything matches
};

// Internal function to handle all side-effects after an order is created
const _executePostOrderActions = async (order) => {
  // 1. Update stock
  for (const line of order.orderLines) {
    await Product.findByIdAndUpdate(line.productId, {
      $inc: { stock: -line.quantity },
    });
  }

  // 2. Mark voucher as used
  if (order.voucherCode) {
    const voucher = await Voucher.findOne({ code: order.voucherCode }).lean();
    if (voucher) {
      await UserVoucher.updateOne(
        { userId: order.userId, voucherId: voucher._id, isUsed: false },
        { $set: { isUsed: true, orderId: order._id } }
      );
      logger.info(
        `Voucher ${order.voucherCode} marked as used for user ${order.userId}`
      );
    }
  }

  // 3. Deduct loyalty points
  if (order.pointsApplied > 0) {
    await User.findByIdAndUpdate(order.userId, {
      $inc: { loyaltyPoints: -order.pointsApplied },
    });
    logger.info(
      `Deducted ${order.pointsApplied} points from user ${order.userId}`
    );
  }
};

// TODO: Cần bổ sung tặng điểm bằng 1% giá trị đơn hàng sau khi khách đã nhận hàng

export const placeOrder = async (userId, { previewOrder: clientPreview }) => {
  // Step 1: Verify the client's preview against a fresh server-side calculation.
  const serverPreview = await _verifyOrderPreview(userId, clientPreview);
  console.log("Server Preview:", serverPreview);
  // Step 2: Create the order using the *trusted* server-side preview data.
  const newOrder = await Order.create({
    ...serverPreview,
    userId: userId, // Explicitly add the userId from the authenticated session
    status: "pending",
    payment: {
      paymentMethod: serverPreview.paymentMethod, // Use the verified payment method
      amount: serverPreview.totalAmount,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    timeline: [
      {
        status: "pending",
        description: "Đơn hàng mới được tạo.",
        performedBy: { userId: userId, userType: "user" },
      },
    ],
  });

  // Step 3: Execute all post-creation side effects (stock, vouchers, points).
  await _executePostOrderActions(newOrder);

  logger.info(`New order created: ${newOrder._id} for user: ${userId}`);

  // Emit notification to admin room
  if (global.io) {
    global.io.to("admin").emit("newOrder", {
      orderId: newOrder._id,
      userId: newOrder.userId,
      totalAmount: newOrder.totalAmount,
      orderLines: newOrder.orderLines.length,
      createdAt: newOrder.createdAt,
      status: newOrder.status,
    });
    logger.info(
      `New order notification sent to admin room for order ${newOrder._id}`
    );
  }

  return newOrder;
};
