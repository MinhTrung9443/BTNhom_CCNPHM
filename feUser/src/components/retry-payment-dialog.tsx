"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, AlertTriangle } from "lucide-react";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";
import { HttpError } from "@/lib/api";

interface RetryPaymentDialogProps {
  orderId: string;
  onSuccess?: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function RetryPaymentDialog({ orderId, onSuccess, variant = "default", size = "default", className = "" }: RetryPaymentDialogProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRetryPayment = async () => {
    if (!session?.user?.accessToken) {
      setError("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await orderService.retryMomoPayment(session.user.accessToken, orderId);

      if (response.success) {
        toast.success(response.message || "Tạo lại link thanh toán thành công!");
        setIsOpen(false);

        // Chuyển hướng đến trang thanh toán MoMo
        if (response.data.payUrl) {
          window.location.href = response.data.payUrl;
        }

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof HttpError ? err.response.data.message : "Không thể tạo lại link thanh toán";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
      setIsOpen(open);
      if (!open) {
        setError("");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isLoading}>
          <CreditCard className="w-4 h-4 mr-1" />
          Thanh toán lại
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Thanh toán lại đơn hàng
          </DialogTitle>
          <DialogDescription>Bạn sẽ được chuyển đến trang thanh toán MoMo để hoàn tất thanh toán cho đơn hàng này.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Thanh toán qua MoMo</h4>
                <p className="text-sm text-blue-700">Bạn sẽ được chuyển hướng đến trang thanh toán MoMo để hoàn tất giao dịch một cách an toàn.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleRetryPayment} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Thanh toán ngay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
