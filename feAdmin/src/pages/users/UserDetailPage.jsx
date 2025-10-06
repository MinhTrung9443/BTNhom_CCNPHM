import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Breadcrumb } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import moment from 'moment'
import adminService from '../../services/adminService'
import { Skeleton, SkeletonText, SkeletonOrderRow } from '../../components/common/Skeleton'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const UserDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  })
  const [orderFilters, setOrderFilters] = useState({
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    fetchUserDetail()
  }, [id])

  useEffect(() => {
    if (user) {
      fetchUserOrders()
    }
  }, [orderFilters, user])

  const fetchUserDetail = async () => {
    try {
      setLoading(true)
      const response = await adminService.getUserById(id)
      setUser(response.data.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải thông tin người dùng')
      navigate('/users')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true)
      const response = await adminService.getUserOrders(id, orderFilters)
      setOrders(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching user orders:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setOrdersLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setOrderFilters(prev => ({ ...prev, page }))
  }

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Chờ xác nhận' },
      confirmed: { bg: 'info', text: 'Đã xác nhận' },
      preparing: { bg: 'primary', text: 'Đang chuẩn bị' },
      shipping: { bg: 'primary', text: 'Đang giao' },
      delivered: { bg: 'success', text: 'Đã giao' },
      completed: { bg: 'success', text: 'Hoàn thành' },
      cancelled: { bg: 'danger', text: 'Đã hủy' },
      delivery_failed: { bg: 'danger', text: 'Giao thất bại' },
    }
    const config = statusConfig[status] || { bg: 'secondary', text: status }
    return <Badge bg={config.bg}>{config.text}</Badge>
  }

  const getVerificationBadge = (isVerified) => {
    return isVerified ? (
      <Badge bg="success">
        <i className="bi bi-check-circle me-1"></i>
        Đã xác thực
      </Badge>
    ) : (
      <Badge bg="warning">
        <i className="bi bi-clock me-1"></i>
        Chưa xác thực
      </Badge>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  if (loading) {
    return (
      <Container fluid className="py-4">
        <LoadingSpinner centered text="Đang tải thông tin người dùng..." />
      </Container>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item onClick={() => navigate('/users')} style={{ cursor: 'pointer' }}>
          Quản lý khách hàng
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Chi tiết khách hàng</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Chi tiết người dùng</h3>
          <p className="text-muted mb-0">Thông tin chi tiết và lịch sử đơn hàng</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate('/users')}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </Button>
      </div>

      <Row>
        {/* User Information */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Thông tin cá nhân</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-block">
                  <i className="bi bi-person text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h4 className="mt-3 mb-1">{user.name}</h4>
                <div className="mb-2">{getVerificationBadge(user.isVerified)}</div>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Email</small>
                <div className="d-flex align-items-center">
                  <i className="bi bi-envelope me-2 text-muted"></i>
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Số điện thoại</small>
                <div className="d-flex align-items-center">
                  <i className="bi bi-telephone me-2 text-muted"></i>
                  <span>{user.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Địa chỉ</small>
                <div className="d-flex align-items-start">
                  <i className="bi bi-geo-alt me-2 text-muted mt-1"></i>
                  <span>{user.address || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Ngày tham gia</small>
                <div className="d-flex align-items-center">
                  <i className="bi bi-calendar me-2 text-muted"></i>
                  <span>{moment(user.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                </div>
              </div>

              {user.lastLogin && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Đăng nhập gần nhất</small>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-clock-history me-2 text-muted"></i>
                    <span>{moment(user.lastLogin).format('DD/MM/YYYY HH:mm')}</span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Đơn hàng gần đây</h5>
              <Badge bg="primary">{pagination.totalItems} đơn hàng</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {ordersLoading ? (
                <Table responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: orderFilters.limit }).map((_, index) => (
                      <SkeletonOrderRow key={index} />
                    ))}
                  </tbody>
                </Table>
              ) : orders.length > 0 ? (
                <>
                  <Table responsive className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <span className="fw-semibold">#{order._id.slice(-8)}</span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                            </small>
                          </td>
                          <td>
                            <span className="fw-semibold">{formatCurrency(order.totalAmount)}</span>
                          </td>
                          <td>{getStatusBadge(order.status)}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewOrder(order._id)}
                              title="Xem chi tiết"
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="p-3">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      loading={ordersLoading}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-cart-x" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2">Người dùng chưa có đơn hàng nào</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default UserDetailPage
