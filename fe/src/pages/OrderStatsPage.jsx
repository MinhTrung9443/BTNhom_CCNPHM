import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserOrderStats } from '../services/orderService';
import { setOrderStats } from '../redux/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import styles from './OrderStatsPage.module.css';

const OrderStatsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { orders } = useSelector((state) => state.order);
  const { stats } = orders;
  
  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getUserOrderStats();
      dispatch(setOrderStats(response.data));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching stats';
      setError({ message: errorMessage });
      toast.error(errorMessage);
      console.error('Failed to fetch order stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatConfig = (status) => {
    switch (status) {
      case 'new':
        return { 
          title: 'Chờ xác nhận', 
          color: 'warning', 
          icon: '📝',
          description: 'Đơn hàng mới tạo' 
        };
      case 'confirmed':
        return { 
          title: 'Đã xác nhận', 
          color: 'info', 
          icon: '✅',
          description: 'Đơn hàng đã xác nhận' 
        };
      case 'preparing':
        return { 
          title: 'Đang chuẩn bị', 
          color: 'primary', 
          icon: '👨‍🍳',
          description: 'Đơn hàng đang được chuẩn bị' 
        };
      case 'shipping':
        return { 
          title: 'Đang vận chuyển', 
          color: 'secondary', 
          icon: '🚚',
          description: 'Đơn hàng đang giao' 
        };
      case 'delivered':
        return { 
          title: 'Đã giao hàng', 
          color: 'success', 
          icon: '📦',
          description: 'Đơn hàng giao thành công' 
        };
      case 'completed':
        return { 
          title: 'Hoàn thành', 
          color: 'success', 
          icon: '✅',
          description: 'Đơn hàng hoàn thành' 
        };
      case 'cancelled':
        return { 
          title: 'Đã hủy', 
          color: 'danger', 
          icon: '❌',
          description: 'Đơn hàng đã hủy' 
        };
      case 'cancellation_requested':
        return { 
          title: 'Yêu cầu hủy', 
          color: 'warning', 
          icon: '⚠️',
          description: 'Đơn hàng có yêu cầu hủy' 
        };
      default:
        return { 
          title: status, 
          color: 'secondary', 
          icon: '❓',
          description: 'Trạng thái không xác định' 
        };
    }
  };

  const handleViewOrders = (status = '') => {
    if (status) {
      navigate(`/orders?status=${status}`);
    } else {
      navigate('/orders');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState onRetry={fetchStats} message={error.message} />;
  }

  if (!stats) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
          <p>Không có dữ liệu thống kê</p>
          <Button variant="primary" onClick={() => navigate('/orders')}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </Container>
    );
  }

  const statEntries = Object.entries(stats);
  const totalOrders = statEntries.reduce((sum, [, stat]) => sum + (stat?.count || 0), 0);
  const completionRate = totalOrders > 0 ? ((stats.completed?.count || 0) / totalOrders * 100).toFixed(1) : 0;
  const cancelRate = totalOrders > 0 ? ((stats.cancelled?.count || 0) / totalOrders * 100).toFixed(1) : 0;

  return (
    <Container className="py-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          <i className="fas fa-home me-1"></i>
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/orders" }}>
          Quản lý đơn hàng
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Thống kê đơn hàng
        </Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-chart-bar me-2 text-primary"></i>
              Thống kê đơn hàng
            </h2>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={() => navigate('/orders')}>
                <i className="fas fa-list me-2"></i>
                Danh sách đơn hàng
              </Button>
              <Button variant="primary" onClick={fetchStats}>
                <i className="fas fa-sync-alt me-2"></i>
                Làm mới
              </Button>
            </div>
          </div>

          {/* Overall Statistics */}
          <Row className="mb-4">
            <Col lg={4} className="mb-4">
              <Card className={`text-center h-100 ${styles.SummaryCard}`} border="primary">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <div className={styles.SummaryIcon}>📊</div>
                  <h3 className="text-primary mb-1">{totalOrders}</h3>
                  <p className="text-muted mb-0">Tổng số đơn hàng</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className={`text-center h-100 ${styles.SummaryCard}`} border="success">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <div className={styles.SummaryIcon}>✅</div>
                  <h3 className="text-success mb-1">{completionRate}%</h3>
                  <p className="text-muted mb-2">Tỷ lệ hoàn thành</p>
                  <ProgressBar 
                    now={completionRate} 
                    variant="success" 
                    style={{height: '6px'}}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className={`text-center h-100 ${styles.SummaryCard}`} border="danger">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <div className={styles.SummaryIcon}>❌</div>
                  <h3 className="text-danger mb-1">{cancelRate}%</h3>
                  <p className="text-muted mb-2">Tỷ lệ hủy đơn</p>
                  <ProgressBar 
                    now={cancelRate} 
                    variant="danger" 
                    style={{height: '6px'}}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Status Statistics */}
          <h4 className="mb-3">
            <i className="fas fa-tasks me-2"></i>
            Thống kê theo trạng thái
          </h4>
          <Row>
            {statEntries.map(([status, stat]) => {
              const config = getStatConfig(status);
              const percentage = totalOrders > 0 ? ((stat?.count || 0) / totalOrders * 100).toFixed(1) : 0;
              
              return (
                <Col md={6} lg={4} xl={3} key={status} className="mb-4">
                  <Card 
                    className={`h-100 ${styles.StatCard}`}
                    border={config.color}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleViewOrders(status)}
                  >
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-3">
                        <div className={styles.StatIcon}>{config.icon}</div>
                        <div className="flex-grow-1">
                          <h6 className={`text-${config.color} mb-0`}>{config.title}</h6>
                          <small className="text-muted">{config.description}</small>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-medium">Số lượng:</span>
                          <strong className={`text-${config.color} h5 mb-0`}>{stat?.count || 0}</strong>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Tỷ lệ:</small>
                            <small className="fw-medium">{percentage}%</small>
                          </div>
                          <ProgressBar 
                            now={percentage} 
                            variant={config.color}
                            style={{ height: '4px' }}
                          />
                        </div>

                        {(stat?.count || 0) > 0 && (
                          <Button
                            variant={`outline-${config.color}`}
                            size="sm"
                            className="w-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrders(status);
                            }}
                          >
                            <i className="fas fa-eye me-1"></i>
                            Xem chi tiết
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Quick Actions */}
          <Card className="mt-4 border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2 text-warning"></i>
                Hành động nhanh
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <Button
                    variant="outline-primary"
                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                    onClick={() => handleViewOrders()}
                  >
                    <i className="fas fa-list fa-2x mb-2"></i>
                    <div>
                      <div className="fw-bold">Tất cả đơn hàng</div>
                      <small className="text-muted">Xem toàn bộ</small>
                    </div>
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button
                    variant="outline-warning"
                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                    onClick={() => handleViewOrders('new')}
                  >
                    <i className="fas fa-clock fa-2x mb-2"></i>
                    <div>
                      <div className="fw-bold">Chờ xác nhận</div>
                      <small className="text-muted">{stats.new?.count || 0} đơn</small>
                    </div>
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button
                    variant="outline-secondary"
                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                    onClick={() => handleViewOrders('shipping')}
                  >
                    <i className="fas fa-truck fa-2x mb-2"></i>
                    <div>
                      <div className="fw-bold">Đang giao hàng</div>
                      <small className="text-muted">{stats.shipping?.count || 0} đơn</small>
                    </div>
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button
                    variant="outline-success"
                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                    onClick={() => handleViewOrders('completed')}
                  >
                    <i className="fas fa-check-circle fa-2x mb-2"></i>
                    <div>
                      <div className="fw-bold">Hoàn thành</div>
                      <small className="text-muted">{stats.completed?.count || 0} đơn</small>
                    </div>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderStatsPage;