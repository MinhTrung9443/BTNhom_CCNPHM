import Article from '../models/Article.js';
import { NotFoundError, BadRequestError } from '../utils/AppError.js';

/**
 * Middleware to verify article exists
 * Attaches article to request object
 */
const verifyArticleExists = async (req, res, next) => {
  try {
    const articleId = req.params.id;

    const article = await Article.findById(articleId).lean();

    if (!article) {
      return next(new NotFoundError('Không tìm thấy bài viết'));
    }

    // Attach article to request
    req.article = article;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify article is published
 * Used for public routes that should only show published articles
 */
const verifyArticlePublished = async (req, res, next) => {
  try {
    const articleId = req.params.id;

    const article = await Article.findOne({
      _id: articleId,
      status: 'published'
    }).lean();

    if (!article) {
      return next(
        new NotFoundError('Không tìm thấy bài viết hoặc bài viết chưa được xuất bản')
      );
    }

    // Attach article to request
    req.article = article;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate article status transition
 * Ensures valid status changes (e.g., can't unpublish a draft)
 */
const validateArticleStatusTransition = (targetStatus) => {
  return async (req, res, next) => {
    try {
      const articleId = req.params.id;

      const article = await Article.findById(articleId).select('status').lean();

      if (!article) {
        return next(new NotFoundError('Không tìm thấy bài viết'));
      }

      const currentStatus = article.status;

      // Validate status transitions
      if (targetStatus === 'published') {
        if (currentStatus === 'published') {
          return next(new BadRequestError('Bài viết đã được xuất bản'));
        }
      } else if (targetStatus === 'draft' || targetStatus === 'archived') {
        if (currentStatus === 'draft' && targetStatus === 'draft') {
          return next(new BadRequestError('Bài viết đã ở trạng thái nháp'));
        }
        if (currentStatus === 'archived' && targetStatus === 'archived') {
          return next(new BadRequestError('Bài viết đã được lưu trữ'));
        }
      }

      // Attach article to request
      req.article = article;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export {
  verifyArticleExists,
  verifyArticlePublished,
  validateArticleStatusTransition
};
