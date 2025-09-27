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
    enum: ['order', 'user', 'product', 'system'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type' === 'order' ? 'Order' : 'User' // Dynamic ref based on type
  },
  recipient: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    orderAmount: { type: Number },
    userName: { type: String },
    // Add more metadata as needed
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, referenceId: 1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
