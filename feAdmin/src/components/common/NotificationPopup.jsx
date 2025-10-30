import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Badge } from 'react-bootstrap';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../../redux/slices/notificationsSlice';
import { fetchOrderDetail } from '../../redux/slices/ordersSlice';
import { toast } from 'react-toastify';

const NotificationPopup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useSelector(state => state.notifications);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap();
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (error) {
      toast.error('Không thể đánh dấu tất cả đã đọc');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      toast.success('Đã xóa thông báo');
    } catch (error) {
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('Notification clicked:', notification);
    
    // Mark as read if not already
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.type === 'order') {
      dispatch(fetchOrderDetail(notification.referenceId));
      navigate(`/orders/${notification.referenceId}`);
    } else if (notification.type === 'article' && notification.articleId) {
      // Điều hướng đến trang chi tiết bài viết với highlight
      const articleId = typeof notification.articleId === 'object' 
        ? notification.articleId._id 
        : notification.articleId;
      
      // Truyền thông tin highlight qua query params
      const params = new URLSearchParams();
      if (notification.subType && notification.referenceId) {
        console.log('Adding highlight params:', {
          subType: notification.subType,
          commentId: notification.referenceId
        });
        params.set('highlight', notification.subType); // 'like', 'comment', 'reply'
        params.set('commentId', notification.referenceId);
      }
      
      const url = `/articles/view/${articleId}${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      console.log('Navigating to:', url);
      navigate(url);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <Dropdown ref={dropdownRef} className="notification-dropdown">
      <Dropdown.Toggle variant="link" className="position-relative p-0">
        <i className="bi bi-bell text-white fs-5"></i>
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="notification-menu">
        <div className="notification-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="mb-0">Thông báo</h6>
          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-bell-slash fs-2 mb-2"></i>
              <p className="mb-0">Không có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Dropdown.Item
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="d-flex">
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-1 notification-title">
                        {notification.title}
                      </h6>
                      <small className="text-muted">
                        {formatTimeAgo(notification.createdAt)}
                      </small>
                    </div>
                    <p className="mb-1 notification-message text-truncate">
                      {notification.message}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {
                          notification.type === 'order' ? 'Đơn hàng' :
                          notification.type === 'article' ? 'Bài viết' :
                          notification.type === 'user' ? 'Người dùng' :
                          notification.type === 'product' ? 'Sản phẩm' :
                          notification.type === 'loyalty' ? 'Tích điểm' :
                          notification.type === 'system' ? 'Hệ thống' : 'Khác'
                        }
                      </small>
                      {!notification.isRead && (
                        <span className="badge bg-primary">Mới</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification._id);
                    }}
                    title="Xóa thông báo"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="notification-footer p-2 border-top">
            <button
              className="btn btn-sm btn-link w-100"
              onClick={() => navigate('/notifications')}
            >
              Xem tất cả thông báo
            </button>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationPopup;
