import Joi from 'joi';

// Create comment schema
const createCommentSchema = {
  body: Joi.object({
    article: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.base': 'ID bài viết phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bài viết không hợp lệ.',
      'any.required': 'ID bài viết là bắt buộc.'
    }),
    content: Joi.string().trim().min(1).max(1000).required().messages({
      'string.base': 'Nội dung bình luận phải là một chuỗi ký tự.',
      'string.empty': 'Nội dung bình luận không được để trống.',
      'string.min': 'Nội dung bình luận phải có ít nhất {#limit} ký tự.',
      'string.max': 'Nội dung bình luận không được vượt quá {#limit} ký tự.',
      'any.required': 'Nội dung bình luận là bắt buộc.'
    }),
    parentComment: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow(null).messages({
      'string.base': 'ID bình luận cha phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bình luận cha không hợp lệ.'
    })
  })
};

// Update comment schema
const updateCommentSchema = {
  params: Joi.object({
    commentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.base': 'ID bình luận phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bình luận không hợp lệ.',
      'any.required': 'ID bình luận là bắt buộc.'
    })
  }),
  body: Joi.object({
    content: Joi.string().trim().min(1).max(1000).required().messages({
      'string.base': 'Nội dung bình luận phải là một chuỗi ký tự.',
      'string.empty': 'Nội dung bình luận không được để trống.',
      'string.min': 'Nội dung bình luận phải có ít nhất {#limit} ký tự.',
      'string.max': 'Nội dung bình luận không được vượt quá {#limit} ký tự.',
      'any.required': 'Nội dung bình luận là bắt buộc.'
    })
  })
};

// Delete comment schema
const deleteCommentSchema = {
  params: Joi.object({
    commentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.base': 'ID bình luận phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bình luận không hợp lệ.',
      'any.required': 'ID bình luận là bắt buộc.'
    })
  })
};

// Get article comments schema
const getArticleCommentsSchema = {
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.base': 'ID bài viết phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bài viết không hợp lệ.',
      'any.required': 'ID bài viết là bắt buộc.'
    })
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Số trang phải là một số.',
      'number.integer': 'Số trang phải là số nguyên.',
      'number.min': 'Số trang phải lớn hơn hoặc bằng 1.'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'Số lượng bình luận trên trang phải là một số.',
      'number.integer': 'Số lượng bình luận trên trang phải là số nguyên.',
      'number.min': 'Số lượng bình luận trên trang phải lớn hơn hoặc bằng 1.',
      'number.max': 'Số lượng bình luận trên trang không được vượt quá 100.'
    }),
    status: Joi.string().valid('pending', 'approved', 'rejected').default('approved').messages({
      'string.base': 'Trạng thái phải là một chuỗi ký tự.',
      'any.only': 'Trạng thái không hợp lệ. Chỉ cho phép: pending, approved, rejected.'
    })
  })
};

// Moderate comment schema
const moderateCommentSchema = {
  params: Joi.object({
    commentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.base': 'ID bình luận phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bình luận không hợp lệ.',
      'any.required': 'ID bình luận là bắt buộc.'
    })
  }),
  body: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required().messages({
      'string.base': 'Trạng thái phải là một chuỗi ký tự.',
      'any.only': 'Trạng thái không hợp lệ. Chỉ cho phép: approved, rejected.',
      'any.required': 'Trạng thái là bắt buộc.'
    })
  })
};

// Get comments for moderation schema
const getCommentsForModerationSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Số trang phải là một số.',
      'number.integer': 'Số trang phải là số nguyên.',
      'number.min': 'Số trang phải lớn hơn hoặc bằng 1.'
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': 'Số lượng bình luận trên trang phải là một số.',
      'number.integer': 'Số lượng bình luận trên trang phải là số nguyên.',
      'number.min': 'Số lượng bình luận trên trang phải lớn hơn hoặc bằng 1.',
      'number.max': 'Số lượng bình luận trên trang không được vượt quá 100.'
    }),
    status: Joi.string().valid('pending', 'approved', 'rejected').optional().messages({
      'string.base': 'Trạng thái phải là một chuỗi ký tự.',
      'any.only': 'Trạng thái không hợp lệ. Chỉ cho phép: pending, approved, rejected.'
    }),
    articleId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
      'string.base': 'ID bài viết phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID bài viết không hợp lệ.'
    })
  })
};

// Bulk moderate comments schema
const bulkModerateCommentsSchema = {
  body: Joi.object({
    commentIds: Joi.array().items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
    ).min(1).required().messages({
      'array.base': 'Danh sách ID bình luận phải là một mảng.',
      'array.min': 'Phải có ít nhất {#limit} ID bình luận.',
      'any.required': 'Danh sách ID bình luận là bắt buộc.',
      'string.pattern.base': 'ID bình luận không hợp lệ.'
    }),
    status: Joi.string().valid('approved', 'rejected').required().messages({
      'string.base': 'Trạng thái phải là một chuỗi ký tự.',
      'any.only': 'Trạng thái không hợp lệ. Chỉ cho phép: approved, rejected.',
      'any.required': 'Trạng thái là bắt buộc.'
    })
  })
};

export {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  getArticleCommentsSchema,
  moderateCommentSchema,
  getCommentsForModerationSchema,
  bulkModerateCommentsSchema
};
