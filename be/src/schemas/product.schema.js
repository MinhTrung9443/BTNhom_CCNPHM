import Joi from 'joi';

const searchProductsSchema = {
  query: Joi.object({
    keyword: Joi.string().trim().max(200).optional().messages({
      'string.base': 'Từ khóa tìm kiếm phải là một chuỗi ký tự.',
      'string.max': 'Từ khóa tìm kiếm không được vượt quá {#limit} ký tự.'
    }),
    categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
      'string.base': 'ID danh mục phải là một chuỗi ký tự.',
      'string.pattern.base': 'ID danh mục không hợp lệ.'
    }),
    minPrice: Joi.number().min(0).optional().messages({
      'number.base': 'Giá tối thiểu phải là một số.',
      'number.min': 'Giá tối thiểu không được nhỏ hơn 0.'
    }),
    maxPrice: Joi.number().min(0).optional().messages({
      'number.base': 'Giá tối đa phải là một số.',
      'number.min': 'Giá tối đa không được nhỏ hơn 0.'
    }),
    minRating: Joi.number().min(0).max(5).optional().messages({
      'number.base': 'Đánh giá tối thiểu phải là một số.',
      'number.min': 'Đánh giá tối thiểu không được nhỏ hơn 0.',
      'number.max': 'Đánh giá tối thiểu không được lớn hơn 5.'
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Số trang phải là một số.',
      'number.integer': 'Số trang phải là số nguyên.',
      'number.min': 'Số trang phải lớn hơn hoặc bằng 1.'
    }),
    limit: Joi.number().integer().min(1).max(100).default(12).messages({
      'number.base': 'Số lượng sản phẩm trên trang phải là một số.',
      'number.integer': 'Số lượng sản phẩm trên trang phải là số nguyên.',
      'number.min': 'Số lượng sản phẩm trên trang phải lớn hơn hoặc bằng 1.',
      'number.max': 'Số lượng sản phẩm trên trang không được vượt quá 100.'
    }),
    sortBy: Joi.string().valid(
      'name', 'price', 'createdAt', 'averageRating', 'soldCount', 'viewCount'
    ).default('createdAt').messages({
      'string.base': 'Trường sắp xếp phải là một chuỗi ký tự.',
      'any.only': 'Trường sắp xếp không hợp lệ. Chỉ cho phép: name, price, createdAt, averageRating, soldCount, viewCount.'
    }),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
      'string.base': 'Thứ tự sắp xếp phải là một chuỗi ký tự.',
      'any.only': 'Thứ tự sắp xếp không hợp lệ. Chỉ cho phép: asc, desc.'
    }),
    inStock: Joi.boolean().optional().messages({
      'boolean.base': 'Trạng thái còn hàng phải là true hoặc false.'
    })
  }).custom((value, helpers) => {
    // Kiểm tra minPrice <= maxPrice
    if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
      return helpers.message('Giá tối thiểu không được lớn hơn giá tối đa.');
    }
    return value;
  })
};

export { searchProductsSchema };