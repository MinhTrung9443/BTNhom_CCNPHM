"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import { X } from "lucide-react";

interface CancelOrderDialogProps {
  orderId: string;
  onSuccess?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function CancelOrderDialog({ orderId, onSuccess, variant = "destructive", className }: CancelOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast({
        title: "Vui lòng nhập lý do",
        description: "Bạn cần nhập lý do hủy đơn hàng.",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user?.accessToken) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng đăng nhập lại.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await orderService.cancelOrder(
        session.user.accessToken,
        orderId,
        reason
      );

      if (response.success) {
        toast({
          title: "Thành công",
          description: response.message,
        });
        setOpen(false);
        setReason("");
        
        // Gọi callback nếu có
        if (onSuccess) {
          onSuccess();
        } else {
          // Refresh trang hiện tại
          router.refresh();
        }
      } else {
        toast({
          title: "Có lỗi xảy ra",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể hủy đơn hàng. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <X className="mr-2 h-4 w-4" />
          Hủy đơn hàng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
          <DialogDescription>
            Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này. Thông tin này sẽ giúp chúng tôi cải thiện dịch vụ.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">
              Lý do hủy đơn <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Tôi đặt nhầm sản phẩm, tôi không muốn mua nữa, giá quá cao..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Tối thiểu 10 ký tự
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Đóng
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading || reason.trim().length < 10}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
