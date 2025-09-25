import Joi from 'joi';
const getUserOrders = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    status: Joi.string().valid(
      'new',
      'confirmed',
      'preparing',
      'shipping',
      'delivered',
      'cancelled',
      'cancellation_requested'
    ),
    search: Joi.string().allow(''),
  }),
};

export { getUserOrders };
const addressSchema = Joi.object({
  province: Joi.string().required(),
  district: Joi.string().required(),
  ward: Joi.string().required(),
  street: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  recipientName: Joi.string().required()
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
  lineTotal: Joi.number().required(),
});
export const previewOrder = {
  body: Joi.object({
    orderLines: Joi.array().items(orderLineSchema).min(1).required(),
    shippingAddress: addressSchema.optional(),
    voucherCode: Joi.string().allow('').optional(),
    shippingMethod: Joi.string().valid("express", "regular", "standard").optional(),
    payment: Joi.object({
      paymentMethod: Joi.string().valid("VNPAY", "COD", "BANK").required(),
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
    }).required(),
  }),
};