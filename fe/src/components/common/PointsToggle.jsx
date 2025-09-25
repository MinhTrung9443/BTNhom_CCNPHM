import React from 'react';
import { Card, Form, Alert, Badge } from 'react-bootstrap';

const PointsToggle = ({
  availablePoints = 0,
  appliedPoints = 0,
  onToggle,
  orderSubtotal = 0,
  isLoading = false
}) => {
  const maxApplicablePoints = Math.min(
    availablePoints,
    Math.floor(orderSubtotal * 0.5)
  );

  const isPointsApplied = appliedPoints > 0;

  const handleToggle = () => {
    if (onToggle) {
      const pointsToApply = isPointsApplied ? 0 : maxApplicablePoints;
      onToggle(pointsToApply);
    }
  };

  const formatPoints = (points) => points.toLocaleString('vi-VN');

  if (availablePoints === 0) {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Điểm tích lũy</h5>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <i className="fas fa-coins fa-3x text-muted mb-3"></i>
          <p className="text-muted mb-2">Bạn chưa có điểm tích lũy nào</p>
          <small className="text-muted">
            Hoàn thành đơn hàng để nhận điểm tích lũy cho lần mua sắm tiếp theo
          </small>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Điểm tích lũy</h5>
        <Badge bg="warning" className="fs-6">
          <i className="fas fa-coins me-1"></i>
          {formatPoints(availablePoints)} điểm
        </Badge>
      </Card.Header>
      <Card.Body>
        <Form.Check
          type="switch"
          id="apply-points-switch"
          label={`Sử dụng điểm tích lũy (${formatPoints(maxApplicablePoints)} điểm)`}
          checked={isPointsApplied}
          onChange={handleToggle}
          disabled={isLoading || maxApplicablePoints === 0}
        />
        {isPointsApplied && (
          <Alert variant="success" className="mt-3 mb-0 text-center">
            <i className="fas fa-check-circle me-2"></i>
            Bạn sẽ tiết kiệm được <strong>{formatPoints(appliedPoints)} VNĐ</strong>
          </Alert>
        )}
        <Alert variant="info" className="mb-0 mt-3">
          <small>
            <i className="fas fa-info-circle me-1"></i>
            <strong>Lưu ý:</strong> Bạn có thể sử dụng điểm để thanh toán tối đa 50% giá trị đơn hàng.
          </small>
        </Alert>
      </Card.Body>
    </Card>
  );
};

export default PointsToggle;