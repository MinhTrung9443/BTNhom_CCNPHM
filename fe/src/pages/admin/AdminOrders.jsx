import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal } from 'react-bootstrap';
import './../../styles/admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockOrders = [
        {
          id: 'ORD001',
          customerName: 'Nguyễn Văn A',
          customerEmail: 'nguyenvana@example.com',
          totalAmount: 450000,
          status: 'pending',
          items: [
            { name: 'Bánh Pía Đậu Xanh', quantity: 5, price: 45000 },
            { name: 'Bánh Pía Thịt', quantity: 3, price: 50000 }
          ],
          createdAt: '2024-01-20T10:30:00Z',
          shippingAddress: '123 Đường ABC, Quận 1, TP.HCM'
        },
        {
          id: 'ORD002',
          customerName: 'Trần Thị B',
          customerEmail: 'tranthib@example.com',
          totalAmount: 150000,
          status: 'processing',
          items: [
            { name: 'Bánh Ín', quantity: 4, price: 35000 }
          ],
          createdAt: '2024-01-20T09:15:00Z',
          shippingAddress: '456 Đường XYZ, Quận 3, TP.HCM'
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Replace with API call
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Chờ xử lý', icon: 'fas fa-clock' },
      processing: { bg: 'info', text: 'Đang xử lý', icon: 'fas fa-cog' },
      shipped: { bg: 'primary', text: 'Đã giao', icon: 'fas fa-truck' },
      delivered: { bg: 'success', text: 'Hoàn thành', icon: 'fas fa-check' },
      cancelled: { bg: 'danger', text: 'Đã hủy', icon: 'fas fa-times' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge bg={config.bg}>
        <i className={config.icon}></i> {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Container fluid className="admin-orders">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-title">
                <i className="fas fa-shopping-cart me-2"></i>
                Quản lý đơn hàng
              </h2>
              <p className="text-muted">Xem và xử lý đơn hàng của khách hàng</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đã giao</option>
            <option value="delivered">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Orders Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>
                      <div>
                        <div className="fw-bold">{order.customerName}</div>
                        <small className="text-muted">{order.customerEmail}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        {order.items.map((item, index) => (
                          <div key={index}>
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetail(true);
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        {order.status === 'pending' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                          >
                            <i className="fas fa-check"></i>
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                          >
                            <i className="fas fa-truck"></i>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Không có đơn hàng nào</h5>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Order Detail Modal */}
      <Modal show={showOrderDetail} onHide={() => setShowOrderDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Thông tin khách hàng</h6>
                  <p><strong>Tên:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
                </Col>
                <Col md={6}>
                  <h6>Thông tin đơn hàng</h6>
                  <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
                  <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                </Col>
              </Row>

              <h6 className="mt-3">Sản phẩm trong đơn hàng</h6>
              <Table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderDetail(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminOrders;
