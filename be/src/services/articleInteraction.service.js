import Article from '../models/Article.js';
import ArticleLike from '../models/ArticleLike.js';
import ArticleShare from '../models/ArticleShare.js';
import Notification from '../models/Notification.js';
import { NotFoundError } from '../utils/AppError.js';
import { emitArticleUpdate } from '../utils/socket.js';
import articleNotificationService from './articleNotification.service.js';

// Helper function to get unread count
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    recipientUserId: userId,
    isRead: false
  });
};

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
    let notification = null;
    
    if (like) {
      await like.deleteOne();
      liked = false;
      
      // Xóa actor khỏi thông báo user khi unlike
      notification = await articleNotificationService.removeActorFromNotification(
        articleId,
        userId,
        'like'
      );
      
      // Xóa actor khỏi thông báo admin khi unlike (nếu có)
      await articleNotificationService.removeActorFromAdminNotification(
        articleId,
        userId,
        'like'
      );
    } else {
      await ArticleLike.create({ article: articleId, user: userId });
      liked = true;
      
      // Tạo/cập nhật thông báo khi like
      notification = await articleNotificationService.handleArticleLike(articleId, userId);
      
      // Gửi thông báo real-time đến người nhận
      if (notification && global.io) {
        global.io.to(`user_${notification.recipientUserId}`).emit('newNotification', {
          notification: notification.toObject(),
          unreadCount: await getUnreadCount(notification.recipientUserId)
        });
      }
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

  /**
   * Track an article share
   * @param {string} articleId - The ID of the article
   * @param {string} userId - The ID of the user (optional)
   * @param {string} platform - The platform the article was shared on
   * @returns {Promise<{shares: number, platform: string}>}
   */
  async trackShare(articleId, userId, platform) {
    const article = await Article.findById(articleId);
    if (!article) {
      throw new NotFoundError('Bài viết không tồn tại');
    }

    // Create a share record
    await ArticleShare.create({
      article: articleId,
      user: userId,
      platform,
    });

    // Update article's share count
    const shares = await ArticleShare.countDocuments({ article: articleId });
    article.stats.shares = shares;
    await article.save();

    // Emit real-time update
    emitArticleUpdate(articleId, {
      'stats.shares': shares,
    });

    return { shares, platform };
  },
};