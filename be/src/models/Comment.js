import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

// Indexes for better performance
commentSchema.index({ article: 1, status: 1, createdAt: -1 });
commentSchema.index({ article: 1, parentComment: 1, status: 1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ createdAt: -1 });

// Validate nesting level before save
commentSchema.pre('save', async function(next) {
  try {
    if (this.parentComment) {
      const parentComment = await this.constructor.findById(this.parentComment);
      
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }

      // Set level based on parent level
      this.level = parentComment.level + 1;

      // Validate max nesting level (0, 1, 2 = 3 levels)
      if (this.level > 2) {
        throw new Error('Maximum comment nesting level (3 levels) exceeded');
      }

      // Ensure parent and child belong to same article
      if (parentComment.article.toString() !== this.article.toString()) {
        throw new Error('Parent comment belongs to different article');
      }
    } else {
      this.level = 0;
    }

    // Set editedAt when content is modified
    if (this.isModified('content') && !this.isNew) {
      this.isEdited = true;
      this.editedAt = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
