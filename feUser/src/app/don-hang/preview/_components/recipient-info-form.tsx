"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddress } from '@/hooks/use-address';

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
}

export function RecipientInfoForm({ formData, onFieldChange, resetFields }: RecipientInfoFormProps) {
  const { provinces, getDistricts, getWards, loading: addressLoading } = useAddress();
  const [districts, setDistricts] = useState<{ name: string }[]>([]);
  const [wards, setWards] = useState<string[]>([]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin người nhận</CardTitle>
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
      </CardContent>
    </Card>
  );
}