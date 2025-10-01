"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DeliveryMethod } from "@/types/delivery";
import { Truck, Clock } from "lucide-react";

interface DeliveryMethodSelectorProps {
  deliveryMethods: DeliveryMethod[];
  selectedMethod: string | null;
  onMethodChange: (methodType: string) => void;
}

export function DeliveryMethodSelector({ 
  deliveryMethods, 
  selectedMethod, 
  onMethodChange 
}: DeliveryMethodSelectorProps) {
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
          {deliveryMethods.map((method) => (
            <div
              key={method._id}
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                selectedMethod === method.type
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onMethodChange(method.type)}
            >
              <RadioGroupItem value={method.type} id={method.type} />
              <div className="flex-1">
                <Label htmlFor={method.type} className="cursor-pointer font-semibold text-base">
                  {method.name}
                </Label>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
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
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
