import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserOrderStats } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import styles from './OrderStatsPage.module.css';

const OrderStatsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getUserOrderStats();
      setStats(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching stats';
      setError({ message: errorMessage });
      toast.error(errorMessage);
      console.error('Failed to fetch order stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatConfig = (status) => {
    switch (status) {
      case 'new':
        return { 
          title: 'New', 
          color: 'primary', 
          icon: '📝',
          description: 'Newly created orders' 
        };
      case 'confirmed':
        return { 
          title: 'Confirmed', 
          color: 'info', 
          icon: '✅',
          description: 'Confirmed orders' 
        };
      case 'preparing':
        return { 
          title: 'Preparing', 
          color: 'warning', 
          icon: '👨‍🍳',
          description: 'Orders being prepared' 
        };
      case 'shipping':
        return { 
          title: 'Shipping', 
          color: 'secondary', 
          icon: '🚚',
          description: 'Orders in transit' 
        };
      case 'delivered':
        return { 
          title: 'Delivered', 
          color: 'success', 
          icon: '📦',
          description: 'Successfully delivered orders' 
        };
      case 'cancelled':
        return { 
          title: 'Cancelled', 
          color: 'danger', 
          icon: '❌',
          description: 'Cancelled orders' 
        };
      case 'cancellation_requested':
        return { 
          title: 'Cancellation Requested', 
          color: 'warning', 
          icon: '⚠️',
          description: 'Orders with cancellation requests' 
        };
      default:
        return { 
          title: status, 
          color: 'secondary', 
          icon: '❓',
          description: 'Unknown status' 
        };
    }
  };

  const handleViewOrders = (status = '') => {
    if (status) {
      navigate(`/orders?status=${status}`);
    } else {
      navigate('/orders');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState onRetry={fetchStats} message={error.message} />;
  }

  if (!stats) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <p>No statistics available</p>
        </div>
      </Container>
    );
  }

  const statEntries = Object.entries(stats);
  const totalOrders = statEntries.reduce((sum, [, stat]) => sum + stat.count, 0);

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Order Statistics</h2>
            <Button variant="primary" onClick={() => handleViewOrders()}>
              View All Orders
            </Button>
          </div>

          {/* Overall Statistics */}
          <Row className="mb-4 justify-content-center">
            <Col md={6}>
              <Card className={`text-center ${styles.SummaryCard}`} border="primary">
                <Card.Body>
                  <div className={styles.SummaryIcon}>📊</div>
                  <h3 className="text-primary">{totalOrders}</h3>
                  <p className="text-muted mb-0">Total Orders</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Status Statistics */}
          <Row>
            {statEntries.map(([status, stat]) => {
              const config = getStatConfig(status);
              return (
                <Col md={6} lg={4} key={status} className="mb-4">
                  <Card 
                    className={`h-100 ${styles.StatCard}`}
                    border={config.color}
                  >
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-3">
                        <div className={styles.StatIcon}>{config.icon}</div>
                        <div>
                          <h6 className={`text-${config.color} mb-0`}>{config.title}</h6>
                          <small className="text-muted">{config.description}</small>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Number of Orders:</span>
                          <strong className={`text-${config.color}`}>{stat.count}</strong>
                        </div>

                        {stat.count > 0 && (
                          <div className="text-center">
                            <Button
                              variant={`outline-${config.color}`}
                              size="sm"
                              onClick={() => handleViewOrders(status)}
                            >
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Quick Actions */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-2">
                  <Button
                    variant="outline-primary"
                    className="w-100"
                    onClick={() => handleViewOrders()}
                  >
                    📋 View All Orders
                  </Button>
                </Col>
                <Col md={4} className="mb-2">
                  <Button
                    variant="outline-success"
                    className="w-100"
                    onClick={() => handleViewOrders('delivered')}
                  >
                    ✅ Delivered Orders
                  </Button>
                </Col>
                <Col md={4} className="mb-2">
                  <Button
                    variant="outline-warning"
                    className="w-100"
                    onClick={() => handleViewOrders('shipping')}
                  >
                    🚚 Shipping Orders
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderStatsPage;