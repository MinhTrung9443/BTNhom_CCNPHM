import mongoose from "mongoose";
import { Product, UserVoucher, Voucher } from "../models/index.js";
import AppError from "../utils/AppError.js";

const buildPaginationMeta = (page, limit, totalItems) => {
  const safePage = Math.max(page, 1);
  const safeLimit = Math.max(limit, 1);
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit);

  return {
    currentPage: safePage,
    totalPages,
    totalItems,
    hasNext: totalItems > 0 && safePage < totalPages,
    hasPrev: safePage > 1 && totalItems > 0,
  };
};

const computeUsageStatsForVoucher = (voucher, stats) => {
  if (voucher.type === "public") {
    const totalUsed = voucher.currentUsage ?? 0;
    const totalAssigned = voucher.globalUsageLimit ?? null;
    const remainingUses = voucher.globalUsageLimit == null ? null : Math.max(voucher.globalUsageLimit - totalUsed, 0);

    return {
      totalUsed,
      totalAssigned,
      remainingUses,
    };
  }

  const totalAssigned = stats?.totalAssigned ?? 0;
  const totalUsed = stats?.totalUsed ?? 0;

  return {
    totalUsed,
    totalAssigned,
    remainingUses: Math.max(totalAssigned - totalUsed, 0),
  };
};

const voucherService = {
  getMyVouchers: async (userId) => {
    const currentDate = new Date();
    const userVouchers = await UserVoucher.find({
      userId: new mongoose.Types.ObjectId(userId),
      isUsed: false,
    }).populate({
      path: "voucherId",
      select: "-applicableProducts -excludedProducts -applicableCategories -excludedCategories -__v",
    });

    // Filter out vouchers that are null (dangling reference) or invalid
    const availableVouchers = userVouchers
      .filter((uv) => {
        const voucher = uv.voucherId;
        // Ensure voucher exists and is valid
        return voucher && voucher.isActive && voucher.startDate <= currentDate && voucher.endDate >= currentDate;
      })
      .map((uv) => uv.voucherId); // Extract the populated voucher document

    return availableVouchers;
  },

  getApplicableVouchers: async (userId, orderLines) => {
    if (!orderLines || orderLines.length === 0) {
      throw new AppError("Please provide cart items.", 400);
    }

    // 1. Calculate subtotal and get product IDs from the current cart
    let subtotal = 0;
    const productIdsInCart = orderLines.map((line) => line.productId);
    const productsInCart = await Product.find({ _id: { $in: productIdsInCart } }).lean();

    const productMap = productsInCart.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    for (const line of orderLines) {
      const product = productMap[line.productId];
      if (product) {
        const actualPrice = product.price * (1 - (product.discount || 0) / 100);
        subtotal += actualPrice * line.quantity;
      }
    }

    // 2. Get all unused vouchers for the user
    const userVouchers = await UserVoucher.find({
      userId: new mongoose.Types.ObjectId(userId),
      isUsed: false,
    }).populate("voucherId");

    const currentDate = new Date();
    const results = [];

    // 3. Check each voucher for applicability
    for (const userVoucher of userVouchers) {
      const voucher = userVoucher.voucherId;
      const result = {
        ...voucher.toObject(),
        isApplicable: false,
        reason: "",
      };

      if (!voucher || !voucher.isActive) {
        result.reason = "Voucher is not active.";
        results.push(result);
        continue;
      }
      if (voucher.startDate > currentDate) {
        result.reason = `Voucher becomes active on ${voucher.startDate.toLocaleDateString("vi-VN")}.`;
        results.push(result);
        continue;
      }
      if (voucher.endDate < currentDate) {
        result.reason = "Voucher has expired.";
        results.push(result);
        continue;
      }
      if (subtotal < voucher.minPurchaseAmount) {
        result.reason = `Requires minimum order value of ${voucher.minPurchaseAmount.toLocaleString("vi-VN")} VND.`;
        results.push(result);
        continue;
      }

      const appliesToAllProducts = !voucher.applicableProducts || voucher.applicableProducts.length === 0;
      if (!appliesToAllProducts) {
        const cartProductIdsSet = new Set(productIdsInCart);
        const voucherProductIds = voucher.applicableProducts.map((id) => id.toString());
        const isProductApplicable = voucherProductIds.some((voucherProductId) => cartProductIdsSet.has(voucherProductId));

        if (!isProductApplicable) {
          result.reason = "Voucher does not apply to items in the cart.";
          results.push(result);
          continue;
        }
      }

      // If all checks pass
      result.isApplicable = true;
      result.reason = "Applicable.";
      results.push(result);
    }

    return results;
  },

  getAdminVouchers: async ({ page = 1, limit = 10, type, source, userId, isActive }) => {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(limit) || 10, 1);

    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (source) {
      filter.source = source;
    }

    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    }

    if (userId) {
      filter.type = "personal";
      const personalVoucherIds = await UserVoucher.distinct("voucherId", {
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (personalVoucherIds.length === 0) {
        return {
          data: [],
          pagination: buildPaginationMeta(pageNumber, pageSize, 0),
        };
      }

      filter._id = { $in: personalVoucherIds };
    }

    const totalItems = await Voucher.countDocuments(filter);

    if (totalItems === 0) {
      return {
        data: [],
        pagination: buildPaginationMeta(pageNumber, pageSize, totalItems),
      };
    }

    const vouchers = await Voucher.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select("-__v")
      .lean();

    const voucherIds = vouchers.map((voucher) => voucher._id);

    const usageAggregates = voucherIds.length
      ? await UserVoucher.aggregate([
          { $match: { voucherId: { $in: voucherIds } } },
          {
            $group: {
              _id: "$voucherId",
              totalAssigned: { $sum: 1 },
              totalUsed: {
                $sum: {
                  $cond: [{ $eq: ["$isUsed", true] }, 1, 0],
                },
              },
            },
          },
        ])
      : [];

    const usageStatsMap = new Map();
    for (const stat of usageAggregates) {
      usageStatsMap.set(stat._id.toString(), {
        totalAssigned: stat.totalAssigned ?? 0,
        totalUsed: stat.totalUsed ?? 0,
      });
    }

    const data = vouchers.map((voucher) => {
      const stats = usageStatsMap.get(voucher._id.toString());
      return {
        ...voucher,
        usageStats: computeUsageStatsForVoucher(voucher, stats),
      };
    });

    return {
      data,
      pagination: buildPaginationMeta(pageNumber, pageSize, totalItems),
    };
  },

  createAdminVoucher: async (payload) => {
    const {
      code,
      discountValue,
      discountType,
      type,
      globalUsageLimit,
      userUsageLimit,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      source = "admin",
      isActive = true,
      applicableProducts,
      excludedProducts,
      applicableCategories,
      excludedCategories,
    } = payload;

    if (!code) {
      throw new AppError("Voucher code is required", 400);
    }

    if (!discountType || !["percentage", "fixed"].includes(discountType)) {
      throw new AppError("Invalid discount type", 400);
    }

    if (!type || !["public", "personal"].includes(type)) {
      throw new AppError("Invalid voucher type", 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      throw new AppError("Invalid voucher time range", 400);
    }

    const voucherData = {
      code: code.trim(),
      discountValue: Number(discountValue),
      discountType,
      type,
      minPurchaseAmount: Number(minPurchaseAmount),
      maxDiscountAmount: Number(maxDiscountAmount),
      startDate: start,
      endDate: end,
      source,
      isActive,
    };

    if (type === "public") {
      voucherData.globalUsageLimit =
        globalUsageLimit === "" || globalUsageLimit === null || globalUsageLimit === undefined ? null : Number(globalUsageLimit);
      voucherData.currentUsage = 0;
    } else {
      const usage = Number(userUsageLimit);
      if (!usage || usage < 1) {
        throw new AppError("userUsageLimit must be at least 1 for personal vouchers", 400);
      }
      voucherData.userUsageLimit = usage;
    }

    if (applicableProducts) voucherData.applicableProducts = applicableProducts;
    if (excludedProducts) voucherData.excludedProducts = excludedProducts;
    if (applicableCategories) voucherData.applicableCategories = applicableCategories;
    if (excludedCategories) voucherData.excludedCategories = excludedCategories;

    try {
      const created = await Voucher.create(voucherData);
      return created.toObject();
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError("Voucher code already exists", 400);
      }
      throw error;
    }
  },

  updateAdminVoucher: async (voucherId, payload) => {
    if (!mongoose.Types.ObjectId.isValid(voucherId)) {
      throw new AppError("Voucher not found", 404);
    }

    const voucher = await Voucher.findById(voucherId);

    if (!voucher) {
      throw new AppError("Voucher not found", 404);
    }

    const {
      discountValue,
      discountType,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      source,
      isActive,
      globalUsageLimit,
      userUsageLimit,
      applicableProducts,
      excludedProducts,
      applicableCategories,
      excludedCategories,
    } = payload;

    const update = {};

    if (discountValue !== undefined) update.discountValue = Number(discountValue);
    if (discountType !== undefined) {
      if (!["percentage", "fixed"].includes(discountType)) {
        throw new AppError("Invalid discount type", 400);
      }
      update.discountType = discountType;
    }
    if (minPurchaseAmount !== undefined) update.minPurchaseAmount = Number(minPurchaseAmount);
    if (maxDiscountAmount !== undefined) update.maxDiscountAmount = Number(maxDiscountAmount);

    if (startDate !== undefined || endDate !== undefined) {
      const newStart = startDate ? new Date(startDate) : voucher.startDate;
      const newEnd = endDate ? new Date(endDate) : voucher.endDate;
      if (Number.isNaN(newStart.getTime()) || Number.isNaN(newEnd.getTime()) || newStart > newEnd) {
        throw new AppError("Invalid voucher time range", 400);
      }
      update.startDate = newStart;
      update.endDate = newEnd;
    }

    if (source !== undefined) update.source = source;

    if (isActive !== undefined) {
      if (voucher.type === "personal" && isActive === false) {
        throw new AppError("Personal vouchers cannot be deactivated", 400);
      }
      update.isActive = Boolean(isActive);
    }

    if (voucher.type === "public" && globalUsageLimit !== undefined) {
      const limitValue = globalUsageLimit === "" || globalUsageLimit === null || globalUsageLimit === undefined ? null : Number(globalUsageLimit);
      if (limitValue !== null && limitValue < (voucher.currentUsage ?? 0)) {
        throw new AppError("globalUsageLimit cannot be less than current usage", 400);
      }
      update.globalUsageLimit = limitValue;
    }

    if (voucher.type === "personal" && userUsageLimit !== undefined) {
      const perUser = Number(userUsageLimit);
      if (!perUser || perUser < 1) {
        throw new AppError("userUsageLimit must be at least 1", 400);
      }
      update.userUsageLimit = perUser;
    }

    if (applicableProducts !== undefined) update.applicableProducts = applicableProducts;
    if (excludedProducts !== undefined) update.excludedProducts = excludedProducts;
    if (applicableCategories !== undefined) update.applicableCategories = applicableCategories;
    if (excludedCategories !== undefined) update.excludedCategories = excludedCategories;

    const updated = await Voucher.findByIdAndUpdate(voucherId, { $set: update }, { new: true, runValidators: true }).lean();

    return updated;
  },
  getAdminVoucherById: async (voucherId) => {
    if (!mongoose.Types.ObjectId.isValid(voucherId)) {
      throw new AppError("Voucher not found", 404);
    }

    const voucher = await Voucher.findById(voucherId).select("-__v").lean();

    if (!voucher) {
      throw new AppError("Voucher not found", 404);
    }

    const [totalAssigned, totalUsed] = await Promise.all([
      UserVoucher.countDocuments({ voucherId: voucher._id }),
      UserVoucher.countDocuments({ voucherId: voucher._id, isUsed: true }),
    ]);

    const usageStats =
      voucher.type === "public"
        ? {
            totalUsed: voucher.currentUsage ?? totalUsed,
            totalAssigned: voucher.globalUsageLimit ?? null,
            remainingUses: voucher.globalUsageLimit == null ? null : Math.max(voucher.globalUsageLimit - (voucher.currentUsage ?? totalUsed), 0),
          }
        : {
            totalUsed,
            totalAssigned,
            remainingUses: Math.max(totalAssigned - totalUsed, 0),
          };

    return { voucher, usageStats };
  },

  deactivateVoucher: async (voucherId) => {
    if (!mongoose.Types.ObjectId.isValid(voucherId)) {
      throw new AppError("Voucher not found", 404);
    }

    const voucher = await Voucher.findById(voucherId);

    if (!voucher) {
      throw new AppError("Voucher not found", 404);
    }

    if (voucher.type === "personal") {
      throw new AppError("Cannot delete voucher: Personal vouchers cannot be deleted or deactivated", 400);
    }

    const hasUsedVoucher = await UserVoucher.exists({
      voucherId: voucher._id,
      isUsed: true,
    });

    if (hasUsedVoucher || (voucher.currentUsage ?? 0) > 0) {
      throw new AppError("Cannot delete voucher: Voucher has been used by users", 400);
    }

    voucher.isActive = false;
    await voucher.save();

    const reclaimedUses =
      voucher.type === "public" ? (voucher.globalUsageLimit == null ? null : Math.max(voucher.globalUsageLimit - (voucher.currentUsage ?? 0), 0)) : 0;

    return {
      reclaimedUses,
    };
  },

  // Lấy danh sách voucher công khai (public vouchers) có thể claim
  getPublicVouchers: async (userId, page = 1, limit = 10) => {
    const currentDate = new Date();
    const skip = (page - 1) * limit;

    // Lấy danh sách voucher public đang hoạt động
    const vouchers = await Voucher.find({
      type: "public",
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      // Voucher chưa hết lượt sử dụng (nếu có giới hạn)
      $or: [
        { globalUsageLimit: null }, // Không giới hạn
        { $expr: { $lt: ["$currentUsage", "$globalUsageLimit"] } }, // Còn lượt
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Kiểm tra user đã claim voucher nào chưa
    const voucherIds = vouchers.map((v) => v._id);
    const userClaims = await UserVoucher.find({
      userId: new mongoose.Types.ObjectId(userId),
      voucherId: { $in: voucherIds },
    }).lean();

    const claimedVoucherIds = new Set(userClaims.map((uv) => uv.voucherId.toString()));

    // Thêm thông tin đã claim
    const vouchersWithClaimStatus = vouchers.map((voucher) => ({
      ...voucher,
      isClaimed: claimedVoucherIds.has(voucher._id.toString()),
      availableSlots: voucher.globalUsageLimit ? Math.max(voucher.globalUsageLimit - (voucher.currentUsage || 0), 0) : null,
    }));

    // Đếm tổng số voucher
    const totalVouchers = await Voucher.countDocuments({
      type: "public",
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      $or: [{ globalUsageLimit: null }, { $expr: { $lt: ["$currentUsage", "$globalUsageLimit"] } }],
    });

    return {
      vouchers: vouchersWithClaimStatus,
      pagination: buildPaginationMeta(page, limit, totalVouchers),
    };
  },

  // Lấy danh sách voucher sắp mở (upcoming vouchers)
  getUpcomingVouchers: async (page = 1, limit = 10) => {
    const currentDate = new Date();
    const skip = (page - 1) * limit;

    const vouchers = await Voucher.find({
      type: "public",
      isActive: true,
      startDate: { $gt: currentDate }, // Chưa bắt đầu
    })
      .sort({ startDate: 1 }) // Sắp xếp theo thời gian bắt đầu
      .skip(skip)
      .limit(limit)
      .lean();

    const totalVouchers = await Voucher.countDocuments({
      type: "public",
      isActive: true,
      startDate: { $gt: currentDate },
    });

    return {
      vouchers,
      pagination: buildPaginationMeta(page, limit, totalVouchers),
    };
  },

  // User claim một voucher public
  claimVoucher: async (userId, voucherId) => {
    const currentDate = new Date();

    // Kiểm tra voucher tồn tại và hợp lệ
    const voucher = await Voucher.findById(voucherId);

    if (!voucher) {
      throw new AppError("Voucher không tồn tại.", 404);
    }

    if (!voucher.isActive) {
      throw new AppError("Voucher không khả dụng.", 400);
    }

    if (voucher.type !== "public") {
      throw new AppError("Chỉ có thể claim voucher công khai.", 400);
    }

    if (voucher.startDate > currentDate) {
      throw new AppError("Voucher chưa bắt đầu.", 400);
    }

    if (voucher.endDate < currentDate) {
      throw new AppError("Voucher đã hết hạn.", 400);
    }

    // Kiểm tra đã claim chưa
    const existingClaim = await UserVoucher.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      voucherId: new mongoose.Types.ObjectId(voucherId),
    });

    if (existingClaim) {
      throw new AppError("Bạn đã lưu voucher này rồi.", 400);
    }

    // Kiểm tra limit global usage
    if (voucher.globalUsageLimit && voucher.currentUsage >= voucher.globalUsageLimit) {
      throw new AppError("Voucher đã hết lượt sử dụng.", 400);
    }

    // Tạo UserVoucher mới
    const userVoucher = new UserVoucher({
      userId: new mongoose.Types.ObjectId(userId),
      voucherId: new mongoose.Types.ObjectId(voucherId),
      isUsed: false,
    });

    await userVoucher.save();

    return {
      success: true,
      message: "Lưu voucher thành công!",
      voucher: voucher,
    };
  },

  // Lấy danh sách voucher của user với phân trang
  getUserVouchers: async (userId, page = 1, limit = 10) => {
    const currentDate = new Date();
    const skip = (page - 1) * limit;

    const userVouchers = await UserVoucher.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate({
        path: "voucherId",
        select: "-applicableProducts -excludedProducts -applicableCategories -excludedCategories -__v",
      })
      .populate({
        path: "orderId",
        select: "orderNumber",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Lọc và phân loại voucher
    const validVouchers = userVouchers
      .filter((uv) => uv.voucherId)
      .map((uv) => {
        const voucher = uv.voucherId;
        const isExpired = voucher.endDate < currentDate;
        const isNotStarted = voucher.startDate > currentDate;
        const isInactive = !voucher.isActive;

        return {
          ...uv,
          voucher,
          status: uv.isUsed ? "used" : isInactive ? "inactive" : isExpired ? "expired" : isNotStarted ? "upcoming" : "available",
        };
      });

    const totalUserVouchers = await UserVoucher.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return {
      vouchers: validVouchers,
      pagination: buildPaginationMeta(page, limit, totalUserVouchers),
    };
  },
};

export default voucherService;
