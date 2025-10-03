import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import React from 'react'

import {
  fetchPendingReturns,
  approveReturn,
  clearReturnRequests,
} from "../../redux/slices/ordersSlice";
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from 'react-toastify'
import moment from 'moment'

const ReturnRefundRequestsPage = () => {
  const dispatch = useDispatch()
  const { returnRequests, returnMeta, loading } = useSelector((state) => state.orders);
  
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchPendingReturns({ 
      page: currentPage, 
      limit: 10
    }));
    
    return () => {
      dispatch(clearReturnRequests());
    };
  }, [dispatch, currentPage]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      return_refund: { variant: "warning", text: "Chờ xử lý trả hàng" },
      refunded: { variant: "success", text: "Đã hoàn tiền" },
    }
    const config = statusConfig[status] || { variant: 'secondary', text: status }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const getDetailedStatusBadge = (timeline) => {
    if (!timeline || timeline.length === 0) return null;
    const latestStatus = timeline[timeline.length - 1].status;
    
    const statusConfig = {
      return_requested: { variant: "warning", text: "Yêu cầu trả hàng" },
      refunded: { variant: "success", text: "Đã hoàn tiền" },
    }
    const config = statusConfig[latestStatus] || { variant: 'secondary', text: latestStatus }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const handleApproveClick = (order) => {
    setSelectedOrder(order)
    setShowApprovalModal(true)
  }

  const handleApproveReturn = async () => {
    if (!selectedOrder) return

    try {
      await dispatch(approveReturn(selectedOrder._id)).unwrap()
      toast.success('Đã chấp nhận yêu cầu trả hàng/hoàn tiền thành công')
      setShowApprovalModal(false)
      setSelectedOrder(null)
      // Refresh the list
      dispatch(fetchPendingReturns({ 
        page: currentPage, 
        limit: 10
      }));
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi chấp nhận yêu cầu trả hàng')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const isRefunded = (timeline) => {
    if (!timeline || timeline.length === 0) return false;
    const latestStatus = timeline[timeline.length - 1].status;
    return latestStatus === 'refunded';
  }

  if (loading && returnRequests.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Yêu cầu trả hàng/hoàn tiền</h2>
        <Link to="/orders" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại đơn hàng
        </Link>
      </div>

      {/* Results */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">
              Danh sách yêu cầu trả hàng/hoàn tiền ({returnMeta.totalItems || 0})
            </h5>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {returnRequests.length > 0 ? (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái chung</th>
                  <th>Trạng thái chi tiết</th>
                  <th>Lý do trả hàng</th>
                  <th>Ngày yêu cầu</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {returnRequests.map((order) => (
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
                    <td>{getDetailedStatusBadge(order.timeline)}</td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {order.returnRequestReason || 'Không có lý do'}
                      </div>
                    </td>
                    <td>
                      {moment(order.returnRequestedAt).format('DD/MM/YYYY HH:mm')}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant={isRefunded(order.timeline) ? "secondary" : "success"}
                          onClick={() => handleApproveClick(order)}
                          disabled={isRefunded(order.timeline)}
                        >
                          <i className={`bi ${isRefunded(order.timeline) ? 'bi-check-circle-fill' : 'bi-check-lg'} me-1`}></i>
                          {isRefunded(order.timeline) ? 'Đã hoàn tiền' : 'Chấp nhận'}
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
              <h5 className="mt-3 text-muted">Không có yêu cầu trả hàng/hoàn tiền nào</h5>
              <p className="text-muted">Hiện tại không có đơn hàng nào yêu cầu trả hàng/hoàn tiền.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {returnMeta.totalPages > 1 && (
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
              {[...Array(returnMeta.totalPages)].map((_, index) => (
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
              <li className={`page-item ${currentPage === returnMeta.totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === returnMeta.totalPages}
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
          <Modal.Title>Xác nhận chấp nhận yêu cầu trả hàng/hoàn tiền</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <p>Bạn có chắc chắn muốn chấp nhận yêu cầu trả hàng/hoàn tiền cho đơn hàng này không?</p>
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
                  <strong>Lý do trả hàng:</strong> {selectedOrder.returnRequestReason || 'Không có lý do'}
                </div>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  Sau khi chấp nhận, đơn hàng sẽ được hoàn tiền và trạng thái chi tiết sẽ chuyển sang "Đã hoàn tiền".
                </small>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Hủy bỏ
          </Button>
          <Button variant="success" onClick={handleApproveReturn}>
            <i className="bi bi-check-lg me-2"></i>
            Chấp nhận và hoàn tiền
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ReturnRefundRequestsPage
