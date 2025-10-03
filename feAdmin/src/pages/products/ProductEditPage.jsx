import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
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
  const [error, setError] = useState(null);
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
    setNewImageFiles([...e.target.files]);
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
      await productService.updateProduct(productId, formData);

      // Show success message
      toast.success('Cập nhật sản phẩm thành công');

      // Navigate back to products page
      navigate('/products');
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật sản phẩm');
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
              <h4 className="fw-bold mb-0">Chỉnh sửa sản phẩm</h4>
            </Card.Header>
            <Card.Body>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên sản phẩm</Form.Label>
                      <Form.Control type="text" name="name" value={product.name} onChange={handleChange} required />
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
                  <Form.Control type="file" multiple onChange={handleImageChange} accept="image/*" />
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

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" onClick={() => navigate('/products')} className="me-2">
                    Hủy
                  </Button>
                  <Button variant="primary" type="submit">
                    Lưu thay đổi
                  </Button>
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