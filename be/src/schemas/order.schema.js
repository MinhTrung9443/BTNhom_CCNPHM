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