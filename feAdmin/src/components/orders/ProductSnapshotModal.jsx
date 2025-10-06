import React from 'react';
import { Modal, Row, Col, Badge, Carousel } from 'react-bootstrap';
import moment from 'moment';
import { getImageSrc, handleImageError } from '../../utils/imageUtils';

const ProductSnapshotModal = ({ show, onHide, orderLine }) => {
  if (!orderLine || !orderLine.productSnapshot) {
    return null;
  }

  const { productSnapshot } = orderLine;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="product-snapshot-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title>
          <i className="bi bi-camera-fill me-2 text-primary"></i>
          Ảnh chụp nhanh sản phẩm
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-info d-flex align-items-center mb-4">
          <i className="bi bi-info-circle-fill me-2"></i>
          <small>
            Đây là thông tin sản phẩm tại thời điểm đặt hàng:{' '}
            <strong>{moment(productSnapshot.capturedAt).format('DD/MM/YYYY HH:mm')}</strong>
          </small>
        </div>

        <Row>
          {/* Hình ảnh sản phẩm */}
          <Col md={6} className="mb-3">
            {productSnapshot.images && productSnapshot.images.length > 0 ? (
              <Carousel interval={null} className="border rounded">
                {productSnapshot.images.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      src={getImageSrc(image, 400, 400)}
                      alt={`${productSnapshot.name} - ${index + 1}`}
                      className="d-block w-100"
                      style={{ height: '400px', objectFit: 'cover' }}
                      onError={(e) => handleImageError(e, 400, 400)}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div className="border rounded d-flex align-items-center justify-content-center bg-light" style={{ height: '400px' }}>
                <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
              </div>
            )}
          </Col>

          {/* Thông tin sản phẩm */}
          <Col md={6}>
            <div className="mb-3">
              <h5 className="fw-bold">{productSnapshot.name}</h5>
              {productSnapshot.code && (
                <small className="text-muted">Mã: {productSnapshot.code}</small>
              )}
            </div>

            <div className="mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-4 fw-bold text-primary">
                  {formatCurrency(productSnapshot.price)}
                </span>
                {productSnapshot.discount > 0 && (
                  <Badge bg="danger">-{productSnapshot.discount}%</Badge>
                )}
              </div>
            </div>

            {productSnapshot.category && (
              <div className="mb-3">
                <strong>Danh mục:</strong>
                <Badge bg="secondary" className="ms-2">{productSnapshot.category}</Badge>
              </div>
            )}

            {productSnapshot.description && (
              <div className="mb-3">
                <strong>Mô tả:</strong>
                <p className="mt-2 text-muted small">{productSnapshot.description}</p>
              </div>
            )}

            <hr />

            <div className="bg-light p-3 rounded">
              <h6 className="fw-bold mb-3">Thông tin đơn hàng</h6>
              <div className="mb-2">
                <strong>Số lượng đặt:</strong> {orderLine.quantity}
              </div>
              <div className="mb-2">
                <strong>Giá tại thời điểm đặt:</strong> {formatCurrency(orderLine.productActualPrice)}
              </div>
              <div>
                <strong>Tổng tiền:</strong>
                <span className="text-primary fw-bold ms-2">
                  {formatCurrency(orderLine.lineTotal)}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default ProductSnapshotModal;
