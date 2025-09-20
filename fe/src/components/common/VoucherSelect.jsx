import React from "react";
import { Form } from "react-bootstrap";

const VoucherSelect = ({ vouchers, onChange }) => {
  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    const selectedVoucher = vouchers.find((v) => v._id === selectedId) || null;
    onChange(selectedVoucher);
  };

  return (
    <Form.Group controlId="voucherSelect">
      <Form.Label>Chọn Voucher</Form.Label>
      <Form.Select onChange={handleSelectChange}>
        <option value="">-- Không chọn voucher --</option>
        {vouchers.map((voucher) => (
          <option key={voucher._id} value={voucher._id}>
            {voucher.code} - Giảm {voucher.discountValue}%
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default VoucherSelect;
