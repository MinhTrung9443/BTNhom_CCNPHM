import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createArticle, updateArticle, fetchArticleById, clearCurrentArticle } from '../../redux/slices/articlesSlice'
import { toast } from 'react-toastify'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { getImageSrc } from '../../utils/imageUtils'

const ArticleFormPage = () => {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentArticle, loading } = useSelector((state) => state.articles)
  const isEditing = !!articleId

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    status: 'draft',
  })
  const [tagInput, setTagInput] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null); // File object
  const [imagePreview, setImagePreview] = useState(null); // URL xem trước

  useEffect(() => {
    if (isEditing && articleId) {
      dispatch(fetchArticleById(articleId))
    }
    return () => {
      dispatch(clearCurrentArticle())
    }
  }, [dispatch, articleId, isEditing])

  useEffect(() => {
    if (currentArticle && isEditing) {
      setFormData({
        title: currentArticle.title || '',
        content: currentArticle.content || '',
        excerpt: currentArticle.excerpt || '',
        tags: currentArticle.tags || [],
        status: currentArticle.status || 'draft',
      })
      // Thêm dòng này:
      if (currentArticle.featuredImage) {
        setImagePreview(getImageSrc(currentArticle.featuredImage)); // Hiển thị ảnh cũ
      }
    }
  }, [currentArticle, isEditing])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }


  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Lưu file
      setImagePreview(URL.createObjectURL(file)); // Tạo link xem trước
    }
  };

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Tiêu đề không được vượt quá 200 ký tự'
    }

    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      newErrors.content = 'Nội dung không được để trống'
    }

    if (formData.excerpt && formData.excerpt.length > 500) {
      newErrors.excerpt = 'Mô tả ngắn không được vượt quá 500 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (publishNow = false) => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setSaveLoading(true);
    try {
      const articleData = {
        ...formData,
        status: publishNow ? 'published' : formData.status,
      };

      // --- THÊM LOGIC NÀY ---
      if (imageFile) {
        // Nếu có file ảnh mới, gán file vào
        articleData.featuredImage = imageFile;
      } else if (isEditing && currentArticle.featuredImage && imagePreview) {
        // Nếu đang edit, không có file mới, nhưng CÓ preview
        // (nghĩa là dùng lại ảnh cũ) -> gán lại URL ảnh cũ
        articleData.featuredImage = currentArticle.featuredImage;
      } else {
        // Không có file mới, cũng không có preview (đã bị xóa)
        articleData.featuredImage = ""; // Gửi chuỗi rỗng để xóa
      }
      // -----------------------

      if (isEditing) {
        await dispatch(updateArticle({ articleId, articleData })).unwrap();
        toast.success('Cập nhật bài viết thành công');
      } else {
        await dispatch(createArticle(articleData)).unwrap();
        toast.success('Tạo bài viết thành công');
      }
      
      navigate('/articles');
    } catch (error) {
    
      toast.error(error || 'Có lỗi xảy ra');
    } finally {
      setSaveLoading(false);
    }
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ]

  if (loading && isEditing) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate('/articles')}>
            <i className="bi bi-x-circle me-2"></i>
            Hủy
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => handleSave(false)}
            disabled={saveLoading}
          >
            {saveLoading ? (
              <Spinner as="span" animation="border" size="sm" className="me-2" />
            ) : (
              <i className="bi bi-save me-2"></i>
            )}
            Lưu nháp
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSave(true)}
            disabled={saveLoading}
          >
            {saveLoading ? (
              <Spinner as="span" animation="border" size="sm" className="me-2" />
            ) : (
              <i className="bi bi-send me-2"></i>
            )}
            Xuất bản
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề bài viết *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả ngắn</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Nhập mô tả ngắn cho bài viết..."
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  isInvalid={!!errors.excerpt}
                />
                <Form.Text className="text-muted">
                  {formData.excerpt.length}/500 ký tự
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.excerpt}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nội dung bài viết *</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: '400px', marginBottom: '50px' }}
                />
                {errors.content && (
                  <Alert variant="danger" className="mt-2">
                    {errors.content}
                  </Alert>
                )}
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>


          {/* Tags */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Thẻ (Tags)</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Nhập thẻ..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button variant="outline-primary" onClick={handleAddTag}>
                    Thêm
                  </Button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <Badge key={idx} bg="secondary" className="d-flex align-items-center gap-1">
                      {tag}
                      <i 
                        className="bi bi-x-circle" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRemoveTag(tag)}
                      ></i>
                    </Badge>
                  ))}
                </div>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Featured Image */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Ảnh đại diện (Featured Image)</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <Form.Text className="text-muted">
                  Ảnh này sẽ hiển thị khi chia sẻ và làm ảnh bìa.
                </Form.Text>
              </Form.Group>

              {imagePreview && (
                <div className="mt-3 position-relative">
                  <p className="text-muted small mb-1">Xem trước:</p>
                  <img
                    src={imagePreview}
                    alt="Xem trước ảnh đại diện"
                    className="rounded"
                    style={{ width: '100%', height: 'auto', maxHeight: '250px', objectFit: 'cover' }}
                    onError={(e) => handleImageError(e, 100, 100)}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      // Nếu đang edit, đừng xóa link ảnh cũ trong data
                      if (isEditing && currentArticle.featuredImage) {
                         setFormData(prev => ({...prev, featuredImage: null}));
                         setImagePreview(null); // Xóa preview
                      }
                    }}
                  >
                    <i className="bi bi-trash"></i> Xóa
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Status */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Trạng thái</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="archived">Lưu trữ</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ArticleFormPage
