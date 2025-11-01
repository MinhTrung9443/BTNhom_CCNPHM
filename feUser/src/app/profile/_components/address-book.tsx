"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MapPin, Plus, Edit, Trash2, Star, Loader2, CheckCircle, XCircle } from "lucide-react";
import { userService } from "@/services/userService";
import { Address } from "@/types/user";
import AddressFormModal, { AddressFormData } from "./address-form-modal";
import { useToast } from "@/hooks/use-toast";

export default function AddressBook() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch addresses
  const fetchAddresses = async () => {
    if (!session?.user?.accessToken) return;

    try {
      setIsLoading(true);
      const response = await userService.getAddresses(session.user.accessToken);
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách địa chỉ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [session]);

  // Handle add address
  const handleAddAddress = () => {
    setModalMode("add");
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  // Handle edit address
  const handleEditAddress = (address: Address) => {
    setModalMode("edit");
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  // Handle delete address
  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete || !session?.user?.accessToken) return;

    try {
      setIsDeleting(true);
      const response = await userService.deleteAddress(session.user.accessToken, addressToDelete._id);
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Đã xóa địa chỉ",
        });
        fetchAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa địa chỉ",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  // Handle set default
  const handleSetDefault = async (addressId: string) => {
    if (!session?.user?.accessToken) return;

    try {
      const response = await userService.setDefaultAddress(session.user.accessToken, addressId);
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Đã đặt địa chỉ mặc định",
        });
        fetchAddresses();
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đặt địa chỉ mặc định",
        variant: "destructive",
      });
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: AddressFormData) => {
    if (!session?.user?.accessToken) return;

    try {
      if (modalMode === "add") {
        const response = await userService.addAddress(session.user.accessToken, data);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Đã thêm địa chỉ mới",
          });
          fetchAddresses();
        }
      } else if (modalMode === "edit" && selectedAddress) {
        const response = await userService.updateAddress(session.user.accessToken, selectedAddress._id, data);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Đã cập nhật địa chỉ",
          });
          fetchAddresses();
        }
      }
    } catch (error) {
      console.error("Error submitting address:", error);
      toast({
        title: "Lỗi",
        description: modalMode === "add" ? "Không thể thêm địa chỉ" : "Không thể cập nhật địa chỉ",
        variant: "destructive",
      });
      throw error; // Re-throw để modal không tự đóng
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Sổ địa chỉ
              </CardTitle>
              <CardDescription>Quản lý địa chỉ giao hàng của bạn</CardDescription>
            </div>
            <Button onClick={handleAddAddress} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm địa chỉ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
              <Button onClick={handleAddAddress} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Thêm địa chỉ đầu tiên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <Card key={address._id} className={address.isDefault ? "border-green-500 border-2" : ""}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{address.recipientName}</h4>
                          <p className="text-sm text-gray-600">{address.phoneNumber}</p>
                        </div>
                        {address.isDefault && (
                          <Badge className="bg-green-100 text-green-800">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Mặc định
                          </Badge>
                        )}
                      </div>

                      {/* Address */}
                      <div className="text-sm text-gray-700">
                        <p>{address.street}</p>
                        <p>
                          {address.ward}, {address.district}
                        </p>
                        <p>{address.province}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        {!address.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(address._id)}
                            className="flex-1"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Đặt mặc định
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                          className={address.isDefault ? "flex-1" : ""}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(address)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Form Modal */}
      <AddressFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedAddress}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
