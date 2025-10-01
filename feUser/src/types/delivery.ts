/**
 * Delivery Types
 * Định nghĩa types cho phương thức giao hàng
 */

export type DeliveryType = 'express' | 'regular' | 'standard';

export interface DeliveryMethod {
  _id: string;
  type: DeliveryType;
  name: string;
  price: number;
  description: string;
  estimatedDays: number;
  isActive: boolean;
}
