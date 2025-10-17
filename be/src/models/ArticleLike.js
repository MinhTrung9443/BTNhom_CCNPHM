import mongoose from 'mongoose';

const articleLikeSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
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
articleLikeSchema.index({ article: 1, user: 1 }, { unique: true });

// Index for querying user's liked articles
articleLikeSchema.index({ user: 1, createdAt: -1 });

// Index for querying article's likes
articleLikeSchema.index({ article: 1, createdAt: -1 });

const ArticleLike = mongoose.model('ArticleLike', articleLikeSchema);
export default ArticleLike;
