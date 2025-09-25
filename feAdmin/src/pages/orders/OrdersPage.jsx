import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchOrders, updateOrderStatus } from '../../redux/slices/ordersSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import { toast } from 'react-toastify'
import moment from 'moment'

const OrdersPage = () => {
  const dispatch = useDispatch()
  const { orders, pagination, loading } = useSelector((state) => state.orders)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    sortBy: '-createdAt',
  })

  useEffect(() => {
    dispatch(fetchOrders(filters))
  }, [dispatch, filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ 
        orderId, 
        status: newStatus, 
        description: `Cập nhật trạng thái thành ${getStatusText(newStatus)}` 
      })).unwrap()
      toast.success('Cập nhật trạng thái đơn hàng thành công')
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

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
      cancellation_requested: { variant: 'warning', text: 'Yêu cầu hủy' },
    }
    const config = statusConfig[status] || { variant: 'secondary', text: status }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const getStatusText = (status) => {
    const statusTexts = {
      new: 'Mới',
      confirmed: 'Đã xác nhận',
      preparing: 'Đang chuẩn bị',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    }
    return statusTexts[status] || status
  }

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      new: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['shipping', 'cancelled'],
      shipping: ['delivered'],
      delivered: [],
      cancelled: [],
      cancellation_requested: ['cancelled', 'confirmed'],
    }
    return statusFlow[currentStatus] || []
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý đơn hàng</h2>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="new">Mới</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="preparing">Đang chuẩn bị</option>
                <option value="shipping">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
                <option value="cancellation_requested">Yêu cầu hủy</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="-createdAt">Mới nhất</option>
                <option value="createdAt">Cũ nhất</option>
                <option value="-totalAmount">Giá trị cao nhất</option>
                <option value="totalAmount">Giá trị thấp nhất</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              >
                <option value={10}>10 / trang</option>
                <option value={25}>25 / trang</option>
                <option value={50}>50 / trang</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : orders.length > 0 ? (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <Link 
                          to={`/orders/${order._id}`} 
                          className="text-decoration-none fw-semibold"
                        >
                          #{order._id.slice(-8)}
                        </Link>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{order.recipientName}</div>
                          <small className="text-muted">{order.phoneNumber}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <small className="text-muted">
                            {order.orderLines.length} sản phẩm
                          </small>
                          <div className="small">
                            {order.orderLines.slice(0, 2).map((item, index) => (
                              <div key={index}>
                                {item.productName} x{item.quantity}
                              </div>
                            ))}
                            {order.orderLines.length > 2 && (
                              <div className="text-muted">
                                +{order.orderLines.length - 2} sản phẩm khác
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="fw-semibold">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td>
                        <div className="mb-2">
                          {getStatusBadge(order.status)}
                        </div>
                        {getStatusOptions(order.status).length > 0 && (
                          <Form.Select
                            size="sm"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStatusChange(order._id, e.target.value)
                                e.target.value = ''
                              }
                            }}
                            style={{ width: '140px' }}
                          >
                            <option value="">Cập nhật...</option>
                            {getStatusOptions(order.status).map((status) => (
                              <option key={status} value={status}>
                                {getStatusText(status)}
                              </option>
                            ))}
                          </Form.Select>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            as={Link}
                            to={`/orders/${order._id}`}
                            variant="outline-primary"
                            size="sm"
                            title="Xem chi tiết"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                        </div>
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
                  loading={loading}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-cart-x" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">Không tìm thấy đơn hàng nào</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default OrdersPage