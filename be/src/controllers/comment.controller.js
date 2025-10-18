import { commentService } from '../services/comment.service.js';

export const commentController = {
  createComment: async (req, res, next) => {
    try {
      const { content, parentCommentId } = req.body;
      const articleId = req.params.id;

      const comment = await commentService.createComment(
        {
          article: articleId,
          content,
          parentComment: parentCommentId,
        },
        req.user._id
      );
      res.status(201).json({
        success: true,
        message: 'Bình luận đã được tạo thành công',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  getArticleComments: async (req, res, next) => {
    try {
      const result = await commentService.getArticleComments(
        req.params.id,
        req.query,
        req.user?._id
      );
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách bình luận thành công',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  updateComment: async (req, res, next) => {
    try {
      const comment = await commentService.updateComment(
        req.params.commentId,
        req.body.content,
        req.user._id
      );
      res.status(200).json({
        success: true,
        message: 'Bình luận đã được cập nhật',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteComment: async (req, res, next) => {
    try {
      const result = await commentService.deleteComment(
        req.params.commentId,
        req.user._id,
        req.user.role === 'admin'
      );
      res.status(200).json({
        success: true,
        message: 'Xóa bình luận thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  toggleCommentLike: async (req, res, next) => {
    try {
      const result = await commentService.toggleCommentLike(
        req.params.commentId,
        req.user._id
      );
      res.status(200).json({
        success: true,
        message: result.liked ? 'Thích bình luận thành công' : 'Bỏ thích bình luận thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getCommentsForModeration: async (req, res, next) => {
    try {
      const result = await commentService.getCommentsForModeration(req.query);
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách bình luận cần kiểm duyệt thành công',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  moderateComment: async (req, res, next) => {
    try {
      const comment = await commentService.moderateComment(
        req.params.commentId,
        req.body.status
      );
      res.status(200).json({
        success: true,
        message: 'Kiểm duyệt bình luận thành công',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  bulkModerateComments: async (req, res, next) => {
    try {
      const result = await commentService.bulkModerateComments(
        req.body.commentIds,
        req.body.status
      );
      res.status(200).json({
        success: true,
        message: 'Kiểm duyệt hàng loạt thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};