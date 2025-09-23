import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { couponService } from '../../services/couponService.js';
import './../../styles/admin.css';

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockPromotions = [
        {
          id: 1,
          code: 'NEWYEAR2024',
          name: 'Khuyến mãi năm mới 2024',
          type: 'percentage',
          value: 20,
          minOrderValue: 200000,
          maxDiscount: 100000,
          usageLimit: 100,
          usedCount: 25,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          status: 'active'
        },
        {
          id: 2,
          code: 'WELCOME',
          name: 'Chào mừng khách hàng mới',
          type: 'fixed',
          value: 50000,
          minOrderValue: 150000,
          maxDiscount: null,
          usageLimit: 50,
          usedCount: 12,
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          status: 'active'
        }
      ];
      setPromotions(mockPromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
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
    <Container fluid className="admin-promotions">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-title">
                <i className="fas fa-tags me-2"></i>
                Quản lý khuyến mãi
              </h2>
              <p className="text-muted">Tạo và quản lý mã giảm giá, khuyến mãi</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <i className="fas fa-plus me-2"></i>
              Tạo khuyến mãi mới
            </Button>
          </div>
        </Col>
      </Row>

      {/* Promotions Table */}
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
                  <th>Mã khuyến mãi</th>
                  <th>Tên chương trình</th>
                  <th>Giá trị</th>
                  <th>Điều kiện</th>
                  <th>Sử dụng</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion.id}>
                    <td>
                      <strong>{promotion.code}</strong>
                    </td>
                    <td>{promotion.name}</td>
                    <td>
                      {promotion.type === 'percentage' ?
                        `${promotion.value}%` :
                        formatCurrency(promotion.value)
                      }
                    </td>
                    <td>
                      <div>
                        <small>Đơn tối thiểu: {formatCurrency(promotion.minOrderValue)}</small>
                        {promotion.maxDiscount && (
                          <div><small>Giảm tối đa: {formatCurrency(promotion.maxDiscount)}</small></div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>{promotion.usedCount}/{promotion.usageLimit}</div>
                      <div className="progress" style={{height: '5px'}}>
                        <div
                          className="progress-bar"
                          style={{width: `${(promotion.usedCount/promotion.usageLimit)*100}%`}}
                        ></div>
                      </div>
                    </td>
                    <td>
                      <div>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</div>
                      <div>đến</div>
                      <div>{new Date(promotion.endDate).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td>{getStatusBadge(promotion.status)}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => {
                            setSelectedPromotion(promotion);
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

          {promotions.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-tags fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Chưa có chương trình khuyến mãi nào</h5>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Tạo khuyến mãi đầu tiên
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create Promotion Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tạo chương trình khuyến mãi mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã khuyến mãi</Form.Label>
                  <Form.Control type="text" placeholder="Nhập mã khuyến mãi" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên chương trình</Form.Label>
                  <Form.Control type="text" placeholder="Nhập tên chương trình" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại giảm giá</Form.Label>
                  <Form.Select>
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị giảm giá</Form.Label>
                  <Form.Control type="number" placeholder="Nhập giá trị" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Đơn hàng tối thiểu</Form.Label>
                  <Form.Control type="number" placeholder="0" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giảm giá tối đa</Form.Label>
                  <Form.Control type="number" placeholder="Không giới hạn" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lần sử dụng tối đa</Form.Label>
                  <Form.Control type="number" placeholder="Không giới hạn" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc</Form.Label>
                  <Form.Control type="date" />
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
            Tạo khuyến mãi
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPromotions;
