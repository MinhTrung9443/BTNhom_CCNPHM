import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup, Modal, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchArticles, deleteArticle, publishArticle, unpublishArticle } from '../../redux/slices/articlesSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import ConfirmModal from '../../components/common/ConfirmModal'
import { toast } from 'react-toastify'
import moment from 'moment'
import { getImageSrc, handleImageError } from '../../utils/imageUtils'

const ArticlesPage = () => {
  const dispatch = useDispatch()
  const { articles, pagination, loading } = useSelector((state) => state.articles)
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    sortBy: 'createdAt',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    dispatch(fetchArticles(filters))
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

  const handleCreateArticle = () => {
    navigate('/articles/create')
  }

  const handleEditArticle = (article) => {
    navigate(`/articles/edit/${article._id}`)
  }

  const handleDeleteArticle = (article) => {
    setSelectedArticle(article)
    setShowDeleteModal(true)
  }

  const confirmDeleteArticle = async () => {
    if (!selectedArticle) return

    setDeleteLoading(true)
    try {
      await dispatch(deleteArticle(selectedArticle._id)).unwrap()
      toast.success('Xóa bài viết thành công')
      setShowDeleteModal(false)
      setSelectedArticle(null)
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi xóa bài viết')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handlePublishToggle = async (article) => {
    const articleId = article._id
    setActionLoading(prev => ({ ...prev, [articleId]: true }))
    
    try {
      if (article.status === 'published') {
        await dispatch(unpublishArticle(articleId)).unwrap()
        toast.success('Đã chuyển bài viết về nháp')
      } else {
        await dispatch(publishArticle(articleId)).unwrap()
        toast.success('Đã xuất bản bài viết')
      }
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    } finally {
      setActionLoading(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { bg: 'secondary', text: 'Nháp' },
      published: { bg: 'success', text: 'Đã xuất bản' },
      archived: { bg: 'dark', text: 'Lưu trữ' },
    }
    const config = statusConfig[status] || statusConfig.draft
    return <Badge bg={config.bg}>{config.text}</Badge>
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý bài viết</h2>
        <Button variant="primary" onClick={handleCreateArticle}>
          <i className="bi bi-plus-circle me-2"></i>
          Tạo bài viết mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
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
                <option value="draft">Nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">Mới nhất</option>
                <option value="publishedAt">Xuất bản gần đây</option>
                <option value="title">Theo tiêu đề</option>
                <option value="views">Lượt xem cao nhất</option>
                <option value="likes">Lượt thích nhiều nhất</option>
                <option value="comments">Bình luận nhiều nhất</option>
                <option value="shares">Chia sẻ nhiều nhất</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Articles Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : articles.length > 0 ? (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Bài viết</th>
                    <th>Trạng thái</th>
                    <th>Thống kê</th>
                    <th>Ngày tạo</th>
                    <th>Ngày xuất bản</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div style={{ maxWidth: '400px' }}>
                            <div className="fw-semibold">{article.title}</div>
                            {article.excerpt && (
                              <small className="text-muted">
                                {article.excerpt.substring(0, 80)}...
                              </small>
                            )}
                            {article.tags && article.tags.length > 0 && (
                              <div className="mt-1">
                                {article.tags.slice(0, 3).map((tag, idx) => (
                                  <Badge key={idx} bg="light" text="dark" className="me-1">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(article.status)}
                      </td>
                      <td>
                        <div className="small">
                          <div><i className="bi bi-eye me-1"></i>{article.stats?.views || 0} lượt xem</div>
                          <div><i className="bi bi-heart me-1"></i>{article.stats?.likes || 0} thích</div>
                          <div><i className="bi bi-chat me-1"></i>{article.stats?.comments || 0} bình luận</div>
                          <div><i className="bi bi-share me-1"></i>{article.stats?.shares || 0} chia sẻ</div>
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {moment(article.createdAt).format('DD/MM/YYYY HH:mm')}
                        </small>
                      </td>
                      <td>
                        {article.publishedAt ? (
                          <small className="text-muted">
                            {moment(article.publishedAt).format('DD/MM/YYYY HH:mm')}
                          </small>
                        ) : (
                          <small className="text-muted">-</small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditArticle(article)}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant={article.status === 'published' ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            onClick={() => handlePublishToggle(article)}
                            disabled={actionLoading[article._id]}
                            title={article.status === 'published' ? 'Chuyển về nháp' : 'Xuất bản'}
                          >
                            {actionLoading[article._id] ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              <i className={article.status === 'published' ? 'bi bi-archive' : 'bi bi-send'}></i>
                            )}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteArticle(article)}
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
              <i className="bi bi-file-text" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">Không tìm thấy bài viết nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteArticle}
        title="Xác nhận xóa bài viết"
        message={`Bạn có chắc chắn muốn xóa bài viết "${selectedArticle?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteLoading}
      />
    </Container>
  )
}

export default ArticlesPage
