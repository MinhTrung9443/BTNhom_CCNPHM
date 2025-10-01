/**
 * Voucher Types
 * Định nghĩa types cho mã giảm giá
 */

export type DiscountType = 'fixed' | 'percentage';
export type VoucherType = 'public' | 'private';
export type VoucherSource = 'admin' | 'system';

export interface Voucher {
  _id: string;
  code: string;
  discountValue: number;
  discountType: DiscountType;
  type: VoucherType;
  globalUsageLimit: number;
  currentUsage: number;
  userUsageLimit: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  source: VoucherSource;
  isActive: boolean;
  applicableProducts: string[];
  excludedProducts: string[];
  applicableCategories: string[];
  excludedCategories: string[];
  __v: number;
  createdAt: string;
  updatedAt: string;
  isApplicable: boolean;
  reason: string;
}

export interface ApplicableVouchersRequest {
  orderLines: {
    productId: string;
    quantity: number;
  }[];
}
