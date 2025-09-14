import React from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";

const ProductCardOrder = ({ products }) => {
  return (
    <>
      {products.map((product, idx) => (
        <Card key={idx} className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title>{product.productName}</Card.Title>

            <Row className="mt-2 align-items-center">
              <Col>
                <h5 className="text-danger">
                  ₫
                  {(
                    product.productPrice -
                    (product.productPrice * (product.discount || 0)) / 100
                  ).toLocaleString()}
                </h5>
                {product.discount > 0 && (
                  <small className="text-muted text-decoration-line-through">
                    ₫{product.productPrice.toLocaleString()}
                  </small>
                )}
                {product.discount > 0 && (
                  <Badge bg="success" className="ms-2">
                    -{product.discount}%
                  </Badge>
                )}
              </Col>
              <Col className="text-end">
                <strong>Số lượng:</strong> {product.quantity}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

export default ProductCardOrder;
