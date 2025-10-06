import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import {
  fetchOrderById,
  updateOrderStatus,
  addOrderNote,
  approveCancellation,
  clearOrder,
} from "../../redux/slices/ordersSlice";
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from 'react-toastify'
import moment from 'moment'
import React from 'react';
import { getImageSrc, handleImageError } from '../../utils/imageUtils'
import ProductSnapshotModal from '../../components/orders/ProductSnapshotModal'

const OrderDetailPage = () => {
  const { orderId } = useParams()
  const dispatch = useDispatch()
  const { order, loading } = useSelector((state) => state.orders);

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [showSnapshotModal, setShowSnapshotModal] = useState(false)
  const [selectedOrderLine, setSelectedOrderLine] = useState(null)
  const [statusForm, setStatusForm] = useState({
    status: '',
    reason: "",
  })
  const [noteForm, setNoteForm] = useState({
    description: '',
    metadata: {}
  })

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
    // Cleanup function to clear the current order when the component unmounts
    // or when the orderId changes, to prevent showing stale data.
    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, orderId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "primary", text: "Chờ xác nhận" },
      processing: { variant: "info", text: "VẬn chuyển" },
      shipping: { variant: "warning", text: "Đang giao" },
      completed: { variant: "success", text: "Hoàn thành" },
      cancelled: { variant: "danger", text: "Đã hủy" },
      return_refund: { variant: "secondary", text: "Trả hàng/Hoàn tiền" },
      // Detailed statuses for timeline
      new: { variant: "primary", text: "Mới" },
      confirmed: { variant: "info", text: "Đã xác nhận" },
      preparing: { variant: "info", text: "Chuẩn bị hàng" },
      shipping_in_progress: { variant: "warning", text: "Đang giao" },
      delivered: { variant: "success", text: "Đã giao" },
      delivery_failed: { variant: "danger", text: "Giao thất bại" },
      cancellation_requested: {
        variant: "warning",
        text: "Yêu cầu hủy",
        bg: "warning",
      },
      refunded: { variant: "info", text: "Đã hoàn tiền" },
    }
    const config = statusConfig[status] || { variant: 'secondary', text: status }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const DETAILED_STATUS_TEXT = {
    preparing: "Chuẩn bị hàng",
    shipping_in_progress: "Bắt đầu giao hàng",
    delivered: "Đã giao thành công",
    cancelled: "Hủy đơn hàng",
    delivery_failed: "Giao hàng thất bại",
    refunded: "Hoàn tiền",
  };

  const getStatusOptions = (currentDetailedStatus) => {
    const transitions = {
      new: ["confirmed"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["shipping_in_progress", "cancelled"],
      shipping_in_progress: [
        "delivered",
        "delivery_failed",
        "cancelled",
      ],
      cancellation_requested: ["cancelled"],
      delivery_failed: [], // Có thể cho phép giao lại?
      delivered: [], // Chỉ có user xác nhận completed
    };
    // Lấy trạng thái chi tiết cuối cùng từ timeline
    const lastStatus = order?.timeline?.[order.timeline.length - 1]?.status;
    return transitions[lastStatus] || [];
  };

  const handleUpdateStatus = async () => {
    if (!statusForm.status) {
      toast.error('Vui lòng chọn trạng thái')
      return
    }

    try {
      // Chỉ truyền reason nếu có giá trị
      const metadata = {};
      if (statusForm.reason && statusForm.reason.trim()) {
        metadata.reason = statusForm.reason.trim();
      }

      await dispatch(updateOrderStatus({
        orderId: order._id,
        status: statusForm.status,
        metadata,
      })).unwrap()
      toast.success('Cập nhật trạng thái thành công')
      setShowStatusModal(false)
      setStatusForm({ status: "", reason: "" });
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    }
  }

  const handleApproveCancellation = async () => {
    try {
      await dispatch(approveCancellation(order._id)).unwrap()
      toast.success('Đã chấp nhận yêu cầu hủy đơn hàng thành công')
      setShowCancellationModal(false)
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi chấp nhận yêu cầu hủy')
    }
  }


  const getUserTypeText = (performedBy) => {
    if (performedBy === 'system') {
      return 'Hệ thống'
    }
    if (performedBy === 'admin') {
      return 'Quản trị viên'
    }
    return 'Khách hàng'
  }

  const isCancellationRequested = () => {
    return order?.timeline?.some(item => item.status === 'cancellation_requested')
  }

  const isCancellationApproved = () => {
    // Kiểm tra xem có yêu cầu hủy và đã được chấp nhận (status = cancelled)
    return isCancellationRequested() && order?.status === 'cancelled'
  }

  const isPendingStatus = () => {
    // Kiểm tra xem trạng thái hiện tại có phải là pending không
    const lastStatus = order?.timeline?.[order.timeline.length - 1]?.status;
    return lastStatus === 'new' || order?.status === 'pending'
  }

  const handleViewSnapshot = (orderLine) => {
    setSelectedOrderLine(orderLine)
    setShowSnapshotModal(true)
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
          {isCancellationRequested() && (
            <Button
              variant={isCancellationApproved() ? "secondary" : "success"}
              onClick={() => setShowCancellationModal(true)}
              disabled={isCancellationApproved()}
            >
              <i className={`bi ${isCancellationApproved() ? 'bi-check-circle-fill' : 'bi-check-lg'} me-2`}></i>
              {isCancellationApproved() ? 'Đã chấp nhận yêu cầu hủy' : 'Chấp nhận yêu cầu hủy'}
            </Button>
          )}
          {!isPendingStatus() && getStatusOptions(order.status).length > 0 && (
            <Button
              variant="primary"
              onClick={() => setShowStatusModal(true)}
              disabled={getStatusOptions().length === 0}
            >
              <i className="bi bi-arrow-repeat me-2"></i>
              Cập nhật trạng thái
            </Button>
          )}
        </div>
      </div>

      {isPendingStatus() && (
        <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-info-circle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
          <div>
            <strong>Đơn hàng đang chờ xác nhận</strong>
            <p className="mb-0 small">
              Đơn hàng này sẽ tự động được chuyển sang trạng thái "Đã xác nhận" sau 30 phút.
              Admin không cần cập nhật thủ công.
            </p>
          </div>
        </div>
      )}

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
                    <strong>Người nhận:</strong> {order.shippingAddress.recipientName}
                  </div>
                  <div className="mb-3">
                    <strong>Số điện thoại:</strong> {order.shippingAddress.phoneNumber}
                  </div>
                  <div className="mb-3">
                    <strong>Địa chỉ:</strong> {`${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`}
                  </div>
                  {order.notes && (
                    <div className="mb-3">
                      <strong>Ghi chú:</strong> {order.notes}
                    </div>
                  )}
                  {order.cancellationRequestReason && (
                    <div className="mb-3">
                      <strong>Lý do yêu cầu hủy:</strong>
                      <span className="text-danger ms-2">{order.cancellationRequestReason}</span>
                      {isCancellationApproved() && (
                        <div className="mt-1">
                          <small className="text-success">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Đã chấp nhận lúc {moment(order.cancelledAt).format('DD/MM/YYYY HH:mm')}
                          </small>
                        </div>
                      )}
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
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderLines.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={getImageSrc(item.productImage, 50, 50)}
                            alt={item.productName}
                            className="rounded me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => handleImageError(e, 50, 50)}
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
                      <td className="text-center">
                        {item.productSnapshot && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="btn-snapshot"
                            onClick={() => handleViewSnapshot(item)}
                            title="Xem ảnh chụp nhanh sản phẩm"
                          >
                            <i className="bi bi-camera-fill"></i>
                          </Button>
                        )}
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
                                {getUserTypeText(item.performedBy)}
                              </small>
                            </div>
                            <small className="text-muted">
                              {moment(item.timestamp).format('DD/MM HH:mm')}
                            </small>
                          </div>
                          <p className="mb-0 small">{item.description}</p>
                          {item.metadata?.reason && (
                            <p className="mb-0 small text-muted fst-italic">
                              <i className="bi bi-chat-quote me-1"></i>
                              "{item.metadata.reason}"
                            </p>
                          )}
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
                {getStatusOptions().map((status) => (
                  <option key={status} value={status}>
                    {DETAILED_STATUS_TEXT[status] || status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả <small className="text-muted">(tùy chọn)</small></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusForm.reason}
                onChange={(e) =>
                  setStatusForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Nhập lý do cập nhật (tùy chọn)"
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

      {/* Cancellation Approval Modal */}
      <Modal show={showCancellationModal} onHide={() => setShowCancellationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận chấp nhận yêu cầu hủy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <p>Bạn có chắc chắn muốn chấp nhận yêu cầu hủy đơn hàng này không?</p>
            <div className="bg-light p-3 rounded">
              <div className="mb-2">
                <strong>Mã đơn hàng:</strong> #{order._id.slice(-8)}
              </div>
              <div className="mb-2">
                <strong>Tổng tiền:</strong> {formatCurrency(order.totalAmount)}
              </div>
              {order.cancellationRequestReason && (
                <div className="mb-2">
                  <strong>Lý do hủy từ khách hàng:</strong>
                  <span className="text-danger ms-2">{order.cancellationRequestReason}</span>
                </div>
              )}
            </div>
            <div className="mt-3">
              <small className="text-muted">
                Sau khi chấp nhận, đơn hàng sẽ được chuyển sang trạng thái "Đã hủy" và không thể hoàn tác.
              </small>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancellationModal(false)}>
            Hủy bỏ
          </Button>
          <Button variant="success" onClick={handleApproveCancellation}>
            <i className="bi bi-check-lg me-2"></i>
            Chấp nhận yêu cầu hủy
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Product Snapshot Modal */}
      <ProductSnapshotModal
        show={showSnapshotModal}
        onHide={() => setShowSnapshotModal(false)}
        orderLine={selectedOrderLine}
      />
    </Container>
  )
}

export default OrderDetailPage