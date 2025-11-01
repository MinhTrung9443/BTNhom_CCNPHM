"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, ArrowRight, AlertTriangle, Package } from "lucide-react";
import moment from "moment";

interface OrderReferenceCardProps {
  orderReference: {
    orderId: {
      _id: string;
      orderCode: string;
      totalAmount: number;
      status: string;
      createdAt: string;
      orderLines?: Array<{
        productName: string;
        productImage: string;
        quantity: number;
      }>;
    } | null;
    orderCode: string;
  } | null;
}

export default function OrderReferenceCard({ orderReference }: OrderReferenceCardProps) {
  const router = useRouter();

  if (!orderReference || !orderReference.orderId) {
    return (
      <Card className="max-w-xs p-3 bg-yellow-50 border-yellow-200">
        <div className="flex items-center gap-2 text-yellow-700">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Đơn hàng không tồn tại</span>
        </div>
      </Card>
    );
  }

  const order = orderReference.orderId;
  const orderCode = orderReference.orderCode || order.orderCode;
  const firstProduct = order.orderLines?.[0];
  const totalProducts = order.orderLines?.length || 0;

  const handleClick = () => {
    if (order._id) {
      router.push(`/don-hang/${order._id}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; text: string }> = {
      pending: { variant: "outline", text: "Chờ xác nhận" },
      processing: { variant: "secondary", text: "Đang xử lý" },
      shipping: { variant: "default", text: "Đang giao" },
      completed: { variant: "default", text: "Hoàn thành" },
      cancelled: { variant: "destructive", text: "Đã hủy" },
      return_refund: { variant: "secondary", text: "Trả hàng" },
    };
    const config = statusMap[status] || { variant: "secondary" as const, text: status };
    return <Badge variant={config.variant} className="text-xs">{config.text}</Badge>;
  };

  return (
    <Card
      className="max-w-sm cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border-green-200 bg-green-50"
      onClick={handleClick}
    >
      <div className="p-3">
        {/* Header with order code and status */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-green-600" />
            <p className="font-semibold text-sm text-green-700">{orderCode}</p>
          </div>
          {order.status && getStatusBadge(order.status)}
        </div>

        {/* Product info with image */}
        {firstProduct && (
          <div className="flex gap-3 mb-2">
            <div className="relative flex-shrink-0">
              <img
                src={firstProduct.productImage || "/placeholder.png"}
                alt={firstProduct.productName}
                className="w-16 h-16 object-cover rounded border border-green-200"
              />
              {totalProducts > 1 && (
                <div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  +{totalProducts - 1}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 font-medium line-clamp-2 mb-1">
                {firstProduct.productName}
              </p>
              {totalProducts > 1 && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>và {totalProducts - 1} sản phẩm khác</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Total amount and date */}
        <div className="flex justify-between items-center pt-2 border-t border-green-200">
          <div>
            {order.totalAmount !== undefined && (
              <p className="text-base font-bold text-green-800">{order.totalAmount.toLocaleString("vi-VN")} ₫</p>
            )}
            {order.createdAt && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>{moment(order.createdAt).format("DD/MM/YYYY")}</span>
              </div>
            )}
          </div>
          {order._id && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span>Chi tiết</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
