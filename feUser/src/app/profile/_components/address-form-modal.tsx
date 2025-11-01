"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, MapPin } from "lucide-react";
import GoongLocationPicker from "@/components/shared/goong-location-picker";
import { Address } from "@/types/user";

interface AddressFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  initialData?: Address | null;
  mode: "add" | "edit";
}

export interface AddressFormData {
  recipientName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
}

export default function AddressFormModal({ open, onOpenChange, onSubmit, initialData, mode }: AddressFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    recipientName: "",
    phoneNumber: "",
    street: "",
    ward: "",
    district: "",
    province: "",
    isDefault: false,
  });

  // Reset form khi modal mở/đóng hoặc initialData thay đổi
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          recipientName: initialData.recipientName,
          phoneNumber: initialData.phoneNumber,
          street: initialData.street,
          ward: initialData.ward,
          district: initialData.district,
          province: initialData.province,
          isDefault: initialData.isDefault,
        });
      } else {
        setFormData({
          recipientName: "",
          phoneNumber: "",
          street: "",
          ward: "",
          district: "",
          province: "",
          isDefault: false,
        });
      }
    }
  }, [open, mode, initialData]);

  const handleLocationChange = (locationData: {
    address?: string;
    commune?: string;
    ward?: string;
    district?: string;
    province?: string;
  }) => {
    console.log("Location data:", locationData);
    
    // Cập nhật địa chỉ cụ thể từ formatted address nếu có
    const fullAddress = locationData.address || "";
    
    setFormData((prev) => ({
      ...prev,
      // Luôn cập nhật địa chỉ từ bản đồ
      street: fullAddress,
      ward: locationData.commune || locationData.ward || "",
      district: locationData.district || "",
      province: locationData.province || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.recipientName.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.street.trim() !== "" &&
      formData.ward.trim() !== "" &&
      formData.district.trim() !== "" &&
      formData.province.trim() !== ""
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {mode === "add" ? "Thêm địa chỉ mới" : "Cập nhật địa chỉ"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Thêm địa chỉ giao hàng mới vào sổ địa chỉ của bạn"
              : "Cập nhật thông tin địa chỉ giao hàng"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient Name */}
          <div className="space-y-2">
            <Label htmlFor="recipientName">
              Tên người nhận <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recipientName"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              placeholder="Nhập tên người nhận"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          {/* Display selected location - Show FIRST for better visibility */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Địa chỉ được chọn <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500">
              Các thông tin này sẽ được tự động điền khi bạn chọn vị trí trên bản đồ bên dưới.
            </p>
            
            {/* 3 combobox: Province, District, Ward */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Tỉnh/Thành phố</Label>
                <Input 
                  id="province" 
                  value={formData.province} 
                  readOnly 
                  className="bg-gray-50 font-medium" 
                  placeholder="Chọn trên bản đồ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quận/Huyện</Label>
                <Input 
                  id="district" 
                  value={formData.district} 
                  readOnly 
                  className="bg-gray-50 font-medium"
                  placeholder="Chọn trên bản đồ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Phường/Xã</Label>
                <Input 
                  id="ward" 
                  value={formData.ward} 
                  readOnly 
                  className="bg-gray-50 font-medium"
                  placeholder="Chọn trên bản đồ"
                />
              </div>
            </div>

            {/* Street Address - Also BEFORE map */}
            <div className="space-y-2">
              <Label htmlFor="street">Địa chỉ cụ thể (Số nhà, tên đường)</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Ví dụ: 123 Đường Trần Hưng Đạo"
                required
              />
              <p className="text-xs text-gray-500">
                💡 Địa chỉ sẽ được tự động điền từ bản đồ. Bạn có thể chỉnh sửa nếu cần.
              </p>
            </div>
          </div>

          {/* Goong Location Picker - Moved to BOTTOM */}
          <div className="space-y-2">
            <Label>
              Chọn vị trí trên bản đồ <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500">
              Tìm kiếm hoặc click trên bản đồ để chọn vị trí. Địa chỉ sẽ được tự động điền vào các ô phía trên.
            </p>
            <GoongLocationPicker onLocationChange={handleLocationChange} />
          </div>

          {/* Is Default Switch */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="isDefault" className="text-base">
                Đặt làm địa chỉ mặc định
              </Label>
              <p className="text-sm text-gray-500">Địa chỉ này sẽ được chọn tự động khi đặt hàng</p>
            </div>
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !isFormValid()} className="flex-1 bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : mode === "add" ? (
                "Thêm địa chỉ"
              ) : (
                "Cập nhật"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
