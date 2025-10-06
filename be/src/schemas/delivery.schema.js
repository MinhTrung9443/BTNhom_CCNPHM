import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const getDeliveriesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().allow(""),
    isActive: Joi.boolean().truthy("true").truthy("1").falsy("false").falsy("0"),
  }),
};

export const createDeliverySchema = {
  body: Joi.object({
    type: Joi.string().valid("express", "regular", "standard").required(),
    name: Joi.string().valid("Giao hỏa tốc", "Giao thường", "Giao chuẩn").required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().valid(
      "Giao hàng trong vòng 24 giờ.",
      "Giao hàng trong 3-5 ngày làm việc.",
      "Giao hàng trong 5-7 ngày làm việc."
    ).required(),
    estimatedDays: Joi.number().integer().min(1).required(),
    isActive: Joi.boolean().default(true),
  }),
};

export const updateDeliverySchema = {
  params: Joi.object({
    id: objectId.required(),
  }),
  body: Joi.object({
    type: Joi.string().valid("express", "regular", "standard"),
    name: Joi.string().valid("Giao hỏa tốc", "Giao thường", "Giao chuẩn"),
    price: Joi.number().min(0),
    description: Joi.string().valid(
      "Giao hàng trong vòng 24 giờ.",
      "Giao hàng trong 3-5 ngày làm việc.",
      "Giao hàng trong 5-7 ngày làm việc."
    ),
    estimatedDays: Joi.number().integer().min(1),
    isActive: Joi.boolean(),
  }).min(1),
};

export const deleteDeliverySchema = {
  params: Joi.object({
    id: objectId.required(),
  }),
};
