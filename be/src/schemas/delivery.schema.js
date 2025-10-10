import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const getDeliveriesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().allow(""),
  }),
};

export const createDeliverySchema = {
  body: Joi.object({
    type: Joi.string().valid("express", "standard").required(),
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().required(),
    estimatedDays: Joi.number().integer().min(1).required(),
  }),
};

export const updateDeliverySchema = {
  params: Joi.object({
    id: objectId.required(),
  }),
  body: Joi.object({
    type: Joi.string(),
    name: Joi.string(),
    price: Joi.number().min(0),
    description: Joi.string(),
    estimatedDays: Joi.number().integer().min(1),
  }).min(1),
};

export const deleteDeliverySchema = {
  params: Joi.object({
    id: objectId.required(),
  }),
};
