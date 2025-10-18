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
  if (status) {
    filter.status = { $in: status };
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

const _revertOrderSideEffects = async (order) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Revert stock
    for (const line of order.orderLines) {
      await Product.findByIdAndUpdate(
        line.productId,
        { $inc: { stock: line.quantity } },
        { session }
      );
    }
    logger.info(`Reverted stock for order ${order._id}`);

    // 2. Revert voucher
    if (order.voucherCode) {
      const voucher = await Voucher.findOne({ code: order.voucherCode }).lean();
      if (voucher) {
        await UserVoucher.updateOne(
          { userId: order.userId, voucherId: voucher._id, isUsed: true, orderId: order._id },
          { $set: { isUsed: false, orderId: null } },
          { session }
        );
        logger.info(`Reverted voucher ${order.voucherCode} for user ${order.userId}`);
      }
    }

    // 3. Revert loyalty points
    if (order.pointsApplied > 0) {
      await User.findByIdAndUpdate(
        order.userId,
        { $inc: { loyaltyPoints: order.pointsApplied } },
        { session }
      );
      logger.info(`Reverted ${order.pointsApplied} points for user ${order.userId}`);
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Failed to revert side effects for order ${order._id}:`, error);
    // Even if reverting fails, we don't throw to the user, as the order is already cancelled.
    // This should be monitored by developers.
  } finally {
    session.endSession();
  }
};


// TODO: Cần bổ sung tặng điểm bằng 1% giá trị đơn hàng sau khi khách đã nhận hàng

export const placeOrder = async (userId, { previewOrder: clientPreview }) => {
  // if #1: Kiểm tra userId
  if (!userId){
    throw new AppError("Thiếu thông tin người dùng.", 400);
  }

  // if #2: Kiểm tra dữ liệu preview từ client
  if (!clientPreview){
    throw new AppError("Thiếu dữ liệu preview từ client.", 400);
  }

  // Xác minh preview từ server
  const serverPreview = await _verifyOrderPreview(userId, clientPreview);

  // if #3: Kiểm tra serverPreview hợp lệ
  if (!serverPreview){
    throw new AppError("Không thể xác minh dữ liệu đơn hàng.", 400);
  }

  // Tạo đơn hàng
  const newOrder = await Order.create({
    ...serverPreview,
    userId: userId,
    payment: {
      paymentMethod: serverPreview.paymentMethod,
      amount: serverPreview.totalAmount,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    timeline: [
      {
        status: DETAILED_ORDER_STATUS.NEW,
        description: "Đơn hàng mới được tạo.",
        performedBy: "user",
      },
    ],
  }); [8]

  // if #4: Kiểm tra tạo đơn hàng
  if (!newOrder){
    throw new AppError("Không thể tạo đơn hàng.", 500);
  }

  // if #5: Nếu có đơn hàng, chạy các tác vụ sau tạo
  if (newOrder) {
    await _executePostOrderActions(newOrder);
  }

  // Tạo thông báo cho admin
  const user = await User.findById(userId).select("name").lean();
  const notification = await Notification.create({
    title: "Đơn hàng mới",
    message: `Khách hàng ${user?.name || "N/A"} đã đặt đơn hàng #${
      newOrder._id
    } với tổng giá trị ${newOrder.totalAmount.toLocaleString("vi-VN")} VNĐ`,
    type: "order",
    referenceId: newOrder._id,
    recipient: "admin",
    metadata: {
      orderAmount: newOrder.totalAmount,
      userName: user?.name || "N/A",
      orderLinesCount: newOrder.orderLines.length,
    },
  });

  // if #6: Kiểm tra tạo thông báo
  if (!notification){
    logger.warn(`Không thể tạo thông báo cho đơn hàng ${newOrder._id}`); [15]
  }

  // if #7: Kiểm tra Socket.IO trước khi gửi thông báo realtime
  if (global.io){
    global.io.to("admin").emit("newOrder", {
      orderId: newOrder._id,
      userId: newOrder.userId,
      totalAmount: newOrder.totalAmount,
      orderLines: newOrder.orderLines.length,
      createdAt: newOrder.createdAt,
      status: newOrder.status,
    });
    logger.info(`Realtime notification sent for order ${newOrder._id}`); 
  } else {
    logger.warn("Socket.IO chưa khởi tạo, không thể gửi thông báo realtime."); 
  }

  // if #8: Trả về kết quả
  if (newOrder) {
    return newOrder;
  } else {
    throw new AppError("Đơn hàng không tồn tại sau khi tạo.", 500);
  }
};



export const getOrderStats = async (userId = null) => {
  const filter = userId ? { userId } : {};
  console.log("Order Stats Filter:", userId);
  const stats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
  console.log("Raw Order Stats:", stats);
  const result = {};
  // Initialize all business statuses with 0 count
  for (const status of Object.values(ORDER_STATUS)) {
    result[status] = { count: 0 };
  }

  // Vì database đã lưu business status (pending, processing, shipping, v.v.)
  // nên chỉ cần map trực tiếp từ aggregate results
  stats.forEach(stat => {
    const businessStatus = stat._id;
    // Chỉ cập nhật nếu businessStatus tồn tại trong ORDER_STATUS
    if (result[businessStatus] !== undefined) {
      result[businessStatus].count = stat.count;
    }
  });
  console.log("Order Stats Result:", result);
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
    [DETAILED_ORDER_STATUS.RETURN_REQUESTED]: "Yêu cầu trả hàng/hoàn tiền đã được ghi nhận. Vui lòng chờ admin xử lý.",
    [DETAILED_ORDER_STATUS.REFUNDED]: "Admin đã chấp nhận yêu cầu trả hàng/hoàn tiền. Đơn hàng đã được hoàn tiền.",
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

export const cancelOrderByUser = async (userId, orderId, reason) => {
  const order = await Order.findOne({ _id: orderId, userId: userId });

  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.", 404);
  }

  const latestDetailedStatus = order.timeline[order.timeline.length - 1]?.status;

  // Case 1: Order is PENDING (detailed status is NEW) -> Direct cancel
  if (order.status === ORDER_STATUS.PENDING) {
    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelledBy = "user";
    order.cancelledReason = reason || "Người dùng tự hủy đơn hàng.";
    order.timeline.push(createTimelineEntry(DETAILED_ORDER_STATUS.CANCELLED, "user", { reason: order.cancelledReason }));
    
    await order.save();
    await _revertOrderSideEffects(order);
    return order;
  }

  // Case 2: Order is PROCESSING (detailed status can be CONFIRMED or PREPARING)
  if (order.status === ORDER_STATUS.PROCESSING) {
    // If seller is already preparing, user must request cancellation
    if (latestDetailedStatus === DETAILED_ORDER_STATUS.PREPARING) {
      order.cancellationRequestedAt = new Date();
      order.cancellationRequestReason = reason || "Người dùng yêu cầu hủy khi người bán đang chuẩn bị hàng.";
      order.timeline.push(createTimelineEntry(DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED, "user", { reason: order.cancellationRequestReason }));
      await order.save();
      // TODO: Notify admin about the cancellation request
      return order;
    }
    // If order is just confirmed, user can cancel directly
    else {
      order.status = ORDER_STATUS.CANCELLED;
      order.cancelledAt = new Date();
      order.cancelledBy = "user";
      order.cancelledReason = reason || "Người dùng tự hủy đơn hàng.";
      order.timeline.push(createTimelineEntry(DETAILED_ORDER_STATUS.CANCELLED, "user", { reason: order.cancelledReason }));

      await order.save();
      await _revertOrderSideEffects(order);
      return order;
    }
  }

  // Case 4: Any other status (COMPLETED, CANCELLED, etc.)
  throw new AppError(`Đơn hàng không thể hủy ở trạng thái hiện tại, vui lòng thực hiện yêu cầu hoàn tiền hoặc trả hàng khi nhận hàng.`, 400);
};

export const getOrdersWithCancellationRequests = async (page = 1, limit = 10) => {
  const filter = {
    "timeline.status": DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED,
    // Optional: Ensure we only get orders that are not yet fully cancelled or completed
    "status": { $in: [ORDER_STATUS.SHIPPING, ORDER_STATUS.PROCESSING] }
  };

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("userId", "name email")
      .sort({ cancellationRequestedAt: -1 })
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

export const approveCancellationRequest = async (orderId, adminId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng.", 404);
  }

  const latestDetailedStatus = order.timeline[order.timeline.length - 1]?.status;
  if (latestDetailedStatus !== DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED) {
    throw new AppError("Đơn hàng này không có yêu cầu hủy nào đang chờ xử lý.", 400);
  }

  // Update order status
  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  order.cancelledBy = "admin";
  order.cancelledReason = `Admin chấp nhận yêu cầu hủy từ người dùng. Lý do: ${order.cancellationRequestReason || 'Không có lý do'}`;
  
  // Add timeline entry
  order.timeline.push(createTimelineEntry(DETAILED_ORDER_STATUS.CANCELLED, "admin", {
    reason: `Chấp nhận yêu cầu hủy từ người dùng.`,
    originalReason: order.cancellationRequestReason,
    approvedBy: adminId
  }));

  await order.save();

  // Revert stock, vouchers, points
  await _revertOrderSideEffects(order);

  // TODO: Notify user that their cancellation request was approved.

  return order;
};

export const requestReturn = async (userId, orderId, reason) => {
  const order = await Order.findOne({ _id: orderId, userId: userId });

  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.", 404);
  }

  const latestDetailedStatus = order.timeline[order.timeline.length - 1]?.status;

  if (order.status !== ORDER_STATUS.SHIPPING || latestDetailedStatus !== DETAILED_ORDER_STATUS.DELIVERED) {
    throw new AppError("Chỉ có thể yêu cầu trả hàng khi đơn hàng đã được giao thành công.", 400);
  }

  order.status = ORDER_STATUS.RETURN_REFUND;
  order.returnRequestedAt = new Date();
  order.returnRequestReason = reason;
  order.timeline.push(createTimelineEntry(DETAILED_ORDER_STATUS.RETURN_REQUESTED, "user", { reason }));

  await order.save();
  // TODO: Notify admin about the return request

  return order;
};

export const getPendingReturns = async (page = 1, limit = 10) => {
  const filter = {
    status: ORDER_STATUS.RETURN_REFUND,
    refundedAt: { $exists: false },
  };

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("userId", "name email")
      .sort({ returnRequestedAt: -1 })
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

export const approveReturn = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng.", 404);
  }

  const latestDetailedStatus = order.timeline[order.timeline.length - 1]?.status;
  if (order.status !== ORDER_STATUS.RETURN_REFUND || latestDetailedStatus !== DETAILED_ORDER_STATUS.RETURN_REQUESTED) {
    throw new AppError("Đơn hàng này không có yêu cầu trả hàng nào đang chờ xử lý.", 400);
  }

  order.refundedAt = new Date();
  order.timeline.push(createTimelineEntry(DETAILED_ORDER_STATUS.REFUNDED, "admin", {}));

  await order.save();
  await _revertOrderSideEffects(order);
  // TODO: Notify user that their return request was approved and refunded.

  return order;
};

export const confirmOrderReceived = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId: userId });

  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.", 404);
  }

  const latestDetailedStatus = order.timeline[order.timeline.length - 1]?.status;

  // Only allow confirmation if the order has been delivered
  if (order.status !== ORDER_STATUS.SHIPPING || latestDetailedStatus !== DETAILED_ORDER_STATUS.DELIVERED) {
    throw new AppError("Chỉ có thể xác nhận đã nhận hàng khi đơn hàng ở trạng thái 'Đã giao hàng'.", 400);
  }

  // Update order status to COMPLETED
  order.status = ORDER_STATUS.COMPLETED;
  order.timeline.push(createTimelineEntry(DETAILED_ORDER_STATUS.COMPLETED, "user", {}));

  // Award loyalty points (1% of totalAmount)
  const pointsToAward = Math.floor(order.totalAmount * 0.01);
  if (pointsToAward > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: { loyaltyPoints: pointsToAward },
    });
    logger.info(`Awarded ${pointsToAward} loyalty points to user ${userId} for order ${orderId}`);
  }

  await order.save();

  return order;
};