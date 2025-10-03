import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import productService from '../../services/productService'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, deleteProduct } from '../../redux/slices/productsSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import ConfirmModal from '../../components/common/ConfirmModal'
import { toast } from 'react-toastify'
import moment from 'moment'
import { getImageSrc, handleImageError } from '../../utils/imageUtils'
import React from 'react'
const ProductsPage = () => {
  const dispatch = useDispatch()
  const { products, pagination, loading } = useSelector((state) => state.products)
  const { categories } = useSelector((state) => state.categories)
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    sortBy: 'createdAt',
    isActive: '',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newImageFiles, setNewImageFiles] = useState([]);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    categoryId: '',
    images: [],
    isActive: true, // Default to active
  })

  useEffect(() => {
    dispatch(fetchProducts(filters))
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

  const handleCreateProduct = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      discount: '',
      stock: '',
      categoryId: '',
      images: [],
      isActive: true, // Default to active
    })
    setNewImageFiles([]);
    setIsEditing(false)
    setShowProductModal(true)
  }

  const handleEditProduct = (product) => {
    navigate(`/products/edit/${product._id}`)
  }

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const handleProductFormChange = (key, value) => {
    setProductForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveProduct = async () => {
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Add product fields
      formData.append('name', productForm.name);
      formData.append('description', productForm.description || '');
      formData.append('price', parseFloat(productForm.price));
      formData.append('discount', productForm.discount ? parseFloat(productForm.discount) : 0);
      formData.append('stock', parseInt(productForm.stock));
      formData.append('categoryId', productForm.categoryId);
      formData.append('isActive', productForm.isActive ? 'true' : 'false');

      if (isEditing) {
        // Add existing images as text fields
        (selectedProduct.images || []).forEach(imageUrl => {
          formData.append('images', imageUrl);
        });

        // Add new image files
        newImageFiles.forEach(file => {
          formData.append('images', file);
        });

        // Call productService directly with FormData
        await productService.updateProduct(selectedProduct._id, formData);
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        // Add new image files for creation
        newImageFiles.forEach(file => {
          formData.append('images', file);
        });

        // Call productService directly with FormData
        await productService.createProduct(formData);
        toast.success('Tạo sản phẩm thành công')
      }

      setShowProductModal(false)
      setSelectedProduct(null)
      setNewImageFiles([])

      // Refresh the products list
      dispatch(fetchProducts(filters))
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
    }
  }

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return

    setDeleteLoading(true)
    try {
      await dispatch(deleteProduct(selectedProduct._id)).unwrap()
      toast.success('Xóa sản phẩm thành công')
      setShowDeleteModal(false)
      setSelectedProduct(null)
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi xóa sản phẩm')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <Badge bg="danger">Hết hàng</Badge>
    } else if (stock < 10) {
      return <Badge bg="warning">Sắp hết</Badge>
    } else {
      return <Badge bg="success">Còn hàng</Badge>
    }
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý sản phẩm</h2>
        <Button variant="primary" onClick={handleCreateProduct}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm sản phẩm
        </Button>
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
                  placeholder="Tìm kiếm sản phẩm..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">Mới nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="price">Giá thấp đến cao</option>
                <option value="-price">Giá cao đến thấp</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : products.length > 0 ? (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={getImageSrc(product.images?.[0], 50, 50)}
                            alt={product.name}
                            className="rounded me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => handleImageError(e, 50, 50)}
                          />
                          <div>
                            <div className="fw-semibold">{product.name}</div>
                            <small className="text-muted">
                              {product.description?.substring(0, 50)}...
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="secondary">
                          {product.categoryId?.name || 'Chưa phân loại'}
                        </Badge>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">
                            {formatCurrency(product.price * (1 - (product.discount || 0) / 100))}
                          </div>
                          {product.discount > 0 && (
                            <small className="text-muted text-decoration-line-through">
                              {formatCurrency(product.price)}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{product.stock}</div>
                        {getStockBadge(product.stock)}
                      </td>
                      <td>
                        {product.discount > 0 && (
                          <Badge bg="danger" className="me-1">
                            -{product.discount}%
                          </Badge>
                        )}
                        <Badge bg={product.isActive ? 'success' : 'secondary'}>
                          {product.isActive ? 'Hoạt động' : 'Ngừng bán'}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {moment(product.createdAt).format('DD/MM/YYYY')}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
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
              <i className="bi bi-box-seam" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Product Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên sản phẩm *</Form.Label>
                  <Form.Control
                    type="text"
                    value={productForm.name}
                    onChange={(e) => handleProductFormChange('name', e.target.value)}
                    placeholder="Nhập tên sản phẩm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select
                    value={productForm.categoryId}
                    onChange={(e) => handleProductFormChange('categoryId', e.target.value)}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={productForm.description}
                onChange={(e) => handleProductFormChange('description', e.target.value)}
                placeholder="Nhập mô tả sản phẩm"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={productForm.price}
                    onChange={(e) => handleProductFormChange('price', e.target.value)}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giảm giá (%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={productForm.discount}
                    onChange={(e) => handleProductFormChange('discount', e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tồn kho *</Form.Label>
                  <Form.Control
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => handleProductFormChange('stock', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewImageFiles([...e.target.files])}
              />
              <div className="d-flex flex-wrap gap-2 mt-2">
                {newImageFiles.map((file, index) => (
                  <div key={index} className="position-relative">
                    <img src={URL.createObjectURL(file)} alt={`preview-${index}`} width="80" height="80" className="rounded object-fit-cover" />
                    <Button variant="danger" size="sm" className="position-absolute top-0 end-0" style={{ lineHeight: 0.5, padding: '0.2rem 0.4rem' }} onClick={() => setNewImageFiles(prev => prev.filter((_, i) => i !== index))}>&times;</Button>
                  </div>
                ))}
              </div>
              <Form.Text className="text-muted">
                Chọn nhiều hình ảnh cho sản phẩm (JPG, PNG)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="is-active-switch"
                label="Đang hoạt động"
                checked={productForm.isActive}
                onChange={(e) => handleProductFormChange('isActive', e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveProduct}>
            {isEditing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteProduct}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteLoading}
      />
    </Container>
  )
}

export default ProductsPage