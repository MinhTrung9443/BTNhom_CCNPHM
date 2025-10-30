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

  return notification;
};

/**
 * Tạo message cho thông báo dựa trên số lượng actors
 */
const generateNotificationMessage = async ({ subType, actors, articleTitle, commentContent }) => {
  const actorCount = actors.length;

  // Lấy thông tin 2 actors đầu tiên
  const actorUsers = await User.find({ _id: { $in: actors.slice(0, 2) } })
    .select('name')
    .lean();

  const actorNames = actorUsers.map(u => u.name);

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
    const actor = await User.findById(actorId).select('name').lean();
    if (actor) {
      const adminNotification = await Notification.create({
        title: 'Lượt thích bài viết mới',
        message: `${actor.name} đã thích bài viết "${article.title}" của bạn.`,
        type: 'article',
        subType: 'like',
        referenceId: articleId,
        articleId,
        recipient: 'admin',
        metadata: {
          articleTitle: article.title,
          actorName: actor.name,
        }
      });

      // Gửi thông báo real-time cho admin
      if (global.io) {
        global.io.to('admin').emit('newNotification', {
          notification: adminNotification.toObject()
        });
      }
    }
  }

  // Thông báo cá nhân cho tác giả (giữ nguyên logic cũ)
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
    const actor = await User.findById(actorId).select('name').lean();
    if (actor) {
      const adminNotification = await Notification.create({
        title: 'Bình luận mới',
        message: `${actor.name} đã bình luận về bài viết "${article.title}": "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`,
        type: 'article',
        subType: 'comment',
        referenceId: articleId,
        articleId,
        recipient: 'admin',
        metadata: {
          articleTitle: article.title,
          commentContent,
          actorName: actor.name,
        }
      });

      // Gửi thông báo real-time cho admin
      if (global.io) {
        global.io.to('admin').emit('newNotification', {
          notification: adminNotification.toObject()
        });
      }
    }
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
    const actor = await User.findById(actorId).select('name').lean();
    if (actor) {
      const adminNotification = await Notification.create({
        title: 'Trả lời bình luận mới',
        message: `${actor.name} đã trả lời bình luận của bạn trong bài viết "${parentComment.article.title}": "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`,
        type: 'article',
        subType: 'reply',
        referenceId: parentCommentId,
        articleId: parentComment.article._id,
        recipient: 'admin',
        metadata: {
          articleTitle: parentComment.article.title,
          commentContent,
          actorName: actor.name,
        }
      });

      // Gửi thông báo real-time cho admin
      if (global.io) {
        global.io.to('admin').emit('newNotification', {
          notification: adminNotification.toObject()
        });
      }
    }
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
    const actor = await User.findById(actorId).select('name').lean();
    if (actor) {
      const adminNotification = await Notification.create({
        title: 'Lượt thích bình luận mới',
        message: `${actor.name} đã thích bình luận của bạn trong bài viết "${comment.article.title}".`,
        type: 'article',
        subType: 'like',
        referenceId: commentId,
        articleId: comment.article._id,
        recipient: 'admin',
        metadata: {
          articleTitle: comment.article.title,
          commentContent: comment.content,
          actorName: actor.name,
        }
      });

      // Gửi thông báo real-time cho admin
      if (global.io) {
        global.io.to('admin').emit('newNotification', {
          notification: adminNotification.toObject()
        });
      }
    }
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
 * Xóa actor khỏi thông báo khi unlike
 */
const removeActorFromNotification = async (referenceId, actorId, subType) => {
  const notification = await Notification.findOne({
    type: 'article',
    subType,
    referenceId
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

export default {
  handleArticleLike,
  handleArticleComment,
  handleCommentReply,
  handleCommentLike,
  removeActorFromNotification
};
