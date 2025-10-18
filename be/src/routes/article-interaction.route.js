import express from 'express';
import { articleInteractionController } from '../controllers/articleInteraction.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { likeArticleSchema, shareArticleSchema } from '../schemas/interaction.schema.js';

const router = express.Router();

// Like/Unlike an article
router.post(
  '/:id/like',
  protect,
  validate(likeArticleSchema),
  articleInteractionController.toggleLike
);

// Track an article share
router.post(
  '/:id/share',
  optionalAuth,
  validate(shareArticleSchema),
  articleInteractionController.trackShare
);

export default router;