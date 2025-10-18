import Article from '../models/Article.js';
import ArticleLike from '../models/ArticleLike.js';
import ArticleShare from '../models/ArticleShare.js';
import Comment from '../models/Comment.js';
import { NotFoundError, BadRequestError } from '../utils/AppError.js';
import {
  generateArticleMetaTags,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateCanonicalUrl,
  generateMetaRobots,
  generateOpenGraphTags,
  generateTwitterCardTags
} from '../utils/seo.js';
import {
  buildArticleAggregationPipeline,
  optimizeImageUrl,
  generateResponsiveImages,
  buildTextSearchQuery,
  optimizeArticleForResponse,
  calculateReadingTime,
  buildPaginationQuery,
  optimizeQuery
} from '../utils/performance.js';

export const articleService = {
  /**
   * Create a new article
   * @param {Object} articleData - Article data
   * @returns {Promise<Object>} Created article
   */
  async createArticle(articleData) {
    if (typeof articleData.tags === 'string') {
      articleData.tags = JSON.parse(articleData.tags);
    }
    if (typeof articleData.seoMeta === 'string') {
      articleData.seoMeta = JSON.parse(articleData.seoMeta);
    }
    const article = new Article(articleData);
    await article.save();
    return article;
  },

  /**
   * Get all articles with filters and pagination (Admin)
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Articles with pagination
   */
  async getAllArticles(queryParams) {
    const pagination = buildPaginationQuery(queryParams.page, queryParams.limit, 50);
    const { status, search, tags, sortBy } = queryParams;

    const filter = {};
    
    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Optimized search
    if (search) {
      Object.assign(filter, buildTextSearchQuery(search, ['title', 'content', 'excerpt']));
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'views': sort = { 'stats.views': -1 }; break;
        case 'likes': sort = { 'stats.likes': -1 }; break;
        case 'comments': sort = { 'stats.comments': -1 }; break;
        case 'shares': sort = { 'stats.shares': -1 }; break;
        case 'publishedAt': sort = { publishedAt: -1 }; break;
        case 'title': sort = { title: 1 }; break;
        default: sort = { createdAt: -1 };
      }
    }

    // Use aggregation for better performance with complex queries
    const pipeline = buildArticleAggregationPipeline(filter, {
      sort,
      skip: pagination.skip,
      limit: pagination.limit,
      select: '-content',
      sortBy
    });

    const [articles, totalResult] = await Promise.all([
      Article.aggregate(pipeline),
      Article.countDocuments(filter)
    ]);

    // Optimize images for response
    const optimizedArticles = articles.map(article => 
      optimizeArticleForResponse(article, {
        excludeContent: true,
        imageSize: 'medium',
        maxExcerptLength: 200
      })
    );

    const totalPages = Math.ceil(totalResult / pagination.limit);

    return {
      meta: {
        currentPage: pagination.page,
        totalPages,
        totalItems: totalResult,
        itemsPerPage: pagination.limit,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      },
      data: optimizedArticles
    };
  },

  /**
   * Get published articles for public view
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Published articles with pagination
   */
  async getPublishedArticles(queryParams) {
    const pagination = buildPaginationQuery(queryParams.page, queryParams.limit, 20);
    const { search, tags, sortBy } = queryParams;

    const filter = { 
      status: 'published',
      publishedAt: { $lte: new Date() }
    };

    // Optimized search
    if (search) {
      Object.assign(filter, buildTextSearchQuery(search, ['title', 'excerpt', 'tags']));
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // Sorting
    let sort = { publishedAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'views': sort = { 'stats.views': -1 }; break;
        case 'likes': sort = { 'stats.likes': -1 }; break;
        case 'popular': sort = { 'stats.views': -1, 'stats.likes': -1 }; break;
        default: sort = { publishedAt: -1 };
      }
    }

    // Use aggregation for better performance
    const pipeline = buildArticleAggregationPipeline(filter, {
      sort,
      skip: pagination.skip,
      limit: pagination.limit,
      select: 'title slug excerpt tags publishedAt stats content featuredImage images',
      sortBy
    });

    const [articles, totalResult] = await Promise.all([
      Article.aggregate(pipeline),
      Article.countDocuments(filter)
    ]);

    // Optimize articles for response with responsive images
    const optimizedArticles = articles.map(article => {
      const optimized = optimizeArticleForResponse(article, {
        includeResponsiveImages: true,
        maxExcerptLength: 150
      });

      // Add reading time
      if (article.content) {
        optimized.readingTime = calculateReadingTime(article.content);
      }

      return optimized;
    });

    const totalPages = Math.ceil(totalResult / pagination.limit);

    return {
      meta: {
        currentPage: pagination.page,
        totalPages,
        totalItems: totalResult,
        itemsPerPage: pagination.limit,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
      data: optimizedArticles
    };
  },

  /**
   * Get article by ID
   * @param {String} id - Article ID
   * @returns {Promise<Object>} Article
   */
  async getArticleById(id) {
    const article = await Article.findById(id).lean();
    
    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    return article;
  },

  /**
   * Get article by slug (public view)
   * @param {String} slug - Article slug
   * @param {String} userId - User ID (optional)
   * @param {String} baseUrl - Base URL for SEO (optional)
   * @returns {Promise<Object>} Article with user interaction status and SEO data
   */
  async getArticleBySlug(slug, userId = null, baseUrl = null) {
    const article = await Article.findOne({ 
      slug, 
      status: 'published',
      publishedAt: { $lte: new Date() }
    }).lean();
    
    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    // Increment view count
    await Article.findByIdAndUpdate(article._id, {
      $inc: { 'stats.views': 1 }
    });

    // Check user interactions if userId provided
    let userInteraction = {
      hasLiked: false,
      hasShared: false
    };

    if (userId) {
      const [hasLiked, hasShared] = await Promise.all([
        ArticleLike.exists({ article: article._id, user: userId }),
        ArticleShare.exists({ article: article._id, user: userId })
      ]);

      userInteraction = {
        hasLiked: !!hasLiked,
        hasShared: !!hasShared
      };
    }

    // Generate SEO data if baseUrl provided
    let seoData = null;
    if (baseUrl) {
      seoData = {
        metaTags: generateArticleMetaTags(article, baseUrl),
        structuredData: {
          article: generateArticleStructuredData(article, baseUrl),
          breadcrumb: generateBreadcrumbStructuredData(article, baseUrl)
        },
        canonical: generateCanonicalUrl(article.slug, baseUrl),
        robots: generateMetaRobots(article),
        openGraph: generateOpenGraphTags(article, baseUrl),
        twitter: generateTwitterCardTags(article, baseUrl)
      };
    }

    // Optimize article for response
    const optimizedArticle = optimizeArticleForResponse(article, {
      includeResponsiveImages: true
    });

    // Add reading time
    optimizedArticle.readingTime = calculateReadingTime(article.content);

    return {
      ...optimizedArticle,
      stats: {
        ...optimizedArticle.stats,
        views: optimizedArticle.stats.views + 1
      },
      userInteraction,
      ...(seoData && { seo: seoData })
    };
  },

  /**
   * Update article
   * @param {String} id - Article ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated article
   */
  async updateArticle(id, updateData) {
    if (typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }
    if (typeof updateData.seoMeta === 'string') {
      updateData.seoMeta = JSON.parse(updateData.seoMeta);
    }
    const article = await Article.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    return article;
  },

  /**
   * Delete article
   * @param {String} id - Article ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteArticle(id) {
    // Check if article has comments
    const commentCount = await Comment.countDocuments({ article: id });

    if (commentCount > 0) {
      // Soft delete by archiving
      const article = await Article.findByIdAndUpdate(
        id,
        { status: 'archived' },
        { new: true }
      );

      if (!article) {
        throw new NotFoundError('Không tìm thấy bài viết');
      }

      return {
        message: 'Bài viết đã được lưu trữ vì có bình luận',
        article,
        softDeleted: true
      };
    } else {
      // Hard delete if no comments
      const article = await Article.findByIdAndDelete(id);

      if (!article) {
        throw new NotFoundError('Không tìm thấy bài viết');
      }

      // Clean up related data
      await Promise.all([
        ArticleLike.deleteMany({ article: id }),
        ArticleShare.deleteMany({ article: id })
      ]);

      return {
        message: 'Bài viết đã được xóa vĩnh viễn',
        articleId: id,
        softDeleted: false
      };
    }
  },

  /**
   * Publish article
   * @param {String} id - Article ID
   * @returns {Promise<Object>} Published article
   */
  async publishArticle(id) {
    const article = await Article.findById(id);

    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    if (article.status === 'published') {
      throw new BadRequestError('Bài viết đã được xuất bản');
    }

    article.status = 'published';
    if (!article.publishedAt) {
      article.publishedAt = new Date();
    }

    await article.save();
    return article;
  },

  /**
   * Unpublish article
   * @param {String} id - Article ID
   * @returns {Promise<Object>} Unpublished article
   */
  async unpublishArticle(id) {
    const article = await Article.findById(id);

    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    if (article.status !== 'published') {
      throw new BadRequestError('Bài viết chưa được xuất bản');
    }

    article.status = 'draft';
    await article.save();
    return article;
  },

  /**
   * Get article analytics
   * @returns {Promise<Object>} Analytics data
   */
  async getArticleAnalytics() {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      archivedArticles,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      topArticles
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      Article.countDocuments({ status: 'archived' }),
      Article.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.views' } } }
      ]),
      Article.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.likes' } } }
      ]),
      Article.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.comments' } } }
      ]),
      Article.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.shares' } } }
      ]),
      Article.find({ status: 'published' })
        .sort({ 'stats.views': -1 })
        .limit(5)
        .select('title slug stats publishedAt')
        .lean()
    ]);

    return {
      overview: {
        totalArticles,
        publishedArticles,
        draftArticles,
        archivedArticles
      },
      engagement: {
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0,
        totalShares: totalShares[0]?.total || 0
      },
      topArticles
    };
  }
};
