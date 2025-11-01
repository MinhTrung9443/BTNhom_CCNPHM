"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangeAddressModal } from "./change-address-modal";

interface ChangeAddressButtonProps {
  orderId: string;
  currentAddress: {
    recipientName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    province: string;
  };
  orderStatus: string;
  latestDetailedStatus?: string;
  addressChangeCount: number;
}

export function ChangeAddressButton({
  orderId,
  currentAddress,
  orderStatus,
  latestDetailedStatus,
  addressChangeCount,
}: ChangeAddressButtonProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  // Kiểm tra có thể thay đổi địa chỉ không
  const canChangeAddress =
    addressChangeCount < 1 &&
    (orderStatus === "pending" ||
      (orderStatus === "processing" && latestDetailedStatus === "confirmed"));

  if (!canChangeAddress) {
    return null;
  }

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setModalOpen(true)}
      >
        <Edit3 className="h-4 w-4 mr-2" />
        Thay đổi địa chỉ
      </Button>

      <ChangeAddressModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        orderId={orderId}
        currentAddress={currentAddress}
        onSuccess={handleSuccess}
      />
    </>
  );
}
