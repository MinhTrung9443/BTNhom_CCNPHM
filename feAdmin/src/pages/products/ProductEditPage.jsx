import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import productService from '../../services/productService';
import React from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getImageSrc, handleImageError } from '../../utils/imageUtils';
import { toast } from 'react-toastify';

const ProductEditPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const { categories } = useSelector(state => state.categories);
  const [newImageFiles, setNewImageFiles] = useState([]);



  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productRes = await productService.getProductById(productId);
        setProduct(productRes.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = [...e.target.files];
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      // Kiểm tra MIME type và extension
      if (
        (fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png') &&
        (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png'))
      ) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Chỉ hỗ trợ tệp JPG, PNG. Các tệp không hợp lệ: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setNewImageFiles(prev => [...prev, ...validFiles]);
    }

    // Reset input để có thể chọn lại cùng file nếu cần
    e.target.value = '';
  };

  const handleRemoveExistingImage = (imgUrl) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imgUrl),
    }));
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Add product fields
      formData.append('name', product.name);
      formData.append('description', product.description || '');
      formData.append('price', product.price);
      formData.append('discount', product.discount || 0);
      formData.append('stock', product.stock);
      formData.append('categoryId', product.categoryId?._id || product.categoryId);
      formData.append('isActive', product.isActive ? 'true' : 'false');

      // Add existing images as text fields
      product.images.forEach(imageUrl => {
        formData.append('images', imageUrl);
      });

      // Add new image files
      newImageFiles.forEach(file => {
        formData.append('images', file);
      });

      // Call productService directly with FormData
      const response = await productService.updateProduct(productId, formData);

      // Update the product state with the latest data from server
      if (response.data && response.data.data) {
        setProduct(response.data.data);
      }

      // Clear new image files since they're now part of the product
      setNewImageFiles([]);

      // Show success message
      toast.success('Cập nhật sản phẩm thành công');
      
      // Show temporary success alert
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật sản phẩm');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!product) return <Alert variant="warning">Không tìm thấy sản phẩm.</Alert>;

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="fw-bold mb-0">Chỉnh sửa sản phẩm</h4>
                  <small className="text-muted">Thay đổi sẽ được lưu ngay lập tức. Bạn có thể tiếp tục chỉnh sửa sau khi lưu.</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="position-relative">

              {showSuccessAlert && (
                <Alert variant="success" className="mb-3" dismissible onClose={() => setShowSuccessAlert(false)}>
                  <i className="bi bi-check-circle me-2"></i>
                  Sản phẩm đã được cập nhật thành công! Bạn có thể tiếp tục chỉnh sửa.
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                {saveLoading && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75" style={{ zIndex: 10 }}>
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <div className="mt-2">Đang lưu sản phẩm...</div>
                    </div>
                  </div>
                )}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên sản phẩm</Form.Label>
                      <Form.Control type="text" name="name" value={product.name} onChange={handleChange} required disabled={saveLoading} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Danh mục</Form.Label>
                      <Form.Select name="categoryId" value={product.categoryId?._id || product.categoryId} onChange={handleChange} required>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control as="textarea" rows={4} name="description" value={product.description} onChange={handleChange} />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giá (VND)</Form.Label>
                      <Form.Control type="number" name="price" value={product.price} onChange={handleChange} required min="0" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giảm giá (%)</Form.Label>
                      <Form.Control type="number" name="discount" value={product.discount} onChange={handleChange} min="0" max="100" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số lượng trong kho</Form.Label>
                      <Form.Control type="number" name="stock" value={product.stock} onChange={handleChange} required min="0" />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Hình ảnh hiện tại</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {product.images.map((img, index) => (
                      <div key={index} className="position-relative">
                        <img
                          src={getImageSrc(img, 100, 100)}
                          alt={`product-${index}`}
                          width="100"
                          height="100"
                          className="rounded object-fit-cover"
                          onError={(e) => handleImageError(e, 100, 100)}
                        />
                        <Button variant="danger" size="sm" className="position-absolute top-0 end-0" onClick={() => handleRemoveExistingImage(img)}>X</Button>
                      </div>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tải lên hình ảnh mới</Form.Label>
                  <Form.Control 
                    type="file" 
                    multiple 
                    onChange={handleImageChange} 
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png" 
                    disabled={saveLoading} 
                  />
                  <Form.Text className="text-muted">
                    Chỉ hỗ trợ tệp JPG, PNG
                  </Form.Text>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {newImageFiles.map((file, index) => (
                      <div key={index} className="position-relative">
                        <img src={URL.createObjectURL(file)} alt={`preview-${index}`} width="100" height="100" className="rounded object-fit-cover" />
                        <Button variant="danger" size="sm" className="position-absolute top-0 end-0" onClick={() => handleRemoveNewImage(index)}>X</Button>
                      </div>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="is-active-switch"
                    label="Đang hoạt động"
                    name="isActive"
                    checked={product.isActive}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button variant="outline-secondary" onClick={() => navigate('/products')} disabled={saveLoading}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Quay lại danh sách
                  </Button>
                  <div>
                    <Button variant="secondary" onClick={() => navigate('/products')} className="me-2" disabled={saveLoading}>
                      Hủy
                    </Button>
                  <Button variant="primary" type="submit" disabled={saveLoading}>
                    {saveLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductEditPage;