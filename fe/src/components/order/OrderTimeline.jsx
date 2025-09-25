import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import ProgressBar from 'react-bootstrap/ProgressBar';
import styles from './OrderTimeline.module.css';

/**
 * Component to display the timeline of an order's statuses with progress tracking
 * @param {{timeline: Array, currentStatus?: string}} props
 */
const OrderTimeline = ({ timeline, currentStatus }) => {
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
        return { 
          variant: 'warning', 
          text: 'Chờ xác nhận', 
          icon: '📝',
          bgColor: '#fff3cd',
          iconColor: '#856404'
        };
      case 'confirmed':
        return { 
          variant: 'info', 
          text: 'Đã xác nhận', 
          icon: '✅',
          bgColor: '#d1ecf1',
          iconColor: '#0c5460'
        };
      case 'preparing':
        return { 
          variant: 'primary', 
          text: 'Đang chuẩn bị', 
          icon: '👨‍🍳',
          bgColor: '#cce7ff',
          iconColor: '#004085'
        };
      case 'shipping':
        return { 
          variant: 'secondary', 
          text: 'Đang vận chuyển', 
          icon: '🚚',
          bgColor: '#e2e3e5',
          iconColor: '#383d41'
        };
      case 'delivered':
        return { 
          variant: 'success', 
          text: 'Đã giao hàng', 
          icon: '📦',
          bgColor: '#d4edda',
          iconColor: '#155724'
        };
      case 'completed':
        return { 
          variant: 'success', 
          text: 'Hoàn thành', 
          icon: '✅',
          bgColor: '#d4edda',
          iconColor: '#155724'
        };
      case 'cancelled':
        return { 
          variant: 'danger', 
          text: 'Đã hủy', 
          icon: '❌',
          bgColor: '#f8d7da',
          iconColor: '#721c24'
        };
      case 'cancellation_requested':
        return { 
          variant: 'warning', 
          text: 'Yêu cầu hủy', 
          icon: '⚠️',
          bgColor: '#fff3cd',
          iconColor: '#856404'
        };
      default:
        return { 
          variant: 'secondary', 
          text: status, 
          icon: '❓',
          bgColor: '#e2e3e5',
          iconColor: '#383d41'
        };
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

  const getProgressPercentage = () => {
    if (!currentStatus) return 0;
    
    const statusOrder = ['new', 'confirmed', 'preparing', 'shipping', 'delivered', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentStatus === 'cancelled' || currentStatus === 'cancellation_requested') {
      return 100; // Special handling for cancelled orders
    }
    
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  const getProgressVariant = () => {
    if (currentStatus === 'cancelled' || currentStatus === 'cancellation_requested') {
      return 'danger';
    }
    if (currentStatus === 'completed') {
      return 'success';
    }
    return 'primary';
  };

  if (!timeline || timeline.length === 0) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">Lịch sử đơn hàng</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-0">Chưa có thông tin lịch sử</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Lịch sử đơn hàng</h5>
        {currentStatus && (
          <div className="mt-2">
            <small className="text-muted d-block mb-1">Tiến độ đơn hàng</small>
            <ProgressBar 
              now={getProgressPercentage()} 
              variant={getProgressVariant()}
              style={{ height: '8px' }}
            />
          </div>
        )}
      </Card.Header>
      <Card.Body>
        <div className={styles.Timeline}>
          {timeline.map((item, index) => {
            const statusConfig = getStatusConfig(item.status);
            const isLatest = index === 0;
            
            return (
              <div key={item._id} className={`${styles.TimelineItem} ${isLatest ? styles.LatestItem : ''}`}>
                <div 
                  className={styles.TimelineIcon}
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    borderColor: statusConfig.iconColor
                  }}
                >
                  <span 
                    className={styles.Icon}
                    style={{ color: statusConfig.iconColor }}
                  >
                    {statusConfig.icon}
                  </span>
                </div>
                <div className={styles.TimelineContent}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Badge bg={statusConfig.variant}>{statusConfig.text}</Badge>
                        <small className="text-muted">
                          {getUserTypeText(item.performedBy.userType, item.performedBy.userName)}
                        </small>
                        {isLatest && (
                          <Badge bg="info" className="ms-auto">
                            <i className="fas fa-clock me-1"></i>
                            Mới nhất
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="mb-1 text-dark">{item.description}</p>
                      )}
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        {formatDate(item.timestamp)}
                      </small>
                    </div>
                  </div>
                </div>
                {index < timeline.length - 1 && (
                  <div 
                    className={styles.TimelineLine}
                    style={{ borderColor: statusConfig.iconColor + '40' }}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {timeline.length === 0 && (
          <div className="text-center text-muted py-3">
            <i className="fas fa-history fa-2x mb-2"></i>
            <p className="mb-0">Chưa có hoạt động nào</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default OrderTimeline;