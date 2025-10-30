import Notification from '../models/Notification.js';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { NotFoundError } from '../utils/AppError.js';

/**
 * Tạo hoặc cập nhật thông báo cho bài viết
 * @param {Object} params - Tham số
 * @param {String} params.subType - Loại thông báo: 'like', 'comment', 'reply'
 * @param {String} params.actorId - ID người thực hiện hành động
 * @param {String} params.recipientUserId - ID người nhận thông báo
 * @param {String} params.articleId - ID bài viết
 * @param {String} params.referenceId - ID tham chiếu (articleId hoặc commentId)
 * @param {String} params.commentContent - Nội dung comment (nếu có)
 */
const createOrUpdateArticleNotification = async ({
  subType,
  actorId,
  recipientUserId,
  articleId,
  referenceId,
  commentContent = null
}) => {
  // Không tạo thông báo nếu người thực hiện là chính người nhận
  if (actorId.toString() === recipientUserId.toString()) {
    return null;
  }

  // Lấy thông tin bài viết
  const article = await Article.findById(articleId).select('title').lean();
  if (!article) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }

  // Tìm thông báo hiện có (cùng type, subType, referenceId và recipient)
  let notification = await Notification.findOne({
    type: 'article',
    subType,
    referenceId,
    recipientUserId
  });

  if (notification) {
    // Cập nhật thông báo hiện có
    // Thêm actor mới nếu chưa có trong danh sách
    if (!notification.actors.some(id => id.toString() === actorId.toString())) {
      notification.actors.push(actorId);
      notification.metadata.actorCount = notification.actors.length;
    }

    // Đánh dấu là chưa đọc
    notification.isRead = false;
    notification.updatedAt = new Date();

    // Cập nhật message
    notification.message = await generateNotificationMessage({
      subType,
      actors: notification.actors,
      articleTitle: article.title,
      commentContent
    });

    await notification.save();
  } else {
    // Tạo thông báo mới
    const message = await generateNotificationMessage({
      subType,
      actors: [actorId],
      articleTitle: article.title,
      commentContent
    });

    notification = await Notification.create({
      title: getNotificationTitle(subType),
      message,
      type: 'article',
      subType,
      referenceId,
      articleId,
      actors: [actorId],
      recipient: 'user',
      recipientUserId,
      isRead: false,
      metadata: {
        articleTitle: article.title,
        commentContent,
        actorCount: 1
      }
    });
  }

  // Populate thông tin actors để gửi qua socket
  await notification.populate('actors', 'name avatar');
  await notification.populate('articleId', 'title slug');

  // Emit real-time notification to user
  if (global.io && recipientUserId) {
    // Get unread count for user
    const unreadCount = await Notification.countDocuments({
      recipientUserId,
      isRead: false
    });

    const userSocketId = recipientUserId.toString();
    
    console.log(`[ArticleNotification] Emitting notification to user ${userSocketId}, unreadCount: ${unreadCount}`);
    
    global.io.to(userSocketId).emit('newNotification', {
      notification: notification.toObject(),
      unreadCount
    });
    
    console.log(`[ArticleNotification] Successfully emitted notification to user ${userSocketId}`);
  } else {
    console.log(`[ArticleNotification] Cannot emit notification - io available: ${!!global.io}, recipientUserId: ${recipientUserId}`);
  }

  return notification;
};

/**
 * Tạo message cho thông báo dựa trên số lượng actors
 */
const generateNotificationMessage = async ({ subType, actors, articleTitle, commentContent }) => {
  const actorCount = actors.length;

  // Lấy thông tin 2 actors mới nhất (2 người cuối cùng trong mảng)
  const recentActorIds = actors.slice(-2);
  const actorUsers = await User.find({ _id: { $in: recentActorIds } })
    .select('name')
    .lean();

  // Đảo thứ tự để hiển thị người mới nhất trước
  const actorNames = recentActorIds.reverse().map(actorId => {
    const user = actorUsers.find(u => u._id.toString() === actorId.toString());
    return user?.name || 'Người dùng';
  });

  let message = '';

  if (actorCount === 1) {
    // "A đã thích bài viết của bạn"
    message = `${actorNames[0]} `;
  } else if (actorCount === 2) {
    // "A, B đã thích bài viết của bạn"
    message = `${actorNames[0]}, ${actorNames[1]} `;
  } else {
    // "A, B và n người khác đã thích bài viết của bạn"
    message = `${actorNames[0]}, ${actorNames[1]} và ${actorCount - 2} người khác `;
  }

  // Thêm hành động
  switch (subType) {
    case 'like':
      message += `đã thích bài viết "${articleTitle}"`;
      break;
    case 'comment':
      message += `đã bình luận về bài viết "${articleTitle}"`;
      if (commentContent && actorCount === 1) {
        message += `: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`;
      }
      break;
    case 'reply':
      message += `đã trả lời bình luận của bạn trong bài viết "${articleTitle}"`;
      if (commentContent && actorCount === 1) {
        message += `: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`;
      }
      break;
  }

  return message;
};

/**
 * Lấy tiêu đề thông báo
 */
const getNotificationTitle = (subType) => {
  switch (subType) {
    case 'like':
      return 'Lượt thích mới';
    case 'comment':
      return 'Bình luận mới';
    case 'reply':
      return 'Trả lời mới';
    default:
      return 'Thông báo mới';
  }
};

/**
 * Tạo hoặc cập nhật thông báo cho admin
 * @param {Object} params - Tham số
 * @param {String} params.subType - Loại thông báo: 'like', 'comment', 'reply'
 * @param {String} params.actorId - ID người thực hiện hành động
 * @param {String} params.articleId - ID bài viết
 * @param {String} params.referenceId - ID tham chiếu (articleId hoặc commentId)
 * @param {String} params.commentContent - Nội dung comment (nếu có)
 */
const createOrUpdateAdminNotification = async ({
  subType,
  actorId,
  articleId,
  referenceId,
  commentContent = null
}) => {
  // Lấy thông tin bài viết
  const article = await Article.findById(articleId).select('title').lean();
  if (!article) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }

  // Tìm thông báo hiện có (cùng type, subType, referenceId và recipient='admin')
  let notification = await Notification.findOne({
    type: 'article',
    subType,
    referenceId,
    recipient: 'admin'
  });

  if (notification) {
    // Cập nhật thông báo hiện có
    // Thêm actor mới nếu chưa có trong danh sách
    if (!notification.actors.some(id => id.toString() === actorId.toString())) {
      notification.actors.push(actorId);
      notification.metadata.actorCount = notification.actors.length;
    }

    // Đánh dấu là chưa đọc (quan trọng!)
    notification.isRead = false;
    notification.updatedAt = new Date();

    // Cập nhật message
    notification.message = await generateNotificationMessage({
      subType,
      actors: notification.actors,
      articleTitle: article.title,
      commentContent
    });

    await notification.save();
  } else {
    // Tạo thông báo mới
    const message = await generateNotificationMessage({
      subType,
      actors: [actorId],
      articleTitle: article.title,
      commentContent
    });

    notification = await Notification.create({
      title: getNotificationTitle(subType),
      message,
      type: 'article',
      subType,
      referenceId,
      articleId,
      actors: [actorId],
      recipient: 'admin',
      isRead: false,
      metadata: {
        articleTitle: article.title,
        commentContent,
        actorCount: 1
      }
    });
  }

  // Populate thông tin actors để gửi qua socket
  await notification.populate('actors', 'name avatar');
  await notification.populate('articleId', 'title slug');

  // Emit real-time notification to admin
  if (global.io) {
    // Get unread count for admin
    const unreadCount = await Notification.countDocuments({
      recipient: 'admin',
      isRead: false
    });
    
    console.log(`[ArticleNotification] Emitting notification to admin, unreadCount: ${unreadCount}`);
    
    global.io.to('admin').emit('newNotification', {
      notification: notification.toObject(),
      unreadCount
    });
    
    console.log(`[ArticleNotification] Successfully emitted notification to admin`);
  }

  return notification;
};

/**
 * Xử lý thông báo khi có người like bài viết
 */
const handleArticleLike = async (articleId, actorId) => {
  const article = await Article.findById(articleId)
    .select('author title')
    .populate('author', 'role name')
    .lean();

  if (!article || !article.author) return null;

  // Nếu tác giả là admin và người like không phải chính tác giả
  if (article.author.role === 'admin' && article.author._id.toString() !== actorId.toString()) {
    // Sử dụng aggregated notification cho admin
    await createOrUpdateAdminNotification({
      subType: 'like',
      actorId,
      articleId,
      referenceId: articleId
    });
  }

  // Thông báo cá nhân cho tác giả
  return await createOrUpdateArticleNotification({
    subType: 'like',
    actorId,
    recipientUserId: article.author._id,
    articleId,
    referenceId: articleId
  });
};

/**
 * Xử lý thông báo khi có người comment bài viết
 */
const handleArticleComment = async (articleId, commentId, actorId, commentContent) => {
  const article = await Article.findById(articleId)
    .select('author title')
    .populate('author', 'role name')
    .lean();

  if (!article || !article.author) return null;

  // Nếu tác giả là admin và người comment không phải chính tác giả
  if (article.author.role === 'admin' && article.author._id.toString() !== actorId.toString()) {
    // Sử dụng aggregated notification cho admin
    await createOrUpdateAdminNotification({
      subType: 'comment',
      actorId,
      articleId,
      referenceId: articleId,
      commentContent
    });
  }

  // Thông báo cá nhân cho tác giả
  return await createOrUpdateArticleNotification({
    subType: 'comment',
    actorId,
    recipientUserId: article.author._id,
    articleId,
    referenceId: articleId,
    commentContent
  });
};

/**
 * Xử lý thông báo khi có người reply comment
 */
const handleCommentReply = async (parentCommentId, replyCommentId, actorId, commentContent) => {
  const parentComment = await Comment.findById(parentCommentId)
    .select('author article')
    .populate('author', 'role name')
    .populate('article', 'title')
    .lean();

  if (!parentComment || !parentComment.author) return null;

  // Nếu người nhận reply là admin và người reply không phải chính họ
  if (parentComment.author.role === 'admin' && parentComment.author._id.toString() !== actorId.toString()) {
    // Sử dụng aggregated notification cho admin
    await createOrUpdateAdminNotification({
      subType: 'reply',
      actorId,
      articleId: parentComment.article._id,
      referenceId: parentCommentId,
      commentContent
    });
  }

  // Thông báo cá nhân cho người nhận reply
  return await createOrUpdateArticleNotification({
    subType: 'reply',
    actorId,
    recipientUserId: parentComment.author._id,
    articleId: parentComment.article._id,
    referenceId: parentCommentId,
    commentContent
  });
};

/**
 * Xử lý thông báo khi có người like comment
 */
const handleCommentLike = async (commentId, actorId) => {
  const comment = await Comment.findById(commentId)
    .select('author article content')
    .populate('author', 'role name')
    .populate('article', 'title')
    .lean();

  if (!comment || !comment.author) return null;

  // Nếu chủ comment là admin và người like không phải chính họ
  if (comment.author.role === 'admin' && comment.author._id.toString() !== actorId.toString()) {
    // Sử dụng aggregated notification cho admin
    await createOrUpdateAdminNotification({
      subType: 'like',
      actorId,
      articleId: comment.article._id,
      referenceId: commentId,
      commentContent: comment.content
    });
  }

  // Thông báo cá nhân cho chủ comment
  return await createOrUpdateArticleNotification({
    subType: 'like',
    actorId,
    recipientUserId: comment.author._id,
    articleId: comment.article._id,
    referenceId: commentId,
    commentContent: comment.content
  });
};

/**
 * Xóa actor khỏi thông báo khi unlike (cho user notifications)
 */
const removeActorFromNotification = async (referenceId, actorId, subType) => {
  const notification = await Notification.findOne({
    type: 'article',
    subType,
    referenceId,
    recipient: 'user'
  });

  if (!notification) return null;

  // Xóa actor khỏi danh sách
  notification.actors = notification.actors.filter(
    id => id.toString() !== actorId.toString()
  );

  // Nếu không còn actor nào, xóa thông báo
  if (notification.actors.length === 0) {
    await notification.deleteOne();
    return null;
  }

  // Cập nhật lại message và metadata
  notification.metadata.actorCount = notification.actors.length;

  const article = await Article.findById(notification.articleId).select('title').lean();
  const comment = await Comment.findById(referenceId).select('content').lean();

  notification.message = await generateNotificationMessage({
    subType,
    actors: notification.actors,
    articleTitle: article?.title || '',
    commentContent: comment?.content
  });

  await notification.save();
  await notification.populate('actors', 'name avatar');

  return notification;
};

/**
 * Xóa actor khỏi thông báo admin khi unlike
 */
const removeActorFromAdminNotification = async (referenceId, actorId, subType) => {
  const notification = await Notification.findOne({
    type: 'article',
    subType,
    referenceId,
    recipient: 'admin'
  });

  if (!notification) return null;

  // Xóa actor khỏi danh sách
  notification.actors = notification.actors.filter(
    id => id.toString() !== actorId.toString()
  );

  // Nếu không còn actor nào, xóa thông báo
  if (notification.actors.length === 0) {
    await notification.deleteOne();
    
    // Emit real-time update to admin
    if (global.io) {
      const unreadCount = await Notification.countDocuments({
        recipient: 'admin',
        isRead: false
      });
      
      global.io.to('admin').emit('notificationDeleted', {
        notificationId: notification._id,
        unreadCount
      });
    }
    
    return null;
  }

  // Cập nhật lại message và metadata
  notification.metadata.actorCount = notification.actors.length;

  const article = await Article.findById(notification.articleId).select('title').lean();
  const comment = await Comment.findById(referenceId).select('content').lean();

  notification.message = await generateNotificationMessage({
    subType,
    actors: notification.actors,
    articleTitle: article?.title || '',
    commentContent: comment?.content
  });

  await notification.save();
  await notification.populate('actors', 'name avatar');
  
  // Emit real-time update to admin
  if (global.io) {
    const unreadCount = await Notification.countDocuments({
      recipient: 'admin',
      isRead: false
    });
    
    global.io.to('admin').emit('notificationUpdated', {
      notification: notification.toObject(),
      unreadCount
    });
  }

  return notification;
};

export default {
  handleArticleLike,
  handleArticleComment,
  handleCommentReply,
  handleCommentLike,
  removeActorFromNotification,
  removeActorFromAdminNotification
};
