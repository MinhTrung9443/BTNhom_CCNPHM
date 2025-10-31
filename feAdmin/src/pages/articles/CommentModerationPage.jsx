import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup, Modal, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchComments, 
  approveComment, 
  rejectComment, 
  deleteComment,
  bulkApproveComments,
  bulkRejectComments,
  bulkDeleteComments
} from '../../redux/slices/commentsSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import ConfirmModal from '../../components/common/ConfirmModal'
import { toast } from 'react-toastify'
import moment from 'moment'

const CommentModerationPage = () => {
  const dispatch = useDispatch()
  const { comments, pagination, loading } = useSelector((state) => state.comments)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    sortBy: '-createdAt',
  })
  const [selectedComments, setSelectedComments] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedComment, setSelectedComment] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchComments(filters))
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

  const handleSelectComment = (commentId) => {
    setSelectedComments(prev => 
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([])
    } else {
      setSelectedComments(comments.map(c => c._id))
    }
  }

  const handleApproveComment = async (commentId) => {
    setActionLoading(prev => ({ ...prev, [commentId]: true }))
    try {
      await dispatch(approveComment(commentId)).unwrap()
      toast.success('Đã duyệt bình luận')
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    } finally {
      setActionLoading(prev => ({ ...prev, [commentId]: false }))
    }
  }

  const handleRejectComment = (comment) => {
    setSelectedComment(comment)
    setRejectNotes('')
    setShowRejectModal(true)
  }

  const confirmRejectComment = async () => {
    if (!selectedComment) return

    setRejectLoading(true)
    try {
      await dispatch(rejectComment({ 
        commentId: selectedComment._id, 
        moderationNotes: rejectNotes.trim() || 'Admin từ chối bình luận này'
      })).unwrap()
      toast.success('Đã từ chối bình luận')
      setShowRejectModal(false)
      setSelectedComment(null)
      setRejectNotes('')
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    } finally {
      setRejectLoading(false)
    }
  }

  const handleDeleteComment = (comment) => {
    setSelectedComment(comment)
    setShowDeleteModal(true)
  }

  const confirmDeleteComment = async () => {
    if (!selectedComment) return

    setDeleteLoading(true)
    try {
      await dispatch(deleteComment(selectedComment._id)).unwrap()
      toast.success('Xóa bình luận thành công')
      setShowDeleteModal(false)
      setSelectedComment(null)
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi xóa bình luận')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedComments.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bình luận')
      return
    }

    setBulkActionLoading(true)
    try {
      switch (action) {
        case 'approve':
          await dispatch(bulkApproveComments(selectedComments)).unwrap()
          toast.success(`Đã duyệt ${selectedComments.length} bình luận`)
          break
        case 'reject':
          await dispatch(bulkRejectComments(selectedComments)).unwrap()
          toast.success(`Đã từ chối ${selectedComments.length} bình luận`)
          break
        case 'delete':
          await dispatch(bulkDeleteComments(selectedComments)).unwrap()
          toast.success(`Đã xóa ${selectedComments.length} bình luận`)
          break
      }
      setSelectedComments([])
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Chờ duyệt' },
      approved: { bg: 'success', text: 'Đã duyệt' },
      rejected: { bg: 'danger', text: 'Đã từ chối' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge bg={config.bg}>{config.text}</Badge>
  }

  const getLevelBadge = (level) => {
    const levels = ['Gốc', 'Cấp 1', 'Cấp 2']
    return <Badge bg="info">{levels[level] || 'Gốc'}</Badge>
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý bình luận</h2>
        {selectedComments.length > 0 && (
          <div className="d-flex gap-2">
            <Button 
              variant="success" 
              size="sm"
              onClick={() => handleBulkAction('approve')}
              disabled={bulkActionLoading}
            >
              <i className="bi bi-check-circle me-2"></i>
              Duyệt ({selectedComments.length})
            </Button>
            <Button 
              variant="warning" 
              size="sm"
              onClick={() => handleBulkAction('reject')}
              disabled={bulkActionLoading}
            >
              <i className="bi bi-x-circle me-2"></i>
              Từ chối ({selectedComments.length})
            </Button>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => handleBulkAction('delete')}
              disabled={bulkActionLoading}
            >
              <i className="bi bi-trash me-2"></i>
              Xóa ({selectedComments.length})
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="-createdAt">Mới nhất</option>
                <option value="createdAt">Cũ nhất</option>
                <option value="-likes">Nhiều lượt thích nhất</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Comments Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : comments.length > 0 ? (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '40px' }}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedComments.length === comments.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Bình luận</th>
                    <th>Bài viết</th>
                    <th>Người dùng</th>
                    <th>Cấp độ</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú kiểm duyệt</th>
                    <th>Lượt thích</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedComments.includes(comment._id)}
                          onChange={() => handleSelectComment(comment._id)}
                        />
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div className="text-truncate">{comment.content}</div>
                        {comment.isEdited && (
                          <small className="text-muted">
                            <i className="bi bi-pencil me-1"></i>
                            Đã chỉnh sửa
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {comment.article?.title || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div>
                            <div className="fw-semibold">{comment.author?.name || 'N/A'}</div>
                            <small className="text-muted">{comment.author?.email || ''}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {getLevelBadge(comment.level)}
                      </td>
                      <td>
                        {getStatusBadge(comment.status)}
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {comment.moderationNotes ? (
                            <small className="text-muted">{comment.moderationNotes}</small>
                          ) : (
                            <small className="text-muted fst-italic">Chưa có ghi chú</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <i className="bi bi-heart me-1"></i>
                        {comment.likes || 0}
                      </td>
                      <td>
                        <small className="text-muted">
                          {moment(comment.createdAt).format('DD/MM/YYYY HH:mm')}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {comment.status === 'pending' && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleApproveComment(comment._id)}
                                disabled={actionLoading[comment._id]}
                                title="Duyệt"
                              >
                                {actionLoading[comment._id] ? (
                                  <Spinner as="span" animation="border" size="sm" />
                                ) : (
                                  <i className="bi bi-check"></i>
                                )}
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleRejectComment(comment)}
                                title="Từ chối"
                              >
                                <i className="bi bi-x"></i>
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteComment(comment)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
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
              <i className="bi bi-chat-dots" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">Không tìm thấy bình luận nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteComment}
        title="Xác nhận xóa bình luận"
        message={`Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Từ chối bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComment && (
            <div className="mb-3">
              <strong>Nội dung bình luận:</strong>
              <p className="text-muted mt-2">{selectedComment.content}</p>
            </div>
          )}
          <Form.Group>
            <Form.Label>Lý do từ chối <small className="text-muted">(tùy chọn)</small></Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Nhập lý do từ chối bình luận... (user sẽ nhận được thông báo)"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
            />
            <Form.Text className="text-muted">
              Lý do này sẽ được gửi đến người dùng qua thông báo
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmRejectComment}
            disabled={rejectLoading}
          >
            {rejectLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận từ chối'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default CommentModerationPage
