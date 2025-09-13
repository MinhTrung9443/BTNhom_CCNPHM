import React from "react";
import { Card, Form } from "react-bootstrap";

const DeliveryOptions = ({ options, selectedOptionId, onChange }) => {
  return (
    <div>
      <h5>Phương thức giao hàng</h5>
      {options.map((option) => (
        <Card key={option._id} className="mb-2">
          <Card.Body>
            <Form.Check
              type="radio"
              id={`delivery-${option._id}`}
              name="deliveryOption"
              value={option._id}
              checked={selectedOptionId === option._id}
              onChange={() => onChange(option._id)}
              label={
                <div>
                  <strong>{option.name}</strong> — ₫
                  {option.price.toLocaleString()}
                  <div className="text-muted small">{option.description}</div>
                </div>
              }
            />
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default DeliveryOptions;
