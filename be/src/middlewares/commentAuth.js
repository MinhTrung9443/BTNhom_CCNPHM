import Comment from '../models/Comment.js';
import { NotFoundError, UnauthorizedError } from '../utils/AppError.js';

/**
 * Middleware to verify comment ownership
 * Allows the comment author or admin to proceed
 */
const verifyCommentOwnership = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Find the comment
    const comment = await Comment.findById(commentId).select('author').lean();

    if (!comment) {
      return next(new NotFoundError('Không tìm thấy bình luận'));
    }

    // Check if user is the author or admin
    const isOwner = comment.author.toString() === userId;

    if (!isOwner && !isAdmin) {
      return next(
        new UnauthorizedError('Bạn không có quyền thực hiện hành động này với bình luận này')
      );
    }

    // Attach comment info to request for potential use in controller
    req.comment = comment;
    req.isCommentOwner = isOwner;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify comment ownership (owner only, not admin)
 * Used for operations that should only be done by the original author
 */
const verifyCommentOwnerOnly = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id.toString();

    // Find the comment
    const comment = await Comment.findById(commentId).select('author').lean();

    if (!comment) {
      return next(new NotFoundError('Không tìm thấy bình luận'));
    }

    // Check if user is the author
    const isOwner = comment.author.toString() === userId;

    if (!isOwner) {
      return next(
        new UnauthorizedError('Chỉ tác giả của bình luận mới có thể thực hiện hành động này')
      );
    }

    // Attach comment info to request
    req.comment = comment;

    next();
  } catch (error) {
    next(error);
  }
};

export { verifyCommentOwnership, verifyCommentOwnerOnly };
