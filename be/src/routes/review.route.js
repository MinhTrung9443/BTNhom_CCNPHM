import express from 'express';
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
} from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { reviewSchema } from '../schemas/review.schema.js';

const router = express.Router();

router.post('/', protect, validate(reviewSchema.createReview), createReview);
router.get('/product/:productId', getProductReviews);
router.get('/me', protect, getUserReviews);
router.put('/:reviewId', protect, validate(reviewSchema.updateReview), updateReview);

export default router;