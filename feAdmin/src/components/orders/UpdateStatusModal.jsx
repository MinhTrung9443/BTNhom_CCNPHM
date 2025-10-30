import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Badge, Spinner, Card, Nav } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { getValidTransitions, updateOrderStatus } from '../../redux/slices/ordersSlice';
import { toast } from 'react-toastify';

// Mapping giữa general status và detailed status (ĐỒNG BỘ VỚI BACKEND)
const STATUS_MAPPING = {
  'pending': {
    label: 'Chờ xác nhận',
    icon: '🕐',
    variant: 'primary',
    detailedStatuses: ['new']
  },
  'processing': {
    label: 'Đang xử lý',
    icon: '📦',
    variant: 'info',
    detailedStatuses: ['confirmed', 'preparing']
  },
  'shipping': {
    label: 'Đang giao',
    icon: '🚚',
    variant: 'warning',
    detailedStatuses: ['shipping_in_progress', 'delivered', 'cancellation_requested', 'delivery_failed']
  },
  'completed': {
    label: 'Hoàn thành',
    icon: '✔️',
    variant: 'success',
    detailedStatuses: ['completed']
  },
  'cancelled': {
    label: 'Đã hủy',
    icon: '❌',
    variant: 'danger',
    detailedStatuses: ['payment_overdue', 'cancelled']
  },
  'return_refund': {
    label: 'Trả hàng/Hoàn tiền',
    icon: '🔄',
    variant: 'secondary',
    detailedStatuses: ['return_requested', 'refunded']
  }
};

const UpdateStatusModal = ({ show, onHide, order, onSuccess }) => {
  const dispatch = useDispatch();
  
  const [validTransitions, setValidTransitions] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [metadata, setMetadata] = useState({
    reason: '',
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && order) {
      fetchValidTransitions();
      // Reset form
      setSelectedStatus('');
      setMetadata({
        reason: '',
        trackingNumber: '',
        carrier: '',
        estimatedDelivery: '',
      });
      setError('');
      // Set default tab dựa trên order status hiện tại
      setActiveTab(order.status || 'pending');
    }
  }, [show, order]);

  const fetchValidTransitions = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await dispatch(getValidTransitions(order._id)).unwrap();
      setValidTransitions(result);
    } catch (err) {
      setError(err || 'Không thể tải danh sách trạng thái');
      toast.error('Không thể tải danh sách trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset selected status khi đổi tab
    setSelectedStatus('');
  };

  const handleSubmit = async () => {
    if (!selectedStatus) {
      setError('Vui lòng chọn trạng thái mới');
      return;
    }

    // Không validate metadata - tất cả đều optional
    try {
      setUpdating(true);
      setError('');

      // Prepare metadata payload - chỉ gửi các field có giá trị
      const metadataPayload = {};
      if (metadata.reason?.trim()) metadataPayload.reason = metadata.reason.trim();
      if (metadata.trackingNumber?.trim()) metadataPayload.trackingNumber = metadata.trackingNumber.trim();
      if (metadata.carrier?.trim()) metadataPayload.carrier = metadata.carrier.trim();
      if (metadata.estimatedDelivery) metadataPayload.estimatedDelivery = metadata.estimatedDelivery;

      await dispatch(updateOrderStatus({
        orderId: order._id,
        status: selectedStatus,
        metadata: metadataPayload,
      })).unwrap();

      toast.success('Cập nhật trạng thái thành công');
      onSuccess && onSuccess();
      onHide();
    } catch (err) {
      setError(err || 'Có lỗi xảy ra khi cập nhật trạng thái');
      toast.error(err || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'preparing': '📦',
      'shipping_in_progress': '🚚',
      'delivered': '✅',
      'delivery_failed': '🔴',
      'cancelled': '❌',
      'refunded': '💰',
    };
    return icons[status] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      'preparing': 'info',
      'shipping_in_progress': 'warning',
      'delivered': 'success',
      'delivery_failed': 'danger',
      'cancelled': 'secondary',
      'refunded': 'primary',
    };
    return colors[status] || 'secondary';
  };

  const renderMetadataFields = () => {
    if (!selectedStatus) return null;

    // Hiện các field metadata phù hợp với status, nhưng TẤT CẢ đều OPTIONAL
    const showTrackingFields = ['shipping_in_progress'].includes(selectedStatus);
    const showReasonField = ['cancelled', 'delivery_failed'].includes(selectedStatus);

    if (!showTrackingFields && !showReasonField) return null;

    return (
      <Card className="mt-3 border-info">
        <Card.Body>
          <h6 className="mb-3 text-info">
            <i className="bi bi-info-circle me-2"></i>
            Thông tin bổ sung (không bắt buộc)
          </h6>
          
          {showTrackingFields && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Mã vận đơn</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập mã vận đơn (tùy chọn)"
                  value={metadata.trackingNumber}
                  onChange={(e) => setMetadata({
                    ...metadata, 
                    trackingNumber: e.target.value
                  })}
                />
                <Form.Text className="text-muted">
                  Nhập mã vận đơn để khách hàng theo dõi đơn hàng (không bắt buộc)
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Đơn vị vận chuyển</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: GHTK, GHN, Viettel Post... (tùy chọn)"
                  value={metadata.carrier}
                  onChange={(e) => setMetadata({
                    ...metadata, 
                    carrier: e.target.value
                  })}
                />
              </Form.Group>
            </>
          )}
          
          {showReasonField && (
            <Form.Group className="mb-3">
              <Form.Label>Lý do</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập lý do chi tiết (tùy chọn)..."
                value={metadata.reason}
                onChange={(e) => setMetadata({
                  ...metadata, 
                  reason: e.target.value
                })}
              />
              <Form.Text className="text-muted">
                Nhập lý do để khách hàng hiểu rõ hơn (không bắt buộc)
              </Form.Text>
            </Form.Group>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-arrow-repeat me-2"></i>
          Cập Nhật Trạng Thái Đơn Hàng
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Đang tải...</p>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
            
            {/* Current Status */}
            {validTransitions && (
              <>
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Mã đơn hàng</h6>
                  <Badge bg="secondary" className="fs-6">
                    {order?.orderCode || order?._id}
                  </Badge>
                </div>

                <div className="mb-4">
                  <h6 className="text-muted mb-2">Trạng thái hiện tại</h6>
                  <Badge 
                    bg={getStatusColor(validTransitions.currentStatus.detailed)} 
                    className="fs-6"
                  >
                    {getStatusIcon(validTransitions.currentStatus.detailed)}{' '}
                    {validTransitions.validTransitions.find(
                      t => t.value === validTransitions.currentStatus.detailed
                    )?.label || validTransitions.currentStatus.detailed}
                  </Badge>
                </div>

                {/* Status Selection with Tabs */}
                {validTransitions.validTransitions.length > 0 ? (
                  <>
                    <div className="mb-3">
                      <Form.Label className="fw-bold">
                        Chọn trạng thái mới <span className="text-danger">*</span>
                      </Form.Label>
                      
                      {/* Tabs for General Status */}
                      <Nav variant="pills" className="mb-3">
                        {Object.keys(STATUS_MAPPING).map(statusKey => {
                          // Check if this general status has any valid detailed status
                          const hasValidStatus = STATUS_MAPPING[statusKey].detailedStatuses.some(ds =>
                            validTransitions.allStatuses.find(s => s.value === ds && s.enabled)
                          );
                          
                          return (
                            <Nav.Item key={statusKey}>
                              <Nav.Link 
                                active={activeTab === statusKey}
                                onClick={() => handleTabChange(statusKey)}
                                disabled={!hasValidStatus}
                                className="px-3"
                              >
                                {STATUS_MAPPING[statusKey].icon} {STATUS_MAPPING[statusKey].label}
                              </Nav.Link>
                            </Nav.Item>
                          );
                        })}
                      </Nav>

                      {/* Detailed Status Buttons */}
                      <div className="d-grid gap-2">
                        {activeTab && STATUS_MAPPING[activeTab]?.detailedStatuses.map(detailedStatusValue => {
                          const statusInfo = validTransitions.allStatuses.find(s => s.value === detailedStatusValue);
                          if (!statusInfo) return null;
                          
                          return (
                            <Button
                              key={statusInfo.value}
                              variant={
                                selectedStatus === statusInfo.value 
                                  ? STATUS_MAPPING[activeTab].variant
                                  : 'outline-secondary'
                              }
                              className="text-start d-flex align-items-center justify-content-between"
                              onClick={() => setSelectedStatus(statusInfo.value)}
                              active={selectedStatus === statusInfo.value}
                              disabled={!statusInfo.enabled}
                            >
                              <span>
                                <i className={`bi ${
                                  selectedStatus === statusInfo.value 
                                    ? 'bi-check-circle-fill' 
                                    : statusInfo.enabled ? 'bi-arrow-right-circle' : 'bi-lock-fill'
                                } me-2`}></i>
                                {getStatusIcon(statusInfo.value)} {statusInfo.label}
                              </span>
                              {!statusInfo.enabled && (
                                <Badge bg="secondary" className="ms-2">
                                  Không khả dụng
                                </Badge>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata Fields */}
                    {renderMetadataFields()}

                    {/* Info Alert */}
                    <Alert variant="info" className="mt-3 mb-0">
                      <small>
                        <i className="bi bi-info-circle me-1"></i>
                        Chọn tab trạng thái tổng quát, sau đó chọn trạng thái chi tiết bên dưới.
                      </small>
                    </Alert>
                  </>
                ) : (
                  <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Không thể chuyển trạng thái từ trạng thái hiện tại. Đơn hàng có thể đã ở trạng thái cuối cùng.
                  </Alert>
                )}
              </>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={updating}>
          Hủy
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={!selectedStatus || loading || updating}
        >
          {updating ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                className="me-2"
              />
              Đang cập nhật...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-2"></i>
              Cập nhật trạng thái
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateStatusModal;
