import Joi from 'joi';

const commonArticleBody = {
  title: Joi.string().trim().min(1).max(200).messages({
    'string.base': 'Tiêu đề phải là một chuỗi ký tự.',
    'string.empty': 'Tiêu đề không được để trống.',
    'string.min': 'Tiêu đề phải có ít nhất {#limit} ký tự.',
    'string.max': 'Tiêu đề không được vượt quá {#limit} ký tự.',
    'any.required': 'Tiêu đề là bắt buộc.'
  }),
  content: Joi.string().trim().min(1).messages({
    'string.base': 'Nội dung phải là một chuỗi ký tự.',
    'string.empty': 'Nội dung không được để trống.',
    'string.min': 'Nội dung phải có ít nhất {#limit} ký tự.',
    'any.required': 'Nội dung là bắt buộc.'
  }),
  excerpt: Joi.string().trim().max(500).optional().allow(''),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  publishedAt: Joi.date().optional(),
  scheduledAt: Joi.date().optional(),
};

// Schema for application/json
const createArticleJsonSchema = Joi.object({
  body: Joi.object({
    ...commonArticleBody,
    title: commonArticleBody.title.required(),
    content: commonArticleBody.content.required(),
    featuredImage: Joi.object({
      url: Joi.string().uri().required(),
      publicId: Joi.string().optional().allow(''),
      alt: Joi.string().optional().allow('')
    }).optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
  })
});

// Schema for multipart/form-data
const createArticleFormDataSchema = Joi.object({
  body: Joi.object({
    ...commonArticleBody,
    title: commonArticleBody.title.required(),
    content: commonArticleBody.content.required(),
    // For FormData, the image is handled by multer, not validated as an object here
    // 'featuredImage' can be the file itself.
    tags: Joi.string().optional(), // tags are sent as a JSON string
  }).unknown(true) // Allow other fields like the file upload
});

// Combined schema for validation middleware
const createArticleSchema = {
  json: createArticleJsonSchema,
  formData: createArticleFormDataSchema
};


// --- UPDATE SCHEMAS ---

// Schema for application/json
const updateArticleJsonSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }),
  body: Joi.object({
    ...commonArticleBody,
    featuredImage: Joi.object({
      url: Joi.string().uri().required(),
      publicId: Joi.string().optional().allow(''),
      alt: Joi.string().optional().allow('')
    }).optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
  }).or('title', 'content') // At least one field must be updated
});

// Schema for multipart/form-data
const updateArticleFormDataSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }),
  body: Joi.object({
    ...commonArticleBody,
    tags: Joi.string().optional(), // tags are-sent as a JSON string
  }).or('title', 'content').unknown(true) // Allow other fields and require at least one
});

// Combined schema for validation middleware
const updateArticleSchema = {
  json: updateArticleJsonSchema,
  formData: updateArticleFormDataSchema,
};


// --- OTHER SCHEMAS ---

const getArticleByIdSchema = {
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  })
};

// Schema for public articles (search is optional, status is filtered internally)
const getPublishedArticlesQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().max(200).optional(),
    tags: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.array().items(Joi.string().trim())
    ).optional(),
    sortBy: Joi.string().valid('createdAt', 'publishedAt', 'title', 'views', 'likes', 'comments', 'shares', 'popular').default('publishedAt')
  })
};

// Schema for admin articles management (status and search optional)
const getArticlesQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    search: Joi.string().trim().max(200).optional(),
    tags: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.array().items(Joi.string().trim())
    ).optional(),
    sortBy: Joi.string().valid('createdAt', 'publishedAt', 'title', 'views', 'likes', 'comments', 'shares').default('createdAt')
  })
};

export {
  createArticleSchema,
  updateArticleSchema,
  getArticleByIdSchema,
  getArticlesQuerySchema,
  getPublishedArticlesQuerySchema
};
