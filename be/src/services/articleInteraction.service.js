import Article from '../models/Article.js';
import ArticleLike from '../models/ArticleLike.js';
import ArticleShare from '../models/ArticleShare.js';
import { NotFoundError, BadRequestError } from '../utils/AppError.js';

export const articleInteractionService = {
  /**
   * Like/Unlike an article
   * @param {String} articleId - Article ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Like result
   */
  async toggleArticleLike(articleId, userId) {
    // Verify article exists and is published
    const article = await Article.findOne({
      _id: articleId,
      status: 'published'
    });

    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết hoặc bài viết chưa được xuất bản');
    }

    // Check if already liked
    const existingLike = await ArticleLike.findOne({
      article: articleId,
      user: userId
    });

    if (existingLike) {
      // Unlike
      await ArticleLike.deleteOne({ _id: existingLike._id });
      
      await Article.findByIdAndUpdate(articleId, {
        $inc: { 'stats.likes': -1 }
      });

      const newLikes = Math.max(0, article.stats.likes - 1);

      // Emit real-time event for article like update
      if (global.io) {
        global.io.to(`article_${articleId}`).emit('articleLikeUpdated', {
          articleId: articleId,
          likes: newLikes
        });
      }

      return {
        liked: false,
        likes: newLikes,
        message: 'Đã bỏ thích bài viết'
      };
    } else {
      // Like
      await ArticleLike.create({
        article: articleId,
        user: userId
      });

      await Article.findByIdAndUpdate(articleId, {
        $inc: { 'stats.likes': 1 }
      });

      const newLikes = article.stats.likes + 1;

      // Emit real-time event for article like update
      if (global.io) {
        global.io.to(`article_${articleId}`).emit('articleLikeUpdated', {
          articleId: articleId,
          likes: newLikes
        });
      }

      return {
        liked: true,
        likes: newLikes,
        message: 'Đã thích bài viết'
      };
    }
  },

  /**
   * Track article share
   * @param {String} articleId - Article ID
   * @param {Object} shareData - Share data
   * @returns {Promise<Object>} Share result
   */
  async trackArticleShare(articleId, shareData) {
    const { userId, platform, ipAddress, userAgent } = shareData;

    // Verify article exists and is published
    const article = await Article.findOne({
      _id: articleId,
      status: 'published'
    });

    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết hoặc bài viết chưa được xuất bản');
    }

    // Validate platform
    const validPlatforms = ['facebook', 'zalo', 'twitter', 'copy'];
    if (!validPlatforms.includes(platform)) {
      throw new BadRequestError('Nền tảng chia sẻ không hợp lệ');
    }

    // Create share record
    await ArticleShare.create({
      article: articleId,
      user: userId || null,
      platform,
      ipAddress,
      userAgent
    });

    // Update article share count
    await Article.findByIdAndUpdate(articleId, {
      $inc: { 'stats.shares': 1 }
    });

    return {
      message: 'Đã ghi nhận chia sẻ bài viết',
      shares: article.stats.shares + 1,
      platform
    };
  },

  /**
   * Get user's liked articles
   * @param {String} userId - User ID
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Liked articles with pagination
   */
  async getUserLikedArticles(userId, queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ArticleLike.countDocuments({ user: userId });
    
    const likes = await ArticleLike.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'article',
        select: 'title slug excerpt featuredImage tags publishedAt stats',
        match: { status: 'published' }
      })
      .lean();

    // Filter out null articles (deleted or unpublished)
    const articles = likes
      .filter(like => like.article)
      .map(like => ({
        ...like.article,
        likedAt: like.createdAt
      }));

    const totalPages = Math.ceil(total / limit);

    return {
      meta: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: articles
    };
  },

  /**
   * Get article like statistics
   * @param {String} articleId - Article ID
   * @returns {Promise<Object>} Like statistics
   */
  async getArticleLikeStats(articleId) {
    const article = await Article.findById(articleId);

    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    const totalLikes = await ArticleLike.countDocuments({ article: articleId });

    // Get likes over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const likesOverTime = await ArticleLike.aggregate([
      {
        $match: {
          article: article._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalLikes,
      currentLikes: article.stats.likes,
      likesOverTime
    };
  },

  /**
   * Get article share statistics
   * @param {String} articleId - Article ID
   * @returns {Promise<Object>} Share statistics
   */
  async getArticleShareStats(articleId) {
    const article = await Article.findById(articleId);

    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    const totalShares = await ArticleShare.countDocuments({ article: articleId });

    // Shares by platform
    const sharesByPlatform = await ArticleShare.aggregate([
      { $match: { article: article._id } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Shares over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sharesOverTime = await ArticleShare.aggregate([
      {
        $match: {
          article: article._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalShares,
      currentShares: article.stats.shares,
      sharesByPlatform: sharesByPlatform.map(s => ({
        platform: s._id,
        count: s.count
      })),
      sharesOverTime
    };
  },

  /**
   * Get overall interaction statistics
   * @returns {Promise<Object>} Overall statistics
   */
  async getOverallInteractionStats() {
    const [
      totalLikes,
      totalShares,
      topLikedArticles,
      topSharedArticles,
      sharesByPlatform
    ] = await Promise.all([
      ArticleLike.countDocuments(),
      ArticleShare.countDocuments(),
      Article.find({ status: 'published' })
        .sort({ 'stats.likes': -1 })
        .limit(10)
        .select('title slug stats.likes publishedAt')
        .lean(),
      Article.find({ status: 'published' })
        .sort({ 'stats.shares': -1 })
        .limit(10)
        .select('title slug stats.shares publishedAt')
        .lean(),
      ArticleShare.aggregate([
        {
          $group: {
            _id: '$platform',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    return {
      totalLikes,
      totalShares,
      topLikedArticles,
      topSharedArticles,
      sharesByPlatform: sharesByPlatform.map(s => ({
        platform: s._id,
        count: s.count
      }))
    };
  },

  /**
   * Check if user has liked an article
   * @param {String} articleId - Article ID
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} Has liked
   */
  async hasUserLikedArticle(articleId, userId) {
    const like = await ArticleLike.exists({
      article: articleId,
      user: userId
    });

    return !!like;
  },

  /**
   * Get user interaction status for multiple articles
   * @param {Array} articleIds - Array of article IDs
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Interaction status map
   */
  async getUserInteractionStatus(articleIds, userId) {
    const likes = await ArticleLike.find({
      article: { $in: articleIds },
      user: userId
    }).select('article').lean();

    const shares = await ArticleShare.find({
      article: { $in: articleIds },
      user: userId
    }).select('article').lean();

    const likedArticles = new Set(likes.map(l => l.article.toString()));
    const sharedArticles = new Set(shares.map(s => s.article.toString()));

    const interactionMap = {};
    articleIds.forEach(id => {
      interactionMap[id] = {
        hasLiked: likedArticles.has(id.toString()),
        hasShared: sharedArticles.has(id.toString())
      };
    });

    return interactionMap;
  }
};
