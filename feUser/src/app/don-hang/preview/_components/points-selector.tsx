"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coins, Info } from "lucide-react";

interface PointsSelectorProps {
  availablePoints: number;
  isApplied: boolean;
  onToggle: (apply: boolean) => void;
  orderSubtotal: number;
  isLoading: boolean;
}

export function PointsSelector({
  availablePoints,
  isApplied,
  onToggle,
  orderSubtotal,
  isLoading,
}: PointsSelectorProps) {
  // Tính toán số điểm tối đa có thể áp dụng (50% giá trị đơn hàng)
  const maxApplicablePoints = Math.min(availablePoints, Math.floor(orderSubtotal * 0.5));

  const formatPoints = (points: number) => points.toLocaleString('vi-VN');

  if (availablePoints === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Điểm Tích Lũy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-4 text-muted-foreground">
          <p>Bạn chưa có điểm tích lũy nào.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Điểm Tích Lũy
          </CardTitle>
          <Badge variant="outline" className="text-base">
            {formatPoints(availablePoints)} điểm
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
            maxApplicablePoints > 0 ? 'bg-amber-50' : 'bg-gray-100'
          }`}
        >
          <Label htmlFor="apply-points-switch" className="flex flex-col cursor-pointer">
            <span className="font-semibold">
              Sử dụng {formatPoints(maxApplicablePoints)} điểm
            </span>
            <span className="text-sm text-green-600">
              Bạn sẽ tiết kiệm được {formatPoints(maxApplicablePoints)}đ
            </span>
          </Label>
          <Switch
            id="apply-points-switch"
            checked={isApplied}
            onCheckedChange={onToggle}
            disabled={isLoading || maxApplicablePoints === 0}
          />
        </div>
        <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs">
            Lưu ý: Bạn có thể sử dụng điểm để thanh toán tối đa 50% giá trị đơn hàng.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
