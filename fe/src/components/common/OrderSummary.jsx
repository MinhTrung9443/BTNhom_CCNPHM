import React from "react";
import { Card } from "react-bootstrap";

const OrderSummary = ({ subtotal, shippingFee, discountAmount = 0, voucherCode = null }) => {
  const total = subtotal + shippingFee - discountAmount;
  const finalTotal = Math.max(0, total);

  return (
    <Card className="mt-4">
      <Card.Body>
        <h5>Tóm tắt đơn hàng</h5>

        <div className="d-flex justify-content-between">
          <span>Thành tiền:</span>
          <span>₫{subtotal.toLocaleString()}</span>
        </div>

        <div className="d-flex justify-content-between">
          <span>Phí vận chuyển:</span>
          <span>₫{shippingFee.toLocaleString()}</span>
        </div>

        {discountAmount > 0 && (
          <div className="d-flex justify-content-between text-success">
            <span>
              Giảm giá {voucherCode && `(${voucherCode})`}:
            </span>
            <span>-₫{discountAmount.toLocaleString()}</span>
          </div>
        )}

        <hr />

        <div className="d-flex justify-content-between">
          <h5>Tổng cộng:</h5>
          <h5 className={discountAmount > 0 ? 'text-success' : ''}>
            ₫{finalTotal.toLocaleString()}
          </h5>
        </div>

        {discountAmount > 0 && (
          <div className="mt-2">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Bạn đã tiết kiệm ₫{discountAmount.toLocaleString()}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default OrderSummary;
