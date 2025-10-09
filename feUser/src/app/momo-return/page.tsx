"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Home, Receipt } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { orderService } from "@/services/orderService";
import { useSession } from "next-auth/react";
import { useCart } from "@/contexts/cart-context";

export default function MomoReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { refreshCartCount } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderInfo, setOrderInfo] = useState<{
    orderId?: string;
    amount?: string;
    resultCode?: string;
    message?: string;
    transId?: string;
  }>({});

  useEffect(() => {
    const processPaymentReturn = async () => {
      // Lấy thông tin từ query parameters
      const orderId = searchParams.get("orderId");
      const resultCode = searchParams.get("resultCode");
      const amount = searchParams.get("amount");
      const message = searchParams.get("message");
      const transId = searchParams.get("transId");

      const orderData = {
        orderId: orderId || undefined,
        amount: amount || undefined,
        resultCode: resultCode || undefined,
        message: message || undefined,
        transId: transId || undefined,
      };

      setOrderInfo(orderData);

      // Xử lý kết quả thanh toán
      if (resultCode === "0") {
        // Thanh toán thành công - gọi API cập nhật
        if (orderId && session?.user?.accessToken) {
          try {
            console.log("Calling MoMo return API...");
            await orderService.momoReturn(session.user.accessToken, {
              orderId,
              resultCode,
              amount: amount || undefined,
              transId: transId || undefined,
              message: message || undefined,
            });

            // Refresh cart count sau khi thanh toán thành công
            await refreshCartCount();

            toast.success("Thanh toán thành công!", {
              description: "Đơn hàng của bạn đã được xác nhận.",
            });
            setStatus("success");
          } catch (error) {
            console.error("Error calling MoMo return API:", error);
            toast.error("Lỗi cập nhật trạng thái", {
              description: "Có lỗi xảy ra khi cập nhật trạng thái thanh toán.",
            });
            setStatus("success"); // Vẫn hiển thị success vì thanh toán đã thành công
          }
        } else {
          setStatus("success");
        }
      } else {
        // Thanh toán thất bại
        if (orderId && session?.user?.accessToken) {
          try {
            await orderService.momoReturn(session.user.accessToken, {
              orderId,
              resultCode,
              amount: amount || undefined,
              transId: transId || undefined,
              message: message || undefined,
            });
          } catch (error) {
            console.error("Error calling MoMo return API for failed payment:", error);
          }
        }
        setStatus("failed");
      }
    };

    if (session?.user?.accessToken) {
      processPaymentReturn();
    }
  }, [searchParams, session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-medium text-gray-900">Đang xử lý kết quả thanh toán...</p>
            <p className="text-sm text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardHeader className="pb-6">
            {status === "success" ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-green-700">Thanh toán thành công!</CardTitle>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-red-700">Thanh toán thất bại</CardTitle>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "success" ? (
              <div className="space-y-3">
                <p className="text-gray-600">Cảm ơn bạn đã thanh toán! Đơn hàng của bạn đã được xử lý thành công.</p>
                {orderInfo.orderId && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Mã đơn hàng:</span> #{orderInfo.orderId}
                    </p>
                    {orderInfo.amount && (
                      <p className="text-sm text-green-800 mt-1">
                        <span className="font-medium">Số tiền:</span> {parseInt(orderInfo.amount).toLocaleString("vi-VN")} VNĐ
                      </p>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-500">Bạn có thể theo dõi trạng thái đơn hàng trong trang "Đơn hàng của tôi"</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600">Rất tiếc, quá trình thanh toán không thành công.</p>
                {orderInfo.message && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Lý do:</span> {orderInfo.message}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500">Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              {status === "success" && orderInfo.orderId ? (
                <Link href={`/don-hang/${orderInfo.orderId}`}>
                  <Button className="w-full sm:w-auto">
                    <Receipt className="w-4 h-4 mr-2" />
                    Xem đơn hàng
                  </Button>
                </Link>
              ) : (
                <Button onClick={() => router.push("/cart")} className="w-full sm:w-auto">
                  Quay lại giỏ hàng
                </Button>
              )}

              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
