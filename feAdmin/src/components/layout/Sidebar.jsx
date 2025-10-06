import React from "react";
import { Nav, Badge } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useChatContext } from "../../contexts/ChatContext";

const Sidebar = () => {
  const location = useLocation();
  const { getTotalUnreadCount } = useChatContext();

  const menuItems = [
    { path: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { path: "/users", icon: "bi-people", label: "Quản lý người dùng" },
    { path: "/products", icon: "bi-box-seam", label: "Quản lý sản phẩm" },
    { path: "/categories", icon: "bi-tags", label: "Quản lý danh mục" },
    { path: "/deliveries", icon: "bi-truck", label: "Phương thức vận chuyển" },
    { path: "/orders", icon: "bi-cart-check", label: "Quản lý đơn hàng" },
    { path: "/notifications", icon: "bi-bell", label: "Thông báo" },
    { path: "/vouchers", icon: "bi-ticket-perforated", label: "Quản lý voucher" },
    { path: "/chat", icon: "bi-chat-dots", label: "Chat hỗ trợ" },
  ];

  return (
    <div className="admin-sidebar bg-light">
      <Nav className="flex-column p-3">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`sidebar-link d-flex align-items-center py-3 px-3 mb-1 rounded ${location.pathname === item.path ? "active" : ""}`}
          >
            <i className={`bi ${item.icon} me-3`}></i>
            <span>{item.label}</span>
            {item.path === "/chat" && getTotalUnreadCount() > 0 && (
              <Badge bg="danger" className="ms-auto">{getTotalUnreadCount()}</Badge>
            )}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
