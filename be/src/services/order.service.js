// import User from "../models/User.js";
// import Product from "../models/Product.js";
// import Review from "../models/Review.js";
// import Voucher from "../models/Voucher.js";
// import UserVoucher from "../models/UserVoucher.js";
// import Delivery from "../models/Delivery.js";
// import Notification from "../models/Notification.js";
import { User, Product, Review, Voucher, UserVoucher, Delivery, Notification } from "../models/index.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import Order, { ORDER_STATUS, DETAILED_ORDER_STATUS, STATUS_MAP } from "../models/Order.js";
import LoyaltyPoints from "../models/LoyaltyPoints.js";
import { createMomoPaymentUrl } from "./momo.service.js";
import { addLoyaltyPoints } from "./loyaltyService.js";
import { cartService } from "./cart.service.js";
import orderNotificationService from "./orderNotification.service.js";
import mongoose from "mongoose";

const calculateShippingFee = async (shippingMethod) => {
  if (!shippingMethod) return 0;

  const deliveryMethod = await Delivery.findOne({
    type: shippingMethod,
    isActive: true,
  }).lean();
  if (!deliveryMethod) {
    logger.warn(`Phương thức vận chuyển '${shippingMethod}' không hợp lệ hoặc không hoạt động.`);
    return 0; // Hoặc throw lỗi tùy theo yêu cầu nghiệp vụ
  }
  return deliveryMethod.price;
};

// Helper function to validate if voucher is applicable to the order
const validateVoucherApplicability = (voucher, productsInCart) => {
  const productIdsInCart = productsInCart.map(p => p._id.toString());
  const categoryIdsInCart = [...new Set(productsInCart.map(p => p.categoryId.toString()))];

  // Check excluded products - nếu TẤT CẢ sản phẩm trong cart đều bị loại trừ
  if (voucher.excludedProducts && voucher.excludedProducts.length > 0) {
    const excludedProductIds = voucher.excludedProducts.map(id => id.toString());
    const hasNonExcludedProduct = productIdsInCart.some(pid => !excludedProductIds.includes(pid));
    
    if (!hasNonExcludedProduct) {
      throw new AppError("Voucher không áp dụng cho các sản phẩm trong đơn hàng", 400);
    }
  }

  // Check applicable products - chỉ áp dụng cho một số sản phẩm cụ thể
  const appliesToAllProducts = !voucher.applicableProducts || voucher.applicableProducts.length === 0;
  if (!appliesToAllProducts) {
    const voucherProductIds = voucher.applicableProducts.map(id => id.toString());
    const isProductApplicable = productIdsInCart.some(pid => voucherProductIds.includes(pid));

    if (!isProductApplicable) {
      throw new AppError("Voucher chỉ áp dụng cho một số sản phẩm cụ thể không có trong đơn hàng", 400);
    }
  }

  // Check excluded categories - nếu TẤT CẢ sản phẩm đều thuộc danh mục bị loại trừ
  if (voucher.excludedCategories && voucher.excludedCategories.length > 0) {
    const excludedCategoryIds = voucher.excludedCategories.map(id => id.toString());
    const hasNonExcludedCategory = categoryIdsInCart.some(catId => !excludedCategoryIds.includes(catId));
    
    if (!hasNonExcludedCategory) {
      throw new AppError("Voucher không áp dụng cho danh mục sản phẩm trong đơn hàng", 400);
    }
  }

  // Check applicable categories - chỉ áp dụng cho một số danh mục cụ thể
  const appliesToAllCategories = !voucher.applicableCategories || voucher.applicableCategories.length === 0;
  if (!appliesToAllCategories) {
    const voucherCategoryIds = voucher.applicableCategories.map(id => id.toString());
    const isCategoryApplicable = categoryIdsInCart.some(catId => voucherCategoryIds.includes(catId));

    if (!isCategoryApplicable) {
      throw new AppError("Voucher chỉ áp dụng cho một số danh mục cụ thể không có trong đơn hàng", 400);
    }
  }

  return true;
};
export const getUserOrders = async (userId, page = 1, limit = 10, status = null, search = null) => {
  const filter = { userId };
  if (status) {
    filter.status = { $in: status };
  }

  // check valid ObjectId if search is _id
  if (search && mongoose.isValidObjectId(search)) {
    filter._id = new mongoose.Types.ObjectId(search);
  } else if (search) {
    const searchRegex = new RegExp(search, "i");
    filter.$or = [{ "orderLines.productName": searchRegex }, { recipientName: searchRegex }, { phoneNumber: searchRegex }];
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  const total = await Order.countDocuments(filter);

  return {
    orders,
    pagination: {
      current: page,
      limit,
      total: Math.ceil(total / limit),
      totalOrders: total,
    },
  };
};

export const getAllOrders = async (page = 1, limit = 10, status = null, detailedStatus = null, search = null, sortBy = "createdAt", sortOrder = "desc") => {
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Build aggregation pipeline
  const pipeline = [];

  // Stage 1: Add field for latest detailed status
  pipeline.push({
    $addFields: {
      latestDetailedStatus: {
        $cond: {
          if: { $gt: [{ $size: "$timeline" }, 0] },
          then: { $arrayElemAt: ["$timeline.status", -1] },
          else: null
        }
      }
    }
  });

  // Stage 2: Match filters
  const matchStage = {};

  // Lọc theo trạng thái chung
  if (status) {
    matchStage.status = { $in: Array.isArray(status) ? status : [status] };
  }

  // Lọc theo trạng thái chi tiết MỚI NHẤT (không phải toàn bộ timeline)
  if (detailedStatus) {
    matchStage.latestDetailedStatus = { $in: Array.isArray(detailedStatus) ? detailedStatus : [detailedStatus] };
  }

  // Tìm kiếm
  if (search) {
    const searchRegex = new RegExp(search, "i");
    matchStage.$or = [
      { "shippingAddress.recipientName": searchRegex },
      { "shippingAddress.phoneNumber": searchRegex },
      { orderCode: searchRegex },
      { _id: mongoose.isValidObjectId(search) ? new mongoose.Types.ObjectId(search) : null },
      { "orderLines.productName": searchRegex },
    ].filter(item => item._id !== null);
  }

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // Stage 3: Lookup userId to populate user info
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "userInfo"
    }
  });

  pipeline.push({
    $addFields: {
      userId: {
        $cond: {
          if: { $gt: [{ $size: "$userInfo" }, 0] },
          then: {
            _id: { $arrayElemAt: ["$userInfo._id", 0] },
            name: { $arrayElemAt: ["$userInfo.name", 0] },
            email: { $arrayElemAt: ["$userInfo.email", 0] }
          },
          else: "$userId"
        }
      }
    }
  });

  pipeline.push({
    $project: {
      userInfo: 0,
      latestDetailedStatus: 0 // Remove the temporary field from final output
    }
  });

  // Create pipeline for counting
  const countPipeline = [...pipeline];
  countPipeline.push({ $count: "total" });

  // Add sort, skip, limit for data pipeline
  pipeline.push({ $sort: sort });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Execute both pipelines
  const [ordersResult, countResult] = await Promise.all([
    Order.aggregate(pipeline),
    Order.aggregate(countPipeline)
  ]);

  const orders = ordersResult;
  const total = countResult.length > 0 ? countResult[0].total : 0;

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

// Deprecated: Sử dụng getDefaultAddress từ user.service.js thay thế
// export const getLatestOrderAddress = async (userId) => {
//   const latestOrder = await Order.findOne({ userId })
//     .sort({ createdAt: -1 })
//     .select("shippingAddress")
//     .lean();
//   if (!latestOrder) {
//     throw new AppError("Không tìm thấy đơn hàng nào", 404);
//   }
//   return latestOrder.shippingAddress;
// };

export const getOrderDetail = async (orderId, userId = null) => {
  const filter = { _id: orderId };
  if (userId) {
    filter.userId = userId;
  }

  const order = await Order.findOne(filter)
    .populate("userId", "name email phone")
    .populate("deliveryId", "name price description") // Populate with specific fields
    .lean(); // Use lean for faster queries

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  // Lấy danh sách các đánh giá liên quan đến đơn hàng này
  const reviews = await Review.find({ orderId: order._id }).lean();
  const reviewsMap = new Map(reviews.map((review) => [review.productId.toString(), review]));

  // Gắn thông tin đánh giá vào từng order line
  order.orderLines = order.orderLines.map((line) => ({
    ...line,
    review: reviewsMap.get(line.productId.toString()) || null,
  }));

  return order;
};

export const previewOrder = async (userId, { orderLines, shippingAddress, voucherCode, shippingMethod, pointsToApply = 0, paymentMethod }) => {
  console.log("Preview Order Input:", { orderLines, shippingAddress, voucherCode, shippingMethod, pointsToApply, paymentMethod });
  if (!orderLines || orderLines.length === 0) {
    throw new AppError("Vui lòng chọn sản phẩm để xem trước", 400);
  }

  // Validate phương thức vận chuyển hỏa tốc chỉ áp dụng cho Sóc Trăng
  if (shippingMethod === "express" && shippingAddress) {
    const province = shippingAddress.province?.trim().toLowerCase();
    const socTrangVariants = ["sóc trăng", "soc trang", "tỉnh sóc trăng", "tinh soc trang"];

    if (!province || !socTrangVariants.some((variant) => province.includes(variant))) {
      throw new AppError("Phương thức giao hỏa tốc chỉ áp dụng cho địa chỉ tại tỉnh Sóc Trăng", 400);
    }
  }

  let subtotal = 0;
  const unavailableItems = [];
  const processedOrderLines = [];
  const productsInCart = []; // Keep track of products with categoryId for voucher validation

  for (const line of orderLines) {
    const product = await Product.findById(line.productId).lean();
    
    if (product) {
      productsInCart.push(product); // Store for later voucher validation
    }

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

    // Lấy thông tin category nếu có
    let categoryName = null;
    if (product.categoryId) {
      const category = await mongoose.model("Category").findById(product.categoryId).select("name").lean();
      categoryName = category?.name || null;
    }

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
      // Lưu snapshot đầy đủ sản phẩm tại thời điểm đặt hàng
      productSnapshot: {
        name: product.name,
        slug: product.slug,
        code: product.code,
        description: product.description || "",
        price: product.price,
        discount: discountPerProduct,
        images: product.images || [],
        stock: product.stock,
        categoryId: product.categoryId,
        categoryName: categoryName,
        averageRating: product.averageRating || 0,
        totalReviews: product.totalReviews || 0,
        soldCount: product.soldCount || 0,
        isActive: product.isActive,
        viewCount: product.viewCount || 0,
        capturedAt: new Date(),
      },
    });
  }

  if (unavailableItems.length > 0) {
    throw new AppError("Một số sản phẩm không có sẵn hoặc đã hết hàng", 409, {
      unavailableItems,
    });
  }

  // Phí ship chỉ được tính khi có phương thức vận chuyển
  const shippingFee = shippingMethod ? await calculateShippingFee(shippingMethod) : null;
  let discount = 0;
  let appliedVoucherCode = null;
  if (voucherCode) {
    const voucher = await Voucher.findOne({
      code: voucherCode,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).lean();
    console.log("Voucher Found:", voucher);
    if (voucher) {
      const userVoucher = await UserVoucher.findOne({
        userId: userId,
        voucherId: voucher._id,
      }).lean();

      if (userVoucher) {
        // Check xem còn lượt sử dụng không
        const userLimit = voucher.userUsageLimit || null;
        if (userLimit !== null && userVoucher.usageCount >= userLimit) {
          throw new AppError(`Bạn đã hết lượt sử dụng voucher này (tối đa ${userLimit} lần)`, 400);
        }
        
        // Validate voucher applicability (products and categories)
        validateVoucherApplicability(voucher, productsInCart);
        
        if (subtotal >= voucher.minPurchaseAmount) {
          // Tính giảm giá dựa trên loại voucher
          if (voucher.discountType === "percentage") {
            // Giảm theo phần trăm
            discount = Math.floor((subtotal * voucher.discountValue) / 100);
            // Áp dụng giới hạn giảm giá tối đa
            if (discount > voucher.maxDiscountAmount) {
              discount = voucher.maxDiscountAmount;
            }
          } else {
            // Giảm giá cố định
            discount = voucher.discountValue;
            console.log("Fixed Discount:", discount);
            // Đảm bảo không vượt quá maxDiscountAmount
            console.log("Max Discount Amount:", voucher.maxDiscountAmount);
            if (! voucher.discountType === "fixed")
            if (discount > voucher.maxDiscountAmount) {
              discount = voucher.maxDiscountAmount;
            }
          }
                      console.log("Fixed Discount2:", discount);

          // Đảm bảo discount không vượt quá subtotal
          if (discount > subtotal) {
            discount = subtotal;
          }
            console.log("Fixed Discount3:", discount);

          appliedVoucherCode = voucher.code;
        } else {
          throw new AppError(`Đơn hàng tối thiểu để áp dụng voucher này là ${voucher.minPurchaseAmount.toLocaleString("vi-VN")} VNĐ`, 400);
        }
      } else {
        throw new AppError("Bạn không có quyền sử dụng voucher này hoặc đã sử dụng rồi", 400);
      }
    } else {
      throw new AppError("Voucher không hợp lệ hoặc đã hết hạn", 400);
    }
  }
  console.log("Discount:", discount);
  
  // Tính giá trị đơn hàng sau khi trừ voucher (không bao gồm phí ship)
  const subtotalAfterVoucher = subtotal - discount;
  
  // Lấy thông tin user để tính điểm
  const user = await User.findById(userId).select("loyaltyPoints").lean();
  const userPoints = user?.loyaltyPoints || 0;
  
  // Tính số điểm tối đa có thể áp dụng (50% giá trị đơn hàng sau voucher, làm tròn xuống bội số 100)
  const maxAllowableDiscount = Math.floor((subtotalAfterVoucher * 0.5) / 100) * 100;
  const maxApplicablePoints = Math.min(userPoints, maxAllowableDiscount);
  
  // Tính số điểm thực tế được áp dụng (dựa trên pointsToApply từ client)
  let pointsApplied = 0;
  if (pointsToApply > 0) {
    if (userPoints > 0) {
      // Lấy giá trị nhỏ nhất trong: điểm user muốn dùng, điểm user có, và giảm giá tối đa cho phép
      pointsApplied = Math.min(pointsToApply, userPoints, maxAllowableDiscount);
    } else {
      logger.warn(`User ${userId} does not have enough loyalty points or tried to apply points with a zero balance.`);
    }
  }

  // Tính tổng tiền cuối cùng: subtotal - discount từ voucher + phí ship - điểm tích lũy
  // 1 điểm = 1 VNĐ
  const totalAmount = subtotal - discount + shippingFee - pointsApplied;
  console.log("Total Amount Calculation:", { subtotal, shippingFee, discount, pointsApplied, maxApplicablePoints, totalAmount });
  
  const preview = {
    orderLines: processedOrderLines,
    shippingAddress: shippingAddress,
    subtotal,
    shippingFee,
    discount,
    shippingMethod: shippingMethod,
    pointsApplied,
    maxApplicablePoints, // Thêm field mới: số điểm tối đa có thể áp dụng
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
  const fieldsToCompare = ["subtotal", "shippingFee", "discount", "pointsApplied", "totalAmount"];
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
      const serverLine = serverPreview.orderLines.find((sl) => sl.productId.toString() === clientLine.productId.toString());

      if (!serverLine) {
        changes.push({
          field: `orderLines[${index}]`,
          message: `Sản phẩm '${clientLine.productName}' không còn tồn tại trong đơn hàng.`,
        });
        return; // Continue to next clientLine
      }

      // Compare critical fields within each line item
      const lineFields = ["productName", "productPrice", "quantity", "lineTotal", "productCode", "productImage", "discount", "productActualPrice"];
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
    throw new AppError("Một vài sản phẩm trong đơn hàng vừa được cập nhật. Vui lòng thực hiện lại.", 409);
  }

  return serverPreview; // Return the trusted, server-generated preview if everything matches
};

const _executePostOrderActions = async (order) => {
  // 1. Update stock & soldCount
  for (const line of order.orderLines) {
    await Product.findByIdAndUpdate(line.productId, {
      $inc: { stock: -line.quantity, soldCount: line.quantity },
    });
  }

  // 2. Increment voucher usage count
  if (order.voucherCode) {
    const voucher = await Voucher.findOne({ code: order.voucherCode }).lean();
    if (voucher) {
      const userVoucher = await UserVoucher.findOne({ userId: order.userId, voucherId: voucher._id });
      if (userVoucher) {
        userVoucher.usageCount += 1;
        
        // Nếu đã hết lượt thì đánh dấu isUsed = true (để tương thích với code cũ)
        const userLimit = voucher.userUsageLimit || null;
        if (userLimit !== null && userVoucher.usageCount >= userLimit) {
          userVoucher.isUsed = true;
        }
        
        await userVoucher.save();
        logger.info(`Voucher ${order.voucherCode} usage count incremented for user ${order.userId} (${userVoucher.usageCount}/${userLimit || '∞'})`);
      }
    }
  }

  // 3. Deduct loyalty points and create transaction
  if (order.pointsApplied > 0) {
    await User.findByIdAndUpdate(order.userId, {
      $inc: { loyaltyPoints: -order.pointsApplied },
    });

    // Tạo giao dịch điểm tích lũy (redeemed)
    await LoyaltyPoints.create({
      userId: order.userId,
      points: -order.pointsApplied, // Số âm để thể hiện điểm bị trừ
      transactionType: "redeemed",
      description: `Sử dụng ${order.pointsApplied} điểm cho đơn hàng ${order.orderCode}`,
      orderId: order._id,
      pointsValue: order.pointsApplied, // Giá trị quy đổi (1 điểm = 1 VNĐ)
      expiryDate: null, // Giao dịch sử dụng điểm không có ngày hết hạn
    });

    logger.info(`Deducted ${order.pointsApplied} points from user ${order.userId} and created redeemed transaction`);
  }
};

const _revertOrderSideEffects = async (order) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Revert stock & soldCount
    for (const line of order.orderLines) {
      await Product.findByIdAndUpdate(line.productId, { $inc: { stock: line.quantity, soldCount: -line.quantity } }, { session });
    }
    logger.info(`Reverted stock and soldCount for order ${order._id}`);

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

    // 3. Revert loyalty points and create refund transaction
    if (order.pointsApplied > 0) {
      await User.findByIdAndUpdate(order.userId, { $inc: { loyaltyPoints: order.pointsApplied } }, { session });

      // Tạo giao dịch hoàn điểm (refund)
      await LoyaltyPoints.create(
        [
          {
            userId: order.userId,
            points: order.pointsApplied, // Số dương để thể hiện điểm được hoàn lại
            transactionType: "refund",
            description: `Hoàn ${order.pointsApplied} điểm từ đơn hàng bị hủy ${order.orderCode}`,
            orderId: order._id,
            pointsValue: order.pointsApplied,
            expiryDate: null, // Điểm hoàn lại không hết hạn (hoặc có thể set expiry date nếu cần)
          },
        ],
        { session }
      );

      logger.info(`Reverted ${order.pointsApplied} points for user ${order.userId} and created refund transaction`);
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
        description: "Đơn hàng mới được tạo.",
        performedBy: "user",
      },
    ],
  });

  // Step 3: Execute all post-creation side effects (stock, vouchers, points).
  await _executePostOrderActions(newOrder);

  // Step 4: Remove ordered items from cart
  const orderedProductIds = newOrder.orderLines.map((line) => line.productId);
  await cartService.removeOrderedItemsFromCart(userId, orderedProductIds);
  logger.info(`Removed ${orderedProductIds.length} items from cart for user ${userId}`);

  // Create persistent notification for admin
  const user = await User.findById(userId).select("name").lean();
  const notification = await Notification.create({
    title: "Đơn hàng mới",
    message: `Khách hàng ${user?.name || "N/A"} đã đặt đơn hàng ${newOrder.orderCode} với tổng giá trị ${newOrder.totalAmount.toLocaleString(
      "vi-VN"
    )} VNĐ`,
    type: "order",
    subType: "new_order",
    referenceId: newOrder._id,
    recipient: "admin",
    metadata: {
      orderAmount: newOrder.totalAmount,
      userName: user?.name || "N/A",
      orderLinesCount: newOrder.orderLines.length,
    },
  });
  logger.info(`Notification created for new order: ${notification._id}`);

  logger.info(`New order created: ${newOrder._id} for user: ${userId}`);

  // Emit real-time notification to admin room
  if (global.io) {
    global.io.to("admin").emit("newOrder", {
      orderId: newOrder._id,
      orderCode: newOrder.orderCode,
      userId: newOrder.userId,
      totalAmount: newOrder.totalAmount,
      orderLines: newOrder.orderLines.length,
      createdAt: newOrder.createdAt,
      status: newOrder.status,
    });
    logger.info(`New order notification sent to admin room for order ${newOrder._id}`);
  }

  return newOrder;
};

export const placeMomoOrder = async (userId, { previewOrder: clientPreview }) => {
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
        description: "Đơn hàng mới được tạo.",
        performedBy: "user",
      },
    ],
  });

  // Step 3: Execute all post-creation side effects (stock, vouchers, points).
  await _executePostOrderActions(newOrder);

  // Step 4: Remove ordered items from cart
  const orderedProductIds = newOrder.orderLines.map((line) => line.productId);
  await cartService.removeOrderedItemsFromCart(userId, orderedProductIds);
  logger.info(`Removed ${orderedProductIds.length} items from cart for user ${userId}`);

  const payUrl = await createMomoPaymentUrl(newOrder);

  // Create persistent notification for admin
  const user = await User.findById(userId).select("name").lean();
  const notification = await Notification.create({
    title: "Đơn hàng mới (MoMo)",
    message: `Khách hàng ${user?.name || "N/A"} đã đặt đơn hàng MoMo ${newOrder.orderCode} với tổng giá trị ${newOrder.totalAmount.toLocaleString(
      "vi-VN"
    )} VNĐ`,
    type: "order",
    subType: "new_order",
    referenceId: newOrder._id,
    recipient: "admin",
    metadata: {
      orderAmount: newOrder.totalAmount,
      userName: user?.name || "N/A",
      orderLinesCount: newOrder.orderLines.length,
      paymentMethod: "MOMO",
    },
  });
  logger.info(`Notification created for new MoMo order: ${notification._id}`);

  logger.info(`New MoMo order created: ${newOrder._id} for user: ${userId}`);

  // Emit real-time notification to admin room
  if (global.io) {
    global.io.to("admin").emit("newOrder", {
      orderId: newOrder._id,
      orderCode: newOrder.orderCode,
      userId: newOrder.userId,
      totalAmount: newOrder.totalAmount,
      orderLines: newOrder.orderLines.length,
      createdAt: newOrder.createdAt,
      status: newOrder.status,
      paymentMethod: "MOMO",
    });
    logger.info(`New MoMo order notification sent to admin room for order ${newOrder._id}`);
  }

  return {
    order: newOrder,
    payUrl: payUrl,
  };
};

// Retry MoMo payment for existing order
export const retryMomoPayment = async (userId, orderId) => {
  // Find the order
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.", 404);
  }

  // Check if order is eligible for retry payment
  if (order.payment.paymentMethod !== "MOMO") {
    throw new AppError("Chỉ có thể thanh toán lại đơn hàng MoMo.", 400);
  }

  if (!["pending", "failed"].includes(order.payment.status)) {
    throw new AppError("Đơn hàng này không thể thanh toán lại.", 400);
  }

  if (["cancelled", "completed", "return_refund"].includes(order.status)) {
    throw new AppError("Không thể thanh toán lại đơn hàng đã hoàn tất hoặc bị hủy.", 400);
  }

  // Update payment status to pending (in case it was failed)
  order.payment.status = "pending";
  order.payment.updatedAt = new Date();

  // Add timeline entry
  order.timeline.push({
    status: DETAILED_ORDER_STATUS.NEW,
    description: "Khách hàng yêu cầu thanh toán lại đơn hàng.",
    performedBy: "user",
  });

  await order.save();

  // Create new MoMo payment URL
  const payUrl = await createMomoPaymentUrl(order);

  logger.info(`Retry MoMo payment for order ${orderId} by user ${userId}`);

  return {
    order,
    payUrl,
  };
};

export const getOrderStats = async (userId = null) => {
  const filter = userId ? { userId } : {};
  console.log("Order Stats Filter:", userId);
  const stats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
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
  stats.forEach((stat) => {
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
  const order = await Order.findById(orderId).populate("userId", "name email").lean();
  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng", 404);
  }
  return order;
};

// TODO: nếu là phương thức khác COD thì không auto confirm, thanh toán thành công thì tự chuyển sang confirmed
export const autoConfirmOrders = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Auto confirm COD orders after 30 minutes
  const ordersToConfirm = await Order.find({
    status: ORDER_STATUS.PENDING,
    createdAt: { $lte: thirtyMinutesAgo },
    "payment.paymentMethod": "COD",
  });

  let confirmedCount = 0;
  for (const order of ordersToConfirm) {
    await markOrderComfirmed(order._id);
    confirmedCount++;
  }

  // Auto cancel unpaid MoMo orders after 30 minutes
  const ordersToCancel = await Order.find({
    status: ORDER_STATUS.PENDING,
    createdAt: { $lte: thirtyMinutesAgo },
    "payment.paymentMethod": "MOMO",
    "payment.status": "pending",
  });

  let cancelledCount = 0;
  for (const order of ordersToCancel) {
    await autoCancelUnpaidMomoOrder(order._id);
    cancelledCount++;
  }

  if (confirmedCount > 0) {
    logger.info(`Đã tự động xác nhận ${confirmedCount} đơn hàng COD`);
  }

  if (cancelledCount > 0) {
    logger.info(`Đã tự động hủy ${cancelledCount} đơn hàng MoMo chưa thanh toán`);
  }

  return { confirmedCount, cancelledCount };
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

  const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true, runValidators: true }).populate(
    "userId",
    "name email phone"
  );
  return updatedOrder;
};

// Auto cancel unpaid MoMo orders
export const autoCancelUnpaidMomoOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  // Double check conditions
  if (order.payment.paymentMethod !== "MOMO" || order.payment.status !== "pending") {
    logger.warn(`Order ${orderId} is not eligible for auto cancellation`);
    return order;
  }

  const updateFields = {
    status: ORDER_STATUS.CANCELLED,
    cancelledAt: new Date(),
    cancelledBy: "system",
    cancelledReason: "Đơn hàng bị hủy tự động do quá thời hạn thanh toán (30 phút)",
  };

  // Update payment status
  updateFields["payment.status"] = "failed";
  updateFields["payment.updatedAt"] = new Date();

  // Tạo timeline entry
  const timelineEntry = createTimelineEntry(DETAILED_ORDER_STATUS.PAYMENT_OVERDUE, "system", {
    reason: "Quá thời hạn thanh toán MoMo (30 phút)",
  });
  updateFields.$push = { timeline: timelineEntry };

  const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email phone");

  // Revert order side effects (stock, voucher, points)
  await _revertOrderSideEffects(updatedOrder);

  logger.info(`Auto cancelled unpaid MoMo order: ${orderId}`);
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
    [DETAILED_ORDER_STATUS.CONFIRMED]: "confirmedAt",
    [DETAILED_ORDER_STATUS.PREPARING]: "preparingAt",
    [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: "shippingAt",
    [DETAILED_ORDER_STATUS.DELIVERED]: "deliveredAt",
    [DETAILED_ORDER_STATUS.CANCELLED]: "cancelledAt",
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
    description: statusDescriptions[status] || "Cập nhật trạng thái đơn hàng",
    performedBy: performer,
    metadata: {
      ...metadata,
    },
  };

  // Thêm thông tin bổ sung cho từng trạng thái
  if (status === DETAILED_ORDER_STATUS.CANCELLED && metadata.cancelledReason) {
    entry.description += ` - Lý do: ${metadata.cancelledReason}`;
    entry.metadata.reason = metadata.cancelledReason;
  }

  if (status === DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS) {
    entry.description = "Đơn hàng đang được giao đến bạn";
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

// --- Valid Status Transitions Map ---
const VALID_TRANSITIONS = {
  [DETAILED_ORDER_STATUS.NEW]: [DETAILED_ORDER_STATUS.CONFIRMED, DETAILED_ORDER_STATUS.CANCELLED],
  [DETAILED_ORDER_STATUS.CONFIRMED]: [DETAILED_ORDER_STATUS.PREPARING, DETAILED_ORDER_STATUS.CANCELLED],
  [DETAILED_ORDER_STATUS.PREPARING]: [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS, DETAILED_ORDER_STATUS.CANCELLED],
  [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: [
    DETAILED_ORDER_STATUS.DELIVERED,
    DETAILED_ORDER_STATUS.DELIVERY_FAILED,
    DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED,
  ],
  [DETAILED_ORDER_STATUS.DELIVERED]: [
    DETAILED_ORDER_STATUS.COMPLETED,
    DETAILED_ORDER_STATUS.RETURN_REQUESTED,
  ],
  [DETAILED_ORDER_STATUS.DELIVERY_FAILED]: [
    DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS, // Thử giao lại
    DETAILED_ORDER_STATUS.CANCELLED, // Hủy đơn
    DETAILED_ORDER_STATUS.REFUNDED, // Hoàn tiền
  ],
  [DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED]: [
    DETAILED_ORDER_STATUS.CANCELLED, // Admin approve
  ],
  [DETAILED_ORDER_STATUS.RETURN_REQUESTED]: [
    DETAILED_ORDER_STATUS.REFUNDED, // Admin approve
  ],
  [DETAILED_ORDER_STATUS.COMPLETED]: [],
  [DETAILED_ORDER_STATUS.CANCELLED]: [],
  [DETAILED_ORDER_STATUS.REFUNDED]: [],
  [DETAILED_ORDER_STATUS.PAYMENT_OVERDUE]: [],
};

/**
 * Get valid status transitions for an order
 * @param {String} orderId - Order ID
 * @returns {Object} Valid transitions with metadata
 */
export const getValidTransitions = async (orderId) => {
  const order = await Order.findById(orderId).lean();
  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng", 404);
  }

  // Lấy detailed status mới nhất từ timeline
  const latestDetailedStatus = order.timeline[order.timeline.length - 1]?.status;
  
  // Lấy danh sách các status có thể chuyển
  const validNextStatuses = VALID_TRANSITIONS[latestDetailedStatus] || [];
  
  // Chỉ lấy các status mà admin có thể cập nhật thủ công
  const adminEditableStatuses = validNextStatuses.filter(status => 
    ADMIN_MANUAL_DETAILED_STATUSES.includes(status)
  );

  return {
    currentStatus: {
      general: order.status,
      detailed: latestDetailedStatus,
    },
    validTransitions: adminEditableStatuses.map(status => ({
      value: status,
      label: getStatusLabel(status),
      requiresMetadata: requiresMetadataForStatus(status),
    })),
    allStatuses: Object.values(DETAILED_ORDER_STATUS).map(status => ({
      value: status,
      label: getStatusLabel(status),
      enabled: adminEditableStatuses.includes(status),
      requiresMetadata: requiresMetadataForStatus(status),
    })),
  };
};

/**
 * Get display label for detailed status
 */
const getStatusLabel = (status) => {
  const labels = {
    [DETAILED_ORDER_STATUS.NEW]: "Mới",
    [DETAILED_ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
    [DETAILED_ORDER_STATUS.PREPARING]: "Đang chuẩn bị",
    [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: "Đang giao hàng",
    [DETAILED_ORDER_STATUS.DELIVERED]: "Đã giao hàng",
    [DETAILED_ORDER_STATUS.COMPLETED]: "Hoàn thành",
    [DETAILED_ORDER_STATUS.CANCELLED]: "Đã hủy",
    [DETAILED_ORDER_STATUS.DELIVERY_FAILED]: "Giao hàng thất bại",
    [DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED]: "Yêu cầu hủy",
    [DETAILED_ORDER_STATUS.RETURN_REQUESTED]: "Yêu cầu trả hàng",
    [DETAILED_ORDER_STATUS.REFUNDED]: "Đã hoàn tiền",
    [DETAILED_ORDER_STATUS.PAYMENT_OVERDUE]: "Quá hạn thanh toán",
  };
  return labels[status] || status;
};

/**
 * Check if status requires metadata
 */
const requiresMetadataForStatus = (status) => {
  // Tất cả metadata đều là OPTIONAL - không bắt buộc
  // Trả về array rỗng cho tất cả status
  return [];
};

export const updateOrderStatusByAdmin = async (orderId, newDetailedStatus, adminId, metadata = {}) => {
  if (!ADMIN_MANUAL_DETAILED_STATUSES.includes(newDetailedStatus)) {
    throw new AppError(`Admin không thể tự cập nhật trạng thái thành '${newDetailedStatus}'.`, 403);
  }

  const order = await Order.findById(orderId).populate("userId");
  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng.", 404);
  }

  const newGeneralStatus = reverseStatusMap[newDetailedStatus];
  if (!newGeneralStatus) {
    throw new AppError(`Không tìm thấy trạng thái tổng quan cho '${newDetailedStatus}'.`, 500);
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
    updateFields.cancelledReason = metadata.reason || "Bị hủy bởi quản trị viên";
  }

  const timelineEntry = createTimelineEntry(newDetailedStatus, "admin", metadata);

  updateFields.$push = { timeline: timelineEntry };

  const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, {
    new: true,
    runValidators: true,
  }).lean();

  // Send notifications to user based on status change
  const notificationMessages = {
    [DETAILED_ORDER_STATUS.PREPARING]: {
      title: "Đơn hàng đang được chuẩn bị",
      message: `Đơn hàng ${order.orderCode} của bạn đang được người bán chuẩn bị`,
    },
    [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: {
      title: "Đơn hàng đang được giao",
      message: metadata.trackingNumber 
        ? `Đơn hàng ${order.orderCode} đang trên đường giao. Mã vận đơn: ${metadata.trackingNumber}`
        : `Đơn hàng ${order.orderCode} của bạn đang trên đường giao`,
    },
    [DETAILED_ORDER_STATUS.DELIVERED]: {
      title: "Đơn hàng đã được giao",
      message: `Đơn hàng ${order.orderCode} đã được giao thành công. Vui lòng xác nhận đã nhận hàng.`,
    },
    [DETAILED_ORDER_STATUS.CANCELLED]: {
      title: "Đơn hàng đã bị hủy",
      message: metadata.reason 
        ? `Đơn hàng ${order.orderCode} đã bị hủy. Lý do: ${metadata.reason}`
        : `Đơn hàng ${order.orderCode} của bạn đã bị hủy`,
    },
    [DETAILED_ORDER_STATUS.DELIVERY_FAILED]: {
      title: "Giao hàng thất bại",
      message: `Không thể giao đơn hàng ${order.orderCode}. Vui lòng liên hệ để được hỗ trợ.`,
    },
    [DETAILED_ORDER_STATUS.REFUNDED]: {
      title: "Đã hoàn tiền",
      message: `Đơn hàng ${order.orderCode} đã được hoàn tiền. Số tiền ${order.totalAmount.toLocaleString('vi-VN')} VNĐ sẽ được hoàn lại cho bạn.`,
    },
  };

  if (notificationMessages[newDetailedStatus]) {
    const userId = order.userId._id || order.userId;
    
    // Use aggregated notification service
    await orderNotificationService.handleOrderStatusUpdate(
      orderId,
      adminId,
      newDetailedStatus,
      notificationMessages[newDetailedStatus].title,
      notificationMessages[newDetailedStatus].message
    );

    // Send real-time order status update event
    if (global.io) {
      const userSocketId = userId.toString();
      
      logger.info(`Emitting order status notification to user ${userSocketId} for order ${order.orderCode}`);
      
      // Emit orderStatusUpdate for order-specific updates
      global.io.to(userSocketId).emit("orderStatusUpdate", {
        orderId: updatedOrder._id,
        orderCode: order.orderCode,
        status: newDetailedStatus,
        message: notificationMessages[newDetailedStatus].message,
      });
      
      logger.info(`Successfully emitted order status update to user ${userSocketId}`);
    } else {
      logger.warn('Socket.IO not available, cannot send real-time notification');
    }
  }

  return updatedOrder;
};

export const cancelOrderByUser = async (userId, orderId, reason) => {
  const order = await Order.findOne({ _id: orderId, userId: userId });

  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.", 404);
  }

  const user = await User.findById(userId).select("name").lean();
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

    // Notify admin about cancellation
    await Notification.create({
      title: "Đơn hàng đã bị hủy",
      message: `Khách hàng ${user?.name || "N/A"} đã hủy đơn hàng ${order.orderCode}. Lý do: ${order.cancelledReason}`,
      type: "order",
      subType: "cancellation",
      referenceId: order._id,
      recipient: "admin",
      metadata: {
        orderAmount: order.totalAmount,
        userName: user?.name || "N/A",
        cancelReason: order.cancelledReason,
      },
    });

    if (global.io) {
      global.io.to("admin").emit("orderCancelled", {
        orderId: order._id,
        userId: order.userId,
        reason: order.cancelledReason,
      });
    }

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

      // Notify admin about cancellation request
      await Notification.create({
        title: "Yêu cầu hủy đơn hàng",
        message: `Khách hàng ${user?.name || "N/A"} yêu cầu hủy đơn hàng ${order.orderCode}. Lý do: ${order.cancellationRequestReason}`,
        type: "order",
        subType: "cancellation",
        referenceId: order._id,
        recipient: "admin",
        metadata: {
          orderAmount: order.totalAmount,
          userName: user?.name || "N/A",
          cancelReason: order.cancellationRequestReason,
        },
      });

      if (global.io) {
        global.io.to("admin").emit("cancellationRequested", {
          orderId: order._id,
          userId: order.userId,
          reason: order.cancellationRequestReason,
        });
      }

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

      // Notify admin about cancellation
      await Notification.create({
        title: "Đơn hàng đã bị hủy",
        message: `Khách hàng ${user?.name || "N/A"} đã hủy đơn hàng ${order.orderCode}. Lý do: ${order.cancelledReason}`,
        type: "order",
        subType: "cancellation",
        referenceId: order._id,
        recipient: "admin",
        metadata: {
          orderAmount: order.totalAmount,
          userName: user?.name || "N/A",
          cancelReason: order.cancelledReason,
        },
      });

      if (global.io) {
        global.io.to("admin").emit("orderCancelled", {
          orderId: order._id,
          userId: order.userId,
          reason: order.cancelledReason,
        });
      }

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
    status: { $in: [ORDER_STATUS.SHIPPING, ORDER_STATUS.PROCESSING] },
  };

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate("userId", "name email").sort({ cancellationRequestedAt: -1 }).skip(skip).limit(limit).lean(),
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
  const order = await Order.findById(orderId).populate("userId", "name");

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
  order.cancelledReason = `Admin chấp nhận yêu cầu hủy từ người dùng. Lý do: ${order.cancellationRequestReason || "Không có lý do"}`;

  // Add timeline entry
  order.timeline.push(
    createTimelineEntry(DETAILED_ORDER_STATUS.CANCELLED, "admin", {
      reason: `Chấp nhận yêu cầu hủy từ người dùng.`,
      originalReason: order.cancellationRequestReason,
      approvedBy: adminId,
    })
  );

  await order.save();

  // Revert stock, vouchers, points
  await _revertOrderSideEffects(order);

  // Notify user that their cancellation request was approved
  await Notification.create({
    title: "Yêu cầu hủy đơn đã được chấp thuận",
    message: `Yêu cầu hủy đơn hàng ${order.orderCode} của bạn đã được chấp thuận. Đơn hàng đã được hủy thành công.`,
    type: "order",
    subType: "cancellation",
    referenceId: orderId,
    recipient: "user",
    userId: order.userId._id || order.userId,
    metadata: {
      orderAmount: order.totalAmount,
      cancelReason: order.cancelledReason,
    },
  });

  if (global.io) {
    const userSocketId = order.userId._id?.toString() || order.userId.toString();
    global.io.to(userSocketId).emit("cancellationApproved", {
      orderId: order._id,
      message: "Yêu cầu hủy đơn của bạn đã được chấp thuận",
    });
  }

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

  // Notify admin about the return request
  const user = await User.findById(userId).select("name").lean();
  await Notification.create({
    title: "Yêu cầu trả hàng/hoàn tiền",
    message: `Khách hàng ${user?.name || "N/A"} yêu cầu trả hàng cho đơn ${order.orderCode}. Lý do: ${reason}`,
    type: "order",
    subType: "return_request",
    referenceId: orderId,
    recipient: "admin",
    metadata: {
      orderAmount: order.totalAmount,
      userName: user?.name || "N/A",
      returnReason: reason,
    },
  });

  if (global.io) {
    global.io.to("admin").emit("returnRequested", {
      orderId: order._id,
      userId: order.userId,
      reason: reason,
      orderAmount: order.totalAmount,
    });
  }

  return order;
};

export const getPendingReturns = async (page = 1, limit = 10) => {
  const filter = {
    status: ORDER_STATUS.RETURN_REFUND,
    refundedAt: { $exists: false },
  };

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate("userId", "name email").sort({ returnRequestedAt: -1 }).skip(skip).limit(limit).lean(),
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
  const order = await Order.findById(orderId).populate("userId", "name");

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

  // Notify user that their return request was approved and refunded
  await Notification.create({
    title: "Yêu cầu trả hàng đã được chấp thuận",
    message: `Yêu cầu trả hàng cho đơn ${order.orderCode} đã được chấp thuận. Số tiền ${order.totalAmount.toLocaleString(
      "vi-VN"
    )} VNĐ sẽ được hoàn lại cho bạn.`,
    type: "order",
    subType: "return_request",
    referenceId: orderId,
    recipient: "user",
    userId: order.userId._id || order.userId,
    metadata: {
      orderAmount: order.totalAmount,
      refundedAt: order.refundedAt,
    },
  });

  if (global.io) {
    const userSocketId = order.userId._id?.toString() || order.userId.toString();
    global.io.to(userSocketId).emit("returnApproved", {
      orderId: order._id,
      refundAmount: order.totalAmount,
      message: "Yêu cầu trả hàng của bạn đã được chấp thuận",
    });
  }

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

  await order.save();

  // Cộng điểm tích lũy khi khách bấm "Đã nhận hàng"
  try {
    const orderAmount = order.subtotal; // Giá trị đơn hàng trước khuyến mãi
    const orderNumber = order.orderCode;

    const loyaltyResult = await addLoyaltyPoints(userId, orderAmount, orderId, orderNumber);

    if (loyaltyResult.earnedPoints > 0) {
      logger.info(`Added ${loyaltyResult.earnedPoints} loyalty points to user ${userId} for order ${orderId}`);

      // Gửi thông báo về xu nhận được
      await Notification.create({
        title: "Nhận điểm tích lũy",
        message: `Bạn đã nhận ${loyaltyResult.earnedPoints} điểm từ đơn hàng ${orderNumber}. Xu sẽ hết hạn vào ${new Date(
          loyaltyResult.expiresAt
        ).toLocaleDateString("vi-VN")}.`,
        type: "loyalty",
        referenceId: orderId,
        recipient: "user",
        userId: userId,
        metadata: {
          earnedPoints: loyaltyResult.earnedPoints,
          expiresAt: loyaltyResult.expiresAt,
        },
      });
    }
  } catch (error) {
    logger.error(`Failed to add loyalty points for order ${orderId}:`, error);
    // Không throw lỗi để không ảnh hưởng đến việc xác nhận nhận hàng
  }

  return order;
};

// Update MoMo payment status from frontend return
export const updateMomoPaymentFromReturn = async (orderId, userId, paymentData) => {
  const { resultCode, transactionId, amount, message } = paymentData;

  // ✅ Extract orderId gốc từ orderId có timestamp (format: originalOrderId_timestamp)
  const originalOrderId = orderId.split("_")[0];

  logger.info(`Updating MoMo payment from return for order ${orderId} (original: ${originalOrderId}): resultCode=${resultCode}`);

  const order = await Order.findOne({
    _id: originalOrderId,
    userId: userId,
  });

  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng.", 404);
  }

  // Chỉ cho phép cập nhật nếu đơn hàng vẫn đang pending payment
  if (order.payment.status !== "pending") {
    logger.info(`Order ${orderId} payment already processed with status: ${order.payment.status}`);
    return order; // Trả về order hiện tại nếu đã được xử lý
  }

  if (resultCode === 0) {
    // Thanh toán thành công
    order.payment.status = "completed";
    order.payment.transactionId = transactionId;
    order.payment.updatedAt = new Date();

    order.status = ORDER_STATUS.PROCESSING;
    order.confirmedAt = new Date();

    order.timeline.push({
      status: DETAILED_ORDER_STATUS.CONFIRMED,
      description: "Thanh toán MoMo thành công. Đơn hàng đã được xác nhận.",
      performedBy: "system",
      timestamp: new Date(),
      metadata: {
        transactionId: transactionId,
        paymentMethod: "MOMO",
      },
    });

    logger.info(`MoMo payment successful for order ${orderId}, transactionId: ${transactionId}`);
  } else {
    // Thanh toán thất bại
    order.payment.status = "failed";
    order.payment.updatedAt = new Date();

    order.timeline.push({
      status: DETAILED_ORDER_STATUS.PAYMENT_OVERDUE,
      description: `Thanh toán MoMo thất bại: ${message || "Unknown error"}`,
      performedBy: "system",
      timestamp: new Date(),
      metadata: {
        errorCode: resultCode,
        errorMessage: message,
        paymentMethod: "MOMO",
      },
    });

    logger.warn(`MoMo payment failed for order ${orderId}: ${message}`);
  }

  await order.save();

  return order;
};

// === UPDATE ORDER SHIPPING ADDRESS ===
export const updateOrderShippingAddress = async (userId, orderId, newAddress) => {
  const order = await Order.findOne({ _id: orderId, userId });
  
  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.", 404);
  }

  // Kiểm tra số lần đã thay đổi địa chỉ
  if (order.addressChangeCount >= 1) {
    throw new AppError("Bạn đã thay đổi địa chỉ giao hàng cho đơn hàng này. Không thể thay đổi thêm.", 400);
  }

  const latestDetailedStatus = order.timeline[order.timeline.length - 1]?.status;

  // Chỉ cho phép thay đổi địa chỉ khi:
  // 1. Đơn hàng đang ở trạng thái PENDING (chờ xác nhận)
  // 2. Đơn hàng đang ở trạng thái PROCESSING và detailed status là CONFIRMED (đã xác nhận nhưng chưa chuẩn bị)
  const canChangeAddress = 
    order.status === ORDER_STATUS.PENDING ||
    (order.status === ORDER_STATUS.PROCESSING && latestDetailedStatus === DETAILED_ORDER_STATUS.CONFIRMED);

  if (!canChangeAddress) {
    throw new AppError(
      "Không thể thay đổi địa chỉ giao hàng khi đơn hàng đã được chuẩn bị hoặc đang giao hàng.", 
      400
    );
  }

  // Validate địa chỉ mới
  const requiredFields = ['recipientName', 'phoneNumber', 'street', 'ward', 'district', 'province'];
  for (const field of requiredFields) {
    if (!newAddress[field]) {
      throw new AppError(`Thiếu thông tin bắt buộc: ${field}`, 400);
    }
  }

  // Cập nhật địa chỉ (tạo bản sao mới, không tham chiếu)
  order.shippingAddress = {
    recipientName: newAddress.recipientName,
    phoneNumber: newAddress.phoneNumber,
    street: newAddress.street,
    ward: newAddress.ward,
    district: newAddress.district,
    province: newAddress.province,
  };

  // Tăng số lần thay đổi địa chỉ
  order.addressChangeCount += 1;

  // Thêm timeline entry
  order.timeline.push({
    status: latestDetailedStatus, // Giữ nguyên status hiện tại
    description: `Người dùng đã cập nhật địa chỉ giao hàng`,
    performedBy: "user",
    timestamp: new Date(),
    metadata: {
      oldAddress: order.shippingAddress,
      newAddress: newAddress,
    },
  });

  await order.save();

  logger.info(`User ${userId} updated shipping address for order ${orderId}`);

  return order;
};
