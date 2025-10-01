"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Voucher } from "@/types/voucher";
import { Ticket, AlertCircle, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

interface VoucherSelectorProps {
  vouchers: Voucher[];
  selectedVoucher: string | null;
  onVoucherChange: (voucherCode: string | null) => void;
  isLoading?: boolean;
}

export function VoucherSelector({ 
  vouchers, 
  selectedVoucher, 
  onVoucherChange,
  isLoading = false
}: VoucherSelectorProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Lọc voucher có thể áp dụng
  const applicableVouchers = vouchers.filter(v => v.isApplicable);
  const nonApplicableVouchers = vouchers.filter(v => !v.isApplicable);
  
  const displayedVouchers = showAll ? vouchers : applicableVouchers;

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discountType === 'percentage') {
      return `Giảm ${voucher.discountValue}%`;
    }
    return `Giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discountValue)}`;
  };

  const formatMinPurchase = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Mã giảm giá
          </CardTitle>
          {selectedVoucher && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onVoucherChange(null)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Bỏ chọn
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Đang tải voucher...</div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            Không có mã giảm giá khả dụng
          </div>
        ) : (
          <div className="space-y-4">
            <RadioGroup value={selectedVoucher || ''} onValueChange={onVoucherChange}>
              {displayedVouchers.map((voucher) => (
                <div
                  key={voucher._id}
                  className={`relative p-4 rounded-lg border-2 transition-colors ${
                    !voucher.isApplicable
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : selectedVoucher === voucher.code
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                  onClick={() => voucher.isApplicable && onVoucherChange(voucher.code)}
                >
                  <div className="flex items-start space-x-3">
                    {voucher.isApplicable && (
                      <RadioGroupItem 
                        value={voucher.code} 
                        id={voucher.code} 
                        disabled={!voucher.isApplicable}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Label 
                            htmlFor={voucher.code} 
                            className={`font-bold text-base ${voucher.isApplicable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          >
                            {voucher.code}
                          </Label>
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            {formatDiscount(voucher)}
                            {voucher.discountType === 'percentage' && voucher.maxDiscountAmount > 0 && (
                              <span className="text-gray-600">
                                {' '}(Tối đa {formatMinPurchase(voucher.maxDiscountAmount)})
                              </span>
                            )}
                          </p>
                        </div>
                        {voucher.isApplicable ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Có thể dùng
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Không khả dụng
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-2">
                        Đơn tối thiểu: {formatMinPurchase(voucher.minPurchaseAmount)}
                      </p>
                      
                      {!voucher.isApplicable && (
                        <p className="text-xs text-red-600 mt-1 italic">
                          {voucher.reason}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>

            {nonApplicableVouchers.length > 0 && !showAll && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAll(true)}
                className="w-full"
              >
                Xem thêm {nonApplicableVouchers.length} voucher không khả dụng
              </Button>
            )}

            {showAll && nonApplicableVouchers.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAll(false)}
                className="w-full"
              >
                Ẩn bớt voucher không khả dụng
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
