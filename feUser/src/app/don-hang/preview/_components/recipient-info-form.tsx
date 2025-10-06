"use client";

import { useEffect, useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAddress } from '@/hooks/use-address';
import { mapGoongLocationToStandard } from '@/lib/locationUtils';
import { orderService } from '@/services/orderService';
import { toast } from 'sonner';
import { History, Loader2 } from 'lucide-react';

// Lazy load component phía client
const GoongLocationPicker = lazy(() => import('@/components/shared/goong-location-picker'));

interface RecipientInfoFormProps {
  formData: {
    recipientName: string;
    phoneNumber: string;
    street: string;
    province: string;
    district: string;
    ward: string;
  };
  onFieldChange: (field: string, value: string) => void;
  resetFields: (fields: ('district' | 'ward')[]) => void;
  accessToken?: string;
}

export function RecipientInfoForm({ formData, onFieldChange, resetFields, accessToken }: RecipientInfoFormProps) {
  const { provinces, getDistricts, getWards, loading: addressLoading } = useAddress();
  const [districts, setDistricts] = useState<{ name: string }[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(true); // State để bật/tắt bản đồ
  const [isLoadingLatestAddress, setIsLoadingLatestAddress] = useState(false);

  useEffect(() => {
    if (formData.province) {
      setDistricts(getDistricts(formData.province));
    } else {
      setDistricts([]);
    }
  }, [formData.province, getDistricts]);

  useEffect(() => {
    if (formData.province && formData.district) {
      setWards(getWards(formData.province, formData.district));
    } else {
      setWards([]);
    }
  }, [formData.province, formData.district, getWards]);

  // Hàm xử lý khi có dữ liệu từ bản đồ
  const handleLocationChange = (locationData: any) => {
    const mapped = mapGoongLocationToStandard(locationData);

    // Cập nhật địa chỉ chi tiết
    onFieldChange('street', locationData.address || '');

    // Cập nhật Tỉnh/Thành
    onFieldChange('province', mapped.province);

    // Sử dụng requestAnimationFrame để đảm bảo React cập nhật state tuần tự, tránh lỗi race condition
    requestAnimationFrame(() => {
      onFieldChange('district', mapped.district);
      requestAnimationFrame(() => {
        onFieldChange('ward', mapped.commune);
      });
    });
  };

  // Hàm xử lý khi người dùng muốn sử dụng địa chỉ từ đơn hàng gần nhất
  const handleUseLatestAddress = async () => {
    if (!accessToken) {
      toast.error('Lỗi', { description: 'Không tìm thấy thông tin xác thực' });
      return;
    }

    setIsLoadingLatestAddress(true);
    try {
      const response = await orderService.getLatestOrderAddress(accessToken);
      if (response.success && response.data) {
        const { recipientName, phone, address, ward, district, province } = response.data;
        
        // Cập nhật thông tin người nhận
        onFieldChange('recipientName', recipientName);
        onFieldChange('phoneNumber', phone);
        onFieldChange('street', address);
        onFieldChange('province', province);

        // Cập nhật district và ward tuần tự
        requestAnimationFrame(() => {
          onFieldChange('district', district);
          requestAnimationFrame(() => {
            onFieldChange('ward', ward);
          });
        });

        toast.success('Thành công', { description: 'Đã điền địa chỉ từ đơn hàng gần nhất' });
      } else {
        toast.error('Lỗi', { description: response.message || 'Không thể lấy địa chỉ' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể lấy địa chỉ đơn hàng gần nhất';
      toast.error('Lỗi', { description: errorMessage });
    } finally {
      setIsLoadingLatestAddress(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Thông tin người nhận</CardTitle>
        {accessToken && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseLatestAddress}
            disabled={isLoadingLatestAddress}
          >
            {isLoadingLatestAddress ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <History className="w-4 h-4 mr-2" />
                Dùng địa chỉ của đơn hàng gần nhất mà bạn đã đặt
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recipientName">Họ và tên người nhận</Label>
            <Input 
              id="recipientName" 
              placeholder="Nhập họ và tên" 
              value={formData.recipientName}
              onChange={(e) => onFieldChange('recipientName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Số điện thoại</Label>
            <Input 
              id="phoneNumber" 
              placeholder="Nhập số điện thoại" 
              value={formData.phoneNumber}
              onChange={(e) => onFieldChange('phoneNumber', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="province">Tỉnh/Thành phố</Label>
            <Select onValueChange={(value) => { onFieldChange('province', value); resetFields(['district', 'ward']); }} value={formData.province} disabled={addressLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">Quận/Huyện</Label>
            <Select onValueChange={(value) => { onFieldChange('district', value); resetFields(['ward']); }} value={formData.district} disabled={!formData.province || districts.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn Quận/Huyện" />
              </SelectTrigger>
              <SelectContent>
                {districts.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ward">Phường/Xã</Label>
            <Select onValueChange={(value) => onFieldChange('ward', value)} value={formData.ward} disabled={!formData.district || wards.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn Phường/Xã" />
              </SelectTrigger>
              <SelectContent>
                {wards.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">Địa chỉ cụ thể</Label>
          <Input 
            id="street" 
            placeholder="Số nhà, tên đường" 
            value={formData.street}
            onChange={(e) => onFieldChange('street', e.target.value)}
          />
        </div>

        {/* Thêm Switch để bật/tắt bản đồ */}
        <div className="flex items-center space-x-2 pt-2">
          {/* <Switch id="show-map-switch" checked={showMap} onCheckedChange={setShowMap} /> */}
          <Label htmlFor="show-map-switch" className="cursor-pointer">
            Sử dụng bản đồ để chọn địa chỉ
          </Label>
        </div>

        {/* Hiển thị bản đồ nếu được bật */}
        {showMap && (
          <Suspense fallback={<div className="h-80 w-full bg-gray-200 animate-pulse rounded-lg"></div>}>
            <GoongLocationPicker onLocationChange={handleLocationChange} />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}