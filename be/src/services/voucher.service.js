import { UserVoucher, Product } from "../models/index.js";
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";


const voucherService = {
  getMyVouchers: async (userId) => {
    const currentDate = new Date();
    const userVouchers = await UserVoucher.find({
      userId: new mongoose.Types.ObjectId(userId),
      isUsed: false,
    }).populate({ path: 'voucherId', select: '-applicableProducts -excludedProducts -applicableCategories -excludedCategories -__v' });
    console.log(userVouchers);

    // Filter out vouchers that are null (dangling reference) or invalid
    const availableVouchers = userVouchers
      .filter(uv => {
        const voucher = uv.voucherId;
        // Ensure voucher exists and is valid
        return (
          voucher &&
          voucher.isActive &&
          voucher.startDate <= currentDate &&
          voucher.endDate >= currentDate
        );
      })
      .map(uv => uv.voucherId); // Extract the populated voucher document

    return availableVouchers;
  },
  getApplicableVouchers: async (userId, orderLines) => {
    if (!orderLines || orderLines.length === 0) {
      throw new AppError('Vui lòng cung cấp sản phẩm trong giỏ hàng.', 400);
    }

    // 1. Calculate subtotal and get product IDs from the current cart
    let subtotal = 0;
    const productIdsInCart = orderLines.map(line => line.productId);
    const productsInCart = await Product.find({ '_id': { $in: productIdsInCart } }).lean();

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
    }).populate('voucherId');

    const currentDate = new Date();
    const results = [];

    // 3. Check each voucher for applicability
    for (const userVoucher of userVouchers) {
      const voucher = userVoucher.voucherId;
      const result = {
        ...voucher.toObject(),
        isApplicable: false,
        reason: '',
      };

      if (!voucher || !voucher.isActive) {
        result.reason = 'Mã giảm giá không hoạt động.';
        results.push(result);
        continue;
      }
      if (voucher.startDate > currentDate) {
        result.reason = `Mã có hiệu lực từ ngày ${voucher.startDate.toLocaleDateString('vi-VN')}.`;
        results.push(result);
        continue;
      }
      if (voucher.endDate < currentDate) {
        result.reason = 'Mã đã hết hạn sử dụng.';
        results.push(result);
        continue;
      }
      if (subtotal < voucher.minPurchaseAmount) {
        result.reason = `Yêu cầu đơn hàng tối thiểu ${voucher.minPurchaseAmount.toLocaleString('vi-VN')}đ.`;
        results.push(result);
        continue;
      }

      const appliesToAllProducts = !voucher.applicableProducts || voucher.applicableProducts.length === 0;
      if (!appliesToAllProducts) {
        const cartProductIdsSet = new Set(productIdsInCart);
        const voucherProductIds = voucher.applicableProducts.map(id => id.toString());
        const isProductApplicable = voucherProductIds.some(voucherProductId => cartProductIdsSet.has(voucherProductId));
        
        if (!isProductApplicable) {
          result.reason = 'Không áp dụng cho các sản phẩm trong giỏ hàng.';
          results.push(result);
          continue;
        }
      }

      // If all checks pass
      result.isApplicable = true;
      result.reason = 'Có thể áp dụng.';
      results.push(result);
    }

    return results;
  },
};

export default voucherService;
