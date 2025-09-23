import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activePromotions: 0
  });

  useEffect(() => {
    // Fetch dashboard statistics
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // This would be replaced with actual API calls
      setStats({
        totalProducts: 150,
        totalOrders: 1250,
        totalCustomers: 890,
        totalRevenue: 250000000,
        pendingOrders: 25,
        activePromotions: 8
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const adminFeatures = [
    {
      title: 'Quản lý sản phẩm',
      description: 'Thêm, sửa, xóa và quản lý sản phẩm',
      icon: 'fas fa-box',
      path: '/admin/products',
      color: 'primary'
    },
    {
      title: 'Quản lý đơn hàng',
      description: 'Xem và xử lý đơn hàng của khách hàng',
      icon: 'fas fa-shopping-cart',
      path: '/admin/orders',
      color: 'success'
    },
    {
      title: 'Quản lý phương thức vận chuyển',
      description: 'Cấu hình các phương thức giao hàng',
      icon: 'fas fa-truck',
      path: '/admin/delivery',
      color: 'info'
    },
    {
      title: 'Quản lý khách hàng',
      description: 'Xem thông tin và quản lý khách hàng',
      icon: 'fas fa-users',
      path: '/admin/customers',
      color: 'warning'
    },
    {
      title: 'Quản lý khuyến mãi',
      description: 'Tạo và quản lý mã giảm giá, khuyến mãi',
      icon: 'fas fa-tags',
      path: '/admin/promotions',
      color: 'danger'
    },
    {
      title: 'Báo cáo doanh thu',
      description: 'Xem thống kê và báo cáo doanh thu',
      icon: 'fas fa-chart-line',
      path: '/admin/reports',
      color: 'secondary'
    }
  ];

  return (
    <Container fluid className="admin-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 className="admin-title">
            <i className="fas fa-tachometer-alt me-2"></i>
            Bảng điều khiển quản trị
          </h2>
          <p className="text-muted">Chào mừng, {user?.name}! Đây là trung tâm quản lý cửa hàng của bạn.</p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Tổng sản phẩm</h6>
                  <h3 className="text-primary">{stats.totalProducts}</h3>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-box text-primary"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Tổng đơn hàng</h6>
                  <h3 className="text-success">{stats.totalOrders}</h3>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-shopping-cart text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Khách hàng</h6>
                  <h3 className="text-info">{stats.totalCustomers}</h3>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-users text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Doanh thu</h6>
                  <h3 className="text-warning">{formatCurrency(stats.totalRevenue)}</h3>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-dollar-sign text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="quick-actions-card">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-tasks me-2"></i>
                Hành động nhanh
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Button variant="primary" size="sm" as={Link} to="/admin/products/new">
                  <i className="fas fa-plus me-1"></i>
                  Thêm sản phẩm
                </Button>
                <Button variant="success" size="sm" as={Link} to="/admin/promotions/new">
                  <i className="fas fa-tags me-1"></i>
                  Tạo khuyến mãi
                </Button>
                <Button variant="info" size="sm" as={Link} to="/admin/reports">
                  <i className="fas fa-chart-bar me-1"></i>
                  Xem báo cáo
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card className="alerts-card">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Cảnh báo
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="alert-item">
                <Badge bg="warning" className="me-2">!</Badge>
                Có {stats.pendingOrders} đơn hàng đang chờ xử lý
              </div>
              <div className="alert-item">
                <Badge bg="info" className="me-2">i</Badge>
                {stats.activePromotions} chương trình khuyến mãi đang hoạt động
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Admin Features Grid */}
      <Row>
        {adminFeatures.map((feature, index) => (
          <Col md={4} sm={6} className="mb-4" key={index}>
            <Card className="feature-card h-100">
              <Card.Body className="text-center">
                <div className={`feature-icon mb-3 ${feature.color}`}>
                  <i className={feature.icon}></i>
                </div>
                <h5 className="feature-title">{feature.title}</h5>
                <p className="feature-description text-muted">{feature.description}</p>
                <Button
                  variant={feature.color}
                  as={Link}
                  to={feature.path}
                  className="w-100"
                >
                  Truy cập
                  <i className="fas fa-arrow-right ms-2"></i>
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminDashboard;
