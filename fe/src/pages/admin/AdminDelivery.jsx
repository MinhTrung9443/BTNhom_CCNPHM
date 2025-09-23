import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import './../../styles/admin.css';

const AdminDelivery = () => {
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryMethods();
  }, []);

  const fetchDeliveryMethods = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockMethods = [
        {
          id: 1,
          name: 'Giao hàng tiêu chuẩn',
          description: 'Giao hàng trong 2-3 ngày làm việc',
          cost: 30000,
          estimatedDays: '2-3',
          status: 'active',
          maxWeight: 10,
          freeShippingThreshold: 500000
        },
        {
          id: 2,
          name: 'Giao hàng nhanh',
          description: 'Giao hàng trong 1 ngày',
          cost: 50000,
          estimatedDays: '1',
          status: 'active',
          maxWeight: 5,
          freeShippingThreshold: 1000000
        },
        {
          id: 3,
          name: 'Giao hàng hỏa tốc',
          description: 'Giao hàng trong 2-4 giờ',
          cost: 100000,
          estimatedDays: '0',
          status: 'inactive',
          maxWeight: 3,
          freeShippingThreshold: null
        }
      ];
      setDeliveryMethods(mockMethods);
    } catch (error) {
      console.error('Error fetching delivery methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' ?
      <Badge bg="success">Hoạt động</Badge> :
      <Badge bg="secondary">Không hoạt động</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Container fluid className="admin-delivery">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-title">
                <i className="fas fa-truck me-2"></i>
                Quản lý phương thức vận chuyển
              </h2>
              <p className="text-muted">Cấu hình các phương thức giao hàng</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <i className="fas fa-plus me-2"></i>
              Thêm phương thức mới
            </Button>
          </div>
        </Col>
      </Row>

      {/* Delivery Methods Table */}
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
                  <th>Tên phương thức</th>
                  <th>Mô tả</th>
                  <th>Phí vận chuyển</th>
                  <th>Thời gian</th>
                  <th>Điều kiện</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {deliveryMethods.map((method) => (
                  <tr key={method.id}>
                    <td>
                      <strong>{method.name}</strong>
                    </td>
                    <td>{method.description}</td>
                    <td>
                      {method.freeShippingThreshold ?
                        `${formatCurrency(method.cost)} (Miễn phí từ ${formatCurrency(method.freeShippingThreshold)})` :
                        formatCurrency(method.cost)
                      }
                    </td>
                    <td>
                      {method.estimatedDays === '0' ?
                        '2-4 giờ' :
                        `${method.estimatedDays} ngày`
                      }
                    </td>
                    <td>
                      <div>
                        <small>Tối đa: {method.maxWeight}kg</small>
                        {method.freeShippingThreshold && (
                          <div><small>Miễn phí: {formatCurrency(method.freeShippingThreshold)}</small></div>
                        )}
                      </div>
                    </td>
                    <td>{getStatusBadge(method.status)}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => {
                            setSelectedMethod(method);
                            setShowEditModal(true);
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
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

          {deliveryMethods.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-truck fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Chưa có phương thức vận chuyển nào</h5>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Thêm phương thức đầu tiên
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create Delivery Method Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm phương thức vận chuyển mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên phương thức</Form.Label>
                  <Form.Control type="text" placeholder="Nhập tên phương thức" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phí vận chuyển</Form.Label>
                  <Form.Control type="number" placeholder="Nhập phí vận chuyển" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Nhập mô tả phương thức" />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian giao hàng (ngày)</Form.Label>
                  <Form.Control type="text" placeholder="2-3 hoặc 1" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trọng lượng tối đa (kg)</Form.Label>
                  <Form.Control type="number" placeholder="10" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngưỡng miễn phí vận chuyển</Form.Label>
                  <Form.Control type="number" placeholder="500000" />
                  <Form.Text className="text-muted">
                    Để trống nếu không áp dụng miễn phí vận chuyển
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Hủy
          </Button>
          <Button variant="primary">
            Thêm phương thức
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDelivery;
