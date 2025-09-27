// import User from "../models/User.js";
// import Product from "../models/Product.js";
// import Review from "../models/Review.js";
// import Voucher from "../models/Voucher.js";
// import UserVoucher from "../models/UserVoucher.js";
// import Delivery from "../models/Delivery.js";
// import Notification from "../models/Notification.js";
import {User, Product, Review, Voucher, UserVoucher, Delivery, Notification} from "../models/index.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import Order, {
  ORDER_STATUS,
  DETAILED_ORDER_STATUS,
  STATUS_MAP,
} from "../models/Order.js";
import mongoose from "mongoose";

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
export const getUserOrders = async (userId, page = 1, limit = 10, status = null, search = null) => {
  const filter = { userId };
  if (status && STATUS_MAP[status]) {
    filter.status = { $in: STATUS_MAP[status] };
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { 'orderLines.productName': searchRegex },
      { recipientName: searchRegex },
      { phoneNumber: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  return {
    orders,
    pagination: {
      current: page,
      limit,
      total: Math.ceil(total / limit),
      totalOrders: total
    }
  };
};

export const getAllOrders = async (
  page = 1,
  limit = 10,
  status = null,
  search = null,
  sortBy = "createdAt",
  sortOrder = "desc"
) => {
  const filter = {};

  // Lọc theo trạng thái
  if (status) {
    filter.status = { $in: status };
  }

  // Tìm kiếm
  if (search) {
    const searchRegex = new RegExp(search, "i");
    filter.$or = [
      { "shippingAddress.recipientName": searchRegex },
      { "shippingAddress.phoneNumber": searchRegex },
      { _id: mongoose.isValidObjectId(search) ? search : null }, // Tìm theo ID đơn hàng
      { "orderLines.productName": searchRegex },
    ].filter(Boolean); // Loại bỏ các điều kiện null
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("userId", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    data: orders,
    meta: {
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
};

export const getOrderDetail = async (orderId, userId = null) => {
  const filter = { _id: orderId };
  if (userId) {
    filter.userId = userId;
  }

  const order = await Order.findOne(filter)
    .populate('userId', 'name email phone')
    .populate('deliveryId', 'name price description') // Populate with specific fields
    .lean(); // Use lean for faster queries

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  // Lấy danh sách các đánh giá liên quan đến đơn hàng này
  const reviews = await Review.find({ orderId: order._id }).lean();
  const reviewsMap = new Map(reviews.map(review => [review.productId.toString(), review]));

  // Gắn thông tin đánh giá vào từng order line
  order.orderLines = order.orderLines.map(line => ({
    ...line,
    review: reviewsMap.get(line.productId.toString()) || null,
  }));

  return order;
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
    payment: {
      paymentMethod: serverPreview.paymentMethod, // Use the verified payment method
      amount: serverPreview.totalAmount,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    timeline: [
      {
        status: DETAILED_ORDER_STATUS.NEW,
        description: 'Đơn hàng mới được tạo.',
        performedBy:  'user' ,
      },
    ],
  });

  // Step 3: Execute all post-creation side effects (stock, vouchers, points).
  await _executePostOrderActions(newOrder);

  // Create persistent notification for admin
  const user = await User.findById(userId).select('name').lean();
  const notification = await Notification.create({
    title: 'Đơn hàng mới',
    message: `Khách hàng ${user?.name || 'N/A'} đã đặt đơn hàng #${newOrder._id} với tổng giá trị ${newOrder.totalAmount.toLocaleString('vi-VN')} VNĐ`,
    type: 'order',
    referenceId: newOrder._id,
    recipient: 'admin',
    metadata: {
      orderAmount: newOrder.totalAmount,
      userName: user?.name || 'N/A',
      orderLinesCount: newOrder.orderLines.length,
    }
  });
  logger.info(`Notification created for new order: ${notification._id}`);

  logger.info(`New order created: ${newOrder._id} for user: ${userId}`);

  // Emit real-time notification to admin room
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


export const getOrderStats = async (userId = null) => {
  const filter = userId ? { userId } : {};

  const stats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {};
  // Initialize all business statuses with 0 count
  for (const status of Object.values(ORDER_STATUS)) {
    result[status] = { count: 0 };
  }

  // Create a reverse map from detailed status to business status
  const reverseStatusMap = {};
  for (const businessStatus in STATUS_MAP) {
    for (const detailedStatus of STATUS_MAP[businessStatus]) {
      reverseStatusMap[detailedStatus] = businessStatus;
    }
  }

  // Aggregate counts from detailed statuses to business statuses
  stats.forEach(stat => {
    const businessStatus = reverseStatusMap[stat._id];
    if (businessStatus) {
      result[businessStatus].count += stat.count;
    }
  });

  return result;

};
export const getOrderByIdForAdmin = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("userId", "name email")
    .lean();
  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng", 404);
  }
  return order;
};


// TODO: nếu là phương thức khác COD thì không auto confirm, thanh toán thành công thì tự chuyển sang confirmed
export const autoConfirmOrders = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const ordersToConfirm = await Order.find({
    status: ORDER_STATUS.PENDING,
    createdAt: { $lte: thirtyMinutesAgo }
  });

  let confirmedCount = 0;
  for (const order of ordersToConfirm) {
    await markOrderComfirmed(order._id);
    confirmedCount++;
  }

  if (confirmedCount > 0) {
    logger.info(`Đã tự động xác nhận ${confirmedCount} đơn hàng`);
  }

  return confirmedCount;

};

// cron
export const markOrderComfirmed = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  const updateFields = {
    status: ORDER_STATUS.PROCESSING,
  };

  // Cập nhật timestamp tương ứng
  const timestampField = getTimestampField(DETAILED_ORDER_STATUS.CONFIRMED);
  if (timestampField) {
    updateFields[timestampField] = new Date();
  }

  // Tạo timeline entry
  const timelineEntry = createTimelineEntry(DETAILED_ORDER_STATUS.CONFIRMED, "system", {});
  updateFields.$push = { timeline: timelineEntry };

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    updateFields,
    { new: true, runValidators: true }
  ).populate('userId', 'name email phone');
  return updatedOrder;

};

export const isValidStatusTransition = (currentStatus, newStatus) => {

  const validTransitions = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.DELIVERY_FAILED],
    [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.RETURN_REFUND],
    [ORDER_STATUS.COMPLETED]: [],
    [ORDER_STATUS.CANCELLED]: [],
    [ORDER_STATUS.RETURN_REFUND]: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

export const getTimestampField = (status) => {
  const timestampMap = {
    [DETAILED_ORDER_STATUS.CONFIRMED]: 'confirmedAt',
    [DETAILED_ORDER_STATUS.PREPARING]: 'preparingAt',
    [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: 'shippingAt',
    [DETAILED_ORDER_STATUS.DELIVERED]: 'deliveredAt',
    [DETAILED_ORDER_STATUS.CANCELLED]: 'cancelledAt',
  };

  return timestampMap[status];
};


export const createTimelineEntry = (status, performer, metadata = {}) => {
  const statusDescriptions = {
    [DETAILED_ORDER_STATUS.NEW]: "Đơn hàng mới được tạo.",
    [DETAILED_ORDER_STATUS.CONFIRMED]: "Đơn hàng đã được xác nhận.",
    [DETAILED_ORDER_STATUS.PREPARING]: "Người bán đang chuẩn bị hàng.",
    [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: "Đơn hàng đang được giao.",
    [DETAILED_ORDER_STATUS.DELIVERED]: "Đơn hàng đã được giao thành công.",
    [DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED]: "Yêu cầu hủy đơn hàng đã được ghi nhận.",
    [DETAILED_ORDER_STATUS.COMPLETED]: "Đơn hàng đã hoàn thành.",
    [DETAILED_ORDER_STATUS.PAYMENT_OVERDUE]: "Đơn hàng đã bị hủy do quá hạn thanh toán.",
    [DETAILED_ORDER_STATUS.CANCELLED]: "Đơn hàng đã được hủy.",
    [DETAILED_ORDER_STATUS.DELIVERY_FAILED]: "Giao hàng không thành công.",
    [DETAILED_ORDER_STATUS.RETURN_REQUESTED]: "Yêu cầu trả hàng/hoàn tiền đã được ghi nhận.",
    [DETAILED_ORDER_STATUS.REFUNDED]: "Đơn hàng đã được hoàn tiền.",
  };

  const entry = {
    status,
    timestamp: new Date(),
    description: statusDescriptions[status] || 'Cập nhật trạng thái đơn hàng',
    performedBy: performer,
    metadata: {
      ...metadata
    }
  };




  // Thêm thông tin bổ sung cho từng trạng thái
  if (status === DETAILED_ORDER_STATUS.CANCELLED && metadata.cancelledReason) {
    entry.description += ` - Lý do: ${metadata.cancelledReason}`;
    entry.metadata.reason = metadata.cancelledReason;
  }

  if (status === DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS) {
    entry.description = 'Đơn hàng đang được giao đến bạn';
    if (metadata.trackingNumber) {
      entry.description += ` - Mã vận đơn: ${metadata.trackingNumber}`;
      entry.metadata.trackingNumber = metadata.trackingNumber;
    }
    if (metadata.carrier) {
      entry.description += ` - Đơn vị vận chuyển: ${metadata.carrier}`;
      entry.metadata.carrier = metadata.carrier;
    }
    if (metadata.estimatedDelivery) {
      entry.metadata.estimatedDelivery = metadata.estimatedDelivery;
    }
  }

  return entry;
};
// --- Reverse Status Map ---
const reverseStatusMap = {};
for (const generalStatus in STATUS_MAP) {
  for (const detailedStatus of STATUS_MAP[generalStatus]) {
    reverseStatusMap[detailedStatus] = generalStatus;
  }
}

// --- Admin-specific constants ---
const ADMIN_MANUAL_DETAILED_STATUSES = [
  DETAILED_ORDER_STATUS.PREPARING,
  DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS,
  DETAILED_ORDER_STATUS.DELIVERED,
  DETAILED_ORDER_STATUS.CANCELLED,
  DETAILED_ORDER_STATUS.DELIVERY_FAILED,
  DETAILED_ORDER_STATUS.REFUNDED,
];

export const updateOrderStatusByAdmin = async (
  orderId,
  newDetailedStatus,
  metadata = {}
) => {
  if (!ADMIN_MANUAL_DETAILED_STATUSES.includes(newDetailedStatus)) {
    throw new AppError(
      `Admin không thể tự cập nhật trạng thái thành '${newDetailedStatus}'.`,
      403
    );
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng.", 404);
  }

  const newGeneralStatus = reverseStatusMap[newDetailedStatus];
  if (!newGeneralStatus) {
    throw new AppError(
      `Không tìm thấy trạng thái tổng quan cho '${newDetailedStatus}'.`,
      500
    );
  }

  const updateFields = {
    status: newGeneralStatus,
  };

  const timestampField = getTimestampField(newDetailedStatus);
  if (timestampField) {
    updateFields[timestampField] = new Date();
  }

  if (newDetailedStatus === DETAILED_ORDER_STATUS.CANCELLED) {
    updateFields.cancelledAt = new Date();
    updateFields.cancelledBy = "admin";
    updateFields.cancelledReason =
      metadata.reason || "Bị hủy bởi quản trị viên";
  }

  const timelineEntry = createTimelineEntry(newDetailedStatus, "admin", metadata);

  updateFields.$push = { timeline: timelineEntry };

  const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, {
    new: true,
    runValidators: true,
  }).lean();

  return updatedOrder;
};