import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './../../styles/admin.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      const mockProducts = [
        {
          id: 1,
          name: 'Bánh Pía Đậu Xanh',
          category: 'pia-dau-xanh',
          price: 45000,
          stock: 150,
          status: 'active',
          image: '/images/pia-dau-xanh.jpg',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          name: 'Bánh Pía Thịt',
          category: 'pia-thit',
          price: 50000,
          stock: 89,
          status: 'active',
          image: '/images/pia-thit.jpg',
          createdAt: '2024-01-14'
        },
        {
          id: 3,
          name: 'Bánh Ín',
          category: 'banh-in',
          price: 35000,
          stock: 0,
          status: 'inactive',
          image: '/images/banh-in.jpg',
          createdAt: '2024-01-13'
        }
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      // This would be replaced with actual API call
      setProducts(products.filter(p => p.id !== productId));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Hoạt động</Badge>;
      case 'inactive':
        return <Badge bg="secondary">Ngưng bán</Badge>;
      case 'out-of-stock':
        return <Badge bg="danger">Hết hàng</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getCategoryName = (category) => {
    const categories = {
      'pia-dau-xanh': 'Bánh pía đậu xanh',
      'pia-thit': 'Bánh pía thịt',
      'pia-trung': 'Bánh pía trứng',
      'pia-dua': 'Bánh pía dừa',
      'banh-in': 'Bánh ín',
      'banh-cam': 'Bánh cam',
      'kem-bo': 'Kem bơ'
    };
    return categories[category] || category;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Container fluid className="admin-products">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-title">
                <i className="fas fa-box me-2"></i>
                Quản lý sản phẩm
              </h2>
              <p className="text-muted">Quản lý danh sách sản phẩm trong cửa hàng</p>
            </div>
            <Button as={Link} to="/admin/products/new" variant="primary">
              <i className="fas fa-plus me-2"></i>
              Thêm sản phẩm mới
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="pia-dau-xanh">Bánh pía đậu xanh</option>
            <option value="pia-thit">Bánh pía thịt</option>
            <option value="pia-trung">Bánh pía trứng</option>
            <option value="pia-dua">Bánh pía dừa</option>
            <option value="banh-in">Bánh ín</option>
            <option value="banh-cam">Bánh cam</option>
            <option value="kem-bo">Kem bơ</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Products Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-thumbnail me-3"
                          onError={(e) => {
                            e.target.src = '/images/placeholder.jpg';
                          }}
                        />
                        <div>
                          <h6 className="mb-0">{product.name}</h6>
                          <small className="text-muted">ID: {product.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{getCategoryName(product.category)}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <span className={product.stock === 0 ? 'text-danger' : 'text-success'}>
                        {product.stock}
                      </span>
                    </td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as={Link}
                          to={`/admin/products/${product.id}/edit`}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteModal(true);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Không tìm thấy sản phẩm nào</h5>
              <p className="text-muted">Hãy thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Bạn có chắc chắn muốn xóa sản phẩm <strong>{productToDelete?.name}</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteProduct(productToDelete?.id)}
          >
            Xóa sản phẩm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminProducts;
