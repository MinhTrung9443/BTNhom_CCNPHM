import Joi from 'joi';

// Like/Unlike article schema
const likeArticleSchema = {
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.base': 'ID bài viết phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bài viết không hợp lệ.',
      'any.required': 'ID bài viết là bắt buộc.'
    })
  })
};

// Like/Unlike comment schema
const likeCommentSchema = {
  params: Joi.object({
    commentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.base': 'ID bình luận phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bình luận không hợp lệ.',
      'any.required': 'ID bình luận là bắt buộc.'
    })
  })
};

// Track article share schema
const shareArticleSchema = {
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.base': 'ID bài viết phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bài viết không hợp lệ.',
      'any.required': 'ID bài viết là bắt buộc.'
    })
  }),
  body: Joi.object({
    platform: Joi.string().valid('facebook', 'zalo', 'twitter', 'copy').required().messages({
      'string.base': 'Nền tảng chia sẻ phải là một chuỗi ký tự.',
      'any.only': 'Nền tảng chia sẻ không hợp lệ. Chỉ cho phép: facebook, zalo, twitter, copy.',
      'any.required': 'Nền tảng chia sẻ là bắt buộc.'
    })
  })
};

// Get article by slug schema
const getArticleBySlugSchema = {
  params: Joi.object({
    slug: Joi.string().trim().required().messages({
      'string.base': 'Slug phải là một chuỗi ký tự.',
      'string.empty': 'Slug không được để trống.',
      'any.required': 'Slug là bắt buộc.'
    })
  })
};

export {
  likeArticleSchema,
  likeCommentSchema,
  shareArticleSchema,
  getArticleBySlugSchema
};
