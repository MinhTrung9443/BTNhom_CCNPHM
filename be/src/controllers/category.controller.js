import { categoryService } from '../services/category.service.js';

export const categoryController = {
  async getAllCategories(req, res, next) {
    try {
      const data = await categoryService.getAllCategories();
      res.status(200).json({ success: true, message: 'Lấy danh sách danh mục thành công', data });
    } catch (error) {
      next(error);
    }
  },
};