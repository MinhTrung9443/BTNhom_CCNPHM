import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Form, Alert } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import moment from 'moment'
import articleService from '../../services/articleService'
import api from '../../services/apiService'
import { getImageSrc } from '../../utils/imageUtils'

const ArticleDetailPage = () => {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [article, setArticle] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false
  })
  const [likingComments, setLikingComments] = useState({})

  useEffect(() => {
    fetchArticleDetail()
    fetchComments()
  }, [articleId])

  const fetchArticleDetail = async () => {
    try {
      setLoading(true)
      const response = await articleService.getArticleById(articleId)
      setArticle(response.data)
    } catch (error) {
      toast.error('Không thể tải bài viết')
      navigate('/articles')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (page = 1) => {
    try {
      setCommentsLoading(true)
      const response = await articleService.getArticleComments(articleId, {
        page,
        limit: 10,
        status: 'approved'
      })
      setComments(response.data)
      setPagination(response.meta)
    } catch (error) {
      toast.error('Không thể tải bình luận')
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()

    if (!commentText.trim()) {
      toast.warning('Vui lòng nhập nội dung bình luận')
      return
    }

    try {
      setSubmitting(true)

      const response = await api.post(`/articles/public/${articleId}/comments`, {
        content: commentText,
        parentCommentId: replyTo?._id || null
      })

      if (response.data.success) {
        toast.success('Bình luận thành công')
        setCommentText('')
        setReplyTo(null)
        fetchComments(pagination.currentPage)
      } else {
        toast.error(response.data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error(error.message || 'Không thể gửi bình luận')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = (comment) => {
    setReplyTo(comment)
    setCommentText('')
    // Scroll to comment form
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelReply = () => {
    setReplyTo(null)
    setCommentText('')
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return

    try {
      const response = await api.delete(`/comments/${commentId}`)

      if (response.data.success) {
        toast.success('Xóa bình luận thành công')
        fetchComments(pagination.currentPage)
      } else {
        toast.error(response.data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error(error.message || 'Không thể xóa bình luận')
    }
  }

  const handleToggleLike = async (commentId) => {
    try {
      setLikingComments(prev => ({ ...prev, [commentId]: true }))

      const response = await api.post(`/comments/${commentId}/like`)

      if (response.data.success) {
        // Update comment likes in state without refetching
        const updateCommentLikes = (commentsList) => {
          return commentsList.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                likes: response.data.data.likes,
                userInteraction: {
                  ...comment.userInteraction,
                  hasLiked: response.data.data.liked
                }
              }
            }
            // Update nested replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentLikes(comment.replies)
              }
            }
            return comment
          })
        }

        setComments(updateCommentLikes(comments))
      }
    } catch (error) {
      toast.error(error.message || 'Không thể thích bình luận')
    } finally {
      setLikingComments(prev => ({ ...prev, [commentId]: false }))
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

  const renderComment = (comment, level = 0) => {
    const isAdmin = comment.author?.role === 'admin'
    const canDelete = user?.role === 'admin' || comment.author?._id === user?._id

    return (
      <div key={comment._id} className={`mb-3 ${level > 0 ? 'ms-4' : ''}`}>
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                  {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="fw-semibold">
                    {comment.author?.name || 'User'}
                    {isAdmin && (
                      <Badge bg="primary" className="ms-2" style={{ fontSize: '0.7rem' }}>
                        Admin
                      </Badge>
                    )}
                  </div>
                  <small className="text-muted">
                    {moment(comment.createdAt).fromNow()}
                    {comment.isEdited && ' (đã chỉnh sửa)'}
                  </small>
                </div>
              </div>
              <div className="d-flex gap-2">
                {level < 2 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-decoration-none p-0"
                    onClick={() => handleReply(comment)}
                  >
                    <i className="bi bi-reply me-1"></i>
                    Trả lời
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger text-decoration-none p-0"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                )}
              </div>
            </div>
            <p className="mb-2">{comment.content}</p>
            <div className="d-flex align-items-center gap-3 text-muted small">
              <Button
                variant="link"
                size="sm"
                className={`text-decoration-none p-0 ${comment.userInteraction?.hasLiked ? 'text-primary' : 'text-muted'}`}
                onClick={() => handleToggleLike(comment._id)}
                disabled={likingComments[comment._id]}
              >
                {likingComments[comment._id] ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  <>
                    <i className={`bi ${comment.userInteraction?.hasLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'} me-1`}></i>
                    {comment.likes || 0}
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  if (!article) {
    return (
      <Container fluid>
        <Alert variant="danger">Không tìm thấy bài viết</Alert>
      </Container>
    )
  }

  return (
    <Container fluid>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/articles')}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </Button>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate(`/articles/edit/${article._id}`)}>
            <i className="bi bi-pencil me-2"></i>
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <Row>
        {/* Article Content */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              {/* Title & Meta */}
              <div className="mb-4">
                <h1 className="fw-bold mb-3">{article.title}</h1>
                <div className="d-flex flex-wrap gap-3 text-muted small mb-3">
                  <span>
                    <i className="bi bi-person-circle me-1"></i>
                    {article.author?.name || 'Admin'}
                  </span>
                  <span>
                    <i className="bi bi-calendar me-1"></i>
                    {moment(article.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                  {article.publishedAt && (
                    <span>
                      <i className="bi bi-send me-1"></i>
                      Xuất bản: {moment(article.publishedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  )}
                </div>
                <div className="mb-3">
                  {getStatusBadge(article.status)}
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {article.tags.map((tag, idx) => (
                      <Badge key={idx} bg="light" text="dark">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Image */}
              {article.featuredImage && (
                <div className="mb-4">
                  <img
                    src={getImageSrc(article.featuredImage)}
                    alt={article.title}
                    className="img-fluid rounded"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Excerpt */}
              {article.excerpt && (
                <div className="mb-4 p-3 bg-light rounded">
                  <p className="mb-0 fst-italic">{article.excerpt}</p>
                </div>
              )}

              {/* Content */}
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </Card.Body>
          </Card>

          {/* Comments Section */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="bi bi-chat-dots me-2"></i>
                Bình luận ({article.stats?.comments || 0})
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Comment Form */}
              <div id="comment-form" className="mb-4">
                {replyTo && (
                  <Alert variant="info" className="d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-reply me-2"></i>
                      Đang trả lời <strong>{replyTo.author?.name}</strong>
                    </span>
                    <Button variant="link" size="sm" onClick={handleCancelReply}>
                      <i className="bi bi-x-lg"></i>
                    </Button>
                  </Alert>
                )}
                <Form onSubmit={handleSubmitComment}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={replyTo ? "Viết câu trả lời..." : "Viết bình luận..."}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={submitting}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end gap-2">
                    {replyTo && (
                      <Button variant="outline-secondary" onClick={handleCancelReply} disabled={submitting}>
                        Hủy
                      </Button>
                    )}
                    <Button variant="primary" type="submit" disabled={submitting || !commentText.trim()}>
                      {submitting ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Gửi bình luận
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Comments List */}
              {commentsLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : comments.length > 0 ? (
                <>
                  {comments.map(comment => renderComment(comment))}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Button
                        variant="outline-primary"
                        disabled={!pagination.hasPrev}
                        onClick={() => fetchComments(pagination.currentPage - 1)}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </Button>
                      <span className="mx-3 align-self-center">
                        Trang {pagination.currentPage} / {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline-primary"
                        disabled={!pagination.hasNext}
                        onClick={() => fetchComments(pagination.currentPage + 1)}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-chat" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2">Chưa có bình luận nào</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Thống kê</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span><i className="bi bi-eye me-2"></i>Lượt xem</span>
                <strong>{article.stats?.views || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span><i className="bi bi-heart me-2"></i>Lượt thích</span>
                <strong>{article.stats?.likes || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span><i className="bi bi-chat me-2"></i>Bình luận</span>
                <strong>{article.stats?.comments || 0}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span><i className="bi bi-share me-2"></i>Chia sẻ</span>
                <strong>{article.stats?.shares || 0}</strong>
              </div>
            </Card.Body>
          </Card>

          {article.seoMeta && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0">SEO</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Tiêu đề SEO</small>
                  <div className="small">{article.seoMeta.title || article.title}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Mô tả SEO</small>
                  <div className="small">{article.seoMeta.description || article.excerpt}</div>
                </div>
                {article.seoMeta.keywords && article.seoMeta.keywords.length > 0 && (
                  <div>
                    <small className="text-muted d-block mb-1">Từ khóa</small>
                    <div className="d-flex flex-wrap gap-1">
                      {article.seoMeta.keywords.map((keyword, idx) => (
                        <Badge key={idx} bg="secondary" className="small">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default ArticleDetailPage
