import React from 'react';
import { Card, Badge, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const OrderReferenceCard = ({ orderReference }) => {
  const navigate = useNavigate();

  if (!orderReference || !orderReference.orderId) {
    return (
      <Card className="order-reference-card order-not-found" style={{ maxWidth: '320px', cursor: 'default' }}>
        <Card.Body className="p-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle text-warning"></i>
            <small className="text-muted">Đơn hàng không tồn tại</small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const order = orderReference.orderId;
  const orderCode = orderReference.orderCode || order.orderCode;
  const firstProduct = order.orderLines?.[0];
  const totalProducts = order.orderLines?.length || 0;

  const handleClick = () => {
    if (order._id) {
      navigate(`/orders/${order._id}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', text: 'Chờ xác nhận' },
      processing: { variant: 'info', text: 'Đang xử lý' },
      shipping: { variant: 'primary', text: 'Đang giao' },
      completed: { variant: 'success', text: 'Hoàn thành' },
      cancelled: { variant: 'danger', text: 'Đã hủy' },
      return_refund: { variant: 'secondary', text: 'Trả hàng' },
    };
    const config = statusMap[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant} className="small">{config.text}</Badge>;
  };

  return (
    <Card 
      className="order-reference-card" 
      style={{ 
        maxWidth: '320px', 
        cursor: order._id ? 'pointer' : 'default',
        border: '1px solid #d1e7dd',
        borderRadius: '8px',
        transition: 'all 0.2s',
        backgroundColor: '#f8fdf9',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (order._id) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Card.Body className="p-3">
        {/* Header with order code and status */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-receipt text-success" style={{ fontSize: '1rem' }}></i>
            <strong className="text-success" style={{ fontSize: '0.9rem' }}>{orderCode}</strong>
          </div>
          {order.status && getStatusBadge(order.status)}
        </div>

        {/* Product info with image */}
        {firstProduct && (
          <div className="d-flex gap-3 mb-2">
            <div className="position-relative" style={{ flexShrink: 0 }}>
              <Image
                src={firstProduct.productImage || '/placeholder.png'}
                alt={firstProduct.productName}
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #d1e7dd',
                }}
              />
              {totalProducts > 1 && (
                <div
                  className="position-absolute bg-success text-white"
                  style={{
                    bottom: '-4px',
                    right: '-4px',
                    fontSize: '0.7rem',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  +{totalProducts - 1}
                </div>
              )}
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <p
                className="text-dark fw-medium mb-1"
                style={{
                  fontSize: '0.85rem',
                  lineHeight: '1.3',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {firstProduct.productName}
              </p>
              {totalProducts > 1 && (
                <p className="text-muted small mb-0">
                  <i className="bi bi-box-seam me-1"></i>
                  và {totalProducts - 1} sản phẩm khác
                </p>
              )}
            </div>
          </div>
        )}

        {/* Total amount and date */}
        <div className="d-flex justify-content-between align-items-center pt-2" style={{ borderTop: '1px solid #d1e7dd' }}>
          <div>
            {order.totalAmount !== undefined && (
              <div className="text-success fw-bold" style={{ fontSize: '1rem' }}>
                {order.totalAmount.toLocaleString('vi-VN')} ₫
              </div>
            )}
            {order.createdAt && (
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-calendar3 me-1"></i>
                {moment(order.createdAt).format('DD/MM/YYYY')}
              </div>
            )}
          </div>
          {order._id && (
            <div className="text-success" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
              Chi tiết
              <i className="bi bi-arrow-right ms-1"></i>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderReferenceCard;
