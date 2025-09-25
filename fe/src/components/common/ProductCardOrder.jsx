import React from "react";
import { Card, Row, Col, Badge, Image } from "react-bootstrap";

/**
 * Enhanced ProductCardOrder for order preview display
 * @param {{products: Array, showImages?: boolean, showDetails?: boolean}} props
 */
const ProductCardOrder = ({ products, showImages = true, showDetails = true }) => {
  if (!products || products.length === 0) {
    return (
      <Card className="mb-3 text-center p-4">
        <Card.Body>
          <p className="text-muted mb-0">Không có sản phẩm nào trong đơn hàng</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {products.map((product, idx) => {
        // Use productActualPrice from API if available, otherwise calculate
        const actualPrice = product.productActualPrice || (product.productPrice * (1 - (product.discount || 0) / 100));
        const lineTotal = product.lineTotal || (actualPrice * product.quantity);

        return (
          <Card key={idx} className="mb-3 shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                {showImages && product.productImage && (
                  <Col xs={12} sm={3} md={2} className="mb-2 mb-sm-0">
                    <Image
                      src={product.productImage}
                      alt={product.productName}
                      thumbnail
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                  </Col>
                )}
                
                <Col xs={12} sm={showImages ? 6 : 8} md={showImages ? 7 : 8}>
                  <Card.Title className="mb-2 h6">{product.productName}</Card.Title>
                  
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <h6 className="text-danger mb-0">
                      ₫{actualPrice.toLocaleString()}
                    </h6>
                    {product.discount > 0 && (
                      <>
                        <small className="text-muted text-decoration-line-through">
                          ₫{product.productPrice.toLocaleString()}
                        </small>
                        <Badge bg="danger" className="ms-1">
                          -{product.discount}%
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  {showDetails && (
                    <>
                      <small className="text-muted d-block">
                        Đơn giá: ₫{actualPrice.toLocaleString()} × {product.quantity}
                      </small>
                      {product.productCode && (
                        <small className="text-muted">
                          Mã SP: {product.productCode}
                        </small>
                      )}
                    </>
                  )}
                </Col>
                
                <Col xs={12} sm={3} className="text-sm-end mt-2 mt-sm-0">
                  <div className="d-flex flex-column align-items-sm-end">
                    <strong className="mb-1">Số lượng: {product.quantity}</strong>
                    <h6 className="text-primary mb-0">
                      Thành tiền: ₫{lineTotal.toLocaleString()}
                    </h6>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      })}
    </>
  );
};

export default ProductCardOrder;
