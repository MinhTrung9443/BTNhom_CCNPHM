import express from 'express';
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  getEligibleProducts,
} from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.js';
import { validatePurchase, checkDuplicate } from '../middlewares/review.js';

const router = express.Router();

router.post('/', protect, validatePurchase, checkDuplicate, createReview);
router.get('/product/:productId', getProductReviews);
router.get('/user/:userId', protect, getUserReviews);
router.put('/:reviewId', protect, updateReview);
router.get('/eligible-products/:userId', protect, getEligibleProducts);

export default router;