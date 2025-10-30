import { articleService } from '../services/article.service.js';
import logger from '../utils/logger.js';

export const articleController = {
  // ==================== ADMIN OPERATIONS ====================

  /**
   * Create a new article (Admin only)
   */
  createArticle: async (req, res, next) => {
    try {
      if (req.file) {
        req.body.featuredImage = req.file.path;
      }
      req.body.author = req.user._id;
      const article = await articleService.createArticle(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo bài viết thành công',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all articles with filters (Admin only)
   */
  getAllArticles: async (req, res, next) => {
    try {
      const result = await articleService.getAllArticles(req.query);
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách bài viết thành công',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get article by ID (Admin only)
   */
  getArticleById: async (req, res, next) => {
    try {
      const article = await articleService.getArticleById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin bài viết thành công',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update article (Admin only)
   */
  updateArticle: async (req, res, next) => {
    try {
      if (req.file) {
        req.body.featuredImage = req.file.path;
      }
      const article = await articleService.updateArticle(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Cập nhật bài viết thành công',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete article (Admin only)
   */
  deleteArticle: async (req, res, next) => {
    try {
      const result = await articleService.deleteArticle(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Publish article (Admin only)
   */
  publishArticle: async (req, res, next) => {
    try {
      const article = await articleService.publishArticle(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Xuất bản bài viết thành công',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Unpublish article (Admin only)
   */
  unpublishArticle: async (req, res, next) => {
    try {
      const article = await articleService.unpublishArticle(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Hủy xuất bản bài viết thành công',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get article analytics (Admin only)
   */
  getArticleAnalytics: async (req, res, next) => {
    try {
      const analytics = await articleService.getArticleAnalytics();
      res.status(200).json({
        success: true,
        message: 'Lấy thống kê bài viết thành công',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==================== PUBLIC OPERATIONS ====================

  /**
   * Get published articles (Public)
   */
  getPublishedArticles: async (req, res, next) => {
    try {
      const userId = req.user?._id;
      const result = await articleService.getPublishedArticles(req.query, userId);
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách bài viết thành công',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get article by slug (Public)
   */
  getArticleBySlug: async (req, res, next) => {
    try {
      const userId = req.user?._id;
      logger.info(`getArticleBySlug Controller: Passing userId: ${userId} to service.`);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const article = await articleService.getArticleBySlug(
        req.params.slug,
        userId,
        baseUrl
      );
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin bài viết thành công',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },
};
