import express from 'express';
import { articleController } from '../controllers/article.controller.js';
import { sitemapController } from '../controllers/sitemap.controller.js';
import { performanceController } from '../controllers/performance.controller.js';
import { protect, optionalAuth, restrictTo } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { verifyCommentOwnership } from '../middlewares/commentAuth.js';
import { validateArticleStatusTransition } from '../middlewares/articleAuth.js';
import {
  createArticleSchema,
  updateArticleSchema,
  getArticleByIdSchema,
  getArticlesQuerySchema,
  getPublishedArticlesQuerySchema
} from '../schemas/article.schema.js';
import upload from '../middlewares/upload.js';
import {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  getArticleCommentsSchema,
  moderateCommentSchema,
  getCommentsForModerationSchema,
  bulkModerateCommentsSchema
} from '../schemas/comment.schema.js';
import {
  likeArticleSchema,
  likeCommentSchema,
  shareArticleSchema,
  getArticleBySlugSchema
} from '../schemas/interaction.schema.js';
import {
  optimizeResponseImages,
  addImagePreloadHints,
  addLazyLoadingSupport
} from '../middlewares/imageOptimization.js';

const router = express.Router();

// ==================== SEO & SITEMAP ROUTES ====================

// Get sitemap index
router.get('/sitemap.xml', sitemapController.getSitemapIndex);

// Get articles sitemap
router.get('/sitemap-articles.xml', sitemapController.getArticlesSitemap);

// Get sitemap statistics (Admin only)
router.get(
  '/admin/sitemap/stats',
  protect,
  restrictTo('admin'),
  sitemapController.getSitemapStats
);

// ==================== PERFORMANCE MONITORING ROUTES ====================

// Get database performance statistics (Admin only)
router.get(
  '/admin/performance/database',
  protect,
  restrictTo('admin'),
  performanceController.getDatabaseStats
);

// Get article performance metrics (Admin only)
router.get(
  '/admin/performance/articles',
  protect,
  restrictTo('admin'),
  performanceController.getArticleMetrics
);

// Get image optimization statistics (Admin only)
router.get(
  '/admin/performance/images',
  protect,
  restrictTo('admin'),
  performanceController.getImageStats
);

// Get caching performance metrics (Admin only)
router.get(
  '/admin/performance/caching',
  protect,
  restrictTo('admin'),
  performanceController.getCachingMetrics
);

// Generate complete performance report (Admin only)
router.get(
  '/admin/performance/report',
  protect,
  restrictTo('admin'),
  performanceController.getPerformanceReport
);

// ==================== PUBLIC ROUTES ====================

// Get published articles (with pagination, search, filters)
router.get(
  '/public',
  validate(getPublishedArticlesQuerySchema),
  optimizeResponseImages,
  addImagePreloadHints,
  addLazyLoadingSupport,
  articleController.getPublishedArticles
);

// Get article by slug (with view tracking)
router.get(
  '/public/slug/:slug',
  optionalAuth,
  validate(getArticleBySlugSchema),
  optimizeResponseImages,
  addLazyLoadingSupport,
  articleController.getArticleBySlug
);

// Get article comments
router.get(
  '/public/:id/comments',
  optionalAuth,
  validate(getArticleCommentsSchema),
  articleController.getArticleComments
);

// Track article share (optional authentication)
router.post(
  '/public/:id/share',
  optionalAuth,
  validate(shareArticleSchema),
  articleController.trackArticleShare
);

// ==================== AUTHENTICATED USER ROUTES ====================

// Create comment (requires authentication)
router.post(
  '/public/:id/comments',
  protect,
  validate(createCommentSchema),
  articleController.createComment
);

// Update comment (requires authentication and ownership)
router.put(
  '/public/comments/:commentId',
  protect,
  validate(updateCommentSchema),
  verifyCommentOwnership,
  articleController.updateComment
);

// Delete comment (requires authentication and ownership or admin)
router.delete(
  '/public/comments/:commentId',
  protect,
  validate(deleteCommentSchema),
  verifyCommentOwnership,
  articleController.deleteComment
);

// Like/Unlike article (requires authentication)
router.post(
  '/public/:id/like',
  protect,
  validate(likeArticleSchema),
  articleController.toggleArticleLike
);

// Like/Unlike comment (requires authentication)
router.post(
  '/public/comments/:commentId/like',
  protect,
  validate(likeCommentSchema),
  articleController.toggleCommentLike
);

// ==================== ADMIN ROUTES ====================

// Get article analytics
router.get(
  '/admin/analytics',
  protect,
  restrictTo('admin'),
  articleController.getArticleAnalytics
);

// Get comments for moderation
router.get(
  '/admin/comments',
  protect,
  restrictTo('admin'),
  validate(getCommentsForModerationSchema),
  articleController.getCommentsForModeration
);

// Bulk moderate comments
router.post(
  '/admin/comments/bulk-moderate',
  protect,
  restrictTo('admin'),
  validate(bulkModerateCommentsSchema),
  articleController.bulkModerateComments
);

// Moderate single comment
router.patch(
  '/admin/comments/:commentId/moderate',
  protect,
  restrictTo('admin'),
  validate(moderateCommentSchema),
  articleController.moderateComment
);

// Get all articles (admin view with all statuses)
router.get(
  '/admin',
  protect,
  restrictTo('admin'),
  validate(getArticlesQuerySchema),
  articleController.getAllArticles
);

// Create article
router.post(
  '/admin',
  protect,
  restrictTo('admin'),
  upload.single('featuredImage'),
  validate(createArticleSchema),
  articleController.createArticle
);

// Publish article
router.post(
  '/admin/:id/publish',
  protect,
  restrictTo('admin'),
  validate(getArticleByIdSchema),
  validateArticleStatusTransition('published'),
  articleController.publishArticle
);

// Unpublish article
router.post(
  '/admin/:id/unpublish',
  protect,
  restrictTo('admin'),
  validate(getArticleByIdSchema),
  validateArticleStatusTransition('draft'),
  articleController.unpublishArticle
);

// Get article by ID (admin view)
router.get(
  '/admin/:id',
  protect,
  restrictTo('admin'),
  validate(getArticleByIdSchema),
  articleController.getArticleById
);

// Update article
router.put(
  '/admin/:id',
  protect,
  restrictTo('admin'),
  upload.single('featuredImage'),
  validate(updateArticleSchema),
  articleController.updateArticle
);

// Delete article
router.delete(
  '/admin/:id',
  protect,
  restrictTo('admin'),
  validate(getArticleByIdSchema),
  articleController.deleteArticle
);

export default router;
