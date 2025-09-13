import React from "react";
import { Card } from "react-bootstrap";

const OrderSummary = ({ subtotal, shippingFee }) => {
  const total = subtotal + shippingFee;

  return (
    <Card className="mt-4">
      <Card.Body>
        <h5>Tóm tắt đơn hàng</h5>
        <p>Thành tiền: ₫{subtotal.toLocaleString()}</p>
        <p>Phí vận chuyển: ₫{shippingFee.toLocaleString()}</p>
        <hr />
        <h5>Tổng cộng: ₫{total.toLocaleString()}</h5>
      </Card.Body>
    </Card>
  );
};

export default OrderSummary;
