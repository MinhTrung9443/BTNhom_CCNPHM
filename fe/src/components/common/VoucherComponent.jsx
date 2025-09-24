import React, { useState } from 'react';
import { Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import couponService from '../services/couponService';

const VoucherComponent = ({ onVoucherApplied, onVoucherRemoved, appliedVoucher }) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher');
      return;
    }

    setIsValidating(true);
    setError('');
    setSuccess('');

    try {
      // Get current cart items from Redux store
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

      const response = await couponService.validateVoucher(voucherCode, cartItems);

      if (response.valid) {
        setSuccess(`Mã voucher hợp lệ! Giảm giá: ${response.discountAmount.toLocaleString('vi-VN')} VNĐ`);
        onVoucherApplied({
          code: voucherCode.toUpperCase(),
          discountAmount: response.discountAmount,
          discountType: response.discountType,
          message: response.message
        });
      } else {
        setError(response.message || 'Mã voucher không hợp lệ');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi kiểm tra mã voucher');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setError('');
    setSuccess('');
    onVoucherRemoved();
  };

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title className="mb-3">
          <i className="fas fa-ticket-alt me-2"></i>
          Mã Giảm Giá
        </Card.Title>

        {appliedVoucher ? (
          <Alert variant="success" className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{appliedVoucher.code}</strong>
              <br />
              <small>{appliedVoucher.message}</small>
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleRemoveVoucher}
            >
              <i className="fas fa-times"></i>
            </Button>
          </Alert>
        ) : (
          <Form onSubmit={handleVoucherSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Nhập mã voucher..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                disabled={isValidating}
                style={{ textTransform: 'uppercase' }}
              />
              <Button
                type="submit"
                variant="outline-primary"
                disabled={isValidating || !voucherCode.trim()}
              >
                {isValidating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang kiểm tra...
                  </>
                ) : (
                  'Áp dụng'
                )}
              </Button>
            </InputGroup>

            {error && (
              <Alert variant="danger" className="mt-2 mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="mt-2 mb-0">
                <i className="fas fa-check-circle me-2"></i>
                {success}
              </Alert>
            )}
          </Form>
        )}

        <div className="mt-3">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Mã voucher sẽ được áp dụng cho toàn bộ đơn hàng
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VoucherComponent;
