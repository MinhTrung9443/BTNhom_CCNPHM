"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PaymentMethod } from "@/types/order";
import { Wallet, CreditCard, Building2 } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onMethodChange: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    value: "COD" as PaymentMethod,
    label: "Thanh toán khi nhận hàng (COD)",
    description: "Thanh toán bằng tiền mặt khi nhận hàng",
    icon: Wallet,
  },
  {
    value: "MOMO" as PaymentMethod,
    label: "Ví MoMo",
    description: "Thanh toán qua ví điện tử MoMo",
    icon: CreditCard,
  },
  {
    value: "BANK" as PaymentMethod,
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản qua ngân hàng",
    icon: Building2,
  },
];

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Phương thức thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod || ""} onValueChange={(value) => onMethodChange(value as PaymentMethod)}>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.value}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedMethod === method.value ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onMethodChange(method.value)}
              >
                <RadioGroupItem value={method.value} id={method.value} />
                <div className="flex-1">
                  <Label htmlFor={method.value} className="cursor-pointer font-semibold text-base flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {method.label}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
