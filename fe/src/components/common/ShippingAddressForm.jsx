import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { updateRecipientInfo, updatePreview } from "../../redux/orderPreviewSlice";
import { toast } from "react-toastify";

/**
 * Shipping address form component for order preview
 * @param {{address: object, onAddressChange: function, isLoading: boolean, error: string}} props
 */
const ShippingAddressForm = ({ 
  address = {}, 
  onAddressChange, 
  isLoading = false, 
  error = null 
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const orderPreview = useSelector((state) => state.orderPreview);
  
  const [formData, setFormData] = useState({
    recipientName: address.recipientName || user?.name || '',
    phoneNumber: address.phoneNumber || user?.phone || '',
    shippingAddress: address.shippingAddress || user?.address || '',
    notes: address.notes || ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Update form data when address prop changes
  useEffect(() => {
    setFormData({
      recipientName: address.recipientName || user?.name || '',
      phoneNumber: address.phoneNumber || user?.phone || '',
      shippingAddress: address.shippingAddress || user?.address || '',
      notes: address.notes || ''
    });
  }, [address, user]);

  // Validate form whenever formData changes
  useEffect(() => {
    const errors = validateForm(formData);
    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formData]);

  /**
   * Validate form fields
   * @param {object} data - Form data to validate
   * @returns {object} Validation errors
   */
  const validateForm = (data) => {
    const errors = {};
    
    if (!data.recipientName.trim()) {
      errors.recipientName = 'Vui lòng nhập họ và tên người nhận';
    } else if (data.recipientName.trim().length < 2) {
      errors.recipientName = 'Họ và tên phải có ít nhất 2 ký tự';
    }
    
    if (!data.phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(data.phoneNumber.replace(/\\s/g, ''))) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 số)';
    }
    
    if (!data.shippingAddress.trim()) {
      errors.shippingAddress = 'Vui lòng nhập địa chỉ giao hàng';
    } else if (data.shippingAddress.trim().length < 10) {
      errors.shippingAddress = 'Địa chỉ phải có ít nhất 10 ký tự';
    }
    
    return errors;
  };

  /**
   * Handle input changes with validation
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    
    setFormData(updatedData);
    
    // Update Redux state
    dispatch(updateRecipientInfo({ field: name, value }));
    
    // Call parent callback if provided
    if (onAddressChange) {
      onAddressChange(updatedData);
    }
  };

  /**
   * Handle form blur to trigger preview update
   * @param {Event} e - Blur event
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Only update preview if the field is valid and not empty
    if (value.trim() && !validationErrors[name]) {
      dispatch(updatePreview({ [name]: value }));
    }
  };

  /**
   * Load user's saved addresses (future enhancement)
   */
  const loadSavedAddresses = () => {
    // This could be implemented to show a modal with saved addresses
    toast.info(\"Chức năng tải địa chỉ đã lưu sẽ được triển khai trong tương lai\");
  };

  return (
    <Card className=\"shadow-sm mb-4\">
      <Card.Header className=\"bg-light d-flex justify-content-between align-items-center\">
        <h5 className=\"mb-0\">Thông tin giao hàng</h5>
        <Button 
          variant=\"outline-primary\" 
          size=\"sm\" 
          onClick={loadSavedAddresses}
          disabled={isLoading}
        >
          <i className=\"fas fa-map-marker-alt me-1\"></i>
          Địa chỉ đã lưu
        </Button>
      </Card.Header>
      
      <Card.Body>
        {error && (
          <Alert variant=\"danger\" className=\"mb-3\">
            <Alert.Heading>Lỗi thông tin giao hàng</Alert.Heading>
            <p className=\"mb-0\">{error}</p>
          </Alert>
        )}
        
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className=\"mb-3\">
                <Form.Label className=\"fw-bold\">Họ và tên người nhận *</Form.Label>
                <Form.Control
                  type=\"text\"
                  name=\"recipientName\"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder=\"Nhập họ và tên người nhận\"
                  isInvalid={!!validationErrors.recipientName}
                  disabled={isLoading}
                  aria-describedby=\"recipientName-error\"
                />
                <Form.Control.Feedback type=\"invalid\" id=\"recipientName-error\">
                  {validationErrors.recipientName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className=\"mb-3\">
                <Form.Label className=\"fw-bold\">Số điện thoại *</Form.Label>
                <Form.Control
                  type=\"tel\"
                  name=\"phoneNumber\"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder=\"Nhập số điện thoại\"
                  isInvalid={!!validationErrors.phoneNumber}
                  disabled={isLoading}
                  aria-describedby=\"phoneNumber-error\"
                />
                <Form.Control.Feedback type=\"invalid\" id=\"phoneNumber-error\">
                  {validationErrors.phoneNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className=\"mb-3\">
            <Form.Label className=\"fw-bold\">Địa chỉ giao hàng *</Form.Label>
            <Form.Control
              as=\"textarea\"
              rows={3}
              name=\"shippingAddress\"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder=\"Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)\"
              isInvalid={!!validationErrors.shippingAddress}
              disabled={isLoading}
              aria-describedby=\"shippingAddress-error\"
            />
            <Form.Control.Feedback type=\"invalid\" id=\"shippingAddress-error\">
              {validationErrors.shippingAddress}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className=\"mb-3\">
            <Form.Label className=\"fw-bold\">Ghi chú đơn hàng</Form.Label>
            <Form.Control
              as=\"textarea\"
              rows={2}
              name=\"notes\"
              value={formData.notes}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder=\"Ghi chú thêm cho đơn hàng (tùy chọn)\"
              disabled={isLoading}
            />
            <Form.Text className=\"text-muted\">
              Ví dụ: Giao hàng vào buổi sáng, gọi trước khi giao, v.v.
            </Form.Text>
          </Form.Group>
        </Form>
        
        {isLoading && (
          <div className=\"text-center py-2\">
            <Spinner animation=\"border\" size=\"sm\" className=\"me-2\" />
            <span className=\"text-muted\">Đang cập nhật thông tin...</span>
          </div>
        )}
        
        {/* Form validation status */}
        <div className=\"mt-3\">
          {isFormValid ? (
            <small className=\"text-success\">
              <i className=\"fas fa-check-circle me-1\"></i>
              Thông tin giao hàng đã được điền đầy đủ
            </small>
          ) : (
            <small className=\"text-warning\">
              <i className=\"fas fa-exclamation-triangle me-1\"></i>
              Vui lòng điền đầy đủ thông tin bắt buộc (*)
            </small>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ShippingAddressForm;