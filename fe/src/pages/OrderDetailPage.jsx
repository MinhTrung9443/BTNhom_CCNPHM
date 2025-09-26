import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { toast } from 'react-toastify';
import { getOrderDetail, cancelOrder } from '../services/orderService';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import OrderTimeline from '../components/order/OrderTimeline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import ReviewForm from '../components/review/ReviewForm';
import StarRating from '../components/review/StarRating';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // Local state
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getOrderDetail(orderId);
      setOrder(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching order details';
      setError({ message: errorMessage });
      toast.error(errorMessage);
      console.error('Failed to fetch order detail:', error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handleShowReviewModal = (product, existingReview = null) => {
    setSelectedProduct({ ...product, existingReview });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
    fetchOrderDetail(); // Refresh order details to show updated review status
  };

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

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancelOrder(orderId);
      toast.success('Đơn hàng đã được hủy thành công');
      
      // Update the local order state
      setOrder(prevOrder => ({ 
        ...prevOrder, 
        status: 'cancelled', 
        canCancel: false 
      }));
      
      setShowCancelModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while cancelling the order';
      toast.error(errorMessage);
      console.error('Failed to cancel order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleGoBack = () => {
    navigate('/orders');
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
    // Handle both legacy format and new format
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState onRetry={fetchOrderDetail} message={error.message} />;
  }

  if (!order) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Không tìm thấy đơn hàng
        </Alert>
        <Button variant="primary" onClick={() => navigate('/orders')}>
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại danh sách đơn hàng
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          <i className="fas fa-home me-1"></i>
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/orders" }}>
          Quản lý đơn hàng
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Chi tiết đơn hàng #{order._id.slice(-8)}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        <Col>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Button 
                variant="outline-secondary" 
                onClick={handleGoBack} 
                className="me-3"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Quay lại
              </Button>
              <h2 className="d-inline mb-0">Chi tiết đơn hàng #{order._id.slice(-8)}</h2>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <OrderStatusBadge status={order.status} showIcon={true} />
              {order.payment && getPaymentStatusBadge(order.payment.status)}
            </div>
          </div>

          <Row>
            <Col lg={8}>
              {/* Order Information */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-info-circle me-2 text-primary"></i>
                    Thông tin đơn hàng
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-muted">Mã đơn hàng:</strong>
                        <div className="fw-bold">#{order._id.slice(-8)}</div>
                      </div>
                      <div className="mb-3">
                        <strong className="text-muted">Ngày đặt hàng:</strong>
                        <div>{formatDate(order.createdAt)}</div>
                      </div>
                      {order.confirmedAt && (
                        <div className="mb-3">
                          <strong className="text-muted">Ngày xác nhận:</strong>
                          <div>{formatDate(order.confirmedAt)}</div>
                        </div>
                      )}
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-muted">Trạng thái:</strong>
                        <div className="mt-1">
                          <OrderStatusBadge status={order.status} showIcon={true} />
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong className="text-muted">Thanh toán:</strong>
                        <div className="d-flex gap-2 align-items-center mt-1">
                          <span>{getPaymentMethodText(order.payment?.paymentMethod)}</span>
                          {order.payment && getPaymentStatusBadge(order.payment.status)}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Customer Information */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-user me-2 text-info"></i>
                    Thông tin khách hàng
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-muted">Tên khách hàng:</strong>
                        <div>{order.userId?.name || getRecipientInfo().recipientName}</div>
                      </div>
                      <div className="mb-3">
                        <strong className="text-muted">Email:</strong>
                        <div>{order.userId?.email || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-muted">Số điện thoại:</strong>
                        <div>{order.userId?.phone || getRecipientInfo().phoneNumber}</div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Shipping Information */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-shipping-fast me-2 text-success"></i>
                    Thông tin giao hàng
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong className="text-muted">Người nhận:</strong>
                    <div>{getRecipientInfo().recipientName}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Số điện thoại:</strong>
                    <div>{getRecipientInfo().phoneNumber}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Địa chỉ giao hàng:</strong>
                    <div>{formatShippingAddress(order.shippingAddress)}</div>
                  </div>
                  {order.notes && (
                    <div className="mb-3">
                      <strong className="text-muted">Ghi chú:</strong>
                      <div className="border p-2 rounded bg-light">{order.notes}</div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Order Items */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-shopping-bag me-2 text-warning"></i>
                    Sản phẩm đã đặt ({order.orderLines.length} món)
                  </h5>
                </Card.Header>
                <Card.Body>
                  {order.orderLines.map((item) => {
                    const review = item.review;
                    const hasReviewed = !!review;
                    const canReview = order.status === 'completed' && !hasReviewed;
                    const canEdit = hasReviewed && review.editCount === 0;

                    return (
                      <div key={item.productId} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className="rounded me-3"
                        />
                        <div className="flex-grow-1">
                          <Link to={`/products/${item.productId}`} className="text-decoration-none text-dark">
                            <h6 className="mb-1">{item.productName}</h6>
                          </Link>
                          <div className="text-muted">
                            {formatCurrency(item.productActualPrice || item.productPrice)} x {item.quantity}
                          </div>
                          {canReview && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleShowReviewModal(item)}
                            >
                              Viết đánh giá
                            </Button>
                          )}
                          {hasReviewed && (
                            <div className="mt-2">
                              <StarRating rating={review.rating} readOnly />
                              <p className="mb-1 fst-italic">"{review.comment}"</p>
                              {canEdit && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0"
                                  onClick={() => handleShowReviewModal(item, review)}
                                >
                                  Chỉnh sửa
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-end">
                          <strong>{formatCurrency((item.productActualPrice || item.productPrice) * item.quantity)}</strong>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-3 border-top">
                    {/* Financial Breakdown */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Tạm tính:</span>
                      <span>{formatCurrency(order.subtotal || order.orderLines.reduce((sum, item) => sum + (item.productActualPrice || item.productPrice) * item.quantity, 0))}</span>
                    </div>
                    
                    {order.shippingFee && order.shippingFee > 0 && (
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Phí vận chuyển:</span>
                        <span>{formatCurrency(order.shippingFee)}</span>
                      </div>
                    )}
                    
                    {order.discount && order.discount > 0 && (
                      <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                        <span>
                          <i className="fas fa-tag me-1"></i>
                          Mã giảm giá:
                        </span>
                        <span>-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    
                    {(order.pointsApplied > 0) && (
                      <div className="d-flex justify-content-between align-items-center mb-2 text-info">
                        <span>
                          <i className="fas fa-coins me-1"></i>
                          Điểm tích lũy đã dùng:
                        </span>
                        <span>-{formatCurrency(order.pointsApplied)}</span>
                      </div>
                    )}
                    
                    <hr className="my-3" />
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 fw-bold">Tổng cộng:</h5>
                      <h5 className="mb-0 fw-bold text-primary">{formatCurrency(order.totalAmount)}</h5>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              {/* Order Summary */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-receipt me-2 text-primary"></i>
                    Tóm tắt đơn hàng
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Tạm tính:</span>
                    <span>{formatCurrency(order.subtotal || order.orderLines.reduce((sum, item) => sum + (item.productActualPrice || item.productPrice) * item.quantity, 0))}</span>
                  </div>
                  
                  {order.shippingFee && order.shippingFee > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Phí vận chuyển:</span>
                      <span>{formatCurrency(order.shippingFee)}</span>
                    </div>
                  )}
                  
                  {order.discount && order.discount > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                      <span>
                        <i className="fas fa-tag me-1"></i>
                        Giảm giá:
                      </span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  
                  {order.pointsApplied && order.pointsApplied > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-2 text-info">
                      <span>
                        <i className="fas fa-coins me-1"></i>
                        Điểm sử dụng:
                      </span>
                      <span>-{formatCurrency(order.pointsApplied)}</span>
                    </div>
                  )}
                  

                  
                  <hr className="my-3" />
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Tổng cộng:</h6>
                    <h5 className="mb-0 fw-bold text-primary">{formatCurrency(order.totalAmount)}</h5>
                  </div>
                </Card.Body>
              </Card>

              {/* Actions */}
              {order.canCancel && order.status !== 'cancelled' && (
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">
                      <i className="fas fa-cogs me-2 text-danger"></i>
                      Hành động
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Button
                      variant="danger"
                      onClick={() => setShowCancelModal(true)}
                      disabled={isCancelling}
                      className="w-100 mb-2"
                    >
                      <i className="fas fa-times me-2"></i>
                      {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                    </Button>
                    <small className="text-muted d-block">
                      Bạn có thể hủy đơn hàng ở trạng thái hiện tại.
                    </small>
                  </Card.Body>
                </Card>
              )}

              {/* Order Timeline */}
              <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
            </Col>
          </Row>
        </Col>
      </Row>

      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProduct?.existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'} cho {selectedProduct?.productName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <ReviewForm
              productId={selectedProduct.productId}
              orderId={order._id}
              existingReview={selectedProduct.existingReview}
              onReviewSubmit={handleReviewSubmit}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Cancel Order Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
            Xác nhận hủy đơn hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <div className="bg-warning-subtle p-4 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
              <i className="fas fa-exclamation-triangle text-warning" style={{fontSize: '2rem'}}></i>
            </div>
          </div>
          <p className="text-center mb-3">
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order._id.slice(-8)}</strong>?
          </p>
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <small>
              {['new', 'confirmed', 'preparing'].includes(order.status) 
                ? 'Đơn hàng sẽ được hủy ngay lập tức.'
                : 'Đơn hàng đang trong quá trình giao hàng. Yêu cầu hủy sẽ được gửi đến shop để xử lý.'
              }
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowCancelModal(false)}
            disabled={isCancelling}
          >
            <i className="fas fa-times me-2"></i>
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
              <>
                <i className="fas fa-check me-2"></i>
                Xác nhận hủy
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderDetailPage;