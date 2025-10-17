/**
 * Performance Monitoring Service
 * Tracks and analyzes application performance metrics
 */

import Article from '../models/Article.js';

export const performanceService = {
  /**
   * Get database performance statistics
   * @returns {Promise<Object>} Performance statistics
   */
  async getDatabaseStats() {
    const stats = await Promise.all([
      // Collection stats
      Article.collection.stats(),
      
      // Index usage stats
      Article.collection.aggregate([
        { $indexStats: {} }
      ]).toArray(),

      // Query performance analysis
      this.analyzeSlowQueries()
    ]);

    return {
      collectionStats: stats[0],
      indexStats: stats[1],
      slowQueries: stats[2],
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Analyze slow queries and suggest optimizations
   * @returns {Promise<Object>} Query analysis
   */
  async analyzeSlowQueries() {
    // This would typically integrate with MongoDB profiler
    // For now, we'll return basic analysis
    const recentArticles = await Article.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(1).explain('executionStats');

    return {
      recentQueriesAnalysis: recentArticles,
      recommendations: [
        'Ensure proper indexing on frequently queried fields',
        'Use aggregation pipelines for complex queries',
        'Implement pagination for large result sets',
        'Use lean() for read-only operations'
      ]
    };
  },

  /**
   * Get article performance metrics
   * @returns {Promise<Object>} Article performance metrics
   */
  async getArticlePerformanceMetrics() {
    const [
      totalArticles,
      publishedArticles,
      avgViewsPerArticle,
      topPerformingArticles,
      recentlyViewedArticles
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, avgViews: { $avg: '$stats.views' } } }
      ]),
      Article.find({ status: 'published' })
        .sort({ 'stats.views': -1 })
        .limit(10)
        .select('title slug stats publishedAt')
        .lean(),
      Article.find({ 
        status: 'published',
        'stats.views': { $gt: 0 }
      })
        .sort({ 'stats.views': -1 })
        .limit(20)
        .select('title slug stats publishedAt')
        .lean()
    ]);

    return {
      overview: {
        totalArticles,
        publishedArticles,
        avgViewsPerArticle: avgViewsPerArticle[0]?.avgViews || 0
      },
      topPerforming: topPerformingArticles,
      recentlyViewed: recentlyViewedArticles,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Get image optimization statistics
   * @returns {Promise<Object>} Image optimization stats
   */
  async getImageOptimizationStats() {
    const articlesWithImages = await Article.aggregate([
      { $match: { 'featuredImage.url': { $exists: true } } },
      {
        $group: {
          _id: null,
          totalWithImages: { $sum: 1 },
          cloudinaryImages: {
            $sum: {
              $cond: [
                { $regexMatch: { input: '$featuredImage.url', regex: /cloudinary\.com/ } },
                1,
                0
              ]
            }
          },
          imagesWithAlt: {
            $sum: {
              $cond: [
                { $ne: ['$featuredImage.alt', null] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = articlesWithImages[0] || {
      totalWithImages: 0,
      cloudinaryImages: 0,
      imagesWithAlt: 0
    };

    return {
      ...stats,
      optimizationRate: stats.totalWithImages > 0 
        ? (stats.cloudinaryImages / stats.totalWithImages * 100).toFixed(2)
        : 0,
      altTextRate: stats.totalWithImages > 0
        ? (stats.imagesWithAlt / stats.totalWithImages * 100).toFixed(2)
        : 0,
      recommendations: [
        stats.cloudinaryImages < stats.totalWithImages ? 'Migrate remaining images to Cloudinary for better optimization' : null,
        stats.imagesWithAlt < stats.totalWithImages ? 'Add alt text to all images for better accessibility and SEO' : null
      ].filter(Boolean),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Get caching performance metrics
   * @returns {Promise<Object>} Caching metrics
   */
  async getCachingMetrics() {
    // Since we're not using Redis, we'll focus on database query optimization
    const queryPatterns = await Article.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgViews: { $avg: '$stats.views' }
        }
      }
    ]);

    return {
      queryPatterns,
      recommendations: [
        'Use database indexes effectively',
        'Implement query result pagination',
        'Use aggregation pipelines for complex queries',
        'Consider implementing application-level caching for frequently accessed data'
      ],
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Generate performance report
   * @returns {Promise<Object>} Complete performance report
   */
  async generatePerformanceReport() {
    const [
      dbStats,
      articleMetrics,
      imageStats,
      cachingMetrics
    ] = await Promise.all([
      this.getDatabaseStats(),
      this.getArticlePerformanceMetrics(),
      this.getImageOptimizationStats(),
      this.getCachingMetrics()
    ]);

    return {
      database: dbStats,
      articles: articleMetrics,
      images: imageStats,
      caching: cachingMetrics,
      generatedAt: new Date().toISOString()
    };
  }
};