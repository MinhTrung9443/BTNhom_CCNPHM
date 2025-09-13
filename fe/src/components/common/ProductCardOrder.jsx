import React from "react";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";

const ProductCardOrder = ({ product }) => {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>{product.name}</Card.Title>

        <Row className="mt-2 align-items-center">
          <Col>
            <h5 className="text-danger">
              ₫
              {product.productPrice -
                (product.productPrice * product.discount) / 100}
            </h5>
            <small className="text-muted text-decoration-line-through">
              ₫{product.productPrice.toLocaleString()}
            </small>
            <Badge bg="success" className="ms-2">
              -{product.discount}%
            </Badge>
          </Col>
          <Col className="text-end">
            <strong>Số lượng:</strong> {product.quantity}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProductCardOrder;
