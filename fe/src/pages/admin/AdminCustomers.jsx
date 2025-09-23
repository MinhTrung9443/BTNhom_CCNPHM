import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal } from 'react-bootstrap';
import './../../styles/admin.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockCustomers = [
        {
          id: 1,
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          phone: '0901234567',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          totalOrders: 5,
          totalSpent: 1250000,
          joinDate: '2024-01-15',
          status: 'active',
          loyaltyPoints: 250
        },
        {
          id: 2,
          name: 'Trần Thị B',
          email: 'tranthib@example.com',
          phone: '0909876543',
          address: '456 Đường XYZ, Quận 3, TP.HCM',
          totalOrders: 2,
          totalSpent: 450000,
          joinDate: '2024-01-10',
          status: 'active',
          loyaltyPoints: 90
        }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
    } else {
      setFilteredCustomers(customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' ?
      <Badge bg="success">Hoạt động</Badge> :
      <Badge bg="secondary">Không hoạt động</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Container fluid className="admin-customers">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-title">
                <i className="fas fa-users me-2"></i>
                Quản lý khách hàng
              </h2>
              <p className="text-muted">Xem thông tin và quản lý khách hàng</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      {/* Customers Table */}
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
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Đơn hàng</th>
                  <th>Tổng chi tiêu</th>
                  <th>Điểm tích lũy</th>
                  <th>Trạng thái</th>
                  <th>Ngày tham gia</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div>
                        <div className="fw-bold">{customer.name}</div>
                        <small className="text-muted">ID: {customer.id}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{customer.email}</div>
                        <small className="text-muted">{customer.phone}</small>
                      </div>
                    </td>
                    <td>{customer.totalOrders}</td>
                    <td>{formatCurrency(customer.totalSpent)}</td>
                    <td>
                      <Badge bg="warning">{customer.loyaltyPoints} điểm</Badge>
                    </td>
                    <td>{getStatusBadge(customer.status)}</td>
                    <td>{new Date(customer.joinDate).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerDetail(true);
                        }}
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {filteredCustomers.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Không tìm thấy khách hàng nào</h5>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Customer Detail Modal */}
      <Modal show={showCustomerDetail} onHide={() => setShowCustomerDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thông tin khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCustomer && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Thông tin cá nhân</h6>
                  <p><strong>Tên:</strong> {selectedCustomer.name}</p>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p><strong>Số điện thoại:</strong> {selectedCustomer.phone}</p>
                  <p><strong>Địa chỉ:</strong> {selectedCustomer.address}</p>
                </Col>
                <Col md={6}>
                  <h6>Thống kê</h6>
                  <p><strong>Tổng đơn hàng:</strong> {selectedCustomer.totalOrders}</p>
                  <p><strong>Tổng chi tiêu:</strong> {formatCurrency(selectedCustomer.totalSpent)}</p>
                  <p><strong>Điểm tích lũy:</strong> {selectedCustomer.loyaltyPoints} điểm</p>
                  <p><strong>Trạng thái:</strong> {getStatusBadge(selectedCustomer.status)}</p>
                  <p><strong>Ngày tham gia:</strong> {new Date(selectedCustomer.joinDate).toLocaleDateString('vi-VN')}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomerDetail(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminCustomers;
