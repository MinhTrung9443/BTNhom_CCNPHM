import React from "react";
import { Card } from "react-bootstrap";

const OrderSummary = ({ subtotal, selectedVoucher, shippingFee }) => {
  const total =
    subtotal +
    shippingFee -
    (selectedVoucher
      ? Math.min(
          (subtotal * selectedVoucher.discountValue) / 100,
          selectedVoucher.maxDiscountAmount
        )
      : 0);

  return (
    <Card className="mt-4">
      <Card.Body>
        <h5>Tóm tắt đơn hàng</h5>
        <p>Thành tiền: ₫{subtotal.toLocaleString()}</p>
        <p>Phí vận chuyển: ₫{shippingFee.toLocaleString()}</p>
        {selectedVoucher && (
          <p>
            Voucher ({selectedVoucher.code}): Giảm{" "}
            {selectedVoucher.discountValue}%
          </p>
        )}
        <hr />
        <h5>Tổng cộng: ₫{total.toLocaleString()}</h5>
      </Card.Body>
    </Card>
  );
};

export default OrderSummary;
