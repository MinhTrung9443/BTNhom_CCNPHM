import React from "react";
import { Form } from "react-bootstrap";

const PaymentMethod = ({ selected, onChange }) => {
  return (
    <div className="mt-4">
      <h5>Phương thức thanh toán</h5>
      <Form.Check
        type="radio"
        label="Thanh toán khi nhận hàng (COD)"
        name="paymentMethod"
        value="COD"
        checked={selected === "COD"}
        onChange={onChange}
      />
      <Form.Check
        type="radio"
        label="VNPAY"
        name="paymentMethod"
        value="VNPAY"
        checked={selected === "VNPAY"}
        onChange={onChange}
      />
      <Form.Check
        type="radio"
        label="Chuyển khoản ngân hàng"
        name="paymentMethod"
        value="BANK"
        checked={selected === "BANK"}
        onChange={onChange}
      />
    </div>
  );
};

export default PaymentMethod;
