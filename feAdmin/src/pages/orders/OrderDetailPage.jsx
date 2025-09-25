import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { fetchOrderDetail, updateOrderStatus, addOrderNote, clearCurrentOrder } from '../../redux/slices/ordersSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from 'react-toastify'
import moment from 'moment'

const OrderDetailPage = () => {
  const { orderId } = useParams()
  const dispatch = useDispatch()
  const { currentOrder: order, loading } = useSelector((state) => state.orders)

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [statusForm, setStatusForm] = useState({
    status: '',
    description: ''
  })
  const [noteForm, setNoteForm] = useState({
    description: '',
    metadata: {}
  })

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetail(orderId))
    }
    return () => {
      dispatch(clearCurrentOrder())
    }
  }, [dispatch, orderId])

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

  const handleUpdateStatus = async () => {
    if (!statusForm.status || !statusForm.description) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      await dispatch(updateOrderStatus({
        orderId: order._id,
        status: statusForm.status,
        description: statusForm.description
      })).unwrap()
      toast.success('Cập nhật trạng thái thành công')
      setShowStatusModal(false)
      setStatusForm({ status: '', description: '' })
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    }
  }

  const handleAddNote = async () => {
    if (!noteForm.description) {
      toast.error('Vui lòng nhập nội dung ghi chú')
      return
    }

    try {
      await dispatch(addOrderNote({
        orderId: order._id,
        description: noteForm.description,
        metadata: noteForm.metadata
      })).unwrap()
      toast.success('Thêm ghi chú thành công')
      setShowNoteModal(false)
      setNoteForm({ description: '', metadata: {} })
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    }
  }

  const getUserTypeText = (userType, userName) => {
    if (userType === 'system') {
      return userName || 'Hệ thống'
    }
    if (userType === 'admin') {
      return 'Nhân viên'
    }
    return 'Khách hàng'
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!order) {
    return (
      <Container fluid>
        <div className="text-center py-5">
          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3">Không tìm thấy đơn hàng</h4>
          <Link to="/orders" className="btn btn-primary mt-3">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/orders" className="text-decoration-none text-muted me-3">
            <i className="bi bi-arrow-left"></i> Quay lại
          </Link>
          <h2 className="fw-bold d-inline">Chi tiết đơn hàng #{order._id.slice(-8)}</h2>
        </div>
        <div className="d-flex gap-2">
          {getStatusOptions(order.status).length > 0 && (
            <Button variant="primary" onClick={() => setShowStatusModal(true)}>
              <i className="bi bi-arrow-repeat me-2"></i>
              Cập nhật trạng thái
            </Button>
          )}
          <Button variant="outline-secondary" onClick={() => setShowNoteModal(true)}>
            <i className="bi bi-chat-left-text me-2"></i>
            Thêm ghi chú
          </Button>
        </div>
      </div>

      <Row>
        {/* Order Info */}
        <Col md={8} className="mb-4">
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">Thông tin đơn hàng</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Mã đơn hàng:</strong> #{order._id.slice(-8)}
                  </div>
                  <div className="mb-3">
                    <strong>Trạng thái:</strong> {getStatusBadge(order.status)}
                  </div>
                  <div className="mb-3">
                    <strong>Ngày tạo:</strong> {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                  <div className="mb-3">
                    <strong>Tổng tiền:</strong> 
                    <span className="fw-bold text-primary ms-2">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Người nhận:</strong> {order.recipientName}
                  </div>
                  <div className="mb-3">
                    <strong>Số điện thoại:</strong> {order.phoneNumber}
                  </div>
                  <div className="mb-3">
                    <strong>Địa chỉ:</strong> {order.shippingAddress}
                  </div>
                  {order.notes && (
                    <div className="mb-3">
                      <strong>Ghi chú:</strong> {order.notes}
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">Sản phẩm đặt hàng</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderLines.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.productImage || '/placeholder.jpg'}
                            alt={item.productName}
                            className="rounded me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-semibold">{item.productName}</div>
                          </div>
                        </div>
                      </td>
                      <td>{formatCurrency(item.productPrice)}</td>
                      <td>{item.quantity}</td>
                      <td className="fw-semibold">
                        {formatCurrency(item.productPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-light">
                  <tr>
                    <th colSpan="3" className="text-end">Tổng cộng:</th>
                    <th className="fw-bold text-primary">
                      {formatCurrency(order.totalAmount)}
                    </th>
                  </tr>
                </tfoot>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Timeline */}
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">Lịch sử đơn hàng</h5>
            </Card.Header>
            <Card.Body>
              {order.timeline && order.timeline.length > 0 ? (
                <div className="timeline">
                  {order.timeline.map((item, index) => (
                    <div key={item._id} className="timeline-item mb-3">
                      <div className="d-flex">
                        <div className="timeline-marker me-3">
                          <div className="bg-primary rounded-circle p-2">
                            <i className="bi bi-clock text-white small"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <div>
                              {getStatusBadge(item.status)}
                              <small className="text-muted ms-2">
                                {getUserTypeText(item.performedBy.userType, item.performedBy.userName)}
                              </small>
                            </div>
                            <small className="text-muted">
                              {moment(item.timestamp).format('DD/MM HH:mm')}
                            </small>
                          </div>
                          <p className="mb-0 small">{item.description}</p>
                        </div>
                      </div>
                      {index < order.timeline.length - 1 && (
                        <div className="timeline-line ms-3"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="bi bi-clock-history" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2 mb-0">Chưa có lịch sử</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái mới</Form.Label>
              <Form.Select
                value={statusForm.status}
                onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Chọn trạng thái</option>
                {getStatusOptions(order.status).map((status) => (
                  <option key={status} value={status}>
                    {status === 'confirmed' && 'Đã xác nhận'}
                    {status === 'preparing' && 'Đang chuẩn bị'}
                    {status === 'shipping' && 'Đang giao'}
                    {status === 'delivered' && 'Đã giao'}
                    {status === 'cancelled' && 'Đã hủy'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusForm.description}
                onChange={(e) => setStatusForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập mô tả cho việc cập nhật trạng thái..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Note Modal */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm ghi chú</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={noteForm.description}
                onChange={(e) => setNoteForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập nội dung ghi chú..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddNote}>
            Thêm ghi chú
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default OrderDetailPage