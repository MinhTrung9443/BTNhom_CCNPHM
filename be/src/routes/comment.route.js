import express from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateCommentSchema, deleteCommentSchema } from '../schemas/comment.schema.js';

const router = express.Router();

// Middleware to protect all comment routes
router.use(protect);

// Update a comment
router.put(
  '/:commentId',
  validate(updateCommentSchema),
  commentController.updateComment
);

// Delete a comment
router.delete(
  '/:commentId',
  validate(deleteCommentSchema),
  commentController.deleteComment
);

// Like/Unlike a comment
router.post(
  '/:commentId/like',
  commentController.toggleCommentLike
);

// Submit comment for AI moderation
router.post(
  '/:commentId/submit-moderation',
  commentController.submitCommentModeration
);

export default router;