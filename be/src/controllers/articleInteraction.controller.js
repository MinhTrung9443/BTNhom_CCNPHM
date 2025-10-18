import { articleInteractionService } from '../services/articleInteraction.service.js';

export const articleInteractionController = {
  /**
   * Like or unlike an article
   */
  toggleLike: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const result = await articleInteractionService.toggleLike(id, userId);

      res.status(200).json({
        success: true,
        message: result.liked ? 'Đã thích bài viết' : 'Đã bỏ thích bài viết',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};