import { articleInteractionService } from '../services/articleInteraction.service.js';

export const articleInteractionController = {
  /**
   * Toggle like status for an article
   */
  toggleLike: async (req, res, next) => {
    try {
      const { id: articleId } = req.params;
      const userId = req.user._id;
      const result = await articleInteractionService.toggleLike(articleId, userId);
      res.status(200).json({
        success: true,
        message: result.liked ? 'Thích bài viết thành công' : 'Bỏ thích bài viết thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Track an article share
   */
  trackShare: async (req, res, next) => {
    try {
      const { id: articleId } = req.params;
      const userId = req.user?._id;
      const { platform } = req.body;
      const result = await articleInteractionService.trackShare(articleId, userId, platform);
      res.status(200).json({
        success: true,
        message: 'Ghi nhận lượt chia sẻ thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};