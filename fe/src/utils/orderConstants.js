
export const ORDER_STATUS = {
  PENDING: "pending", // Chờ xác nhận -> Tab: Chờ xác nhận
  PROCESSING: "processing", // Đã xác nhận, đang chuẩn bị -> Tab: Vận chuyển  
  SHIPPING: "shipping", // Đang giao hàng, Đã giao, Yêu cầu hủy -> Tab: Chờ giao hàng
  COMPLETED: "completed", // Hoàn thành (khi khách bấm nhận hàng) -> Tab: Hoàn thành
  CANCELLED: "cancelled", //quá hạn thanh toán, Đã hủy (hủy Trước khi shop chuẩn bị ) -> Tab: Đã hủy
  RETURN_REFUND: "return_refund", // Giao hàng không thành công, Trả hàng/Hoàn tiền (Sau khi giao hàng) -> Tab: Trả hàng/Hoàn tiền
};

/**
 * Detailed Order Statuses (for timeline and internal tracking)
 * These are the granular statuses used in order timeline
 */
export const DETAILED_ORDER_STATUS = {
  // PENDING
  NEW: "new", // Đơn hàng đã được đặt

  // PROCESSING
  CONFIRMED: "confirmed", // Đơn hàng đã xác nhận
  PREPARING: "preparing", // Người bán đang chuẩn bị hàng

  // SHIPPING
  SHIPPING_IN_PROGRESS: "shipping_in_progress", // Đang giao hàng
  DELIVERED: "delivered", // Đã giao
  CANCELLATION_REQUESTED: "cancellation_requested", // Yêu cầu hủy

  // COMPLETED
  COMPLETED: "completed", // Hoàn thành (khách đã nhận hàng)

  // CANCELLED
  PAYMENT_OVERDUE: "payment_overdue", // Quá hạn thanh toán
  CANCELLED: "cancelled", // Đã hủy (trước khi shop chuẩn bị)

  // RETURN_REFUND
  DELIVERY_FAILED: "delivery_failed", // Giao hàng không thành công
  RETURN_REQUESTED: "return_requested", // Yêu cầu trả hàng/hoàn tiền
  REFUNDED: "refunded", // Đã hoàn tiền
};

/**
 * Order Status Labels in Vietnamese for Tabs
 */
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Chờ xác nhận",
  [ORDER_STATUS.PROCESSING]: "Vận chuyển", 
  [ORDER_STATUS.SHIPPING]: "Chờ giao hàng",
  [ORDER_STATUS.COMPLETED]: "Hoàn thành",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
  [ORDER_STATUS.RETURN_REFUND]: "Trả hàng/Hoàn tiền",
};

/**
 * Detailed Order Status Labels (for timeline)
 */
export const DETAILED_STATUS_LABELS = {
  [DETAILED_ORDER_STATUS.NEW]: "Đơn hàng mới",
  [DETAILED_ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [DETAILED_ORDER_STATUS.PREPARING]: "Đang chuẩn bị",
  [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: "Đang giao hàng",
  [DETAILED_ORDER_STATUS.DELIVERED]: "Đã giao hàng",
  [DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED]: "Yêu cầu hủy",
  [DETAILED_ORDER_STATUS.COMPLETED]: "Hoàn thành",
  [DETAILED_ORDER_STATUS.PAYMENT_OVERDUE]: "Quá hạn thanh toán",
  [DETAILED_ORDER_STATUS.CANCELLED]: "Đã hủy",
  [DETAILED_ORDER_STATUS.DELIVERY_FAILED]: "Giao hàng thất bại",
  [DETAILED_ORDER_STATUS.RETURN_REQUESTED]: "Yêu cầu trả hàng",
  [DETAILED_ORDER_STATUS.REFUNDED]: "Đã hoàn tiền",
};

/**
 * Order Status Colors for Badge Components (Tab Level)
 */
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: "warning",
  [ORDER_STATUS.PROCESSING]: "info", 
  [ORDER_STATUS.SHIPPING]: "primary",
  [ORDER_STATUS.COMPLETED]: "success",
  [ORDER_STATUS.CANCELLED]: "danger",
  [ORDER_STATUS.RETURN_REFUND]: "secondary",
};

/**
 * Detailed Status Colors (for timeline)
 */
export const DETAILED_STATUS_COLORS = {
  [DETAILED_ORDER_STATUS.NEW]: "warning",
  [DETAILED_ORDER_STATUS.CONFIRMED]: "info",
  [DETAILED_ORDER_STATUS.PREPARING]: "primary",
  [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: "primary",
  [DETAILED_ORDER_STATUS.DELIVERED]: "success",
  [DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED]: "warning",
  [DETAILED_ORDER_STATUS.COMPLETED]: "success",
  [DETAILED_ORDER_STATUS.PAYMENT_OVERDUE]: "danger",
  [DETAILED_ORDER_STATUS.CANCELLED]: "danger",
  [DETAILED_ORDER_STATUS.DELIVERY_FAILED]: "danger",
  [DETAILED_ORDER_STATUS.RETURN_REQUESTED]: "secondary",
  [DETAILED_ORDER_STATUS.REFUNDED]: "secondary",
};

/**
 * Tab Configuration for OrdersPage
 * Now uses simplified ORDER_STATUS directly
 */
export const BUSINESS_TABS = {
  ALL: {
    key: 'all',
    label: 'Tất cả',
    status: null, // No status filter, fetch all
    description: 'Hiển thị tất cả đơn hàng'
  },
  PENDING: {
    key: 'pending',
    label: ORDER_STATUS_LABELS[ORDER_STATUS.PENDING],
    status: ORDER_STATUS.PENDING,
    description: 'Đơn hàng chờ shop xác nhận'
  },
  PROCESSING: {
    key: 'processing',
    label: ORDER_STATUS_LABELS[ORDER_STATUS.PROCESSING],
    status: ORDER_STATUS.PROCESSING,
    description: 'Đơn hàng đang được xử lý và chuẩn bị'
  },
  SHIPPING: {
    key: 'shipping',
    label: ORDER_STATUS_LABELS[ORDER_STATUS.SHIPPING],
    status: ORDER_STATUS.SHIPPING,
    description: 'Đơn hàng đang giao hoặc chờ giao'
  },
  COMPLETED: {
    key: 'completed',
    label: ORDER_STATUS_LABELS[ORDER_STATUS.COMPLETED],
    status: ORDER_STATUS.COMPLETED,
    description: 'Đơn hàng đã giao thành công'
  },
  CANCELLED: {
    key: 'cancelled',
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CANCELLED],
    status: ORDER_STATUS.CANCELLED,
    description: 'Đơn hàng đã bị hủy'
  },
  RETURN_REFUND: {
    key: 'return_refund',
    label: ORDER_STATUS_LABELS[ORDER_STATUS.RETURN_REFUND],
    status: ORDER_STATUS.RETURN_REFUND,
    description: 'Đơn hàng trả hàng và hoàn tiền'
  }
};

export const STATUS_MAP = {
  [ORDER_STATUS.PENDING]: [DETAILED_ORDER_STATUS.NEW],
  [ORDER_STATUS.PROCESSING]: [
    DETAILED_ORDER_STATUS.CONFIRMED,
    DETAILED_ORDER_STATUS.PREPARING,
  ],
  [ORDER_STATUS.SHIPPING]: [
    DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS,
    DETAILED_ORDER_STATUS.DELIVERED,
    DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED,
  ],
  [ORDER_STATUS.COMPLETED]: [DETAILED_ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.CANCELLED]: [
    DETAILED_ORDER_STATUS.PAYMENT_OVERDUE,
    DETAILED_ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.RETURN_REFUND]: [
    DETAILED_ORDER_STATUS.DELIVERY_FAILED,
    DETAILED_ORDER_STATUS.RETURN_REQUESTED,
    DETAILED_ORDER_STATUS.REFUNDED,
  ],
};

/**
 * Helper function to get business tab configuration by status
 * @param {string} status - Order status
 * @returns {object|null} Business tab configuration
 */
export const getBusinessTabByStatus = (status) => {
  return Object.values(BUSINESS_TABS).find(tab =>
    tab.status === status
  ) || null;
};

/**
 * Helper function to get all business tab configurations as array
 * @returns {array} Array of business tab configurations
 */
export const getBusinessTabsArray = () => {
  return Object.values(BUSINESS_TABS);
};

/**
 * Helper function to get all valid order statuses (simplified)
 */
export const getValidOrderStatuses = () => {
  return Object.values(ORDER_STATUS);
};

/**
 * Helper function to get all valid detailed statuses
 */
export const getValidDetailedStatuses = () => {
  return Object.values(DETAILED_ORDER_STATUS);
};

/**
 * Helper function to check if a status is valid (simplified)
 */
export const isValidOrderStatus = (status) => {
  return getValidOrderStatuses().includes(status);
};

/**
 * Helper function to check if a detailed status is valid
 */
export const isValidDetailedStatus = (status) => {
  return getValidDetailedStatuses().includes(status);
};

/**
 * Helper function to find the business status from a detailed status
 */
export const getBusinessStatusFromDetailed = (detailedStatus) => {
  for (const businessStatus in STATUS_MAP) {
    if (STATUS_MAP[businessStatus].includes(detailedStatus)) {
      return businessStatus;
    }
  }
  return null; // Return null if no mapping is found
};

/**
 * Helper function to get status label (simplified)
 */
export const getOrderStatusLabel = (status) => {
  return ORDER_STATUS_LABELS[status] || status;
};

/**
 * Helper function to get detailed status label
 */
export const getDetailedStatusLabel = (status) => {
  return DETAILED_STATUS_LABELS[status] || status;
};

/**
 * Helper function to get status color (simplified)
 */
export const getOrderStatusColor = (status) => {
  return ORDER_STATUS_COLORS[status] || "secondary";
};

/**
 * Helper function to get detailed status color
 */
export const getDetailedStatusColor = (status) => {
  return DETAILED_STATUS_COLORS[status] || "secondary";
};

// Keep ORDER_TABS for backward compatibility, but use BUSINESS_TABS going forward
export const ORDER_TABS = BUSINESS_TABS;