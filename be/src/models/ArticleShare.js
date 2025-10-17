import mongoose from 'mongoose';

const articleShareSchema = new mongoose.Schema(
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
      default: null,
      index: true
    },
    platform: {
      type: String,
      enum: ['facebook', 'zalo', 'twitter', 'copy'],
      required: true,
      index: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Indexes for analytics and tracking
articleShareSchema.index({ article: 1, platform: 1 });
articleShareSchema.index({ article: 1, createdAt: -1 });
articleShareSchema.index({ user: 1, createdAt: -1 });
articleShareSchema.index({ platform: 1, createdAt: -1 });
articleShareSchema.index({ createdAt: -1 });

const ArticleShare = mongoose.model('ArticleShare', articleShareSchema);
export default ArticleShare;
