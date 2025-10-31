import Joi from "joi";

const objectId = Joi.string().hex().length(24);

const orderLineSchema = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const getApplicableVouchersSchema = {
  body: Joi.object({
    orderLines: Joi.array().items(orderLineSchema).min(1).required(),
  }),
};

export const adminGetVouchersSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    type: Joi.string().valid("public", "personal"),
    source: Joi.string().valid("admin", "review", "promotion"),
    userId: objectId,
    isActive: Joi.boolean().truthy("true").truthy("1").falsy("false").falsy("0"),
  }),
};

export const adminVoucherIdParamsSchema = {
  params: Joi.object({
    id: objectId.required(),
  }),
};

export const adminCreateVoucherSchema = {
  body: Joi.object({
    code: Joi.string().trim().max(20).required(),
    discountValue: Joi.number().min(0).required(),
    discountType: Joi.string().valid('percentage', 'fixed').required(),
    type: Joi.string().valid('public', 'personal').required(),
    globalUsageLimit: Joi.alternatives().try(
      Joi.number().integer().min(0),
      Joi.valid(null)
    ).optional(),
    userUsageLimit: Joi.alternatives().try(
      Joi.number().integer().min(1),
      Joi.valid(null)
    ).optional(),
    minPurchaseAmount: Joi.number().min(0).required(),
    maxDiscountAmount: Joi.number().min(0).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    source: Joi.string().valid('admin', 'review', 'promotion').default('admin'),
    isActive: Joi.boolean().default(true),
    applicableProducts: Joi.array().items(objectId).optional(),
    excludedProducts: Joi.array().items(objectId).optional(),
    applicableCategories: Joi.array().items(objectId).optional(),
    excludedCategories: Joi.array().items(objectId).optional(),
  }),
};

export const adminUpdateVoucherSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    discountValue: Joi.number().min(0),
    discountType: Joi.string().valid('percentage', 'fixed'),
    minPurchaseAmount: Joi.number().min(0),
    maxDiscountAmount: Joi.number().min(0),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    source: Joi.string().valid('admin', 'review', 'promotion'),
    isActive: Joi.boolean(),
    globalUsageLimit: Joi.alternatives().try(
      Joi.number().integer().min(0),
      Joi.valid(null)
    ),
    userUsageLimit: Joi.alternatives().try(
      Joi.number().integer().min(1),
      Joi.valid(null)
    ),
    applicableProducts: Joi.array().items(objectId).optional(),
    excludedProducts: Joi.array().items(objectId).optional(),
    applicableCategories: Joi.array().items(objectId).optional(),
    excludedCategories: Joi.array().items(objectId).optional(),
  }).min(1),
};
