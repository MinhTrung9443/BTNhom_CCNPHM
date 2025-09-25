import Badge from 'react-bootstrap/Badge';
import { 
  ORDER_STATUS, 
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_COLORS,
  DETAILED_ORDER_STATUS,
  DETAILED_STATUS_LABELS,
  DETAILED_STATUS_COLORS,
  getOrderStatusColor,
  getDetailedStatusColor,
  getOrderStatusLabel,
  getDetailedStatusLabel
} from '../../utils/orderConstants';

/**
 * Component to display order status with proper color mapping and Vietnamese labels
 * Supports both simplified ORDER_STATUS and detailed DETAILED_ORDER_STATUS
 * @param {{status: string, showIcon?: boolean, useDetailed?: boolean}} props
 */
const OrderStatusBadge = ({ status, showIcon = false, useDetailed = false }) => {
  const getStatusConfig = (status) => {
    // Status icons mapping
    const simplifiedIcons = {
      [ORDER_STATUS.PENDING]: '📝',
      [ORDER_STATUS.PROCESSING]: '⚙️',
      [ORDER_STATUS.SHIPPING]: '🚚',
      [ORDER_STATUS.COMPLETED]: '✅',
      [ORDER_STATUS.CANCELLED]: '❌',
      [ORDER_STATUS.RETURN_REFUND]: '↩️',
    };

    const detailedIcons = {
      [DETAILED_ORDER_STATUS.NEW]: '📝',
      [DETAILED_ORDER_STATUS.CONFIRMED]: '✅', 
      [DETAILED_ORDER_STATUS.PREPARING]: '👨‍🍳',
      [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: '🚚',
      [DETAILED_ORDER_STATUS.DELIVERED]: '📦',
      [DETAILED_ORDER_STATUS.COMPLETED]: '✅',
      [DETAILED_ORDER_STATUS.CANCELLED]: '❌',
      [DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED]: '⚠️',
      [DETAILED_ORDER_STATUS.RETURN_REQUESTED]: '↩️',
      [DETAILED_ORDER_STATUS.REFUNDED]: '💰',
    };

    if (useDetailed) {
      return {
        variant: getDetailedStatusColor(status),
        text: getDetailedStatusLabel(status),
        icon: detailedIcons[status] || '❓'
      };
    } else {
      return {
        variant: getOrderStatusColor(status),
        text: getOrderStatusLabel(status),
        icon: simplifiedIcons[status] || '❓'
      };
    }
  };

  const { variant, text, icon } = getStatusConfig(status);

  return (
    <Badge bg={variant}>
      {showIcon && <span className="me-1">{icon}</span>}
      {text}
    </Badge>
  );
};

export default OrderStatusBadge;