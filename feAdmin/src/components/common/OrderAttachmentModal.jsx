import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Spinner, Badge, Image } from 'react-bootstrap';
import orderService from '../../services/orderService';
import moment from 'moment';
import { toast } from 'react-toastify';

const OrderAttachmentModal = ({ show, onHide, onSelectOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    if (show) {
      fetchOrders(1, '');
    }
  }, [show]);

  const fetchOrders = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await orderService.getUserOrdersForChat({
        page,
        limit: 10,
        search,
      });

      setOrders(response.data.data);
      setPagination(response.data.meta);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(1, searchQuery);
  };

  const handleSelectOrder = (order) => {
    onSelectOrder({
      orderId: order._id,
      orderCode: order.orderCode,
    });
    onHide();
  };

  const handlePageChange = (newPage) => {
    fetchOrders(newPage, searchQuery);
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
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Chọn đơn hàng để đính kèm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSearch} className="mb-3">
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="primary">
              <i className="bi bi-search"></i>
            </Button>
            {searchQuery && (
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchQuery('');
                  fetchOrders(1, '');
                }}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </div>
        </Form>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <p className="mt-2 text-muted">Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <>
            <div className="d-flex flex-column gap-3">
              {orders.map((order) => {
                const firstProduct = order.orderLines[0];
                const totalProducts = order.orderLines.length;
                
                return (
                  <div
                    key={order._id}
                    onClick={() => handleSelectOrder(order)}
                    className="d-flex align-items-start gap-3 p-3 border rounded"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: '#fff',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#86efac';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.borderColor = '#dee2e6';
                    }}
                  >
                    {/* Product Image */}
                    <div className="position-relative" style={{ flexShrink: 0 }}>
                      <Image
                        src={firstProduct?.productImage || '/placeholder.png'}
                        alt={firstProduct?.productName || 'Product'}
                        width={64}
                        height={64}
                        style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #dee2e6' }}
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

                    {/* Order Info */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      {/* Header: Order Code & Status */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1 me-2" style={{ minWidth: 0 }}>
                          <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                            {order.orderCode}
                          </div>
                          <div
                            className="text-muted small"
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {firstProduct?.productName}
                          </div>
                          {totalProducts > 1 && (
                            <div className="text-muted small d-flex align-items-center gap-1 mt-1">
                              <i className="bi bi-box-seam"></i>
                              <span>và {totalProducts - 1} sản phẩm khác</span>
                            </div>
                          )}
                        </div>
                        <div className="d-flex flex-column align-items-end gap-1">
                          {getStatusBadge(order.status)}
                          <div className="text-muted small" style={{ whiteSpace: 'nowrap' }}>
                            {moment(order.createdAt).format('DD/MM/YYYY')}
                          </div>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <div className="fw-bold text-success" style={{ fontSize: '1rem' }}>
                          {order.totalAmount.toLocaleString('vi-VN')} ₫
                        </div>
                        <span className="text-success small fw-medium">Chọn đơn này →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  <i className="bi bi-chevron-left"></i>
                </Button>
                <span className="text-muted">
                  Trang {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  <i className="bi bi-chevron-right"></i>
                </Button>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderAttachmentModal;
