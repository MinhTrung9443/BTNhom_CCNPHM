import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(protect);

// Lấy danh sách thông báo
router.get('/', notificationController.getNotifications);

// Lấy số lượng thông báo chưa đọc
router.get('/unread-count', notificationController.getUnreadCount);

// Đánh dấu một thông báo là đã đọc
router.patch('/:id/read', notificationController.markAsRead);

// Đánh dấu tất cả thông báo là đã đọc
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Xóa một thông báo
router.delete('/:id', notificationController.deleteNotification);

export default router;
