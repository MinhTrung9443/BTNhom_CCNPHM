import { Category, Product } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const categoryService = {
  async getCategories(queryParams) {
    const { page = 1, limit = 10, search } = queryParams;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Category.countDocuments(filter),
    ]);

    return {
      categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCategories: total,
      },
    };
  },

  async getAllCategories() {
    return Category.find({ isActive: true }).sort({ name: 1 });
  },

  async createCategory(categoryData) {
    const category = new Category(categoryData);
    await category.save();
    return category;
  },

  async updateCategory(categoryId, updateData) {
    const category = await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      throw new AppError('Không tìm thấy danh mục', 404);
    }
    return category;
  },

  async deleteCategory(categoryId) {
    const productCount = await Product.countDocuments({ categoryId });

    if (productCount > 0) {
      const category = await Category.findByIdAndUpdate(categoryId, { isActive: false }, { new: true });
      if (!category) {
        throw new AppError('Không tìm thấy danh mục', 404);
      }
      return { message: 'Danh mục đã được vô hiệu hóa vì có sản phẩm thuộc về.', category, softDeleted: true };
    } else {
      const category = await Category.findByIdAndDelete(categoryId);
      if (!category) {
        throw new AppError('Không tìm thấy danh mục', 404);
      }
      return { message: 'Danh mục đã được xóa vĩnh viễn.', categoryId, softDeleted: false };
    }
  },
};