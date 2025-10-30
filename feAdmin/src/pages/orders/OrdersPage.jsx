import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchOrders, updateOrderStatus } from '../../redux/slices/ordersSlice'
import { SkeletonOrderRow } from '../../components/common/Skeleton'
import Pagination from '../../components/common/Pagination'
import { toast } from 'react-toastify'
import moment from 'moment'
const OrdersPage = () => {
  const dispatch = useDispatch()
  const { orders, meta, loading, error } = useSelector((state) => state.orders);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  useEffect(() => {
    dispatch(fetchOrders(filters))
  }, [dispatch, filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split(',');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1,
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "primary", text: "Chờ xác nhận" },
      processing: { variant: "info", text: "Vận chuyển" },
      shipping: { variant: "warning", text: "Đang giao" },
      completed: { variant: "success", text: "Hoàn thành" },
      cancelled: { variant: "danger", text: "Đã hủy" },
      return_refund: { variant: "secondary", text: "Trả hàng/Hoàn tiền" },
    }
    const config = statusConfig[status] || { variant: 'secondary', text: status }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const getStatusText = (status) => {
    const statusTexts = {
      pending: "Chờ xác nhận",
      processing: "Vận chuyển",
      shipping: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      return_refund: "Trả hàng/Hoàn tiền",
    }
    return statusTexts[status] || status
  }

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      pending: ["processing", "cancelled"],
      processing: ["shipping", "cancelled"],
      shipping: ["completed", "return_refund"],
      completed: [],
      cancelled: [],
      return_refund: [],
    }
    return statusFlow[currentStatus] || []
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý đơn hàng</h2>
        <div className="d-flex gap-2">
          <Link 
            to="/orders/cancellation-requests" 
            className="btn btn-warning"
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            Yêu cầu hủy đơn hàng
          </Link>
          <Link 
            to="/orders/return-refund-requests" 
            className="btn btn-info"
          >
            <i className="bi bi-arrow-return-left me-2"></i>
            Yêu cầu trả hàng/hoàn tiền
          </Link>
        </div>
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
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="processing">Vận chuyển</option>
                <option value="shipping">Đang giao</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="return_refund">Trả hàng/Hoàn tiền</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={`${filters.sortBy},${filters.sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="createdAt,desc">Mới nhất</option>
                <option value="createdAt,asc">Cũ nhất</option>
                <option value="totalAmount,desc">Giá trị cao nhất</option>
                <option value="totalAmount,asc">Giá trị thấp nhất</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.limit}
                name="limit"
                onChange={handleFilterChange}
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
                {Array.from({ length: filters.limit }).map((_, index) => (
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
                          {order.orderCode || `#${order._id.slice(-8)}`}
                        </Link>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{order.shippingAddress?.recipientName}</div>
                          <small className="text-muted">{order.shippingAddress?.phoneNumber}</small>
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
                  currentPage={meta.currentPage}
                  totalPages={meta.totalPages}
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