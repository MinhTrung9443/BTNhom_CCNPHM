import { categoryService } from '../services/category.service.js';

export const categoryController = {
  async getCategories(req, res, next) {
    try {
      const data = await categoryService.getCategories(req.query);
      res.status(200).json({ success: true, message: 'Lấy danh sách danh mục thành công', data });
    } catch (error) {
      next(error);
    }
  },
  
  async getAllCategories(req, res, next) {
    const data = await categoryService.getAllCategories();
    res.status(200).json({ 
      success: true, 
      message: 'Lấy danh sách danh mục thành công', 
      data 
    });
  },

  async getAllCategoriesSimple(req, res, next) {
    const data = await categoryService.getAllCategoriesSimple();
    res.status(200).json({ 
      success: true, 
      message: 'Lấy danh sách danh mục đơn giản thành công', 
      data 
    });
  },

  async createCategory(req, res, next) {
    try {
      const data = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data });
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const data = await categoryService.updateCategory(id, req.body);
      res.status(200).json({ success: true, message: 'Cập nhật danh mục thành công', data });
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const result = await categoryService.deleteCategory(id);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};