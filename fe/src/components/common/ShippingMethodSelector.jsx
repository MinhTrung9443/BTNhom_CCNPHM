import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col, Alert, Badge, Spinner, Button } from "react-bootstrap";

/**
 * Individual delivery method card component
 * @param {{method: object, isSelected: boolean, onSelect: function, disabled: boolean}} props
 */
const DeliveryMethodCard = ({ 
  method, 
  isSelected = false, 
  onSelect, 
  disabled = false 
}) => {
  const getMethodIcon = (type) => {
    switch (type) {
      case 'express':
        return 'fas fa-shipping-fast';
      case 'regular':
        return 'fas fa-truck';
      case 'standard':
        return 'fas fa-box';
      default:
        return 'fas fa-truck';
    }
  };

  const getMethodColor = (type) => {
    switch (type) {
      case 'express':
        return 'danger';
      case 'regular':
        return 'primary';
      case 'standard':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <div className="mb-3">
      <Form.Check
        type="radio"
        id={`delivery-${method._id}`}
        name="deliveryMethod"
        value={method._id}
        checked={isSelected}
        onChange={() => onSelect(method)}
        disabled={disabled || !method.isActive}
        className="d-none"
      />
      
      <label 
        htmlFor={`delivery-${method._id}`}
        className={`d-block cursor-pointer ${disabled ? 'pe-none' : ''}`}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <Card 
          className={`h-100 border-2 transition-all ${
            isSelected 
              ? 'border-primary bg-primary bg-opacity-10' 
              : 'border-light hover-border-primary'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          <Card.Body className="p-3">
            <Row className="align-items-center">
              <Col xs={2} className="text-center">
                <i 
                  className={`${getMethodIcon(method.type)} fa-2x text-${getMethodColor(method.type)}`}
                ></i>
              </Col>
              
              <Col xs={7}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="mb-0">{method.name}</h6>
                  <Badge bg={getMethodColor(method.type)} className="small">
                    {method.type === 'express' ? 'Nhanh' : 
                     method.type === 'regular' ? 'Tiêu chuẩn' : 'Tiết kiệm'}
                  </Badge>
                  {!method.isActive && (
                    <Badge bg="secondary" className="small">Tạm ngưng</Badge>
                  )}
                </div>
                <small className="text-muted d-block mb-1">{method.description}</small>
                {method.estimatedDays && (
                  <small className="text-info">
                    <i className="fas fa-clock me-1"></i>
                    Dự kiến: {method.estimatedDays} ngày
                  </small>
                )}
              </Col>
              
              <Col xs={2} className="text-end">
                <div className="mb-1">
                  <strong className="text-primary">
                    {method.price === 0 ? (
                      <span className="text-success">Miễn phí</span>
                    ) : (
                      `₫${method.price.toLocaleString()}`
                    )}
                  </strong>
                </div>
                <div 
                  className={`border rounded-circle d-flex align-items-center justify-content-center mx-auto ${
                    isSelected 
                      ? 'border-primary bg-primary' 
                      : 'border-secondary'
                  }`}
                  style={{ width: '20px', height: '20px' }}
                >
                  {isSelected && (
                    <i className="fas fa-check text-white" style={{ fontSize: '10px' }}></i>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </label>
    </div>
  );
};

/**
 * Shipping method selector component
 * @param {{selectedMethod: object, onMethodChange: function, deliveryMethods: array, isLoading: boolean, error: string}} props
 */
const ShippingMethodSelector = ({
  selectedMethod = null,
  onMethodSelect,
  methods = [],
  isLoading = false,
  error = null,
  onRetry,
}) => {

  const handleMethodSelect = (method) => {
    if (isLoading || !method.isActive) return;
    if (onMethodSelect) {
      onMethodSelect(method);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const isLoadingState = isLoading;
  const errorState = error;

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Phương thức vận chuyển</h5>
        {methods.length > 0 && (
          <Badge bg="info" pill>
            {methods.length} tùy chọn
          </Badge>
        )}
      </Card.Header>
      
      <Card.Body>
        {errorState && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Lỗi tải phương thức vận chuyển</Alert.Heading>
            <p className="mb-2">{errorState}</p>
            <Button variant="outline-danger" size="sm" onClick={handleRetry}>
              <i className="fas fa-redo me-1"></i>
              Thử lại
            </Button>
          </Alert>
        )}
        
        {isLoadingState ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted mb-0">Đang tải phương thức vận chuyển...</p>
          </div>
        ) : methods.length === 0 ? (
          <Alert variant="warning" className="text-center">
            <Alert.Heading>Không có phương thức vận chuyển</Alert.Heading>
            <p className="mb-2">Hiện tại không có phương thức vận chuyển nào khả dụng.</p>
            <Button variant="outline-warning" size="sm" onClick={handleRetry}>
              <i className="fas fa-redo me-1"></i>
              Tải lại
            </Button>
          </Alert>
        ) : (
          <>
            <div className="mb-3">
              <small className="text-muted">
                Chọn phương thức vận chuyển phù hợp. Chi phí vận chuyển sẽ được tính vào tổng đơn hàng.
              </small>
            </div>
            
            <Form>
              {methods.map((method) => (
                <DeliveryMethodCard
                  key={method._id}
                  method={method}
                  isSelected={selectedMethod?._id === method._id}
                  onSelect={handleMethodSelect}
                  disabled={isLoadingState}
                />
              ))}
            </Form>
            
            {!selectedMethod && (
              <Alert variant="warning" className="mt-3 mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Vui lòng chọn phương thức vận chuyển để tiếp tục
              </Alert>
            )}
            
            {selectedMethod && (
              <Alert variant="success" className="mt-3 mb-0">
                <i className="fas fa-check-circle me-2"></i>
                Đã chọn: {selectedMethod.name} - {selectedMethod.price === 0 ? 'Miễn phí' : `₫${selectedMethod.price.toLocaleString()}`}
              </Alert>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export { DeliveryMethodCard };
export default ShippingMethodSelector;