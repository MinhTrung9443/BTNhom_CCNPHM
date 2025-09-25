import React, { useEffect } from 'react'
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
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
import { fetchDashboardStats, fetchRecentOrders, fetchSalesChart } from '../redux/slices/dashboardSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import moment from 'moment'

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
  const dispatch = useDispatch()
  const { stats, recentOrders, salesChart, loading } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchRecentOrders())
    dispatch(fetchSalesChart('7d'))
  }, [dispatch])

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Dashboard</h2>
        <small className="text-muted">
          Cập nhật lần cuối: {moment().format('DD/MM/YYYY HH:mm')}
        </small>
      </div>

      {/* Stats Cards */}
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

      {/* Charts */}
      <Row className="mb-4">
        <Col md={8} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pb-0">
              <h5 className="fw-bold mb-0">Biểu đồ doanh thu</h5>
            </Card.Header>
            <Card.Body>
              {salesChart.labels && salesChart.labels.length > 0 ? (
                <Line data={salesChart} options={salesChartOptions} />
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-graph-up" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2">Chưa có dữ liệu biểu đồ</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pb-0">
              <h5 className="fw-bold mb-0">Trạng thái đơn hàng</h5>
            </Card.Header>
            <Card.Body>
              <Doughnut 
                data={orderStatusData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Đơn hàng gần đây</h5>
              <a href="/orders" className="btn btn-outline-primary btn-sm">
                Xem tất cả
              </a>
            </Card.Header>
            <Card.Body className="p-0">
              {recentOrders && recentOrders.length > 0 ? (
                <Table responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <a href={`/orders/${order._id}`} className="text-decoration-none fw-semibold">
                            #{order._id.slice(-8)}
                          </a>
                        </td>
                        <td>
                          <div>
                            <div className="fw-semibold">{order.recipientName}</div>
                            <small className="text-muted">{order.phoneNumber}</small>
                          </div>
                        </td>
                        <td className="fw-semibold">{formatCurrency(order.totalAmount)}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>
                          <small className="text-muted">
                            {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-cart-x" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2">Chưa có đơn hàng nào</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default DashboardPage