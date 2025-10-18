import mongoose from 'mongoose';

const articleShareSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Not required, as anonymous users can share
    },
    platform: {
      type: String,
      required: true,
      enum: ['facebook', 'twitter', 'zalo', 'copy'],
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

articleShareSchema.index({ article: 1, user: 1, platform: 1 });

const ArticleShare = mongoose.model('ArticleShare', articleShareSchema);

export default ArticleShare;
