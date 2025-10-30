import Joi from "joi";
const getUserOrders = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    status: Joi.string().valid("pending", "processing", "shipping", "completed", "cancelled", "return_refund"),
    search: Joi.string().allow(""),
  }),
};

const getOrderById = {
  params: Joi.object().keys({
    orderId: Joi.string().hex().length(24).required(),
  }),
};
export { getUserOrders, getOrderById };
export const requestReturn = {
  params: Joi.object().keys({
    orderId: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object().keys({
    reason: Joi.string().required(),
  }),
};

export const approveReturn = {
  params: Joi.object().keys({
    orderId: Joi.string().hex().length(24).required(),
  }),
};
const addressSchema = Joi.object({
  province: Joi.string().required(),
  district: Joi.string().required(),
  ward: Joi.string().required(),
  street: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  recipientName: Joi.string().required(),
});

const orderLineSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(), // LÚC NÀY K CẦN NAME VÀ PRICE,
});
const orderLinePreviewSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  productCode: Joi.string().required(),
  productName: Joi.string().required(),
  productImage: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  productPrice: Joi.number().required(),
  discount: Joi.number().required(),
  productActualPrice: Joi.number().required(),
  lineTotal: Joi.number().required(),
  productSnapshot:  Joi.object().optional(), //có thể ko cần truyền
});
export const previewOrder = {
  body: Joi.object({
    orderLines: Joi.array().items(orderLineSchema).min(1).required(),
    shippingAddress: addressSchema.optional(),
    voucherCode: Joi.string().allow("").optional(),
    shippingMethod: Joi.string().valid("express", "regular", "standard").optional(),
    payment: Joi.object({
      paymentMethod: Joi.string().valid("MOMO", "COD", "BANK").required(),
    }).optional(),
    pointsToApply: Joi.number().integer().min(0).optional(),
  }),
};

export const placeOrder = {
  body: Joi.object({
    previewOrder: Joi.object({
      orderLines: Joi.array().items(orderLinePreviewSchema).min(1).required(),
      shippingAddress: addressSchema.required(),
      subtotal: Joi.number().required(),
      shippingMethod: Joi.string().valid("express", "regular", "standard").required(),
      shippingFee: Joi.number().required(),
      discount: Joi.number().required(),
      pointsApplied: Joi.number().required(),
      totalAmount: Joi.number().required(),
      voucherCode: Joi.string().allow(null),
      paymentMethod: Joi.string().valid("MOMO", "COD", "BANK").required(),
      
    }).required(),
  }),
};

export const updateOrderStatus = {
  params: Joi.object().keys({
    orderId: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid("preparing", "shipping_in_progress", "delivered", "cancelled", "delivery_failed", "refunded", "return_requested")
      .required(),
    // Tất cả metadata đều optional
    reason: Joi.string().optional().allow(''),
    trackingNumber: Joi.string().optional().allow(''),
    carrier: Joi.string().optional().allow(''),
    estimatedDelivery: Joi.date().optional(),
  }),
};

export const confirmReceived = {
  params: Joi.object({
    orderId: Joi.string().hex().length(24).required().messages({
      "string.base": "ID đơn hàng phải là một chuỗi.",
      "string.hex": "ID đơn hàng phải là một chuỗi hex.",
      "string.length": "ID đơn hàng phải có độ dài 24 ký tự.",
      "any.required": "ID đơn hàng là bắt buộc.",
    }),
  }),
};

export const cancelOrder = {
  body: Joi.object({
    reason: Joi.string().trim().max(500).optional().messages({
      "string.base": "Lý do hủy phải là một chuỗi.",
      "string.max": "Lý do hủy không được vượt quá 500 ký tự.",
    }),
  }),
  params: Joi.object({
    orderId: Joi.string().hex().length(24).required().messages({
      "string.base": "ID đơn hàng phải là một chuỗi.",
      "string.hex": "ID đơn hàng phải là một chuỗi hex.",
      "string.length": "ID đơn hàng phải có độ dài 24 ký tự.",
      "any.required": "ID đơn hàng là bắt buộc.",
    }),
  }),
};
