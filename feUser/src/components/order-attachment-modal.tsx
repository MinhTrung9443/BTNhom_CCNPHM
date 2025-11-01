"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { orderService } from "@/services/orderService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

interface OrderAttachmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOrder: (orderReference: { orderId: string; orderCode: string }, orderDetails: OrderForChat) => void;
}

interface OrderForChat {
  _id: string;
  orderCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderLines: Array<{ productName: string; productImage: string }>;
}

export default function OrderAttachmentModal({ open, onOpenChange, onSelectOrder }: OrderAttachmentModalProps) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderForChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    if (open && session?.user?.accessToken) {
      fetchOrders(1, "");
    }
  }, [open, session?.user?.accessToken]);

  const fetchOrders = async (page: number, search: string) => {
    if (!session?.user?.accessToken) return;

    setLoading(true);
    try {
      const response = await orderService.getOrdersForChat(session.user.accessToken, {
        page,
        limit: 10,
        search,
      });

      if (response.success && response.data) {
        setOrders(response.data);
        if (response.meta) {
          setPagination({
            currentPage: response.meta.currentPage,
            totalPages: response.meta.totalPages,
            totalItems: response.meta.totalItems,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1, searchQuery);
  };

  const handleSelectOrder = (order: OrderForChat) => {
    onSelectOrder(
      {
        orderId: order._id,
        orderCode: order.orderCode,
      },
      order
    );
    onOpenChange(false);
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
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] order-attachment-modal-content">
        <DialogHeader>
          <DialogTitle>Chọn đơn hàng để đính kèm</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" size="icon" variant="default">
            <Search className="h-4 w-4" />
          </Button>
          {searchQuery && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                fetchOrders(1, "");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
              <p className="text-sm text-gray-500">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-sm text-gray-500">Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const firstProduct = order.orderLines[0];
                const totalProducts = order.orderLines.length;
                
                return (
                  <div
                    key={order._id}
                    onClick={() => handleSelectOrder(order)}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 cursor-pointer transition-all"
                  >
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={firstProduct?.productImage || "/placeholder.png"}
                        alt={firstProduct?.productName || "Product"}
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                      {totalProducts > 1 && (
                        <div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          +{totalProducts - 1}
                        </div>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      {/* Header: Order Code & Status */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="font-semibold text-sm text-gray-900 mb-0.5">{order.orderCode}</p>
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {firstProduct?.productName}
                          </p>
                          {totalProducts > 1 && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Package className="h-3 w-3" />
                              <span>và {totalProducts - 1} sản phẩm khác</span>
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(order.status)}
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {moment(order.createdAt).format("DD/MM/YYYY")}
                          </p>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <p className="text-base font-bold text-green-600">
                          {order.totalAmount.toLocaleString("vi-VN")} ₫
                        </p>
                        <span className="text-xs text-green-600 font-medium">Chọn đơn này →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchOrders(pagination.currentPage - 1, searchQuery)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Trang {pagination.currentPage} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchOrders(pagination.currentPage + 1, searchQuery)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
