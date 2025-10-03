import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import React from 'react'

import {
  fetchCancellationRequests,
  approveCancellation,
  clearCancellationRequests,
} from "../../redux/slices/ordersSlice";
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from 'react-toastify'
import moment from 'moment'

const CancellationRequestsPage = () => {
  const dispatch = useDispatch()
  const { cancellationRequests, cancellationMeta, loading } = useSelector((state) => state.orders);
  
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  })

  useEffect(() => {
    dispatch(fetchCancellationRequests({ 
      page: currentPage, 
      limit: 10,
      ...filters 
    }));
    
    return () => {
      dispatch(clearCancellationRequests());
    };
  }, [dispatch, currentPage, filters]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "primary", text: "Chờ xác nhận" },
      processing: { variant: "info", text: "Đang xử lý" },
      shipping: { variant: "warning", text: "Đang giao" },
      completed: { variant: "success", text: "Hoàn thành" },
      cancelled: { variant: "danger", text: "Đã hủy" },
      cancellation_requested: { variant: "warning", text: "Yêu cầu hủy" },
    }
    const config = statusConfig[status] || { variant: 'secondary', text: status }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const handleApproveClick = (order) => {
    setSelectedOrder(order)
    setShowApprovalModal(true)
  }

  const handleApproveCancellation = async () => {
    if (!selectedOrder) return

    try {
      await dispatch(approveCancellation(selectedOrder._id)).unwrap()
      toast.success('Đã chấp nhận yêu cầu hủy đơn hàng thành công')
      setShowApprovalModal(false)
      setSelectedOrder(null)
      // Refresh the list
      dispatch(fetchCancellationRequests({ 
        page: currentPage, 
        limit: 10,
        ...filters 
      }));
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi chấp nhận yêu cầu hủy')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    dispatch(fetchCancellationRequests({ 
      page: 1, 
      limit: 10,
      ...filters 
    }));
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading && cancellationRequests.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Yêu cầu hủy đơn hàng</h2>
        <Link to="/orders" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại đơn hàng
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </Col>
              <Col md={4}>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="preparing">Chuẩn bị hàng</option>
                  <option value="shipping">Đang giao</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button type="submit" variant="primary" className="w-100">
                  <i className="bi bi-search me-2"></i>
                  Tìm kiếm
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Results */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">
              Danh sách yêu cầu hủy ({cancellationMeta.totalItems || 0})
            </h5>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {cancellationRequests.length > 0 ? (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Lý do hủy</th>
                  <th>Ngày yêu cầu</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cancellationRequests.map((order) => (
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
                        <div className="fw-semibold">{order.userId.name}</div>
                        <small className="text-muted">{order.userId.email}</small>
                      </div>
                    </td>
                    <td className="fw-semibold">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {order.cancellationRequestReason || 'Không có lý do'}
                      </div>
                    </td>
                    <td>
                      {moment(order.cancellationRequestedAt).format('DD/MM/YYYY HH:mm')}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant={order.status === 'cancelled' ? "secondary" : "success"}
                          onClick={() => handleApproveClick(order)}
                          disabled={order.status === 'cancelled'}
                        >
                          <i className={`bi ${order.status === 'cancelled' ? 'bi-check-circle-fill' : 'bi-check-lg'} me-1`}></i>
                          {order.status === 'cancelled' ? 'Đã chấp nhận' : 'Chấp nhận'}
                        </Button>
                        <Link
                          to={`/orders/${order._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-eye me-1"></i>
                          Xem
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">Không có yêu cầu hủy nào</h5>
              <p className="text-muted">Hiện tại không có đơn hàng nào yêu cầu hủy.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {cancellationMeta.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
              </li>
              {[...Array(cancellationMeta.totalPages)].map((_, index) => (
                <li
                  key={index + 1}
                  className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === cancellationMeta.totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === cancellationMeta.totalPages}
                >
                  Sau
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận chấp nhận yêu cầu hủy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <p>Bạn có chắc chắn muốn chấp nhận yêu cầu hủy đơn hàng này không?</p>
              <div className="bg-light p-3 rounded">
                <div className="mb-2">
                  <strong>Mã đơn hàng:</strong> #{selectedOrder._id.slice(-8)}
                </div>
                <div className="mb-2">
                  <strong>Khách hàng:</strong> {selectedOrder.userId.name}
                </div>
                <div className="mb-2">
                  <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmount)}
                </div>
                <div className="mb-2">
                  <strong>Lý do hủy:</strong> {selectedOrder.cancellationRequestReason || 'Không có lý do'}
                </div>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  Sau khi chấp nhận, đơn hàng sẽ được chuyển sang trạng thái "Đã hủy" và không thể hoàn tác.
                </small>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Hủy bỏ
          </Button>
          <Button variant="success" onClick={handleApproveCancellation}>
            <i className="bi bi-check-lg me-2"></i>
            Chấp nhận yêu cầu hủy
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default CancellationRequestsPage