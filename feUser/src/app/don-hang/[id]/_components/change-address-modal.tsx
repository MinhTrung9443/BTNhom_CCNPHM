"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { MapPin, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { userService } from "@/services/userService";
import { orderService } from "@/services/orderService";
import { cn } from "@/lib/utils";

interface Address {
  _id?: string;
  recipientName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  isDefault?: boolean;
}

interface ChangeAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentAddress: Address;
  onSuccess: () => void;
}

export function ChangeAddressModal({
  open,
  onOpenChange,
  orderId,
  currentAddress,
  onSuccess,
}: ChangeAddressModalProps) {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && session?.user?.accessToken) {
      loadAddresses();
    }
  }, [open, session]);

  const loadAddresses = async () => {
    if (!session?.user?.accessToken) return;

    setLoading(true);
    try {
      const response = await userService.getAddresses(session.user.accessToken);
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ mới");
      return;
    }

    if (!session?.user?.accessToken) {
      toast.error("Vui lòng đăng nhập lại");
      return;
    }

    setSubmitting(true);
    try {
      const response = await orderService.updateOrderAddress(
        session.user.accessToken,
        orderId,
        selectedAddressId
      );

      if (response.success) {
        toast.success("Cập nhật địa chỉ giao hàng thành công");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.message || "Không thể cập nhật địa chỉ");
      }
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi cập nhật địa chỉ");
    } finally {
      setSubmitting(false);
    }
  };

  const formatAddress = (addr: Address) => {
    return `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thay đổi địa chỉ giao hàng</DialogTitle>
          <DialogDescription>
            Chọn địa chỉ mới từ danh sách địa chỉ đã lưu. Bạn chỉ có thể thay đổi địa chỉ 1 lần duy nhất khi đơn hàng chưa được chuẩn bị bới người bán.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Address */}
          <div className="p-4 bg-muted rounded-lg border">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Địa chỉ hiện tại
            </p>
            <div className="text-sm space-y-1">
              <p className="font-semibold">{currentAddress.recipientName}</p>
              <p>{currentAddress.phoneNumber}</p>
              <p className="text-muted-foreground">{formatAddress(currentAddress)}</p>
            </div>
          </div>

          {/* Address List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới trong trang Hồ sơ.
            </div>
          ) : (
            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isCurrent = 
                    addr.recipientName === currentAddress.recipientName &&
                    addr.phoneNumber === currentAddress.phoneNumber &&
                    addr.street === currentAddress.street;

                  return (
                    <div
                      key={addr._id!}
                      className={cn(
                        "relative flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedAddressId === addr._id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                        isCurrent && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !isCurrent && setSelectedAddressId(addr._id!)}
                    >
                      <RadioGroupItem
                        value={addr._id!}
                        id={addr._id!}
                        disabled={isCurrent}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={addr._id!}
                        className="flex-1 cursor-pointer space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{addr.recipientName}</p>
                          {addr.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Mặc định
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Đang dùng
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{addr.phoneNumber}</p>
                        <p className="text-sm text-muted-foreground">{formatAddress(addr)}</p>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAddressId || submitting || loading}
          >
            {submitting ? "Đang cập nhật..." : "Xác nhận thay đổi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
