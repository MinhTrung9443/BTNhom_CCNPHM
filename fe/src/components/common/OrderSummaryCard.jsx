import React from 'react';
import { ListGroup } from 'react-bootstrap';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const OrderSummaryCard = ({
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  pointsApplied = 0,
  totalAmount = 0,
  voucherCode,
}) => {
  return (
    <ListGroup variant="flush">
      <ListGroup.Item className="d-flex justify-content-between align-items-center">
        <span>Tổng tiền hàng</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </ListGroup.Item>
      
      <ListGroup.Item className="d-flex justify-content-between align-items-center">
        <span>Phí vận chuyển</span>
        <strong>{shippingFee > 0 ? formatCurrency(shippingFee) : <span className="text-success">Miễn phí</span>}</strong>
      </ListGroup.Item>

      {discount > 0 && (
        <ListGroup.Item className="d-flex justify-content-between align-items-center text-danger">
          <span>
            Giảm giá
            {voucherCode && <small className="d-block text-muted">{`(Mã: ${voucherCode})`}</small>}
          </span>
          <strong>- {formatCurrency(discount)}</strong>
        </ListGroup.Item>
      )}

      {pointsApplied > 0 && (
        <ListGroup.Item className="d-flex justify-content-between align-items-center text-danger">
          <span>Sử dụng xu</span>
          <strong>- {formatCurrency(pointsApplied)}</strong>
        </ListGroup.Item>
      )}

      <ListGroup.Item className="d-flex justify-content-between align-items-center fw-bold fs-5 border-top mt-2 pt-3">
        <span>Tổng cộng</span>
        <span className="text-primary">{formatCurrency(totalAmount)}</span>
      </ListGroup.Item>
    </ListGroup>
  );
};

export default OrderSummaryCard;