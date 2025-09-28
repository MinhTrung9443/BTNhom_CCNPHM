import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
// ... other imports
import {
  fetchDashboardStats,
  // === NEW IMPORTS ===
  fetchCashFlowStats,
  fetchTopProducts,
  fetchDeliveredOrders,
} from '../redux/slices/dashboardSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination'; // Import component phân trang
import moment from 'moment';
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const DashboardPage = () => {
  const dispatch = useDispatch();
  const {
    stats, recentOrders, salesChart, loading,
    // === NEW SELECTORS ===
    cashFlow, topProducts, deliveredOrders,
    loadingCashFlow, loadingTopProducts, loadingDeliveredOrders
  } = useSelector((state) => state.dashboard);

  const [deliveredPage, setDeliveredPage] = useState(1);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    // === NEW DISPATCHES ===
    dispatch(fetchCashFlowStats());
    dispatch(fetchTopProducts());
  }, [dispatch]);

  // Fetch delivered orders when page changes
  useEffect(() => {
    dispatch(fetchDeliveredOrders({ page: deliveredPage, limit: 5 }));
  }, [dispatch, deliveredPage]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { variant: 'primary', text: 'Mới' },
      confirmed: { variant: 'info', text: 'Đã xác nhận' },
      preparing: { variant: 'warning', text: 'Đang chuẩn bị' },
      shipping: { variant: 'secondary', text: 'Đang giao' },
      delivered: { variant: 'success', text: 'Đã giao' },
      cancelled: { variant: 'danger', text: 'Đã hủy' },
    }
    const config = statusConfig[status] || { variant: 'secondary', text: status }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const salesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Doanh thu 7 ngày qua',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN').format(value) + ' đ'
          }
        }
      }
    }
  }

  const orderStatusData = {
    labels: ['Mới', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã giao', 'Đã hủy'],
    datasets: [
      {
        data: [12, 19, 8, 15, 25, 3],
        backgroundColor: [
          '#0d6efd',
          '#0dcaf0',
          '#ffc107',
          '#6c757d',
          '#198754',
          '#dc3545',
        ],
        borderWidth: 0,
      },
    ],
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Container fluid>
      {/* ... Phần header và Stats Cards hiện tại ... */}
       <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Dashboard</h2>
        <small className="text-muted">
          Cập nhật lần cuối: {moment().format('DD/MM/YYYY HH:mm')}
        </small>
      </div>
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-people text-primary" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">Tổng người dùng</h6>
                <h3 className="fw-bold mb-0">{stats.totalUsers?.toLocaleString() || 0}</h3>
                <small className="text-success">
                  <i className="bi bi-arrow-up"></i> +{stats.newUsersToday || 0} hôm nay
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-cart-check text-success" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">Tổng đơn hàng</h6>
                <h3 className="fw-bold mb-0">{stats.totalOrders?.toLocaleString() || 0}</h3>
                <small className="text-success">
                  <i className="bi bi-arrow-up"></i> +{stats.ordersToday || 0} hôm nay
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-currency-dollar text-warning" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">Tổng doanh thu</h6>
                <h3 className="fw-bold mb-0">{formatCurrency(stats.totalRevenue || 0)}</h3>
                <small className="text-success">
                  <i className="bi bi-arrow-up"></i> {formatCurrency(stats.revenueToday || 0)} hôm nay
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-box-seam text-info" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">Tổng sản phẩm</h6>
                <h3 className="fw-bold mb-0">{stats.totalProducts?.toLocaleString() || 0}</h3>
                <small className="text-muted">Đang hoạt động</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* === NEW CASH FLOW & TOP PRODUCTS ROW === */}
      <Row className="mb-4">
        <Col md={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">Top 10 sản phẩm bán chạy</h5>
            </Card.Header>
            <Card.Body>
              {loadingTopProducts ? <LoadingSpinner /> : (
                <Table responsive hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sản phẩm</th>
                      <th>Đã bán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={product.productId}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={product.image || '/placeholder.jpg'} alt={product.name} className="rounded me-2" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                            <span className="fw-semibold">{product.name}</span>
                          </div>
                        </td>
                        <td className="fw-bold">{product.totalSold}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">Thống kê Doanh thu & Dòng tiền</h5>
            </Card.Header>
            <Card.Body>
              {loadingCashFlow ? <LoadingSpinner /> : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                    <div>
                      <h6 className="text-success mb-0">Doanh thu đã nhận</h6>
                      <small className="text-muted">{cashFlow.completed?.count} đơn đã giao</small>
                    </div>
                    <h4 className="fw-bold text-success mb-0">{formatCurrency(cashFlow.completed?.totalAmount || 0)}</h4>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                    <div>
                      <h6 className="text-warning mb-0">Tiền đang về</h6>
                      <small className="text-muted">{cashFlow.shipping?.count} đơn đang giao</small>
                    </div>
                    <h4 className="fw-bold text-warning mb-0">{formatCurrency(cashFlow.shipping?.totalAmount || 0)}</h4>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === NEW DELIVERED ORDERS TABLE === */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">Các đơn hàng đã giao thành công</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loadingDeliveredOrders ? <LoadingSpinner /> : (
                <Table responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Mã ĐH</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Ngày giao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredOrders.orders.map(order => (
                      <tr key={order._id}>
                        <td>
                          <a href={`/orders/${order._id}`} className="text-decoration-none fw-semibold">
                            #{order._id.slice(-8)}
                          </a>
                        </td>
                        <td>{order.userId?.name || 'N/A'}</td>
                        <td className="fw-semibold">{formatCurrency(order.totalAmount)}</td>
                        <td>
                          <small className="text-muted">
                            {moment(order.deliveredAt).format('DD/MM/YYYY HH:mm')}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
            {deliveredOrders.pagination && deliveredOrders.pagination.totalPages > 1 && (
              <Card.Footer className="bg-white border-0">
                <Pagination
                  currentPage={deliveredOrders.pagination.currentPage}
                  totalPages={deliveredOrders.pagination.totalPages}
                  onPageChange={(page) => setDeliveredPage(page)}
                  loading={loadingDeliveredOrders}
                />
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default DashboardPage