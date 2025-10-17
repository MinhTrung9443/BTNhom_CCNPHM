import { articleService } from '../services/article.service.js';
import { commentService } from '../services/comment.service.js';
import { articleInteractionService } from '../services/articleInteraction.service.js';

export const articleController = {
  // ==================== ADMIN OPERATIONS ====================

  /**
   * Create a new article (Admin only)
   */
  async createArticle(req, res, next) {
    const article = await articleService.createArticle(req.body);
    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: article
    });
  },

  /**
   * Get all articles with filters (Admin only)
   */
  async getAllArticles(req, res, next) {
    const result = await articleService.getAllArticles(req.query);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài viết thành công',
      meta: result.meta,
      data: result.data
    });
  },

  /**
   * Get article by ID (Admin only)
   */
  async getArticleById(req, res, next) {
    const article = await articleService.getArticleById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin bài viết thành công',
      data: article
    });
  },

  /**
   * Update article (Admin only)
   */
  async updateArticle(req, res, next) {
    const article = await articleService.updateArticle(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: article
    });
  },

  /**
   * Delete article (Admin only)
   */
  async deleteArticle(req, res, next) {
    const result = await articleService.deleteArticle(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.softDeleted ? result.article : { articleId: result.articleId }
    });
  },

  /**
   * Publish article (Admin only)
   */
  async publishArticle(req, res, next) {
    const article = await articleService.publishArticle(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Xuất bản bài viết thành công',
      data: article
    });
  },

  /**
   * Unpublish article (Admin only)
   */
  async unpublishArticle(req, res, next) {
    const article = await articleService.unpublishArticle(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Hủy xuất bản bài viết thành công',
      data: article
    });
  },

  /**
   * Get article analytics (Admin only)
   */
  async getArticleAnalytics(req, res, next) {
    const analytics = await articleService.getArticleAnalytics();
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê bài viết thành công',
      data: analytics
    });
  },

  // ==================== PUBLIC OPERATIONS ====================

  /**
   * Get published articles (Public)
   */
  async getPublishedArticles(req, res, next) {
    const result = await articleService.getPublishedArticles(req.query);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài viết thành công',
      meta: result.meta,
      data: result.data
    });
  },

  /**
   * Get article by slug (Public)
   */
  async getArticleBySlug(req, res, next) {
    const userId = req.user?._id;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const article = await articleService.getArticleBySlug(req.params.slug, userId, baseUrl);
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin bài viết thành công',
      data: article
    });
  },

  /**
   * Get article comments (Public)
   */
  async getArticleComments(req, res, next) {
    const userId = req.user?._id;
    const result = await commentService.getArticleComments(
      req.params.id,
      req.query,
      userId
    );
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bình luận thành công',
      meta: result.meta,
      data: result.data
    });
  },

  /**
   * Create comment (Authenticated users)
   */
  async createComment(req, res, next) {
    const userId = req.user._id;
    const comment = await commentService.createComment(req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Tạo bình luận thành công',
      data: comment
    });
  },

  /**
   * Update comment (Authenticated users - own comments only)
   */
  async updateComment(req, res, next) {
    const userId = req.user._id;
    const comment = await commentService.updateComment(
      req.params.commentId,
      req.body.content,
      userId
    );
    res.status(200).json({
      success: true,
      message: 'Cập nhật bình luận thành công',
      data: comment
    });
  },

  /**
   * Delete comment (Authenticated users - own comments only, or admin)
   */
  async deleteComment(req, res, next) {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const result = await commentService.deleteComment(
      req.params.commentId,
      userId,
      isAdmin
    );
    res.status(200).json({
      success: true,
      message: result.message,
      data: { deletedCount: result.deletedCount }
    });
  },

  /**
   * Like/Unlike article (Authenticated users)
   */
  async toggleArticleLike(req, res, next) {
    const userId = req.user._id;
    const result = await articleInteractionService.toggleArticleLike(
      req.params.id,
      userId
    );
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        liked: result.liked,
        likes: result.likes
      }
    });
  },

  /**
   * Like/Unlike comment (Authenticated users)
   */
  async toggleCommentLike(req, res, next) {
    const userId = req.user._id;
    const result = await commentService.toggleCommentLike(
      req.params.commentId,
      userId
    );
    res.status(200).json({
      success: true,
      message: result.liked ? 'Đã thích bình luận' : 'Đã bỏ thích bình luận',
      data: {
        liked: result.liked,
        likes: result.likes
      }
    });
  },

  /**
   * Track article share (Public - optional authentication)
   */
  async trackArticleShare(req, res, next) {
    const userId = req.user?._id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    const result = await articleInteractionService.trackArticleShare(
      req.params.id,
      {
        userId,
        platform: req.body.platform,
        ipAddress,
        userAgent
      }
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        shares: result.shares,
        platform: result.platform
      }
    });
  },

  // ==================== COMMENT MODERATION (ADMIN) ====================

  /**
   * Get comments for moderation (Admin only)
   */
  async getCommentsForModeration(req, res, next) {
    const result = await commentService.getCommentsForModeration(req.query);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bình luận thành công',
      meta: result.meta,
      data: result.data
    });
  },

  /**
   * Moderate comment (Admin only)
   */
  async moderateComment(req, res, next) {
    const comment = await commentService.moderateComment(
      req.params.commentId,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái bình luận thành công',
      data: comment
    });
  },

  /**
   * Bulk moderate comments (Admin only)
   */
  async bulkModerateComments(req, res, next) {
    const result = await commentService.bulkModerateComments(
      req.body.commentIds,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: result.message,
      data: { modifiedCount: result.modifiedCount }
    });
  }
};
