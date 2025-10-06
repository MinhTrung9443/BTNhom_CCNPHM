"use client";

import { useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { ReviewButton } from "@/components/review-button";
import { ProductSnapshotModal } from "./product-snapshot-modal";
import type { Order, OrderLine } from "@/types/order";
import { Camera } from "lucide-react";

interface OrderItemsWithSnapshotProps {
  order: Order;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export function OrderItemsWithSnapshot({ order }: OrderItemsWithSnapshotProps) {
  const [selectedOrderLine, setSelectedOrderLine] = useState<OrderLine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (orderLine: OrderLine) => {
    if (orderLine.productSnapshot) {
      setSelectedOrderLine(orderLine);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {order.orderLines.map((item, index) => (
          <div key={index}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 self-center sm:self-start">
                <Image src={item.productImage} alt={item.productName} fill unoptimized className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold">{item.productName}</h4>
                  {item.productSnapshot && (
                    <button
                      onClick={() => handleProductClick(item)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap flex items-center gap-1 transition-colors"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Xem chi tiết
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">Mã SP: {item.productCode}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.discount > 0 && (
                      <>
                        <span className="text-sm line-through text-muted-foreground">{formatPrice(item.productPrice)}</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">-{item.discount}%</span>
                      </>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">Số lượng: {item.quantity}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-semibold">{formatPrice(item.productActualPrice)}</p>
                  <p className="font-bold text-lg">{formatPrice(item.lineTotal)}</p>
                </div>
              </div>
              {order.status === "completed" && (
                <div className="self-center sm:self-end">
                  <ReviewButton
                    product={{
                      id: item.productId,
                      name: item.productName,
                      image: item.productImage,
                    }}
                    orderId={order._id}
                  />
                </div>
              )}
            </div>
            {index < order.orderLines.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </div>

      {/* Product Snapshot Modal */}
      {selectedOrderLine && (
        <ProductSnapshotModal orderLine={selectedOrderLine} open={isModalOpen} onOpenChange={setIsModalOpen} />
      )}
    </>
  );
}
