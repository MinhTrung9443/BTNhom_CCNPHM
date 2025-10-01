import express from 'express';
import { categoryController } from '../controllers/category.controller.js';

const router = express.Router();

// Public routes
router.get('/simple', categoryController.getAllCategoriesSimple); // Route đơn giản cho dropdown
router.get('/', categoryController.getAllCategories); // Route đầy đủ với productCount

export default router;