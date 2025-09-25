import Joi from 'joi';

const objectId = Joi.string().pattern(new RegExp('^[0-9a-fA-F]{24}$')).required();

const createReview = {
  body: Joi.object().keys({
    productId: objectId.messages({
      'string.pattern.base': 'Product ID không hợp lệ.',
      'any.required': 'Product ID là bắt buộc.',
    }),
    orderId: objectId.messages({
      'string.pattern.base': 'Order ID không hợp lệ.',
      'any.required': 'Order ID là bắt buộc.',
    }),
    rating: Joi.number().min(1).max(5).required().messages({
      'number.base': 'Đánh giá phải là một số.',
      'number.min': 'Đánh giá phải ít nhất là 1 sao.',
      'number.max': 'Đánh giá không được vượt quá 5 sao.',
      'any.required': 'Đánh giá là bắt buộc.',
    }),
    comment: Joi.string().min(10).max(1000).required().messages({
      'string.base': 'Bình luận phải là một chuỗi ký tự.',
      'string.empty': 'Bình luận không được để trống.',
      'string.min': 'Bình luận phải có ít nhất 10 ký tự.',
      'string.max': 'Bình luận không được vượt quá 1000 ký tự.',
      'any.required': 'Bình luận là bắt buộc.',
    }),
  }),
};

const updateReview = {
  params: Joi.object().keys({
    reviewId: objectId.messages({
      'string.pattern.base': 'Review ID không hợp lệ.',
      'any.required': 'Review ID là bắt buộc.',
    }),
  }),
  body: Joi.object().keys({
    rating: Joi.number().min(1).max(5).required().messages({
        'number.base': 'Đánh giá phải là một số.',
        'number.min': 'Đánh giá phải ít nhất là 1 sao.',
        'number.max': 'Đánh giá không được vượt quá 5 sao.',
        'any.required': 'Đánh giá là bắt buộc.',
      }),
    comment: Joi.string().min(10).max(1000).required().messages({
        'string.base': 'Bình luận phải là một chuỗi ký tự.',
        'string.empty': 'Bình luận không được để trống.',
        'string.min': 'Bình luận phải có ít nhất 10 ký tự.',
        'string.max': 'Bình luận không được vượt quá 1000 ký tự.',
        'any.required': 'Bình luận là bắt buộc.',
    }),
  }),
};

export const reviewSchema = {
  createReview,
  updateReview,
};