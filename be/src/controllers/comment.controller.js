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
        req.body.status,
        req.body.moderationNotes
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

  submitCommentModeration: async (req, res, next) => {
    try {
      const result = await commentService.submitCommentModeration(
        req.params.commentId
      );
      res.status(200).json({
        success: true,
        message: 'Đã gửi bình luận để kiểm duyệt',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  handleN8nCallback: async (req, res, next) => {
    try {

      const { commentId, status, moderationNote, moderationNotes } = req.body;
      
      // Validate required fields
      if (!commentId) {
        console.error('[N8N Callback Controller] Missing commentId in request body');
        return res.status(400).json({
          success: false,
          message: 'Thiếu commentId'
        });
      }
      
      if (!status) {
        console.error('[N8N Callback Controller] Missing status in request body');
        return res.status(400).json({
          success: false,
          message: 'Thiếu status'
        });
      }
      
      console.log(`[N8N Callback Controller] Processing: commentId=${commentId}, status=${status}`);
      
      // Support both moderationNote and moderationNotes for compatibility
      const notes = moderationNotes || moderationNote;
      
      const comment = await commentService.handleN8nCallback(
        commentId,
        status,
        notes
      );
      
      console.log(`[N8N Callback Controller] Successfully processed comment ${commentId}`);
      
      res.status(200).json({
        success: true,
        message: 'Đã cập nhật kết quả kiểm duyệt',
        data: comment,
      });
    } catch (error) {
      console.error('[N8N Callback Controller] Error:', error.message);
      console.error('[N8N Callback Controller] Stack:', error.stack);
      next(error);
    }
  },
};