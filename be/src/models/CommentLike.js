import mongoose from 'mongoose';

const commentLikeSchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate likes
commentLikeSchema.index({ comment: 1, user: 1 }, { unique: true });

// Index for querying user's liked comments
commentLikeSchema.index({ user: 1, createdAt: -1 });

// Index for querying comment's likes
commentLikeSchema.index({ comment: 1, createdAt: -1 });

const CommentLike = mongoose.model('CommentLike', commentLikeSchema);
export default CommentLike;
