import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get order data from navigation state
  const { orderId, orderData } = location.state || {};

  useEffect(() => {
    // If no order data, redirect to home
    if (!orderId || !orderData) {
      navigate('/');
    }
  }, [orderId, orderData, navigate, dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'VNPAY':
        return 'VNPay';
      case 'BANK':
        return 'Chuyển khoản ngân hàng';
      default:
        return method;
    }
  };

  if (!orderData) {
    return (
      <Container className="my-5">
        <Alert variant="warning" className="text-center">
          Không tìm thấy thông tin đơn hàng
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* Success Header */}
          <Card className="mb-4 border-success">
            <Card.Body className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-check-circle fa-5x text-success"></i>
              </div>
              <h2 className="text-success mb-3">Đặt hàng thành công!</h2>
              <p className="text-muted mb-4">
                Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button 
                  variant="primary" 
                  onClick={() => navigate(`/orders/${orderId}`)}
                >
                  Xem chi tiết đơn hàng
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate('/orders')}
                >
                  Xem tất cả đơn hàng
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Order Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Thông tin đơn hàng</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Mã đơn hàng:</strong>
                </Col>
                <Col sm={8}>
                  <Badge bg="primary" className="fs-6">
                    {orderId}
                  </Badge>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Trạng thái:</strong>
                </Col>
                <Col sm={8}>
                  <Badge bg="info">
                    {orderData.status === 'new' ? 'Đơn hàng mới' : orderData.status}
                  </Badge>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Tổng tiền:</strong>
                </Col>
                <Col sm={8}>
                  <strong className="text-danger fs-5">
                    {formatCurrency(orderData.totalAmount)}
                  </strong>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Phương thức thanh toán:</strong>
                </Col>
                <Col sm={8}>
                  {getPaymentMethodText(orderData.payment?.paymentMethod)}
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Ngày đặt hàng:</strong>
                </Col>
                <Col sm={8}>
                  {new Date(orderData.createdAt).toLocaleString('vi-VN')}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Shipping Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Thông tin giao hàng</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Người nhận:</strong>
                </Col>
                <Col sm={8}>
                  {orderData.shippingAddress?.recipientName}
                </Col>
              </Row>
              
              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Số điện thoại:</strong>
                </Col>
                <Col sm={8}>
                  {orderData.shippingAddress?.phoneNumber}
                </Col>
              </Row>
              
              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Địa chỉ:</strong>
                </Col>
                <Col sm={8}>
                  {orderData.shippingAddress?.street}, {orderData.shippingAddress?.ward}, {orderData.shippingAddress?.district}, {orderData.shippingAddress?.province}
                </Col>
              </Row>
              
              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Phí vận chuyển:</strong>
                </Col>
                <Col sm={8}>
                  {orderData.shippingFee === 0 ? (
                    <span className="text-success">Miễn phí</span>
                  ) : (
                    formatCurrency(orderData.shippingFee)
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Sản phẩm đã đặt</h5>
            </Card.Header>
            <Card.Body>
              {orderData.orderLines?.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                  <div className="me-3">
                    <img 
                      src={item.productImage} 
                      alt={item.productName}
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      className="rounded"
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.productName}</h6>
                    <small className="text-muted">Mã: {item.productCode}</small>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span>Số lượng: {item.quantity}</span>
                      <strong>{formatCurrency(item.lineTotal)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Next Steps */}
          <Alert variant="info">
            <Alert.Heading>Bước tiếp theo</Alert.Heading>
            <ul className="mb-0">
              <li>Chúng tôi sẽ xác nhận đơn hàng của bạn trong vòng 24 giờ</li>
              <li>Bạn sẽ nhận được email/SMS thông báo khi đơn hàng được xử lý</li>
              <li>Theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi"</li>
              <li>Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</li>
            </ul>
          </Alert>

          {/* Action Buttons */}
          <div className="text-center">
            <Button 
              variant="primary" 
              className="me-3"
              onClick={() => navigate('/')}
            >
              Tiếp tục mua sắm
            </Button>
            <Button 
              variant="outline-primary"
              onClick={() => navigate('/orders')}
            >
              Xem đơn hàng của tôi
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccessPage;