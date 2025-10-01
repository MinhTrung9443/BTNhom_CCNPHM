/**
 * Order Types
 * Định nghĩa types cho đơn hàng
 */

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'processing'
  | 'shipping_in_progress'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'COD' | 'VNPAY' | 'BANK';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

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
}

export type PerformerRole = 'user' | 'admin' | 'system';

export interface OrderUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Timeline {
  _id: string;
  status: OrderStatus;
  description: string;
  timestamp: string;
  performedBy: PerformerRole;
}

export interface Order {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  preparingAt?: string;
  shippingAt?: string;
  deliveredAt?: string;
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
  status?: OrderStatus;
  search?: string;
}

export interface OrderPreviewRequest {
  orderLines: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress?: Partial<ShippingAddress>;
  voucherCode?: string;
  shippingMethod?: "express" | "regular" | "standard";
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
