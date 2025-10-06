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
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import { PackageCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HttpError } from "@/lib/api";

interface ConfirmReceivedDialogProps {
  orderId: string;
  onSuccess?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function ConfirmReceivedDialog({ orderId, onSuccess, variant = "default", className }: ConfirmReceivedDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const handleConfirm = async () => {
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
      const response = await orderService.confirmReceived(
        session.user.accessToken,
        orderId
      );

      if (response.success) {
        toast({
          title: "Thành công",
          description: response.message,
        });
        setOpen(false);
        
        // Gọi callback nếu có
        if (onSuccess) {
          onSuccess();
        } else {
          // Refresh trang hiện tại
          router.refresh();
        }
      }
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) {
        toast({
          title: "Có lỗi xảy ra",
          description: error.response.data.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <PackageCheck className="mr-2 h-4 w-4" />
          Đã nhận hàng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-green-600" />
            Xác nhận đã nhận hàng
          </DialogTitle>
          <DialogDescription>
            Vui lòng xác nhận rằng bạn đã nhận được đơn hàng này và hài lòng với sản phẩm.
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái <strong>Hoàn thành</strong></li>
              <li>Bạn có thể đánh giá sản phẩm sau khi đơn hàng hoàn thành</li>
              <li>Hành động này không thể hoàn tác</li>
            </ul>
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận đã nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
