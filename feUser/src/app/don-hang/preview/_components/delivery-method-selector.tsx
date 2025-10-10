"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DeliveryMethod } from "@/types/delivery";
import { Truck, Clock, AlertCircle } from "lucide-react";

interface DeliveryMethodSelectorProps {
  deliveryMethods: DeliveryMethod[];
  selectedMethod: string | null;
  onMethodChange: (methodType: string) => void;
  province?: string;
}

export function DeliveryMethodSelector({
  deliveryMethods,
  selectedMethod,
  onMethodChange,
  province
}: DeliveryMethodSelectorProps) {
  // Kiểm tra xem địa chỉ có phải Sóc Trăng không
  const isSocTrang = (provinceStr?: string): boolean => {
    if (!provinceStr) return false;
    const normalized = provinceStr.trim().toLowerCase();
    const socTrangVariants = ["sóc trăng", "soc trang", "tỉnh sóc trăng", "tinh soc trang"];
    return socTrangVariants.some(variant => normalized.includes(variant));
  };

  const canUseExpress = isSocTrang(province);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Phương thức vận chuyển
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod || ''} onValueChange={onMethodChange}>
          {deliveryMethods.map((method) => {
            const isExpressDisabled = method.type === 'express' && !canUseExpress;
            const isInactive = !method.isActive;
            const isDisabled = isExpressDisabled || isInactive;

            return (
              <div
                key={method._id}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  : selectedMethod === method.type
                    ? 'border-green-600 bg-green-50 cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                onClick={() => !isDisabled && onMethodChange(method.type)}
              >
                <RadioGroupItem
                  value={method.type}
                  id={method.type}
                  disabled={isDisabled}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={method.type}
                    className={`font-semibold text-base ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {method.name}
                    {isInactive && <span className="ml-2 text-xs text-gray-500">(Tạm ngưng)</span>}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  {isExpressDisabled && !isInactive && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Chỉ áp dụng cho địa chỉ tại tỉnh Sóc Trăng</span>
                    </div>
                  )}
                  {isInactive && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>Phương thức này hiện đang tạm ngưng</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {method.estimatedDays} ngày
                    </span>
                    <span className="font-semibold text-green-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(method.price)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
