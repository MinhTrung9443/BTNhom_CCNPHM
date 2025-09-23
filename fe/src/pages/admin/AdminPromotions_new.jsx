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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderValue: 0,
    maximumDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await couponService.getAllCoupons();
      if (response.success) {
        setPromotions(response.data);
      } else {
        // Fallback to mock data if API fails
        const mockPromotions = [
          {
            _id: '1',
            code: 'NEWYEAR2024',
            name: 'Khuyến mãi năm mới 2024',
            discountType: 'percentage',
            discountValue: 20,
            minimumOrderValue: 200000,
            maximumDiscountAmount: 100000,
            usageLimit: 100,
            usedCount: 25,
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-01-31T23:59:59.000Z',
            isActive: true
          },
          {
            _id: '2',
            code: 'WELCOME',
            name: 'Chào mừng khách hàng mới',
            discountType: 'fixed',
            discountValue: 50000,
            minimumOrderValue: 150000,
            maximumDiscountAmount: null,
            usageLimit: 50,
            usedCount: 12,
            startDate: '2024-01-15T00:00:00.000Z',
            endDate: '2024-02-15T23:59:59.000Z',
            isActive: true
          }
        ];
        setPromotions(mockPromotions);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError('Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.code.trim()) {
      errors.code = 'Mã khuyến mãi không được để trống';
    } else if (formData.code.length < 3) {
      errors.code = 'Mã khuyến mãi phải có ít nhất 3 ký tự';
    }

    if (!formData.name.trim()) {
      errors.name = 'Tên chương trình không được để trống';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      errors.discountValue = 'Giá trị giảm giá phải lớn hơn 0';
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      errors.discountValue = 'Giảm giá phần trăm không được vượt quá 100%';
    }

    if (formData.minimumOrderValue < 0) {
      errors.minimumOrderValue = 'Đơn hàng tối thiểu không được âm';
    }

    if (formData.maximumDiscountAmount && formData.maximumDiscountAmount <= 0) {
      errors.maximumDiscountAmount = 'Giảm giá tối đa phải lớn hơn 0';
    }

    if (formData.usageLimit && formData.usageLimit <= 0) {
      errors.usageLimit = 'Số lần sử dụng phải lớn hơn 0';
    }

    if (!formData.startDate) {
      errors.startDate = 'Ngày bắt đầu không được để trống';
    }

    if (!formData.endDate) {
      errors.endDate = 'Ngày kết thúc không được để trống';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderValue: 0,
      maximumDiscountAmount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setFormErrors({});
    setError('');
    setSuccess('');
  };

  const handleCreatePromotion = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const couponData = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: parseFloat(formData.discountValue),
        minimumOrderValue: parseFloat(formData.minimumOrderValue) || 0,
        maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      };

      const response = await couponService.createCoupon(couponData);

      if (response.success) {
        setSuccess('Tạo khuyến mãi thành công!');
        resetForm();
        setShowCreateModal(false);
        fetchPromotions(); // Refresh the list
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tạo khuyến mãi');
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo khuyến mãi');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ?
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

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {success && (
        <Row className="mb-3">
          <Col>
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Col>
        </Row>
      )}

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
                  <tr key={promotion._id || promotion.id}>
                    <td>
                      <strong>{promotion.code}</strong>
                    </td>
                    <td>{promotion.name}</td>
                    <td>
                      {promotion.discountType === 'percentage' ?
                        `${promotion.discountValue}%` :
                        formatCurrency(promotion.discountValue)
                      }
                    </td>
                    <td>
                      <div>
                        <small>Đơn tối thiểu: {formatCurrency(promotion.minimumOrderValue)}</small>
                        {promotion.maximumDiscountAmount && (
                          <div><small>Giảm tối đa: {formatCurrency(promotion.maximumDiscountAmount)}</small></div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>{promotion.usedCount || 0}/{promotion.usageLimit || 'Không giới hạn'}</div>
                      {promotion.usageLimit && (
                        <div className="progress" style={{height: '5px'}}>
                          <div
                            className="progress-bar"
                            style={{width: `${promotion.usageLimit ? ((promotion.usedCount || 0)/promotion.usageLimit)*100 : 0}%`}}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</div>
                      <div>đến</div>
                      <div>{new Date(promotion.endDate).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td>{getStatusBadge(promotion.isActive)}</td>
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
          <Form onSubmit={handleCreatePromotion}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã khuyến mãi *</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Nhập mã khuyến mãi"
                    isInvalid={!!formErrors.code}
                    style={{textTransform: 'uppercase'}}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.code}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên chương trình *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên chương trình"
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả chương trình (tùy chọn)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại giảm giá *</Form.Label>
                  <Form.Select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.discountType}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.discountType}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị giảm giá *</Form.Label>
                  <Form.Control
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder="Nhập giá trị"
                    min="0"
                    step="0.01"
                    isInvalid={!!formErrors.discountValue}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.discountValue}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Đơn hàng tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    name="minimumOrderValue"
                    value={formData.minimumOrderValue}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                    isInvalid={!!formErrors.minimumOrderValue}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.minimumOrderValue}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giảm giá tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    name="maximumDiscountAmount"
                    value={formData.maximumDiscountAmount}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn"
                    min="0"
                    step="1000"
                    isInvalid={!!formErrors.maximumDiscountAmount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.maximumDiscountAmount}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Chỉ áp dụng cho giảm giá phần trăm
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lần sử dụng tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn"
                    min="1"
                    isInvalid={!!formErrors.usageLimit}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.usageLimit}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.startDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.startDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.endDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.endDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.checked}))}
                    label="Kích hoạt khuyến mãi"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowCreateModal(false);
            resetForm();
          }}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleCreatePromotion}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang tạo...
              </>
            ) : (
              'Tạo khuyến mãi'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPromotions;
