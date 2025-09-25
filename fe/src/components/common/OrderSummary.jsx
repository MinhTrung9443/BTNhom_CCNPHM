import React from "react";
import { Card } from "react-bootstrap";

const OrderSummary = ({
  subtotal,
  shippingFee,
  pointsApplied = 0,
  discount = 0,
}) => {
  const total = subtotal + shippingFee - discount;

  return (
    <Card className="mt-4">
      <Card.Body>
        <h5>Tóm tắt đơn hàng</h5>
        <p>Thành tiền: ₫{subtotal.toLocaleString()}</p>
        <p>Phí vận chuyển: ₫{shippingFee.toLocaleString()}</p>
        {pointsApplied > 0 && (
          <p className="text-success">
            Điểm sử dụng: -₫{discount.toLocaleString()} ({pointsApplied} điểm)
          </p>
        )}
        <hr />
        <h5>Tổng cộng: ₫{total.toLocaleString()}</h5>
      </Card.Body>
    </Card>
  );
};

export default OrderSummary;
