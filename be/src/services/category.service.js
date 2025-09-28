import { Category } from '../models/index.js';

export const categoryService = {
  async getAllCategories() {
    return Category.find().sort({ name: 1 });
  },
};