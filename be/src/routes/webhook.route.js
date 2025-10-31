import express from 'express';
import { commentController } from '../controllers/comment.controller.js';

const router = express.Router();

// N8n callback webhook for comment moderation result
// This endpoint is called by n8n after AI processing
router.post('/n8n/comment-result', commentController.handleN8nCallback);

// Test endpoint for debugging notifications
router.post('/test-notification', async (req, res) => {
  const { userId, title, message } = req.body;
  
  console.log('[Test] Sending test notification to user:', userId);
  
  if (global.io) {
    const roomName = userId.toString();
    
    // Create a test notification object
    const testNotification = {
      _id: new Date().getTime().toString(),
      recipientUserId: userId,
      type: 'article',
      subType: 'status_update',
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('[Test] Emitting to room:', roomName);
    global.io.to(roomName).emit('newNotification', {
      notification: testNotification,
      unreadCount: 1
    });
    
    console.log('[Test] Emitted test notification');
    res.json({ success: true, message: 'Test notification sent', roomName });
  } else {
    console.error('[Test] global.io not available');
    res.status(500).json({ success: false, message: 'Socket.io not available' });
  }
});

export default router;
