import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Tabs, Tab, Form, Button, InputGroup, Container, Row, Col, Pagination } from 'react-bootstrap';
import { getUserOrders, getUserOrderStats, cancelOrder } from '../services/orderService';
import OrderCard from '../components/order/OrderCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import 'bootstrap/dist/css/bootstrap.min.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 5,
    total: 0,
    totalOrders: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState(null);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'cancellation_requested', label: 'Cancellation Requested' },
  ];

  const fetchOrders = async (page = 1, status = '', resetData = false) => {
    try {
      if (resetData) setIsLoading(true);
      else setIsSearching(true);
      setError(null);

      const response = await getUserOrders({
        page,
        limit: pagination.limit,
        status,
        search: filters.search,
      });

      setOrders(response.data);
      setPagination(response.pagination);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching orders';
      setError({ message: errorMessage });
      toast.error(errorMessage);
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getUserOrderStats();
      setStats(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching stats';
      toast.error(errorMessage);
      console.error('Failed to fetch order stats:', error);
    }
  };

  useEffect(() => {
    fetchOrders(1, filters.status, true);
    fetchStats();
  }, [filters.status]);

  const handleTabChange = (status) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(1, filters.status);
  };

  const handlePageChange = (page) => {
    fetchOrders(page, filters.status);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders(pagination.current, filters.status);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while cancelling the order';
      toast.error(errorMessage);
      console.error('Failed to cancel order:', error);
    }
  };

  const renderPagination = () => {
    if (pagination.total <= 1) return null;

    const items = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, pagination.current - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(pagination.total, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
      if (startPage > 2) items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === pagination.current}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (endPage < pagination.total) {
      if (endPage < pagination.total - 1) items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      items.push(
        <Pagination.Item key={pagination.total} onClick={() => handlePageChange(pagination.total)}>
          {pagination.total}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev
          disabled={pagination.current === 1}
          onClick={() => handlePageChange(pagination.current - 1)}
        />
        {items}
        <Pagination.Next
          disabled={pagination.current === pagination.total}
          onClick={() => handlePageChange(pagination.current + 1)}
        />
      </Pagination>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (isLoading && !stats) return <LoadingSpinner />;

  if (error) return <ErrorState onRetry={() => { fetchOrders(1, filters.status, true); fetchStats(); }} message={error.message} />;

  const statEntries = stats ? Object.entries(stats) : [];
  const totalOrders = statEntries.reduce((sum, [, stat]) => sum + stat.count, 0);

  return (
    <Container className="py-5">
      <h1 className="mb-4 text-3xl font-bold text-dark">Order Management</h1>

      {/* Filters and Search */}
      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="g-3 align-items-end">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Search</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by product name, order ID..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Search
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setFilters({ status: '', search: '' });
                fetchOrders(1, '', true);
              }}
              className="w-100"
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Tabs */}
      {stats && (
        <Tabs
          activeKey={filters.status || 'all'}
          onSelect={(key) => handleTabChange(key === 'all' ? '' : key)}
          className="mb-4"
        >
          <Tab eventKey="all" title={`All (${totalOrders})`}></Tab>
          {statusOptions.slice(1).map((option) => (
            <Tab
              key={option.value}
              eventKey={option.value}
              title={`${option.label} (${stats[option.value]?.count || 0})`}
            ></Tab>
          ))}
        </Tabs>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState message="No orders found" />
      ) : (
        <div>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onCancel={handleCancelOrder} />
          ))}
          {renderPagination()}
        </div>
      )}
    </Container>
  );
};

export default OrdersPage;