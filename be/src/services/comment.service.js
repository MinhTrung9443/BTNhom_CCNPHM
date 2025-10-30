import Comment from '../models/Comment.js';
import CommentLike from '../models/CommentLike.js';
import Article from '../models/Article.js';
import Notification from '../models/Notification.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/AppError.js';
import articleNotificationService from './articleNotification.service.js';

// Helper function to get unread count
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    recipientUserId: userId,
    isRead: false
  });
};

export const commentService = {
  /**
   * Create a new comment
   * @param {Object} commentData - Comment data
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Created comment
   */
  async createComment(commentData, userId) {
    const { article, content, parentComment } = commentData;

    // Verify article exists and is published
    const articleDoc = await Article.findOne({ 
      _id: article, 
      status: 'published' 
    });

    if (!articleDoc) {
      throw new NotFoundError('Không tìm thấy bài viết hoặc bài viết chưa được xuất bản');
    }

    // If replying to a comment, verify parent exists and nesting level
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);

      if (!parentCommentDoc) {
        throw new NotFoundError('Không tìm thấy bình luận cha');
      }
      
      // Nếu trả lời một bình luận con (level 1), thì gán parent của nó cho bình luận mới
      if (parentCommentDoc.level >= 1) {
        commentData.parentComment = parentCommentDoc.parentComment;
      }

      if (parentCommentDoc.article.toString() !== article) {
        throw new BadRequestError('Bình luận cha không thuộc bài viết này');
      }
    }

    // Create comment
    const comment = new Comment({
      article,
      author: userId,
      content,
      parentComment: commentData.parentComment || null
    });

    await comment.save();

    // Update article comment count
    await Article.findByIdAndUpdate(article, {
      $inc: { 'stats.comments': 1 }
    });

    // Populate author info
    await comment.populate('author', 'name avatar role');

    // Tạo thông báo
    let notification = null;
    if (parentComment) {
      // Thông báo reply comment
      notification = await articleNotificationService.handleCommentReply(
        parentComment,
        comment._id,
        userId,
        content
      );
    } else {
      // Thông báo comment bài viết
      notification = await articleNotificationService.handleArticleComment(
        article,
        comment._id,
        userId,
        content
      );
    }

    // Gửi thông báo real-time đến người nhận
    if (notification && global.io) {
      global.io.to(`user_${notification.recipientUserId}`).emit('newNotification', {
        notification: notification.toObject(),
        unreadCount: await getUnreadCount(notification.recipientUserId)
      });
    }

    // Emit real-time event for new comment
    if (global.io) {
      global.io.to(`article_${article}`).emit('newComment', {
        comment: {
          ...comment.toObject(),
          author: {
            ...comment.author,
            isAdmin: comment.author.role === 'admin'
          }
        },
        articleId: article
      });
    }

    return comment;
  },

  /**
   * Get comments for an article with nested structure
   * @param {String} articleId - Article ID
   * @param {Object} queryParams - Query parameters
   * @param {String} userId - User ID (optional)
   * @returns {Promise<Object>} Comments with pagination
   */
  async getArticleComments(articleId, queryParams, userId = null) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;
    const { status = 'approved' } = queryParams;

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    // Get root comments (level 0)
    const filter = {
      article: articleId,
      parentComment: null,
      status
    };

    const total = await Comment.countDocuments(filter);
    const rootComments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name avatar role')
      .lean();

    // Get all replies for these root comments
    const rootCommentIds = rootComments.map(c => c._id);
    const replies = await Comment.find({
      article: articleId,
      parentComment: { $in: rootCommentIds },
      status
    })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar role')
      .lean();

    // Get nested replies (level 2)
    const level1CommentIds = replies.map(c => c._id);
    const nestedReplies = await Comment.find({
      article: articleId,
      parentComment: { $in: level1CommentIds },
      status
    })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar role')
      .lean();

    // Check user interactions if userId provided
    let userLikes = new Set();
    if (userId) {
      const allCommentIds = [
        ...rootCommentIds,
        ...replies.map(r => r._id),
        ...nestedReplies.map(r => r._id)
      ];

      const likes = await CommentLike.find({
        comment: { $in: allCommentIds },
        user: userId
      }).select('comment').lean();

      userLikes = new Set(likes.map(l => l.comment.toString()));
    }

    // Build nested structure
    const commentsWithReplies = rootComments.map(comment => {
      const commentReplies = replies.filter(
        r => r.parentComment.toString() === comment._id.toString()
      );

      const repliesWithNested = commentReplies.map(reply => {
        const nestedReps = nestedReplies.filter(
          nr => nr.parentComment.toString() === reply._id.toString()
        );

        return {
          ...reply,
          author: {
            ...reply.author,
            isAdmin: reply.author.role === 'admin'
          },
          userInteraction: {
            hasLiked: userLikes.has(reply._id.toString()),
            canEdit: userId ? reply.author._id.toString() === userId : false,
            canDelete: userId ? reply.author._id.toString() === userId : false
          },
          replies: nestedReps.map(nr => ({
            ...nr,
            author: {
              ...nr.author,
              isAdmin: nr.author.role === 'admin'
            },
            userInteraction: {
              hasLiked: userLikes.has(nr._id.toString()),
              canEdit: userId ? nr.author._id.toString() === userId : false,
              canDelete: userId ? nr.author._id.toString() === userId : false
            }
          }))
        };
      });

      return {
        ...comment,
        author: {
          ...comment.author,
          isAdmin: comment.author.role === 'admin'
        },
        userInteraction: {
          hasLiked: userLikes.has(comment._id.toString()),
          canEdit: userId ? comment.author._id.toString() === userId : false,
          canDelete: userId ? comment.author._id.toString() === userId : false
        },
        replies: repliesWithNested
      };
    });

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
      data: commentsWithReplies
    };
  },

  /**
   * Update comment
   * @param {String} commentId - Comment ID
   * @param {String} content - New content
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated comment
   */
  async updateComment(commentId, content, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new NotFoundError('Không tìm thấy bình luận');
    }

    // Check ownership
    if (!comment.author.equals(userId)) {
      throw new UnauthorizedError('Bạn không có quyền chỉnh sửa bình luận này');
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('author', 'name avatar role');

    // Emit real-time event for comment update
    if (global.io) {
      global.io.to(`article_${comment.article}`).emit('commentUpdated', {
        comment: {
          ...comment.toObject(),
          author: {
            ...comment.author,
            isAdmin: comment.author.role === 'admin'
          }
        },
        articleId: comment.article
      });
    }

    return comment;
  },

  /**
   * Delete comment
   * @param {String} commentId - Comment ID
   * @param {String} userId - User ID
   * @param {Boolean} isAdmin - Is admin user
   * @returns {Promise<Object>} Deletion result
   */
  async deleteComment(commentId, userId, isAdmin = false) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new NotFoundError('Không tìm thấy bình luận');
    }

    // Check ownership or admin
    if (!isAdmin && !comment.author.equals(userId)) {
      console.log('Unauthorized delete attempt by user:', userId);
      throw new UnauthorizedError('Bạn không có quyền xóa bình luận này');
    }

    // Count nested replies
    const replyCount = await Comment.countDocuments({
      $or: [
        { parentComment: commentId },
        { 
          parentComment: { 
            $in: await Comment.find({ parentComment: commentId }).distinct('_id')
          }
        }
      ]
    });

    // Delete comment and all nested replies
    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentComment: commentId },
        { 
          parentComment: { 
            $in: await Comment.find({ parentComment: commentId }).distinct('_id')
          }
        }
      ]
    });

    // Update article comment count
    await Article.findByIdAndUpdate(comment.article, {
      $inc: { 'stats.comments': -(replyCount + 1) }
    });

    // Clean up likes
    await CommentLike.deleteMany({ comment: commentId });

    // Emit real-time event for comment deletion
    if (global.io) {
      global.io.to(`article_${comment.article}`).emit('commentDeleted', {
        commentId: commentId,
        articleId: comment.article,
        deletedCount: replyCount + 1
      });
    }

    return {
      message: 'Bình luận đã được xóa',
      deletedCount: replyCount + 1
    };
  },

  /**
   * Like/Unlike comment
   * @param {String} commentId - Comment ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Like result
   */
  async toggleCommentLike(commentId, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new NotFoundError('Không tìm thấy bình luận');
    }

    // Check if already liked
    const existingLike = await CommentLike.findOne({
      comment: commentId,
      user: userId
    });

    let notification = null;

    if (existingLike) {
      // Unlike
      await CommentLike.deleteOne({ _id: existingLike._id });
      await Comment.findByIdAndUpdate(commentId, {
        $inc: { likes: -1 }
      });

      const newLikes = Math.max(0, comment.likes - 1);

      // Xóa actor khỏi thông báo user
      notification = await articleNotificationService.removeActorFromNotification(
        commentId,
        userId,
        'like'
      );
      
      // Xóa actor khỏi thông báo admin (nếu có)
      await articleNotificationService.removeActorFromAdminNotification(
        commentId,
        userId,
        'like'
      );

      // Emit real-time event for comment like update
      if (global.io) {
        global.io.to(`article_${comment.article}`).emit('commentLikeUpdated', {
          commentId: commentId,
          likes: newLikes,
          articleId: comment.article
        });
      }

      return {
        liked: false,
        likes: newLikes
      };
    } else {
      // Like
      await CommentLike.create({
        comment: commentId,
        user: userId
      });

      await Comment.findByIdAndUpdate(commentId, {
        $inc: { likes: 1 }
      });

      const newLikes = comment.likes + 1;

      // Tạo/cập nhật thông báo
      notification = await articleNotificationService.handleCommentLike(commentId, userId);

      // Gửi thông báo real-time đến người nhận
      if (notification && global.io) {
        global.io.to(`user_${notification.recipientUserId}`).emit('newNotification', {
          notification: notification.toObject(),
          unreadCount: await getUnreadCount(notification.recipientUserId)
        });
      }

      // Emit real-time event for comment like update
      if (global.io) {
        global.io.to(`article_${comment.article}`).emit('commentLikeUpdated', {
          commentId: commentId,
          likes: newLikes,
          articleId: comment.article
        });
      }

      return {
        liked: true,
        likes: newLikes
      };
    }
  },

  /**
   * Moderate comment (Admin only)
   * @param {String} commentId - Comment ID
   * @param {String} status - New status (approved/rejected)
   * @returns {Promise<Object>} Updated comment
   */
  async moderateComment(commentId, status) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestError('Trạng thái không hợp lệ');
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { status },
      { new: true }
    ).populate('author', 'name avatar');

    if (!comment) {
      throw new NotFoundError('Không tìm thấy bình luận');
    }

    return comment;
  },

  /**
   * Get all comments for moderation (Admin only)
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Comments with pagination
   */
  async getCommentsForModeration(queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, articleId } = queryParams;

    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    if (articleId) {
      filter.article = articleId;
    }

    const total = await Comment.countDocuments(filter);
    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name avatar email')
      .populate('article', 'title slug')
      .lean();

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
      data: comments
    };
  },

  /**
   * Bulk moderate comments (Admin only)
   * @param {Array} commentIds - Array of comment IDs
   * @param {String} status - New status
   * @returns {Promise<Object>} Update result
   */
  async bulkModerateComments(commentIds, status) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestError('Trạng thái không hợp lệ');
    }

    const result = await Comment.updateMany(
      { _id: { $in: commentIds } },
      { status }
    );

    return {
      message: `Đã cập nhật ${result.modifiedCount} bình luận`,
      modifiedCount: result.modifiedCount
    };
  }
};
