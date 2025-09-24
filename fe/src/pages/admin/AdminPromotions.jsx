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
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    minOrderValue: 0,
    maxDiscount: null,
    usageLimit: null,
    startDate: '',
    endDate: ''
  });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await couponService.getAllCoupons();
      setPromotions(response.data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      // Fallback to empty array if API fails
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if coupon is within valid date range
    const isWithinDateRange = today >= startDate && today <= endDate;

    if (!isWithinDateRange) {
      if (today < startDate) {
        return <Badge bg="warning">Chưa bắt đầu</Badge>;
      } else {
        return <Badge bg="danger">Đã hết hạn</Badge>;
      }
    }

    // Within date range, check if active
    if (promotion.isActive) {
      return <Badge bg="success">Hoạt động</Badge>;
    } else {
      return <Badge bg="secondary">Tạm ngưng</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCoupon = async () => {
    try {
      setCreating(true);

      // Validate required fields
      if (!formData.code || !formData.name || !formData.value || !formData.startDate || !formData.endDate) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
      }

      // Prepare coupon data - convert dates to UTC to avoid timezone issues
      const startDate = new Date(formData.startDate + 'T00:00:00');
      const endDate = new Date(formData.endDate + 'T23:59:59');

      const couponData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        discountType: formData.type,
        discountValue: parseFloat(formData.value),
        minimumOrderValue: parseFloat(formData.minOrderValue) || 0,
        maximumDiscountAmount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true
      };

      await couponService.createCoupon(couponData);
      alert('Tạo mã khuyến mãi thành công!');

      // Reset form and close modal
      setFormData({
        code: '',
        name: '',
        type: 'percentage',
        value: '',
        minOrderValue: 0,
        maxDiscount: null,
        usageLimit: null,
        startDate: '',
        endDate: ''
      });
      setShowCreateModal(false);

      // Refresh promotions list
      fetchPromotions();
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Có lỗi xảy ra khi tạo mã khuyến mãi. Vui lòng thử lại!');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'percentage',
      value: '',
      minOrderValue: 0,
      maxDiscount: null,
      usageLimit: null,
      startDate: '',
      endDate: ''
    });
  };

  const handleEditClick = (promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      type: promotion.discountType || 'percentage',
      value: promotion.discountValue || promotion.value,
      minOrderValue: promotion.minimumOrderValue || 0,
      maxDiscount: promotion.maximumDiscountAmount || null,
      usageLimit: promotion.usageLimit || null,
      startDate: promotion.startDate ? promotion.startDate.split('T')[0] : '',
      endDate: promotion.endDate ? promotion.endDate.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditCoupon = async () => {
    try {
      setEditing(true);

      // Validate required fields
      if (!formData.code || !formData.name || !formData.value || !formData.startDate || !formData.endDate) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
      }

      // Prepare coupon data - convert dates to UTC to avoid timezone issues
      const startDate = new Date(formData.startDate + 'T00:00:00');
      const endDate = new Date(formData.endDate + 'T23:59:59');

      const couponData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        discountType: formData.type,
        discountValue: parseFloat(formData.value),
        minimumOrderValue: parseFloat(formData.minOrderValue) || 0,
        maximumDiscountAmount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: selectedPromotion.isActive
      };

      await couponService.updateCoupon(selectedPromotion._id, couponData);
      alert('Cập nhật mã khuyến mãi thành công!');

      // Reset form and close modal
      resetForm();
      setShowEditModal(false);
      setSelectedPromotion(null);

      // Refresh promotions list
      fetchPromotions();
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('Có lỗi xảy ra khi cập nhật mã khuyến mãi. Vui lòng thử lại!');
    } finally {
      setEditing(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPromotion(null);
    resetForm();
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
                {promotions.map((promotion, index) => (
                  <tr key={promotion._id || `promotion-${index}`}>
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
                        <small>Đơn tối thiểu: {formatCurrency(promotion.minimumOrderValue || 0)}</small>
                        {promotion.maximumDiscountAmount && (
                          <div><small>Giảm tối đa: {formatCurrency(promotion.maximumDiscountAmount)}</small></div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>{promotion.usedCount || 0}/{promotion.usageLimit || '∞'}</div>
                      <div className="progress" style={{height: '5px'}}>
                        <div
                          className="progress-bar"
                          style={{width: `${promotion.usageLimit ? (promotion.usedCount/promotion.usageLimit)*100 : 0}%`}}
                        ></div>
                      </div>
                    </td>
                    <td>
                      <div>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</div>
                      <div>đến</div>
                      <div>{new Date(promotion.endDate).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td>{getStatusBadge(promotion)}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleEditClick(promotion)}
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
                  <Form.Label>Mã khuyến mãi <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Nhập mã khuyến mãi (VD: NEWYEAR2024)"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên chương trình <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên chương trình"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại giảm giá <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị giảm giá <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder={formData.type === 'percentage' ? 'Nhập % (VD: 20)' : 'Nhập số tiền (VD: 50000)'}
                    min="0"
                    step={formData.type === 'percentage' ? '1' : '1000'}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Đơn hàng tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    placeholder="0 (không yêu cầu)"
                    min="0"
                    step="1000"
                  />
                  <Form.Text className="text-muted">
                    Giá trị đơn hàng tối thiểu để áp dụng mã giảm giá
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giảm giá tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount || ''}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn"
                    min="0"
                    step="1000"
                  />
                  <Form.Text className="text-muted">
                    Chỉ áp dụng cho giảm giá theo phần trăm
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lần sử dụng tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit || ''}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn"
                    min="1"
                  />
                  <Form.Text className="text-muted">
                    Giới hạn số lần mã này có thể được sử dụng
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
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
            onClick={handleCreateCoupon}
            disabled={creating}
          >
            {creating ? (
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

      {/* Edit Promotion Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa chương trình khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã khuyến mãi <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Nhập mã khuyến mãi (VD: NEWYEAR2024)"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên chương trình <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên chương trình"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại giảm giá <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị giảm giá <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder={formData.type === 'percentage' ? 'Nhập % (VD: 20)' : 'Nhập số tiền (VD: 50000)'}
                    min="0"
                    step={formData.type === 'percentage' ? '1' : '1000'}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Đơn hàng tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    placeholder="0 (không yêu cầu)"
                    min="0"
                    step="1000"
                  />
                  <Form.Text className="text-muted">
                    Giá trị đơn hàng tối thiểu để áp dụng mã giảm giá
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giảm giá tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount || ''}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn"
                    min="0"
                    step="1000"
                  />
                  <Form.Text className="text-muted">
                    Chỉ áp dụng cho giảm giá theo phần trăm
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lần sử dụng tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit || ''}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn"
                    min="1"
                  />
                  <Form.Text className="text-muted">
                    Giới hạn số lần mã này có thể được sử dụng
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleEditCoupon}
            disabled={editing}
          >
            {editing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật khuyến mãi'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPromotions;
