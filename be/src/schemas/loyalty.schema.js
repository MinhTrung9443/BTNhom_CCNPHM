import Joi from "joi";

export const getLoyaltyHistorySchema = {
  query: Joi.object().keys({
    type: Joi.string().valid("earn", "redeem", "all").default("all").messages({
      "any.only": 'Loại giao dịch phải là "earn", "redeem" hoặc "all".',
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Số trang phải là một số.",
      "number.integer": "Số trang phải là số nguyên.",
      "number.min": "Số trang phải lớn hơn hoặc bằng 1.",
    }),
    limit: Joi.number().integer().min(1).max(50).default(10).messages({
      "number.base": "Số bản ghi mỗi trang phải là một số.",
      "number.integer": "Số bản ghi mỗi trang phải là số nguyên.",
      "number.min": "Số bản ghi mỗi trang phải lớn hơn hoặc bằng 1.",
      "number.max": "Số bản ghi mỗi trang không được vượt quá 50.",
    }),
  }),
};
