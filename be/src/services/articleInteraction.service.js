import Article from '../models/Article.js';
import ArticleLike from '../models/ArticleLike.js';
import { NotFoundError } from '../utils/AppError.js';
import { emitArticleUpdate } from '../utils/socket.js';

export const articleInteractionService = {
  /**
   * Toggle like status for an article
   * @param {string} articleId - The ID of the article
   * @param {string} userId - The ID of the user
   * @returns {Promise<{liked: boolean, likes: number}>}
   */
  async toggleLike(articleId, userId) {
    const article = await Article.findById(articleId);
    if (!article) {
      throw new NotFoundError('Bài viết không tồn tại');
    }

    const like = await ArticleLike.findOne({ article: articleId, user: userId });

    let liked;
    if (like) {
      await like.deleteOne();
      liked = false;
    } else {
      await ArticleLike.create({ article: articleId, user: userId });
      liked = true;
    }

    // Update article's like count
    const likes = await ArticleLike.countDocuments({ article: articleId });
    article.stats.likes = likes;
    await article.save();

    // Emit real-time update
    emitArticleUpdate(articleId, {
      'stats.likes': likes,
    });

    return { liked, likes };
  },
};