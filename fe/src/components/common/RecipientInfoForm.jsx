import React, { useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { useAddressData } from "../../hooks/useAddressData";

const RecipientInfoForm = ({ formData, onChange }) => {
  const { 
    provinces, 
    getDistrictsByProvince, 
    getWardsByDistrict 
  } = useAddressData();
  
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
    
    // Handle cascading dropdowns
    if (name === 'province') {
      // Reset district and ward when province changes
      onChange('district', '');
      onChange('ward', '');
      setAvailableDistricts(getDistrictsByProvince(value));
      setAvailableWards([]);
    } else if (name === 'district') {
      // Reset ward when district changes
      onChange('ward', '');
      setAvailableWards(getWardsByDistrict(formData.province, value));
    }
  };

  // Update districts when province changes
  useEffect(() => {
    if (formData.province) {
      setAvailableDistricts(getDistrictsByProvince(formData.province));
    }
  }, [formData.province, getDistrictsByProvince]);

  // Update wards when district changes
  useEffect(() => {
    if (formData.province && formData.district) {
      setAvailableWards(getWardsByDistrict(formData.province, formData.district));
    }
  }, [formData.province, formData.district, getWardsByDistrict]);

  return (
    <div>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Họ và tên người nhận <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="recipientName"
              value={formData.recipientName || ''}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên người nhận"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Tỉnh/Thành phố <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="province"
              value={formData.province || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map((province) => (
                <option key={province.name} value={province.name}>
                  {province.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Quận/Huyện <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="district"
              value={formData.district || ''}
              onChange={handleInputChange}
              required
              disabled={!formData.province || availableDistricts.length === 0}
            >
              <option value="">Chọn quận/huyện</option>
              {availableDistricts.map((district) => (
                <option key={district.name} value={district.name}>
                  {district.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Phường/Xã <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="ward"
              value={formData.ward || ''}
              onChange={handleInputChange}
              required
              disabled={!formData.district || availableWards.length === 0}
            >
              <option value="">Chọn phường/xã</option>
              {availableWards.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Địa chỉ cụ thể <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="street"
          value={formData.street || ''}
          onChange={handleInputChange}
          placeholder="Số nhà, tên đường..."
          required
        />
      </Form.Group>
    </div>
  );
};

export default RecipientInfoForm;
