import express from 'express';
import { articleController } from '../controllers/article.controller.js';
import { sitemapController } from '../controllers/sitemap.controller.js';
import { performanceController } from '../controllers/performance.controller.js';
import { protect, optionalAuth, restrictTo } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { validateArticleStatusTransition } from '../middlewares/articleAuth.js';
import {
  createArticleSchema,
  updateArticleSchema,
  getArticleByIdSchema,
  getArticlesQuerySchema,
  getPublishedArticlesQuerySchema,
} from '../schemas/article.schema.js';
import { getArticleBySlugSchema } from '../schemas/interaction.schema.js';
import {
  getArticleCommentsSchema,
  createCommentSchema,
} from '../schemas/comment.schema.js';
import upload from '../middlewares/upload.js';
import {
  optimizeResponseImages,
  addImagePreloadHints,
  addLazyLoadingSupport,
} from '../middlewares/imageOptimization.js';
import { commentController } from '../controllers/comment.controller.js';

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
  optionalAuth,
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
  commentController.getArticleComments
);

// Create a comment on an article
router.post(
  '/public/:id/comments',
  protect,
  validate(createCommentSchema),
  commentController.createComment
);

// ==================== ADMIN ROUTES ====================

// Get article analytics
router.get(
  '/admin/analytics',
  protect,
  restrictTo('admin'),
  articleController.getArticleAnalytics
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
