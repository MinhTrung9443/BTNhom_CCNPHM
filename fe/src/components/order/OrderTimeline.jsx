import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import styles from './OrderTimeline.module.css';

/**
 * Component to display the timeline of an order's statuses
 * @param {{timeline: Array}} props
 */
const OrderTimeline = ({ timeline }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'new':
        return { variant: 'primary', text: 'New', icon: '📝' };
      case 'confirmed':
        return { variant: 'info', text: 'Confirmed', icon: '✅' };
      case 'preparing':
        return { variant: 'warning', text: 'Preparing', icon: '👨‍🍳' };
      case 'shipping':
        return { variant: 'secondary', text: 'Shipping', icon: '🚚' };
      case 'delivered':
        return { variant: 'success', text: 'Delivered', icon: '📦' };
      case 'cancelled':
        return { variant: 'danger', text: 'Cancelled', icon: '❌' };
      case 'cancellation_requested':
        return { variant: 'warning', text: 'Cancellation Requested', icon: '⚠️' };
      default:
        return { variant: 'secondary', text: status, icon: '❓' };
    }
  };

  const getUserTypeText = (userType, userName) => {
    if (userType === 'system') {
      return userName || 'Hệ thống';
    }
    if (userType === 'admin') {
      return 'Nhân viên';
    }
    return 'Khách hàng';
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Order History</h5>
      </Card.Header>
      <Card.Body>
        <div className={styles.Timeline}>
          {timeline.map((item, index) => {
            const statusConfig = getStatusConfig(item.status);
            return (
              <div key={item._id} className={styles.TimelineItem}>
                <div className={styles.TimelineIcon}>
                  <span className={styles.Icon}>{statusConfig.icon}</span>
                </div>
                <div className={styles.TimelineContent}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Badge bg={statusConfig.variant}>{statusConfig.text}</Badge>
                        <small className="text-muted">
                          {getUserTypeText(item.performedBy.userType, item.performedBy.userName)}
                        </small>
                      </div>
                      <p className="mb-1">{item.description}</p>
                      <small className="text-muted">
                        {formatDate(item.timestamp)}
                      </small>
                    </div>
                  </div>
                </div>
                {index < timeline.length - 1 && <div className={styles.TimelineLine}></div>}
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderTimeline;