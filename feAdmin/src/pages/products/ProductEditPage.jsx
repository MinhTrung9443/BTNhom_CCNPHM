import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { fetchProducts, updateProduct } from '../../redux/slices/productsSlice';
import productService from '../../services/productService';
import { API_URL } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProductEditPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  
  const { loading: updateLoading, error: updateError } = useSelector(state => state.products);

  useEffect(() => {
    const loadProductAndCategories = async () => {
      try {
        setLoading(true);
        const [productRes, categoriesRes] = await Promise.all([
          productService.getProductById(productId),
          productService.getCategories(),
        ]);
        setProduct(productRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProductAndCategories();
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
      let uploadedImageUrls = [];
      if (newImageFiles.length > 0) {
        const uploadRes = await productService.uploadImages(newImageFiles);
        uploadedImageUrls = uploadRes.data.filePaths;
      }

      const finalImages = [...product.images, ...uploadedImageUrls];
      const { _id, ...productData } = { ...product, images: finalImages };

      const resultAction = await dispatch(updateProduct({ productId, productData }));
      if (updateProduct.fulfilled.match(resultAction)) {
        navigate('/products');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải lên hình ảnh');
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
              {updateError && <Alert variant="danger">{updateError}</Alert>}
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
                        <img src={img.startsWith('/uploads') ? `${API_URL}${img}` : img} alt={`product-${index}`} width="100" height="100" className="rounded object-fit-cover"/>
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
                        <img src={URL.createObjectURL(file)} alt={`preview-${index}`} width="100" height="100" className="rounded object-fit-cover"/>
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
                  <Button variant="primary" type="submit" disabled={updateLoading}>
                    {updateLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Lưu thay đổi'}
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