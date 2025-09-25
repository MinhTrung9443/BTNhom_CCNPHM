import Joi from 'joi';

const orderLineSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const getApplicableVouchersSchema = {
  body: Joi.object({
    orderLines: Joi.array().items(orderLineSchema).min(1).required(),
  }),
};