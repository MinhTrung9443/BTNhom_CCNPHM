import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup, Nav, Tab } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchOrders } from '../../redux/slices/ordersSlice'
import { SkeletonOrderRow } from '../../components/common/Skeleton'
import Pagination from '../../components/common/Pagination'
import UpdateStatusModal from '../../components/orders/UpdateStatusModal'
import { toast } from 'react-toastify'
import moment from 'moment'

// Mapping giữa general status và detailed status (ĐỒNG BỘ VỚI BACKEND)
const STATUS_MAPPING = {
  'all': {
    label: 'Tất cả',
    icon: '📋',
    detailedStatuses: []
  },
  'pending': {
    label: 'Chờ xác nhận',
    icon: '🕐',
    detailedStatuses: [
      { value: 'new', label: '🆕 Mới' }
    ]
  },
  'processing': {
    label: 'Đang xử lý',
    icon: '📦',
    detailedStatuses: [
      { value: 'confirmed', label: '✅ Đã xác nhận' },
      { value: 'preparing', label: '📦 Đang chuẩn bị' }
    ]
  },
  'shipping': {
    label: 'Đang giao',
    icon: '🚚',
    detailedStatuses: [
      { value: 'shipping_in_progress', label: '🚚 Đang giao hàng' },
      { value: 'delivered', label: '✅ Đã giao' },
      { value: 'cancellation_requested', label: '⚠️ Yêu cầu hủy' },
      { value: 'delivery_failed', label: '🔴 Giao thất bại' }
    ]
  },
  'completed': {
    label: 'Hoàn thành',
    icon: '✔️',
    detailedStatuses: [
      { value: 'completed', label: '✔️ Hoàn thành' }
    ]
  },
  'cancelled': {
    label: 'Đã hủy',
    icon: '❌',
    detailedStatuses: [
      { value: 'payment_overdue', label: '⏰ Quá hạn thanh toán' },
      { value: 'cancelled', label: '❌ Đã hủy' }
    ]
  },
  'return_refund': {
    label: 'Trả hàng/Hoàn tiền',
    icon: '🔄',
    detailedStatuses: [
      { value: 'return_requested', label: '🔄 Yêu cầu trả hàng' },
      { value: 'refunded', label: '💰 Đã hoàn tiền' }
    ]
  }
};

const OrdersPage = () => {
  const dispatch = useDispatch()
  const { orders, meta, loading, error } = useSelector((state) => state.orders);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: null, // General status từ activeTab
    detailedStatus: '',
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const [activeTab, setActiveTab] = useState('all')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    dispatch(fetchOrders(filters))
  }, [dispatch, filters])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Cập nhật general status và reset detailed status khi đổi tab
    setFilters(prev => ({
      ...prev,
      status: tab === 'all' ? null : tab, // Gửi general status lên backend
      detailedStatus: '',
      page: 1,
    }))
  }

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

  const handleOpenUpdateModal = (order) => {
    setSelectedOrder(order)
    setShowUpdateModal(true)
  }

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false)
    setSelectedOrder(null)
  }

  const handleUpdateSuccess = () => {
    dispatch(fetchOrders(filters))
    toast.success('Cập nhật trạng thái thành công')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getDetailedStatusLabel = (detailedStatus) => {
    // Tìm trong STATUS_MAPPING
    for (const generalStatus in STATUS_MAPPING) {
      const found = STATUS_MAPPING[generalStatus].detailedStatuses.find(
        ds => ds.value === detailedStatus
      );
      if (found) return found.label;
    }
    return detailedStatus;
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
          {/* Search, Sort, Limit */}
          <Row className="g-3 mb-3">
            <Col lg={5}>
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
            <Col lg={5}>
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
            <Col lg={2}>
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

          {/* Tabs for General Status */}
          <Nav variant="pills" className="mb-3">
            {Object.keys(STATUS_MAPPING).map(statusKey => (
              <Nav.Item key={statusKey}>
                <Nav.Link 
                  active={activeTab === statusKey}
                  onClick={() => handleTabChange(statusKey)}
                  className="px-3"
                >
                  {STATUS_MAPPING[statusKey].icon} {STATUS_MAPPING[statusKey].label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          {/* Detailed Status Filter (only show if not "all" tab and has detailed statuses) */}
          {activeTab !== 'all' && STATUS_MAPPING[activeTab].detailedStatuses.length > 0 && (
            <Row className="g-3">
              <Col lg={4}>
                <Form.Select
                  name="detailedStatus"
                  value={filters.detailedStatus}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả trạng thái chi tiết</option>
                  {STATUS_MAPPING[activeTab].detailedStatuses.map(ds => (
                    <option key={ds.value} value={ds.value}>
                      {ds.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          )}
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
                        <div>
                          {getStatusBadge(order.status)}
                          {order.timeline && order.timeline.length > 0 && (
                            <div className="small text-muted mt-1">
                              <i className="bi bi-info-circle me-1"></i>
                              {getDetailedStatusLabel(order.timeline[order.timeline.length - 1]?.status)}
                            </div>
                          )}
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
                          <Button
                            variant="outline-success"
                            size="sm"
                            title="Cập nhật trạng thái"
                            onClick={() => handleOpenUpdateModal(order)}
                          >
                            <i className="bi bi-arrow-repeat"></i>
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

      {/* Update Status Modal */}
      {selectedOrder && (
        <UpdateStatusModal
          show={showUpdateModal}
          onHide={handleCloseUpdateModal}
          order={selectedOrder}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </Container>
  )
}

export default OrdersPage