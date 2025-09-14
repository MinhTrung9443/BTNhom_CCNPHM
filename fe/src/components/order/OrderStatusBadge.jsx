import Badge from 'react-bootstrap/Badge';

/**
 * Component to display order status
 * @param {{status: string}} props
 */
const OrderStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'new':
        return { variant: 'primary', text: 'New' };
      case 'confirmed':
        return { variant: 'info', text: 'Confirmed' };
      case 'preparing':
        return { variant: 'warning', text: 'Preparing' };
      case 'shipping':
        return { variant: 'secondary', text: 'Shipping' };
      case 'delivered':
        return { variant: 'success', text: 'Delivered' };
      case 'cancelled':
        return { variant: 'danger', text: 'Cancelled' };
      case 'cancellation_requested':
        return { variant: 'warning', text: 'Cancellation Requested' };
      default:
        return { variant: 'secondary', text: 'Unknown' };
    }
  };

  const { variant, text } = getStatusConfig(status);

  return <Badge bg={variant}>{text}</Badge>;
};

export default OrderStatusBadge;