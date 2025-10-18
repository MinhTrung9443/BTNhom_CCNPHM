import express from 'express';
import { articleInteractionController } from '../controllers/articleInteraction.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { likeArticleSchema } from '../schemas/interaction.schema.js';

const router = express.Router();

// Like/Unlike an article
router.post(
  '/:id/like',
  protect,
  validate(likeArticleSchema),
  articleInteractionController.toggleLike
);

export default router;