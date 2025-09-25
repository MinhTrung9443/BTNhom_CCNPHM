import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Tabs, Tab, Form, Button, InputGroup, Container, Row, Col, Pagination } from 'react-bootstrap';
import { getUserOrders, getUserOrderStats, cancelOrder } from '../services/orderService';
import { BUSINESS_TABS, ORDER_STATUS } from '../utils/orderConstants';
import OrderCard from '../components/order/OrderCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import 'bootstrap/dist/css/bootstrap.min.css';

const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state management
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 5,
    total: 0,
    totalOrders: 0
  });
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    tab: 'all',
    search: '',
    page: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Local state for search input
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Tab configuration from constants
  const tabConfig = Object.values(BUSINESS_TABS);

  // Initialize from URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab') || 'all';
    const searchParam = searchParams.get('search') || '';
    const pageParam = parseInt(searchParams.get('page')) || 1;
    
    setFilters({
      tab: tabParam,
      search: searchParam,
      page: pageParam
    });
    
    setSearchInput(searchParam);
  }, [searchParams]);

  const fetchOrders = async (page = 1, tabKey = 'all', search = '', resetData = false) => {
    try {
      if (resetData) {
        setLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);

      const tab = tabConfig.find(t => t.key === tabKey);
      let statusFilter = '';
      
      // Convert tab to status filter (now simplified)
      if (tabKey !== 'all' && tab && tab.status) {
        statusFilter = tab.status; // Single status per tab
      }

      const response = await getUserOrders({
        page,
        limit: pagination.limit,
        status: statusFilter,
        search,
      });

      setOrders(response.data);
      setPagination(response.pagination);
      
      // Update URL params
      const newParams = new URLSearchParams();
      if (tabKey !== 'all') newParams.set('tab', tabKey);
      if (search) newParams.set('search', search);
      if (page > 1) newParams.set('page', page.toString());
      setSearchParams(newParams);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching orders';
      setError({ message: errorMessage });
      toast.error(errorMessage);
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
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
    fetchOrders(filters.page, filters.tab, filters.search, true);
    fetchStats();
  }, [filters.tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tabKey) => {
    setFilters(prev => ({ ...prev, tab: tabKey, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    fetchOrders(1, filters.tab, searchInput);
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    fetchOrders(page, filters.tab, filters.search);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    try {
      await cancelOrder(orderId);
      toast.success('Đơn hàng đã được hủy thành công');
      
      // Update the order in the list using ORDER_STATUS constant
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: ORDER_STATUS.CANCELLED, canCancel: false }
            : order
        )
      );
      
      // Refresh data
      fetchOrders(pagination.current, filters.tab, filters.search);
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while cancelling the order';
      toast.error(errorMessage);
      console.error('Failed to cancel order:', error);
    }
  };

  const handleReset = () => {
    setSearchInput('');
    setFilters({ tab: 'all', search: '', page: 1 });
    setSearchParams({});
    fetchOrders(1, 'all', '', true);
  };

  const getCurrentTabKey = () => {
    return filters.tab || 'all';
  };

  const getTabOrderCount = (tabKey) => {
    if (tabKey === 'all') {
      return Object.values(stats || {}).reduce((sum, stat) => sum + (stat?.count || 0), 0);
    }
    
    const tab = tabConfig.find(t => t.key === tabKey);
    if (!tab || !tab.status) return 0;
    
    return stats?.[tab.status]?.count || 0;
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

  if (loading && !stats) return <LoadingSpinner />;

  if (error) {
    return (
      <ErrorState 
        onRetry={() => { 
          fetchOrders(1, filters.status, filters.search, true); 
          fetchStats(); 
        }} 
        message={error.message} 
      />
    );
  }

  const currentTabKey = getCurrentTabKey();

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0 text-3xl font-bold text-dark">Quản lý đơn hàng</h1>
        <Link to="/orders/stats" className="btn btn-outline-primary">
          <i className="fas fa-chart-bar me-2"></i>
          Thống kê đơn hàng
        </Link>
      </div>

      {/* Search and Filters */}
      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="g-3 align-items-end">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Tìm kiếm đơn hàng</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tên sản phẩm, mã đơn hàng..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="fas fa-search me-2"></i>
                  )}
                  Tìm kiếm
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Button
              variant="outline-secondary"
              onClick={handleReset}
              className="w-100"
            >
              <i className="fas fa-redo me-2"></i>
              Đặt lại
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Tab Navigation */}
      {stats && (
        <Tabs
          activeKey={currentTabKey}
          onSelect={handleTabChange}
          className="mb-4"
        >
          {tabConfig.map((tab) => {
            const count = getTabOrderCount(tab.key);
            const isDisabled = tab.key === 'returns'; // Disable returns tab for now
            
            return (
              <Tab 
                key={tab.key} 
                eventKey={tab.key} 
                title={
                  <span title={tab.description}>
                    {tab.label} ({count})
                    {isDisabled && <small className="text-muted ms-1">(Sắp ra mắt)</small>}
                  </span>
                }
                disabled={isDisabled}
              />
            );
          })}
        </Tabs>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState 
          message={
            filters.search 
              ? `Không tìm thấy đơn hàng nào với từ khóa "${filters.search}"`
              : 'Không có đơn hàng nào'
          }
          actionButton={
            filters.search || filters.status ? (
              <Button variant="primary" onClick={handleReset}>
                Hiển thị tất cả đơn hàng
              </Button>
            ) : (
              <Link to="/products" className="btn btn-primary">
                Tiếp tục mua sắm
              </Link>
            )
          }
        />
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <small className="text-muted">
              Hiển thị {orders.length} đơn hàng trên tổng số {pagination.totalOrders} đơn hàng
            </small>
            {pagination.totalOrders > 0 && (
              <small className="text-muted">
                Trang {pagination.current} / {pagination.total}
              </small>
            )}
          </div>
          
          {orders.map((order) => (
            <OrderCard 
              key={order._id} 
              order={order} 
              onCancel={handleCancelOrder} 
            />
          ))}
          
          {renderPagination()}
        </div>
      )}
    </Container>
  );
};

export default OrdersPage;