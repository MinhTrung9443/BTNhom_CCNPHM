import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Button, Tabs, Tab, Alert } from 'react-bootstrap';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import './../../styles/admin.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comprehensive statistics state
  const [statsData, setStatsData] = useState({
    // Overview statistics
    overview: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalOrders: 0,
      monthlyOrders: 0,
      totalCustomers: 0,
      newCustomers: 0,
      pendingRevenue: 0,
      completedRevenue: 0
    },

    // Revenue analytics
    revenue: {
      daily: [],
      monthly: [],
      yearly: [],
      growth: 0
    },

    // Order analytics
    orders: {
      byStatus: [],
      byDate: [],
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    },

    // Customer analytics
    customers: {
      total: 0,
      newThisMonth: 0,
      returning: 0,
      topCustomers: []
    },

    // Product analytics
    products: {
      top10: [],
      categories: [],
      lowStock: []
    },

    // Financial tracking
    financial: {
      pendingAmount: 0,
      completedAmount: 0,
      totalEarnings: 0,
      monthlyEarnings: []
    }
  });

  useEffect(() => {
    fetchAllStatistics();
  }, [dateRange]);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      setError('');

      // Mock comprehensive data - replace with API calls
      const mockData = {
        overview: {
          totalRevenue: 250000000,
          monthlyRevenue: 45000000,
          totalOrders: 1250,
          monthlyOrders: 180,
          totalCustomers: 890,
          newCustomers: 45,
          pendingRevenue: 15000000,
          completedRevenue: 235000000
        },
        revenue: {
          daily: [
            { date: '2024-01-14', amount: 1200000 },
            { date: '2024-01-15', amount: 2100000 },
            { date: '2024-01-16', amount: 1800000 },
            { date: '2024-01-17', amount: 3200000 },
            { date: '2024-01-18', amount: 2800000 },
            { date: '2024-01-19', amount: 4100000 },
            { date: '2024-01-20', amount: 3600000 }
          ],
          monthly: [
            { month: 'Tháng 7', amount: 32000000 },
            { month: 'Tháng 8', amount: 38000000 },
            { month: 'Tháng 9', amount: 42000000 },
            { month: 'Tháng 10', amount: 35000000 },
            { month: 'Tháng 11', amount: 48000000 },
            { month: 'Tháng 12', amount: 45000000 }
          ],
          growth: 18.4
        },
        orders: {
          byStatus: [
            { status: 'completed', count: 850, amount: 235000000 },
            { status: 'processing', count: 280, amount: 15000000 },
            { status: 'pending', count: 95, amount: 8500000 },
            { status: 'cancelled', count: 25, amount: 1200000 }
          ],
          pendingOrders: 95,
          completedOrders: 850,
          cancelledOrders: 25
        },
        customers: {
          total: 890,
          newThisMonth: 45,
          returning: 845,
          topCustomers: [
            { name: 'Nguyễn Văn A', orders: 15, totalSpent: 8500000 },
            { name: 'Trần Thị B', orders: 12, totalSpent: 6200000 },
            { name: 'Lê Văn C', orders: 10, totalSpent: 4800000 },
            { name: 'Phạm Thị D', orders: 8, totalSpent: 3200000 },
            { name: 'Hoàng Văn E', orders: 7, totalSpent: 2900000 }
          ]
        },
        products: {
          top10: [
            { name: 'Bánh Pía Đậu Xanh', sold: 450, revenue: 20250000, category: 'Bánh Pía' },
            { name: 'Bánh Pía Thịt', sold: 320, revenue: 16000000, category: 'Bánh Pía' },
            { name: 'Bánh Ín', sold: 280, revenue: 9800000, category: 'Bánh Ín' },
            { name: 'Bánh Pía Trứng', sold: 190, revenue: 9500000, category: 'Bánh Pía' },
            { name: 'Kem Bơ', sold: 150, revenue: 4500000, category: 'Kem' },
            { name: 'Bánh Bò', sold: 120, revenue: 3600000, category: 'Bánh Bò' },
            { name: 'Bánh Chuối', sold: 95, revenue: 2850000, category: 'Bánh Chuối' },
            { name: 'Bánh Cam', sold: 85, revenue: 2550000, category: 'Bánh Cam' },
            { name: 'Bánh Dừa', sold: 75, revenue: 2250000, category: 'Bánh Dừa' },
            { name: 'Bánh Mì', sold: 65, revenue: 1950000, category: 'Bánh Mì' }
          ],
          categories: [
            { name: 'Bánh Pía', sold: 960, revenue: 45750000 },
            { name: 'Bánh Ín', sold: 280, revenue: 9800000 },
            { name: 'Kem', sold: 150, revenue: 4500000 },
            { name: 'Bánh Bò', sold: 120, revenue: 3600000 },
            { name: 'Khác', sold: 290, revenue: 8700000 }
          ]
        },
        financial: {
          pendingAmount: 15000000,
          completedAmount: 235000000,
          totalEarnings: 250000000,
          monthlyEarnings: [
            { month: 'Tháng 7', pending: 8000000, completed: 24000000 },
            { month: 'Tháng 8', pending: 12000000, completed: 26000000 },
            { month: 'Tháng 9', pending: 10000000, completed: 32000000 },
            { month: 'Tháng 10', pending: 9000000, completed: 26000000 },
            { month: 'Tháng 11', pending: 15000000, completed: 33000000 },
            { month: 'Tháng 12', pending: 15000000, completed: 30000000 }
          ]
        }
      };

      setStatsData(mockData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'success', text: 'Hoàn thành', icon: 'fas fa-check' },
      processing: { variant: 'warning', text: 'Đang xử lý', icon: 'fas fa-clock' },
      pending: { variant: 'info', text: 'Chờ xử lý', icon: 'fas fa-hourglass-half' },
      cancelled: { variant: 'danger', text: 'Đã hủy', icon: 'fas fa-times' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge bg={config.variant}>
        <i className={config.icon}></i> {config.text}
      </Badge>
    );
  };

  // Chart data configurations
  const revenueChartData = {
    labels: statsData.revenue.daily.map(item => new Date(item.date).toLocaleDateString('vi-VN')),
    datasets: [{
      label: 'Doanh thu hàng ngày',
      data: statsData.revenue.daily.map(item => item.amount),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };

  const orderStatusChartData = {
    labels: statsData.orders.byStatus.map(item => getStatusBadge(item.status)),
    datasets: [{
      data: statsData.orders.byStatus.map(item => item.count),
      backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545'],
      borderWidth: 2
    }]
  };

  const productChartData = {
    labels: statsData.products.top10.slice(0, 5).map(item => item.name),
    datasets: [{
      label: 'Số lượng bán',
      data: statsData.products.top10.slice(0, 5).map(item => item.sold),
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1
    }]
  };

  const financialChartData = {
    labels: statsData.financial.monthlyEarnings.map(item => item.month),
    datasets: [
      {
        label: 'Đơn chờ xử lý',
        data: statsData.financial.monthlyEarnings.map(item => item.pending),
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        stack: 'Stack 0'
      },
      {
        label: 'Đơn hoàn thành',
        data: statsData.financial.monthlyEarnings.map(item => item.completed),
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        stack: 'Stack 0'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Thống kê'
      }
    }
  };

  if (loading) {
    return (
      <Container fluid className="admin-reports">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu thống kê...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="admin-reports">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-reports">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-title">
                <i className="fas fa-chart-line me-2"></i>
                Báo cáo thống kê
              </h2>
              <p className="text-muted">Xem thống kê và báo cáo chi tiết</p>
            </div>
            <Form.Select
              style={{width: '200px'}}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      {/* Overview Summary Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Tổng doanh thu</h6>
                  <h3 className="text-success">{formatCurrency(statsData.overview.totalRevenue)}</h3>
                  <small className="text-success">
                    <i className="fas fa-arrow-up"></i> +{statsData.revenue.growth}%
                  </small>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-dollar-sign text-success"></i>
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
                  <h6 className="text-muted">Doanh thu tháng này</h6>
                  <h3 className="text-primary">{formatCurrency(statsData.overview.monthlyRevenue)}</h3>
                  <small className="text-muted">
                    So với tháng trước: +{statsData.revenue.growth}%
                  </small>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-chart-line text-primary"></i>
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
                  <h6 className="text-muted">Tổng khách hàng</h6>
                  <h3 className="text-info">{statsData.overview.totalCustomers}</h3>
                  <small className="text-info">
                    <i className="fas fa-user-plus"></i> +{statsData.overview.newCustomers} mới
                  </small>
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
                  <h6 className="text-muted">Dòng tiền chờ xử lý</h6>
                  <h3 className="text-warning">{formatCurrency(statsData.overview.pendingRevenue)}</h3>
                  <small className="text-muted">
                    {statsData.orders.pendingOrders} đơn hàng
                  </small>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-clock text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {/* Overview Tab */}
        <Tab eventKey="overview" title="Tổng quan">
          <Row>
            <Col md={8} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-chart-area me-2"></i>
                    Doanh thu theo ngày
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Line data={revenueChartData} options={chartOptions} />
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-pie-chart me-2"></i>
                    Trạng thái đơn hàng
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Pie data={orderStatusChartData} options={chartOptions} />
                  <div className="mt-3">
                    {statsData.orders.byStatus.map((item, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <div
                            className="legend-color me-2"
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545'][index],
                              borderRadius: '50%'
                            }}
                          ></div>
                          <span>{getStatusBadge(item.status)}</span>
                        </div>
                        <span className="fw-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Revenue Tab */}
        <Tab eventKey="revenue" title="Doanh thu">
          <Row>
            <Col md={12} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    Doanh thu chi tiết
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Line data={revenueChartData} options={chartOptions} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Dòng tiền theo tháng</h5>
                </Card.Header>
                <Card.Body>
                  <Bar data={financialChartData} options={chartOptions} />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Tóm tắt tài chính</h5>
                </Card.Header>
                <Card.Body>
                  <div className="financial-summary">
                    <div className="d-flex justify-content-between mb-3">
                      <span>Doanh thu chờ xử lý:</span>
                      <strong className="text-warning">{formatCurrency(statsData.financial.pendingAmount)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Doanh thu hoàn thành:</span>
                      <strong className="text-success">{formatCurrency(statsData.financial.completedAmount)}</strong>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span>Tổng doanh thu:</span>
                      <strong className="text-primary">{formatCurrency(statsData.financial.totalEarnings)}</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Products Tab */}
        <Tab eventKey="products" title="Sản phẩm">
          <Row>
            <Col md={8} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-trophy me-2"></i>
                    Top 10 sản phẩm bán chạy
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Số lượng bán</th>
                        <th>Doanh thu</th>
                        <th>Thị phần</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.products.top10.map((product, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{product.name}</strong>
                          </td>
                          <td>
                            <Badge bg="secondary">{product.category}</Badge>
                          </td>
                          <td>{product.sold}</td>
                          <td>{formatCurrency(product.revenue)}</td>
                          <td>
                            <div className="progress" style={{width: '100px'}}>
                              <div
                                className="progress-bar"
                                style={{width: `${(product.revenue / statsData.products.top10[0].revenue) * 100}%`}}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Biểu đồ sản phẩm</h5>
                </Card.Header>
                <Card.Body>
                  <Bar data={productChartData} options={chartOptions} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Customers Tab */}
        <Tab eventKey="customers" title="Khách hàng">
          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Thống kê khách hàng</h5>
                </Card.Header>
                <Card.Body>
                  <div className="customer-stats">
                    <div className="d-flex justify-content-between mb-3">
                      <span>Tổng khách hàng:</span>
                      <strong>{statsData.customers.total}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Khách hàng mới:</span>
                      <strong className="text-success">{statsData.customers.newThisMonth}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Khách hàng quay lại:</span>
                      <strong className="text-info">{statsData.customers.returning}</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Top khách hàng</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Khách hàng</th>
                        <th>Đơn hàng</th>
                        <th>Tổng chi tiêu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.customers.topCustomers.map((customer, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{customer.name}</strong>
                          </td>
                          <td>{customer.orders}</td>
                          <td>{formatCurrency(customer.totalSpent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Orders Tab */}
        <Tab eventKey="orders" title="Đơn hàng">
          <Row>
            <Col md={12} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Chi tiết đơn hàng theo trạng thái</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Trạng thái</th>
                        <th>Số lượng</th>
                        <th>Tổng giá trị</th>
                        <th>Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.orders.byStatus.map((item, index) => (
                        <tr key={index}>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>{item.count}</td>
                          <td>{formatCurrency(item.amount)}</td>
                          <td>
                            <div className="progress" style={{width: '100px'}}>
                              <div
                                className="progress-bar"
                                style={{width: `${(item.count / statsData.orders.byStatus.reduce((sum, i) => sum + i.count, 0)) * 100}%`}}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminReports;
