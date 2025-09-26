import React from 'react'
import { Nav } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    {
      path: '/dashboard',
      icon: 'bi-speedometer2',
      label: 'Dashboard',
    },
    {
      path: '/users',
      icon: 'bi-people',
      label: 'Quản lý người dùng',
    },
    {
      path: '/products',
      icon: 'bi-box-seam',
      label: 'Quản lý sản phẩm',
    },
    {
      path: '/orders',
      icon: 'bi-cart-check',
      label: 'Quản lý đơn hàng',
    },
    {
      path: '/notifications',
      icon: 'bi-bell',
      label: 'Thông báo',
    },
    {
      path: '/coupons',
      icon: 'bi-ticket-perforated',
      label: 'Mã giảm giá',
    },
    {
      path: '/loyalty-points',
      icon: 'bi-star',
      label: 'Điểm thưởng',
    },
    {
      path: '/settings',
      icon: 'bi-gear',
      label: 'Cài đặt',
    },
  ]

  return (
    <div className="admin-sidebar bg-light">
      <Nav className="flex-column p-3">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`sidebar-link d-flex align-items-center py-3 px-3 mb-1 rounded ${
              location.pathname === item.path ? 'active' : ''
            }`}
          >
            <i className={`bi ${item.icon} me-3`}></i>
            <span>{item.label}</span>
          </Nav.Link>
        ))}
      </Nav>
    </div>
  )
}

export default Sidebar