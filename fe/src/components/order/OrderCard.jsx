import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
import Collapse from 'react-bootstrap/Collapse';
import Modal from 'react-bootstrap/Modal';
import { useNavigate, Link } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';
import styles from './OrderCard.module.css';

/**
 * Component to display order information in a card format with enhanced features
 * @param {{
 *   order: {
 *     _id: string,
 *     status: string,
 *     orderLines: array,
 *     shippingAddress: object,
 *     payment: object,
 *     totalAmount: number,
 *     canCancel: boolean,
 *     createdAt: string,
 *     recipientName: string,
 *     phoneNumber: string,
 *     notes?: string
 *   };
 *   onCancel?: (orderId: string) => void;
 * }} props
 */
const OrderCard = ({ order, onCancel }) => {
  const navigate = useNavigate();
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'COD':
        return 'Tiền mặt khi nhận hàng';
      case 'BANK':
        return 'Chuyển khoản ngân hàng';
      case 'VNPAY':
        return 'VNPay';
      default:
        return method;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Chờ thanh toán</Badge>;
      case 'completed':
        return <Badge bg="success">Đã thanh toán</Badge>;
      case 'failed':
        return <Badge bg="danger">Thanh toán thất bại</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'warning';
      case 'confirmed': return 'info';
      case 'preparing': return 'primary';
      case 'shipping': return 'secondary';
      case 'delivered': return 'success';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'cancellation_requested': return 'warning';
      default: return 'secondary';
    }
  };

  const formatShippingAddress = (shippingAddress) => {
    // Handle both string (legacy) and object (new) formats
    if (typeof shippingAddress === 'string') {
      return shippingAddress;
    }
    
    if (typeof shippingAddress === 'object' && shippingAddress !== null) {
      const { street, ward, district, province } = shippingAddress;
      return [street, ward, district, province].filter(Boolean).join(', ');
    }
    
    return 'Không có thông tin địa chỉ';
  };

  const getRecipientInfo = () => {
    // Handle both legacy format (order.recipientName) and new format (order.shippingAddress.recipientName)
    if (order.shippingAddress && typeof order.shippingAddress === 'object') {
      return {
        recipientName: order.shippingAddress.recipientName || order.recipientName || 'N/A',
        phoneNumber: order.shippingAddress.phoneNumber || order.phoneNumber || 'N/A'
      };
    }
    
    return {
      recipientName: order.recipientName || 'N/A',
      phoneNumber: order.phoneNumber || 'N/A'
    };
  };

  const handleViewDetail = () => {
    navigate(`/orders/${order._id}`);
  };

  const handleCancelOrder = async () => {
    if (!onCancel) return;
    
    setIsCancelling(true);
    try {
      await onCancel(order._id);
      setShowCancelModal(false);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const getCancellationMessage = () => {
    const { status } = order;
    if (['new', 'confirmed', 'preparing'].includes(status)) {
      return 'Đơn hàng sẽ được hủy ngay lập tức.';
    }
    return 'Đơn hàng đang trong quá trình giao hàng. Yêu cầu hủy sẽ được gửi đến shop để xử lý.';
  };

  const visibleProducts = showAllProducts ? order.orderLines : order.orderLines.slice(0, 2);
  const hiddenProductsCount = order.orderLines.length - 2;
  
  return (
    <>
      <Card 
        className={`mb-3 ${styles.OrderCard}`} 
        border={getStatusColor(order.status)}
      >
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <strong>#{order._id.slice(-8)}</strong>
            <span className="text-muted ms-2">
              {formatDate(order.createdAt)}
            </span>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <OrderStatusBadge status={order.status} showIcon={true} />
            {order.payment && getPaymentStatusBadge(order.payment.status)}
          </div>
        </Card.Header>

        <Card.Body>
          <Row>
            <Col lg={8}>
              {/* Product Information */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Sản phẩm ({order.orderLines.length} món):</h6>
                  {hiddenProductsCount > 0 && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 text-decoration-none"
                      onClick={() => setShowAllProducts(!showAllProducts)}
                      aria-expanded={showAllProducts}
                    >
                      {showAllProducts ? 'Thu gọn' : `Xem thêm ${hiddenProductsCount} sản phẩm`}
                      <i className={`fas fa-chevron-${showAllProducts ? 'up' : 'down'} ms-1`}></i>
                    </Button>
                  )}
                </div>
                
                <div className={styles.ProductList}>
                  {visibleProducts.map((item, index) => (
                    <div key={index} className="d-flex align-items-center mb-2">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={50}
                        height={50}
                        className="rounded me-3 border"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1">
                        <Link 
                          to={`/products/${item.productId}`} 
                          className="text-decoration-none text-dark fw-medium d-block"
                        >
                          {item.productName}
                        </Link>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {formatCurrency(item.productActualPrice)} x {item.quantity}
                          </small>
                          <small className="fw-semibold">
                            {formatCurrency(item.productActualPrice * item.quantity)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Collapse in={showAllProducts}>
                    <div>
                      {order.orderLines.slice(2).map((item, index) => (
                        <div key={index + 2} className="d-flex align-items-center mb-2">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={50}
                            height={50}
                            className="rounded me-3 border"
                            style={{ objectFit: 'cover' }}
                          />
                          <div className="flex-grow-1">
                            <Link 
                              to={`/products/${item.productId}`} 
                              className="text-decoration-none text-dark fw-medium d-block"
                            >
                              {item.productName}
                            </Link>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                {formatCurrency(item.productActualPrice)} x {item.quantity}
                              </small>
                              <small className="fw-semibold">
                                {formatCurrency(item.productActualPrice * item.quantity)}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </div>
              </div>

              {/* Order Status Info */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-info-circle text-primary"></i>
                  <small className="text-muted">
                    <strong>Trạng thái:</strong>
                  </small>
                  <OrderStatusBadge status={order.status} showIcon={false} />
                </div>
                <small className="text-muted">
                  <i className="fas fa-credit-card me-1"></i>
                  {getPaymentMethodText(order.payment?.paymentMethod)}
                </small>
              </div>

              {order.notes && (
                <div className="mt-2 pt-2 border-top">
                  <small className="text-muted">
                    <i className="fas fa-sticky-note me-1"></i>
                    <strong>Ghi chú:</strong> {order.notes}
                  </small>
                </div>
              )}
            </Col>

            <Col lg={4} className="text-end">
              {/* Total Amount */}
              <div className="mb-3">
                <div className="h5 mb-0 text-primary">
                  {formatCurrency(order.totalAmount)}
                </div>
                <small className="text-muted">Tổng cộng</small>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-column gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleViewDetail}
                  className="d-flex align-items-center justify-content-center"
                >
                  <i className="fas fa-eye me-2"></i>
                  Xem chi tiết
                </Button>
                
                {order.canCancel && order.status !== 'cancelled' && (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => setShowCancelModal(true)}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <i className="fas fa-times me-2"></i>
                    Hủy đơn hàng
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Cancel Order Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận hủy đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
          </div>
          <p className="text-center mb-3">
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order._id.slice(-8)}</strong>?
          </p>
          <div className="alert alert-info">
            <small>{getCancellationMessage()}</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowCancelModal(false)}
            disabled={isCancelling}
          >
            Hủy bỏ
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelOrder}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang hủy...
              </>
            ) : (
              'Xác nhận hủy'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderCard;