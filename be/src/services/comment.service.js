import Comment from '../models/Comment.js';
import CommentLike from '../models/CommentLike.js';
import Article from '../models/Article.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/AppError.js';
import articleNotificationService from './articleNotification.service.js';

// Helper function to get unread count
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    recipientUserId: userId,
    isRead: false
  });
};

const createModerationNotification = async (comment, status, moderationNotes) => {
  try {
    const statusText = status === 'approved' ? 'đã được duyệt' : 'đã bị từ chối';
    const message = status === 'rejected' && moderationNotes 
      ? `Bình luận của bạn ${statusText}. Lý do: ${moderationNotes}`
      : `Bình luận của bạn ${statusText}`;

    const authorId = comment.author._id || comment.author;
    console.log(`[Notification] Creating notification for user ${authorId}, status: ${status}`);

    let notification;
    try {
      notification = await Notification.create({
        recipientUserId: authorId,
        type: 'article', // Use 'article' as main type  
        subType: 'status_update', // Use status_update for moderation results
        title: `Bình luận ${statusText}`,
        message,
        referenceId: comment._id, // Required field
        recipient: 'user', // Required field
        relatedId: comment._id,
        relatedModel: 'Comment',
        link: `/articles/${comment.article}/comments`,
        articleId: comment.article,
        metadata: {
          commentContent: comment.content.substring(0, 100),
          status: status,
          moderationNotes: moderationNotes
        }
      });
      console.log(`[Notification] Created notification: ${notification._id} for user ${authorId}`);
    } catch (createError) {
      // Handle duplicate key error (E11000)
      if (createError.code === 11000) {
        console.log(`[Notification] Duplicate notification detected, fetching existing notification`);
        notification = await Notification.findOne({
          recipientUserId: authorId,
          type: 'article',
          subType: 'status_update',
          referenceId: comment._id
        });
        if (!notification) {
          throw createError; // Re-throw if we can't find the existing notification
        }
        console.log(`[Notification] Using existing notification: ${notification._id}`);
      } else {
        throw createError; // Re-throw if it's not a duplicate key error
      }
    }

    // Populate necessary fields before sending via socket (fix for missing articleId.slug)
    await notification.populate([
      { path: 'actors', select: 'name avatar' },
      { path: 'articleId', select: 'title slug' }
    ]);
    console.log(`[Notification] Populated notification fields for socket emission`);

    // Send real-time notification
    if (global.io) {
      const roomName = authorId.toString();
      const unreadCount = await getUnreadCount(authorId);
      
      // Check if user is in the room
      const sockets = await global.io.in(roomName).fetchSockets();
      console.log(`[Notification] Users in room ${roomName}: ${sockets.length}`);
      
      if (sockets.length > 0) {
        console.log(`[Notification] Emitting to room: ${roomName}, unreadCount: ${unreadCount}`);
        
        global.io.to(roomName).emit('newNotification', {
          notification: notification.toObject(),
          unreadCount
        });
        
        console.log(`[Notification] Emitted newNotification event to ${sockets.length} socket(s) in room ${roomName}`);
      } else {
        console.log(`[Notification] No users in room ${roomName}, notification will be stored in DB only`);
      }
    } else {
      console.error('[Notification] global.io not available');
    }

    return notification;
  } catch (error) {
    console.error('[Notification] Failed to create moderation notification:', error);
    console.error('[Notification] Error details:', error.message, error.stack);
  }
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

    // Check if user is admin
    const user = await User.findById(userId);
    const isAdmin = user?.role === 'admin';

    // Create comment
    const comment = new Comment({
      article,
      author: userId,
      content,
      parentComment: commentData.parentComment || null,
      status: isAdmin ? 'approved' : 'pending'
    });

    await comment.save();
    
    console.log(`[Comment] Created comment: ${comment._id}, author: ${userId}, status: ${comment.status}`);

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
      if (comment.status === 'approved') {
        // If approved, broadcast to everyone in the article room
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
      } else if (comment.status === 'pending') {
        // If pending, only emit to the author
        global.io.to(userId.toString()).emit('newComment', {
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
    // If userId is provided, also include pending comments authored by that user
    const filter = userId ? {
      article: articleId,
      parentComment: null,
      $or: [
        { status },
        { status: 'pending', author: userId }
      ]
    } : {
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
    const repliesFilter = userId ? {
      article: articleId,
      parentComment: { $in: rootCommentIds },
      $or: [
        { status },
        { status: 'pending', author: userId }
      ]
    } : {
      article: articleId,
      parentComment: { $in: rootCommentIds },
      status
    };
    
    const replies = await Comment.find(repliesFilter)
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar role')
      .lean();

    // Get nested replies (level 2)
    const level1CommentIds = replies.map(c => c._id);
    const nestedRepliesFilter = userId ? {
      article: articleId,
      parentComment: { $in: level1CommentIds },
      $or: [
        { status },
        { status: 'pending', author: userId }
      ]
    } : {
      article: articleId,
      parentComment: { $in: level1CommentIds },
      status
    };
    
    const nestedReplies = await Comment.find(nestedRepliesFilter)
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

    // Check if user is admin
    const user = await User.findById(userId);
    const isAdmin = user?.role === 'admin';

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    
    // Reset status to pending if user is not admin, keep approved if admin
    if (!isAdmin) {
      comment.status = 'pending';
    }

    await comment.save();
    await comment.populate('author', 'name avatar role');

    // Emit real-time event for comment update (only if approved)
    if (global.io && comment.status === 'approved') {
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
    } else if (global.io && comment.status === 'pending') {
      // If comment becomes pending, emit delete event to remove from UI
      global.io.to(`article_${comment.article}`).emit('commentDeleted', {
        commentId: comment._id,
        articleId: comment.article,
        deletedCount: 1
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
   * @param {String} moderationNotes - Optional moderation notes
   * @returns {Promise<Object>} Updated comment
   */
  async moderateComment(commentId, status, moderationNotes) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestError('Trạng thái không hợp lệ');
    }

    const updateData = { status };
    if (moderationNotes) {
      updateData.moderationNotes = moderationNotes;
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      updateData,
      { new: true }
    ).populate('author', 'name avatar role');

    if (!comment) {
      throw new NotFoundError('Không tìm thấy bình luận');
    }

    // Tạo thông báo cho user khi admin duyệt thủ công
    await createModerationNotification(comment, status, moderationNotes);

    // Emit socket.io event để update UI real-time
    if (global.io) {
      // Nếu approved, emit commentStatusUpdated để hiển thị comment
      if (status === 'approved') {
        global.io.to(`article_${comment.article}`).emit('commentStatusUpdated', {
          commentId: comment._id,
          status: comment.status,
          articleId: comment.article
        });
      }

      // Notify to user về kết quả
      global.io.to(`user_${comment.author._id}`).emit('commentModerated', {
        commentId: comment._id,
        status: comment.status,
        moderationNotes: comment.moderationNotes
      });
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
  },

  /**
   * Submit comment to n8n for AI moderation
   * Client gọi API này sau khi tạo/sửa comment
   * @param {String} commentId - Comment ID
   * @returns {Promise<Object>} Submission result
   */
  async submitCommentModeration(commentId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new NotFoundError('Không tìm thấy bình luận');
    }

    // Only submit pending comments
    if (comment.status !== 'pending') {
      throw new BadRequestError('Bình luận này không cần kiểm duyệt');
    }

    // Import n8n service dynamically to avoid circular dependency
    const { submitCommentModeration } = await import('./n8n.service.js');

    try {
      // Gọi n8n và đợi kết quả (synchronous)
      const result = await submitCommentModeration(commentId, comment.content);
      
      return {
        message: 'Đã gửi bình luận để kiểm duyệt',
        result
      };
    } catch (error) {
      console.error('[Comment] Failed to submit moderation:', error.message);
      throw new BadRequestError('Không thể gửi bình luận để kiểm duyệt. Vui lòng thử lại.');
    }
  },

  /**
   * Handle n8n callback after AI moderation
   * N8n sẽ gọi endpoint này sau khi xử lý xong
   * @param {String} commentId - Comment ID
   * @param {String} status - New status (approved/rejected/pending)
   * @param {String} moderationNotes - AI moderation notes
   * @returns {Promise<Object>} Updated comment
   */
  async handleN8nCallback(commentId, status, moderationNotes) {
    console.log(`[N8N Callback] Received: commentId=${commentId}, status=${status}, moderationNotes=${moderationNotes}`);
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      throw new BadRequestError('Trạng thái không hợp lệ');
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        status, 
        moderationNotes 
      },
      { new: true }
    ).populate('author', 'name avatar role');

    if (!comment) {
      throw new NotFoundError('Không tìm thấy bình luận');
    }

    console.log(`[N8N Callback] Updated comment: ${comment._id}, author: ${comment.author._id}, status: ${status}`);

    // Tạo thông báo cho user (chỉ khi approved hoặc rejected)
    if (status === 'approved' || status === 'rejected') {
      console.log(`[N8N Callback] Creating notification for status: ${status}`);
      await createModerationNotification(comment, status, moderationNotes);
    } else {
      console.log(`[N8N Callback] Skipping notification for status: ${status} (not approved/rejected)`);
    }

    // Emit socket.io event để update UI real-time
    if (global.io) {
      // Notify to article room
      global.io.to(`article_${comment.article}`).emit('commentStatusUpdated', {
        commentId: comment._id,
        status: comment.status,
        articleId: comment.article
      });

      // Notify to user (use only userId as room name)
      const authorId = comment.author._id || comment.author;
      global.io.to(authorId.toString()).emit('commentModerated', {
        commentId: comment._id,
        status: comment.status,
        moderationNotes: comment.moderationNotes
      });
    }

    console.log(`[N8N Callback] Comment ${commentId} status updated to ${status}`);

    return comment;
  }
};
