import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
import { useNavigate, Link } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';
import styles from './OrderCard.module.css';

/**
 * Component to display order information in a card format
 * @param {{
 *   order: object;
 *   onCancel?: (orderId: string) => void;
 * }} props
 */
const OrderCard = ({ order, onCancel }) => {
  const navigate = useNavigate();

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

  const handleViewDetail = () => {
    navigate(`/orders/${order._id}`);
  };

  const handleCancelOrder = () => {
    if (onCancel) {
      onCancel(order._id);
    }
  };

  return (
    <Card className={`mb-3 ${styles.OrderCard}`}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Order #{order._id.slice(-8)}</strong>
          <span className="text-muted ms-2">
            {formatDate(order.createdAt)}
          </span>
        </div>
        <div className="d-flex gap-2">
          <OrderStatusBadge status={order.status} />
          {order.payment && getPaymentStatusBadge(order.payment.status)}
        </div>
      </Card.Header>

      <Card.Body>
        <Row>
          <Col md={8}>
            <h6>Products ({order.orderLines.length} items):</h6>
            <div className={styles.ProductList}>
              {order.orderLines.slice(0, 2).map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={40}
                    height={40}
                    className="rounded me-2"
                  />
                  <div className="flex-grow-1">
                    <Link to={`/products/${item.productId}`} className="text-decoration-none text-dark fw-medium">
                      {item.productName}
                    </Link>
                    <small className="text-muted d-block">
                      {formatCurrency(item.productPrice)} x {item.quantity}
                    </small>
                  </div>
                </div>
              ))}
              {order.orderLines.length > 2 && (
                <small className="text-muted">
                  ... and {order.orderLines.length - 2} more products
                </small>
              )}
            </div>

            <div className="mt-2">
              <small className="text-muted">
                <strong>Recipient:</strong> {order.recipientName} - {order.phoneNumber}
              </small>
              <br />
              <small className="text-muted">
                <strong>Address:</strong> {order.shippingAddress}
              </small>
              <br />
              <small className="text-muted">
                <strong>Payment:</strong> {getPaymentMethodText(order.payment?.paymentMethod)}
              </small>
            </div>
          </Col>

          <Col md={4} className="text-end">

            <div className="d-flex flex-column gap-2">
              <Button variant="outline-primary" onClick={handleViewDetail}>
                View Details
              </Button>
              {order.canCancel && order.status !== 'cancelled' && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </Col>
        </Row>

        {order.notes && (
          <div className="mt-2 pt-2 border-top">
            <small className="text-muted">
              <strong>Notes:</strong> {order.notes}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default OrderCard;