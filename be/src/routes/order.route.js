import express from 'express';
import * as OrderController from '../controllers/order.controller.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { getUserOrders } from '../schemas/order.schema.js';

const router = express.Router();

// All routes below are protected and require a valid token
router.use(protect);

// === USER ROUTES ===
router.get('/my', restrictTo('user'), validate(getUserOrders), OrderController.getUserOrders);
router.get('/my/stats', restrictTo('user'), OrderController.getUserOrderStats);
router.get('/:orderId', restrictTo('user'), OrderController.getOrderDetail);

export default router;