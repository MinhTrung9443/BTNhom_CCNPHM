import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Pagination, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../redux/slices/notificationsSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, pagination, loading, error } = useSelector(state => state.notifications);
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchNotifications({ page, limit: 20 }));
  }, [dispatch, page]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap();
      toast.success('Đã đánh dấu thông báo là đã đọc');
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      toast.error('Không thể đánh dấu tất cả đã đọc');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    setNotificationToDelete(notificationId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteNotification(notificationToDelete)).unwrap();
      toast.success('Đã xóa thông báo');
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    } catch (error) {
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    if (notification.type === 'order') {
      navigate(`/orders/${notification.referenceId}`);
    }
    // Add more navigation logic for other types
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

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Lỗi tải thông báo</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => dispatch(fetchNotifications({ page, limit: 20 }))}>
            Thử lại
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Thông báo</h2>
            <div className="d-flex gap-2">
              <Badge bg="info">{unreadCount} chưa đọc</Badge>
              {unreadCount > 0 && (
                <Button variant="outline-primary" size="sm" onClick={handleMarkAllAsRead} disabled={loading}>
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>
          </div>

          {loading && notifications.length === 0 ? (
            <LoadingSpinner />
          ) : notifications.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <i className="bi bi-bell-slash fs-1 text-muted mb-3"></i>
                <Card.Title>Không có thông báo nào</Card.Title>
                <Card.Text className="text-muted">
                  Bạn chưa có thông báo mới.
                </Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Card className="mb-4">
                <Card.Body className="p-0">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 border-bottom notification-item ${!notification.isRead ? 'unread' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-1 notification-title">{notification.title}</h6>
                            <small className="text-muted">{formatTimeAgo(notification.createdAt)}</small>
                          </div>
                          <p className="mb-2 notification-message">{notification.message}</p>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">
                              Loại: {notification.type === 'order' ? 'Đơn hàng' : 'Khác'}
                            </small>
                            {!notification.isRead && <Badge bg="primary">Mới</Badge>}
                          </div>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification._id);
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>

              <Pagination className="justify-content-center">
                <Pagination.Prev
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1 || loading}
                />
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(num => (
                  <Pagination.Item
                    key={num}
                    active={num === page}
                    onClick={() => setPage(num)}
                    disabled={loading}
                  >
                    {num}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={page === pagination.pages || loading}
                />
              </Pagination>
            </>
          )}
        </Col>
      </Row>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setNotificationToDelete(null);
        }}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        confirmVariant="danger"
        onConfirm={confirmDelete}
      />
    </Container>
  );
};

export default Notifications;
