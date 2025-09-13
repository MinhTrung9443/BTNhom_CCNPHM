import React from "react";
import { Form } from "react-bootstrap";

const RecipientInfoForm = ({ formData, onChange }) => {
  return (
    <div className="mt-4">
      <h5>Thông tin người nhận</h5>
      <Form.Group className="mb-2">
        <Form.Label>Họ và tên</Form.Label>
        <Form.Control
          name="recipientName"
          value={formData.recipientName}
          onChange={onChange}
        />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Số điện thoại</Form.Label>
        <Form.Control
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={onChange}
        />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Địa chỉ</Form.Label>
        <Form.Control
          name="shippingAddress"
          value={formData.shippingAddress}
          onChange={onChange}
        />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Ghi chú</Form.Label>
        <Form.Control name="notes" value={formData.notes} onChange={onChange} />
      </Form.Group>
    </div>
  );
};

export default RecipientInfoForm;
