import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { getOrderDetail, cancelOrder } from '../services/orderService';
import {  getUserReviews } from '../redux/reviewSlice';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import OrderTimeline from '../components/order/OrderTimeline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import ReviewForm from '../components/review/ReviewForm';
import StarRating from '../components/review/StarRating';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { eligibleProducts, byUser: userReviews } = useSelector((state) => state.reviews);

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
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      dispatch(getUserReviews(user._id));
    }
  }, [user, dispatch]);

  const handleShowReviewModal = (product, existingReview = null) => {
    setSelectedProduct({ ...product, existingReview });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
    if (user) {
      dispatch(getUserReviews(user._id));
    }
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
        return 'Cash on Delivery';
      case 'BANK':
        return 'Bank Transfer';
      case 'VNPAY':
        return 'VNPay';
      default:
        return method;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'failed':
        return <Badge bg="danger">Failed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrderDetail(); // Refresh order data
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState onRetry={fetchOrderDetail} message={error.message} />;
  }

  if (!order) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Order not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Button variant="outline-secondary" onClick={handleGoBack} className="me-3">
                ← Back
              </Button>
              <h2 className="d-inline">Order #{order._id.slice(-8)}</h2>
            </div>
            <div className="d-flex gap-2">
              <OrderStatusBadge status={order.status} />
              {order.payment && getPaymentStatusBadge(order.payment.status)}
            </div>
          </div>

          <Row>
            <Col lg={8}>
              {/* Order Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Order Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Order ID:</strong> #{order._id.slice(-8)}
                      </div>
                      <div className="mb-3">
                        <strong>Date:</strong> {formatDate(order.createdAt)}
                      </div>
                      {order.confirmedAt && (
                        <div className="mb-3">
                          <strong>Confirmed Date:</strong> {formatDate(order.confirmedAt)}
                        </div>
                      )}
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Status:</strong>{' '}
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="mb-3">
                        <strong>Payment:</strong>{' '}
                        {getPaymentMethodText(order.payment?.paymentMethod)}
                        {' - '}
                        {getPaymentStatusBadge(order.payment?.status)}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Customer Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Customer Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Customer Name:</strong> {order.userId?.name || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>Email:</strong> {order.userId?.email || 'N/A'}
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Phone Number:</strong> {order.userId?.phone || order.phoneNumber}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Shipping Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Shipping Information</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Recipient:</strong> {order.recipientName}
                  </div>
                  <div className="mb-3">
                    <strong>Phone Number:</strong> {order.phoneNumber}
                  </div>
                  <div className="mb-3">
                    <strong>Address:</strong> {order.shippingAddress}
                  </div>
                  {order.notes && (
                    <div className="mb-3">
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Order Items */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Ordered Items</h5>
                </Card.Header>
                <Card.Body>
                  {order.orderLines.map((item) => {
                    const review = userReviews.find(
                      (r) => r.productId?._id === item.productId && r.orderId === order._id
                    );
                    const hasReviewed = !!review;
                    const canReview = order.status === 'delivered' && !hasReviewed;
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
                            {formatCurrency(item.productPrice)} x {item.quantity}
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
                          <strong>{formatCurrency(item.productPrice * item.quantity)}</strong>
                        </div>
                      </div>
                    );
                  })}

                  <div className="text-end pt-3">
                    <h5>
                      <strong>Total: {formatCurrency(order.totalAmount)}</strong>
                    </h5>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              {/* Actions */}
              {order.canCancel && order.status !== 'cancelled' && (
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Actions</h5>
                  </Card.Header>
                  <Card.Body>
                    <Button
                      variant="danger"
                      onClick={handleCancelOrder}
                      disabled={isCancelling}
                      className="w-100"
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                    <small className="text-muted d-block mt-2">
                      You can cancel the order in its current state.
                    </small>
                  </Card.Body>
                </Card>
              )}

              {/* Order Timeline */}
              <OrderTimeline timeline={order.timeline} />
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
    </Container>
  );
};

export default OrderDetailPage;