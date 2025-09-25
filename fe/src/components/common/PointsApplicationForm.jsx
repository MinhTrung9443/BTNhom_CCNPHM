import React, { useState, useEffect } from "react";
import { 
  Card, 
  Form, 
  Row, 
  Col, 
  Button, 
  Alert, 
  InputGroup, 
  Badge,
  ProgressBar 
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLoyaltyPoints } from "../../hooks/useLoyaltyPoints";

/**
 * Points application form component with limits and validation
 * @param {{availablePoints: number, appliedPoints: number, onPointsChange: function, maxAllowed: number, orderTotal: number, isLoading: boolean}} props
 */
const PointsApplicationForm = ({ 
  availablePoints = 0, 
  appliedPoints = 0, 
  onPointsChange, 
  maxAllowed = 0,
  orderTotal = 0,
  isLoading = false
}) => {
  const dispatch = useDispatch();
  const orderPreview = useSelector((state) => state.orderPreview);
  
  // Use loyalty points hook
  const {
    loyaltyPoints,
    getMaxApplicablePoints,
    formatPoints,
    formatPointsAsCurrency,
    hasPoints
  } = useLoyaltyPoints();
  
  const [isApplying, setIsApplying] = useState(false);

  // Get user points and calculation values
  const userPoints = availablePoints || loyaltyPoints;
  const currentOrderTotal = orderTotal || orderPreview.data.totalAmount || 0;
  const maxPointsAllowed = maxAllowed || getMaxApplicablePoints(currentOrderTotal);
  const maxApplicablePoints = Math.min(userPoints, maxPointsAllowed);
  const pointValue = 1; // 1 point = 1 VND
  
  // Calculate the points to apply (max applicable)
  const pointsToApply = maxApplicablePoints;
  const isPointsApplied = appliedPoints > 0;
  
  /**
   * Toggle points application
   */
  const handleTogglePoints = async () => {
    if (isApplying) return;
    
    setIsApplying(true);
    
    try {
      const newPointsValue = isPointsApplied ? 0 : pointsToApply;
      
      // Update Redux state
      dispatch(setPointsToApply(newPointsValue));
      
      // Trigger preview update
      dispatch(updatePreview({ pointsToApply: newPointsValue }));
      
      // Call parent callback if provided
      if (onPointsChange) {
        onPointsChange(newPointsValue);
      }
    } catch (error) {
      console.error('Error toggling points:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Don't show component if user has no points
  if (!hasPoints) {
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
        <h5 className="mb-0">Sử dụng điểm tích lũy</h5>
        <Badge bg="warning" className="fs-6">
          <i className="fas fa-coins me-1"></i>
          {formatPoints(userPoints)} điểm
        </Badge>
      </Card.Header>
      
      <Card.Body>
        {/* Points Information */}
        <Row className="mb-3">
          <Col md={6}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Điểm khả dụng:</small>
              <strong className="text-success">{formatPoints(userPoints)}</strong>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Tối đa áp dụng:</small>
              <strong className="text-primary">{formatPoints(maxApplicablePoints)}</strong>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Giá trị quy đổi:</small>
              <strong className="text-info">1 điểm = ₫{pointValue.toLocaleString()}</strong>
            </div>
          </Col>
          <Col md={6}>
            <div className="text-center"> 
              <div className="mb-2">
                <small className="text-muted">Mức sử dụng điểm</small>
              </div>
              <ProgressBar 
                now={maxApplicablePoints > 0 ? (inputPoints / maxApplicablePoints) * 100 : 0} 
                variant={inputPoints > maxApplicablePoints * 0.8 ? "danger" : "success"}
                className="mb-2"
                style={{ height: "8px" }}
              />
              <small className="text-muted">
                {formatPoints(inputPoints)} / {formatPoints(maxApplicablePoints)} điểm
              </small>
            </div>
          </Col>
        </Row>

        {/* Points Input */}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Số điểm muốn sử dụng</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                min="0"
                max={maxApplicablePoints}
                value={inputPoints}
                onChange={handlePointsChange}
                placeholder="Nhập số điểm"
                isInvalid={!!validationError}
                disabled={isLoading || isApplying}
                aria-describedby="points-help"
              />
              <Button 
                variant="outline-secondary" 
                onClick={handleApplyMaxPoints}
                disabled={isLoading || isApplying || maxApplicablePoints === 0}
                title="Áp dụng tối đa"
              >
                Tối đa
              </Button>
              <Button 
                variant="primary" 
                onClick={handleApplyPoints}
                disabled={isLoading || isApplying || !!validationError || inputPoints === appliedPoints}
              >
                {isApplying ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Áp dụng...
                  </>
                ) : (
                  'Áp dụng'
                )}
              </Button>
              <Form.Control.Feedback type="invalid">
                {validationError}
              </Form.Control.Feedback>
            </InputGroup>
            <Form.Text id="points-help" className="text-muted">
              Bạn có thể sử dụng tối đa {formatPoints(maxApplicablePoints)} điểm cho đơn hàng này
            </Form.Text>
          </Form.Group>
        </Form>

        {/* Quick Actions */}
        <Row className="mb-3">
          <Col>
            <div className="d-flex gap-2 flex-wrap">
              {[25, 50, 75, 100].map(percentage => {
                const points = Math.floor(maxApplicablePoints * percentage / 100);
                return points > 0 && (
                  <Button
                    key={percentage}
                    variant="outline-info"
                    size="sm"
                    onClick={() => {
                      setInputPoints(points);
                      setValidationError('');
                    }}
                    disabled={isLoading || isApplying}
                  >
                    {percentage}% ({formatPoints(points)})
                  </Button>
                );
              })}
            </div>
          </Col>
        </Row>

        {/* Applied Points Status */}
        {appliedPoints > 0 && (
          <Alert variant="success" className="mb-0">
            <Row className="align-items-center">
              <Col>
                <i className="fas fa-check-circle me-2"></i>
                Đã áp dụng {formatPoints(appliedPoints)} điểm
                <br />
                <small>Tiết kiệm: {formatPointsAsCurrency(appliedPoints)}</small>
              </Col>
              <Col xs="auto">
                <Button 
                  variant="outline-success" 
                  size="sm" 
                  onClick={handleClearPoints}
                  disabled={isLoading || isApplying}
                >
                  Bỏ áp dụng
                </Button>
              </Col>
            </Row>
          </Alert>
        )}

        {/* Information Alert */}
        <Alert variant="info" className="mb-0 mt-3">
          <small>
            <i className="fas fa-info-circle me-1"></i>
            <strong>Lưu ý:</strong> Điểm tích lũy chỉ có thể sử dụng tối đa 50% giá trị đơn hàng. 
            Điểm sẽ được trừ sau khi đơn hàng được xác nhận thành công.
          </small>
        </Alert>
      </Card.Body>
    </Card>
  );
};

export default PointsApplicationForm;