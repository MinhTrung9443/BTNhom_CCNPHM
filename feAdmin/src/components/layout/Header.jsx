import React, { useEffect } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Badge,
  Dropdown,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../redux/slices/authSlice";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "../../redux/slices/notificationsSlice";
import { toast } from "react-toastify";
import socketService from '../../services/socketService';

const Header = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { unreadCount, notifications } = useSelector(
    (state) => state.notifications
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 5 })); // Fetch recent notifications for dropdown
  }, [dispatch]);

  useEffect(() => {
  socketService.connect(token);

    // Set callback to refetch notifications on new order
    socketService.setOnNewOrderCallback(() => {
      dispatch(fetchNotifications({ page: 1, limit: 5 }));
    });

    // Join admin room
    socketService.emit('joinRoom', 'admin');

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      navigate("/login");
      toast.success("Đăng xuất thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="admin-header">
      <Container fluid>
        <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
          <i className="bi bi-shop me-2"></i>
          <span className="fw-bold">Admin Dashboard</span>
          <small className="ms-2 text-muted">Đặc Sản Sóc Trăng</small>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Dropdown className="position-relative me-3" align="end">
              <Dropdown.Toggle
                id="notifications-dropdown"
                className="p-0 border-0 bg-transparent text-white"
                style={{ cursor: "pointer" }}
              >
                <i className="bi bi-bell fs-5"></i>
                {unreadCount > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle small"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="notification-dropdown shadow-lg"
                style={{
                  width: "400px",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                <Dropdown.Header className="d-flex justify-content-between align-items-center bg-light">
                  <span className="fw-bold">Thông báo ({unreadCount})</span>
                  <small
                    className="text-primary"
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => navigate("/notifications")}
                  >
                    Xem tất cả
                  </small>
                </Dropdown.Header>

                {notifications.length === 0 ? (
                  <Dropdown.Item className="text-center text-muted py-4">
                    <i className="bi bi-bell-slash fs-3 mb-2"></i>
                    <div>Không có thông báo mới</div>
                  </Dropdown.Item>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <Dropdown.Item
                      key={notification._id}
                      className={`p-3 border-bottom notification-item ${
                        !notification.isRead ? "bg-light" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification._id);
                        }
                        if (notification.type === "order") {
                          navigate(`/orders/${notification.referenceId}`);
                        }
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <strong
                              className={`notification-title ${
                                !notification.isRead ? "text-primary" : ""
                              }`}
                            >
                              {notification.title}
                            </strong>
                            <small className="text-muted">
                              {new Date(notification.createdAt).toLocaleString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </small>
                          </div>
                          <p className="mb-2 small text-muted notification-message">
                            {notification.message}
                          </p>
                          {notification.metadata && (
                            <small className="text-muted">
                              {notification.type === "order" &&
                                `Số tiền: ${notification.metadata.orderAmount?.toLocaleString(
                                  "vi-VN"
                                )} VNĐ`}
                            </small>
                          )}
                        </div>
                        {!notification.isRead && (
                          <div className="ms-2">
                            <i
                              className="bi bi-circle-fill text-primary"
                              style={{ fontSize: "0.5rem" }}
                            ></i>
                          </div>
                        )}
                      </div>
                    </Dropdown.Item>
                  ))
                )}

                {notifications.length > 0 && <Dropdown.Divider />}

                <Dropdown.Item
                  onClick={handleMarkAllAsRead}
                  className="text-center py-2"
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Đánh dấu tất cả đã đọc
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={() => navigate("/notifications")}
                  className="text-center py-2 fw-bold text-primary"
                >
                  Xem tất cả thông báo
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-2"></i>
                  {user?.name || "Admin"}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item href="/settings">
                <i className="bi bi-gear me-2"></i>
                Cài đặt
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>
                Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
