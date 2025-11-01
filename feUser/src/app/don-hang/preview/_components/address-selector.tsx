"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MapPin, Edit, Plus, Star } from "lucide-react";
import { Address } from "@/types/user";
import AddressFormModal, { AddressFormData } from "@/app/profile/_components/address-form-modal";

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  onAddAddress: (data: AddressFormData) => Promise<void>;
}

export function AddressSelector({ addresses, selectedAddress, onSelectAddress, onAddAddress }: AddressSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tempSelectedId, setTempSelectedId] = useState<string | null>(selectedAddress?._id || null);

  const handleOpenDialog = () => {
    setTempSelectedId(selectedAddress?._id || null);
    setIsDialogOpen(true);
  };

  const handleConfirmSelection = () => {
    const selected = addresses.find((addr) => addr._id === tempSelectedId);
    if (selected) {
      onSelectAddress(selected);
    }
    setIsDialogOpen(false);
  };

  const handleAddNewAddress = () => {
    setIsDialogOpen(false);
    setIsAddModalOpen(true);
  };

  const handleAddressSubmit = async (data: AddressFormData) => {
    await onAddAddress(data);
    setIsAddModalOpen(false);
    // Sau khi thêm xong, dialog chọn địa chỉ sẽ tự mở lại để user chọn địa chỉ vừa thêm
    setTimeout(() => setIsDialogOpen(true), 300);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Địa chỉ giao hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedAddress ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{selectedAddress.recipientName}</h4>
                    {selectedAddress.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{selectedAddress.phoneNumber}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district},{" "}
                    {selectedAddress.province}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleOpenDialog}>
                  <Edit className="w-4 h-4 mr-1" />
                  Thay đổi
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Chưa có địa chỉ giao hàng</p>
              <Button onClick={handleOpenDialog} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Chọn địa chỉ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
            <DialogDescription>Chọn một địa chỉ từ sổ địa chỉ của bạn hoặc thêm địa chỉ mới</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Bạn chưa có địa chỉ nào</p>
                <Button onClick={handleAddNewAddress}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm địa chỉ mới
                </Button>
              </div>
            ) : (
              <>
                <RadioGroup value={tempSelectedId || ""} onValueChange={setTempSelectedId}>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          tempSelectedId === address._id ? "border-green-500 bg-green-50" : "hover:border-gray-400"
                        }`}
                        onClick={() => setTempSelectedId(address._id)}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={address._id} id={address._id} className="mt-1" />
                          <Label htmlFor={address._id} className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{address.recipientName}</span>
                                {address.isDefault && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    Mặc định
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{address.phoneNumber}</p>
                              <p className="text-sm text-gray-700">
                                {address.street}, {address.ward}, {address.district}, {address.province}
                              </p>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleAddNewAddress} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm địa chỉ mới
                  </Button>
                  <Button
                    onClick={handleConfirmSelection}
                    disabled={!tempSelectedId}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Xác nhận
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Address Modal */}
      <AddressFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddressSubmit}
        initialData={null}
        mode="add"
      />
    </>
  );
}
