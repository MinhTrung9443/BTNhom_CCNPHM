import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col, Alert, Badge } from "react-bootstrap";
import { useDispatch } from "react-redux";

/**
 * Payment method option configuration
 */
const PAYMENT_METHODS = [
  {
    id: 'COD',
    label: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: 'fas fa-money-bill-wave',
    fees: 0,
    isRecommended: true,
    isAvailable: true
  },
  {
    id: 'VNPAY',
    label: 'Ví điện tử VNPay',
    description: 'Thanh toán trực tuyến qua VNPay, ATM, thẻ tín dụng',
    icon: 'fab fa-cc-visa',
    fees: 0,
    isRecommended: false,
    isAvailable: true
  },
  {
    id: 'BANK',
    label: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản trực tiếp vào tài khoản ngân hàng',
    icon: 'fas fa-university',
    fees: 0,
    isRecommended: false,
    isAvailable: true
  }
];

/**
 * Individual payment method card component
 * @param {{method: object, isSelected: boolean, onSelect: function, disabled: boolean}} props
 */
const PaymentMethodCard = ({ 
  method, 
  isSelected = false, 
  onSelect, 
  disabled = false 
}) => {
  return (
    <div className="mb-3">
      <Form.Check
        type="radio"
        id={`payment-${method.id}`}
        name="paymentMethod"
        value={method.id}
        checked={isSelected}
        onChange={() => onSelect(method)}
        disabled={disabled || !method.isAvailable}
        className="d-none"
      />
      
      <label 
        htmlFor={`payment-${method.id}`}
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
                  className={`${method.icon} fa-2x ${
                    isSelected ? 'text-primary' : 'text-muted'
                  }`}
                ></i>
              </Col>
              
              <Col xs={8}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="mb-0">{method.label}</h6>
                  {method.isRecommended && (
                    <Badge bg="success" className="small">Khuyến nghị</Badge>
                  )}
                  {!method.isAvailable && (
                    <Badge bg="secondary" className="small">Tạm ngưng</Badge>
                  )}
                </div>
                <small className="text-muted">{method.description}</small>
                {method.fees > 0 && (
                  <div className="mt-1">
                    <small className="text-warning">
                      Phí giao dịch: +₫{method.fees.toLocaleString()}
                    </small>
                  </div>
                )}
              </Col>
              
              <Col xs={2} className="text-end">
                <div 
                  className={`border rounded-circle d-flex align-items-center justify-content-center ${
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
 * Payment method selector component
 * @param {{selectedMethod: string, onMethodChange: function, availableMethods: array, isLoading: boolean, error: string}} props
 */
const PaymentMethodSelector = ({ 
  selectedMethod = '', 
  onMethodChange, 
  availableMethods = PAYMENT_METHODS,
  isLoading = false,
  error = null
}) => {
  const dispatch = useDispatch();
  const [localSelected, setLocalSelected] = useState(selectedMethod);

  // Update local state when prop changes
  useEffect(() => {
    setLocalSelected(selectedMethod);
  }, [selectedMethod]);

  /**
   * Handle payment method selection
   * @param {object} method - Selected payment method
   */
  const handleMethodSelect = (method) => {
    if (isLoading || !method.isAvailable) return;
    
    setLocalSelected(method.id);
  
    
    // Call parent callback if provided
    if (onMethodChange) {
      onMethodChange(method);
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-light">
        <h5 className="mb-0">Phương thức thanh toán</h5>
      </Card.Header>
      
      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Lỗi phương thức thanh toán</Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
        )}
        
        <div className="mb-3">
          <small className="text-muted">
            Chọn phương thức thanh toán phù hợp với bạn. Tất cả các giao dịch đều được bảo mật.
          </small>
        </div>
        
        <Form>
          {availableMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isSelected={localSelected === method.id}
              onSelect={handleMethodSelect}
              disabled={isLoading}
            />
          ))}
        </Form>
        
        {!localSelected && (
          <Alert variant="warning" className="mt-3 mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Vui lòng chọn phương thức thanh toán để tiếp tục
          </Alert>
        )}
        
        {localSelected && (
          <Alert variant="success" className="mt-3 mb-0">
            <i className="fas fa-check-circle me-2"></i>
            Đã chọn phương thức thanh toán: {availableMethods.find(m => m.id === localSelected)?.label}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export { PAYMENT_METHODS, PaymentMethodCard };
export default PaymentMethodSelector;