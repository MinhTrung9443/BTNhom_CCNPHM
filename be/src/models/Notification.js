import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['order', 'user', 'product', 'system', 'loyalty', 'article'],
    required: true
  },
  subType: {
    type: String,
    enum: ['like', 'comment', 'reply', 'status_update', 'new_order', 'cancellation', 'return_request'],
    required: function() {
      return this.type === 'article' || this.type === 'order';
    }
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  actors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  recipient: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin',
    required: true
  },
  userId: {type : mongoose.Schema.Types.ObjectId, ref : 'User'},
  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedModel: {
    type: String,
    enum: ['Comment', 'Article', 'Order', 'User', 'Product']
  },
  link: {
    type: String
  },
  metadata: {
    orderAmount: { type: Number },
    userName: { type: String },
    articleTitle: { type: String },
    commentContent: { type: String },
    actorCount: { type: Number }
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, referenceId: 1 });
notificationSchema.index({ type: 1, subType: 1, referenceId: 1, recipientUserId: 1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });

// Prevent duplicate notifications for the same event
// For comment moderation, we only want one notification per comment per user
notificationSchema.index(
  { 
    type: 1, 
    subType: 1, 
    referenceId: 1, 
    recipientUserId: 1 
  }, 
  { 
    unique: true, 
    partialFilterExpression: { 
      type: 'article',
      subType: 'status_update'
    } 
  }
);

export default mongoose.model('Notification', notificationSchema);
