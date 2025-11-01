/**
 * Order Types
 * Định nghĩa types cho đơn hàng
 */

// Main order status - used for filtering/tabs
export type OrderStatus = "pending" | "processing" | "shipping" | "completed" | "cancelled" | "return_refund";

// Alias for API compatibility
export type ApiOrderStatus = OrderStatus;

// Detailed status - used in timeline
export type DetailedOrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "shipping_in_progress"
  | "delivered"
  | "completed"
  | "cancelled"
  | "cancellation_requested"
  | "payment_overdue"
  | "delivery_failed"
  | "return_requested"
  | "refunded";

export type PaymentMethod = "COD" | "MOMO" | "BANK";
export type PaymentStatus = "pending" | "completed" | "failed";

export interface ShippingAddress {
  recipientName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  province: string;
}

export interface Payment {
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderLine {
  productId: string;
  productCode: string;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  discount: number;
  productActualPrice: number;
  lineTotal: number;
  review: {
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
  productSnapshot : {
    _id: string;
    name: string;
    price: number;
    discount: number;
    actualPrice: number;
    images: string[];
    category: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    capturedAt: string;
    slug: string;
    code: string;
    categoryName: string;
    isActive:boolean;
    stock: number;
    viewCount: number;
    averageRating: number;
    totalReviews: number;
    soldCount:number
  };
}

export type PerformerRole = "user" | "admin" | "system";

export interface OrderUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Timeline {
  _id: string;
  status: DetailedOrderStatus;
  description: string;
  timestamp: string;
  performedBy: PerformerRole;
  metadata?: {
    reason?: string;
  };
}

export interface Order {
  _id: string;
  orderCode?: string;
  userId: OrderUser;
  status: OrderStatus;
  orderLines: OrderLine[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  pointsApplied: number;
  totalAmount: number;
  voucherCode: string | null;
  shippingAddress: ShippingAddress;
  payment: Payment;
  canCancel: boolean;
  timeline: Timeline[];
  addressChangeCount?: number;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  preparingAt?: string;
  shippingAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelledBy?: "user" | "admin" | "system";
  cancelledReason?: string;
  cancellationRequestedAt?: string;
  cancellationRequestReason?: string;
  returnRequestedAt?: string;
  returnRequestReason?: string;
  __v: number;
}

export interface OrderPagination {
  current: number;
  limit: number;
  total: number;
  totalOrders: number;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  pagination: OrderPagination;
  data: Order[];
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: ApiOrderStatus;
  search?: string;
}

export interface OrderPreviewRequest {
  orderLines: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress?: Partial<ShippingAddress>;
  voucherCode?: string;
  shippingMethod?: "express" | "standard";
  pointsToApply?: number;
}

export interface OrderPreview {
  orderLines: OrderLine[];
  shippingAddress: ShippingAddress | null;
  subtotal: number;
  shippingFee: number;
  discount: number;
  shippingMethod: string | null;
  pointsApplied: number;
  maxApplicablePoints: number; // Số điểm tối đa có thể áp dụng (từ backend)
  totalAmount: number;
  voucherCode: string | null;
  paymentMethod: PaymentMethod | null;
}

export interface CreateOrderRequest {
  previewOrder: OrderPreview;
}

export interface OrderStatusCount {
  count: number;
}

export interface OrderStats {
  pending: OrderStatusCount;
  processing: OrderStatusCount;
  shipping: OrderStatusCount;
  completed: OrderStatusCount;
  cancelled: OrderStatusCount;
  return_refund: OrderStatusCount;
}
