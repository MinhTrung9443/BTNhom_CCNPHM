"use client";

import { useEffect, useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CartItem } from "@/types/cart";
import { OrderPreview, OrderPreviewRequest, CreateOrderRequest, PaymentMethod } from "@/types/order";
import { DeliveryMethod } from "@/types/delivery";
import { Voucher } from "@/types/voucher";
import { RecipientInfoForm } from "./recipient-info-form";
import { DeliveryMethodSelector } from "./delivery-method-selector";
import { PaymentMethodSelector } from "./payment-method-selector";
import { VoucherSelector } from "./voucher-selector";
import { PointsSelector } from "./points-selector";
import { orderService } from "@/services/orderService";
import { deliveryService } from "@/services/deliveryService";
import { voucherService } from "@/services/voucherService";
import { userService } from "@/services/userService";

interface PreviewClientProps {
  accessToken: string;
}

interface PreviewState {
  selectedItems: CartItem[];
  previewData: OrderPreview | null;
  deliveryMethods: DeliveryMethod[];
  selectedDeliveryMethod: string | null;
  selectedPaymentMethod: PaymentMethod | null;
  vouchers: Voucher[];
  selectedVoucher: string | null;
  availablePoints: number;
  pointsApplied: number;
  recipientName: string;
  phoneNumber: string;
  address: string;
  street: string;
  province: string;
  district: string;
  ward: string;
  isLoading: boolean;
  isLoadingDelivery: boolean;
  isLoadingVouchers: boolean;
  isCreatingOrder: boolean;
  error: string | null;
}

type PreviewAction =
  | { type: "SET_IS_LOADING"; payload: boolean }
  | { type: "SET_IS_LOADING_DELIVERY"; payload: boolean }
  | { type: "SET_IS_LOADING_VOUCHERS"; payload: boolean }
  | { type: "SET_IS_CREATING_ORDER"; payload: boolean }
  | { type: "SET_SELECTED_ITEMS"; payload: CartItem[] }
  | { type: "SET_PREVIEW_DATA"; payload: OrderPreview }
  | { type: "SET_DELIVERY_METHODS"; payload: DeliveryMethod[] }
  | { type: "SET_DELIVERY_METHOD"; payload: string }
  | { type: "SET_PAYMENT_METHOD"; payload: PaymentMethod }
  | { type: "SET_VOUCHERS"; payload: Voucher[] }
  | { type: "SET_VOUCHER"; payload: string | null }
  | { type: "SET_AVAILABLE_POINTS"; payload: number }
  | { type: "SET_POINTS_APPLIED"; payload: number }
  | { type: "SET_RECIPIENT_FIELD"; payload: { field: keyof PreviewState; value: string } }
  | { type: "RESET_FIELDS"; payload: (keyof PreviewState)[] }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: PreviewState = {
  selectedItems: [],
  previewData: null,
  deliveryMethods: [],
  selectedDeliveryMethod: null,
  selectedPaymentMethod: "COD",
  vouchers: [],
  selectedVoucher: null,
  availablePoints: 0,
  pointsApplied: 0,
  recipientName: "",
  phoneNumber: "",
  address: "",
  street: "",
  province: "",
  district: "",
  ward: "",
  isLoading: true,
  isLoadingDelivery: true,
  isLoadingVouchers: true,
  isCreatingOrder: false,
  error: null,
};

function previewReducer(state: PreviewState, action: PreviewAction): PreviewState {
  switch (action.type) {
    case "SET_IS_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_IS_LOADING_DELIVERY":
      return { ...state, isLoadingDelivery: action.payload };
    case "SET_IS_CREATING_ORDER":
      return { ...state, isCreatingOrder: action.payload };
    case "SET_SELECTED_ITEMS":
      return { ...state, selectedItems: action.payload };
    case "SET_PREVIEW_DATA":
      return { ...state, previewData: action.payload };
    case "SET_DELIVERY_METHODS":
      return { ...state, deliveryMethods: action.payload };
    case "SET_DELIVERY_METHOD":
      return { ...state, selectedDeliveryMethod: action.payload };
    case "SET_PAYMENT_METHOD":
      return { ...state, selectedPaymentMethod: action.payload };
    case "SET_IS_LOADING_VOUCHERS":
      return { ...state, isLoadingVouchers: action.payload };
    case "SET_VOUCHERS":
      return { ...state, vouchers: action.payload };
    case "SET_VOUCHER":
      return { ...state, selectedVoucher: action.payload };
    case "SET_AVAILABLE_POINTS":
      return { ...state, availablePoints: action.payload };
    case "SET_POINTS_APPLIED":
      return { ...state, pointsApplied: action.payload };
    case "SET_RECIPIENT_FIELD":
      return { ...state, [action.payload.field]: action.payload.value };
    case "RESET_FIELDS":
      const newState = { ...state };
      action.payload.forEach((field) => {
        if (field === "district" || field === "ward") {
          newState[field] = "";
        }
      });
      return newState;
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false, isCreatingOrder: false };
    default:
      return state;
  }
}

export default function PreviewClient({ accessToken }: PreviewClientProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(previewReducer, initialState);

  // Fetch delivery methods và user points
  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch({ type: "SET_IS_LOADING_DELIVERY", payload: true });
      try {
        const [deliveryRes, pointsRes] = await Promise.all([
          deliveryService.getDeliveryMethods(accessToken),
          userService.getLoyaltyPoints(accessToken),
        ]);

        if (deliveryRes.success && deliveryRes.data) {
          dispatch({ type: "SET_DELIVERY_METHODS", payload: deliveryRes.data });
          if (deliveryRes.data.length > 0) {
            dispatch({ type: "SET_DELIVERY_METHOD", payload: deliveryRes.data[0].type });
          }
        }

        if (pointsRes.success && pointsRes.data) {
          dispatch({ type: "SET_AVAILABLE_POINTS", payload: pointsRes.data.loyaltyPoints });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Không thể tải dữ liệu ban đầu";
        toast.error("Lỗi", { description: errorMessage });
      } finally {
        dispatch({ type: "SET_IS_LOADING_DELIVERY", payload: false });
      }
    };

    fetchInitialData();
  }, [accessToken]);

  // Fetch applicable vouchers khi selectedItems thay đổi
  useEffect(() => {
    const fetchVouchers = async () => {
      if (state.selectedItems.length === 0) return;

      dispatch({ type: "SET_IS_LOADING_VOUCHERS", payload: true });
      try {
        const response = await voucherService.getApplicableVouchers(accessToken, {
          orderLines: state.selectedItems.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
          })),
        });
        if (response.success && response.data) {
          dispatch({ type: "SET_VOUCHERS", payload: response.data });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Không thể tải voucher";
        toast.error("Lỗi", { description: errorMessage });
      } finally {
        dispatch({ type: "SET_IS_LOADING_VOUCHERS", payload: false });
      }
    };

    fetchVouchers();
  }, [accessToken, state.selectedItems]);

  const updatePreview = useCallback(async () => {
    if (state.selectedItems.length === 0) return;

    dispatch({ type: "SET_IS_LOADING", payload: true });
    const requestData: OrderPreviewRequest = {
      orderLines: state.selectedItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      shippingMethod: state.selectedDeliveryMethod as "express" | "regular" | "standard" | undefined,
      voucherCode: state.selectedVoucher || undefined,
      pointsToApply: state.pointsApplied,
    };

    try {
      const response = await orderService.previewOrder(accessToken, requestData);
      if (response.success && response.data.previewOrder) {
        
        dispatch({ type: "SET_PREVIEW_DATA", payload: response.data.previewOrder });
      } else {
        throw new Error(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật thông tin đơn hàng";
      toast.error("Lỗi cập nhật xem trước", { description: errorMessage });
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_IS_LOADING", payload: false });
    }
  }, [accessToken, state.selectedItems, state.selectedDeliveryMethod, state.selectedVoucher, state.pointsApplied]);

  useEffect(() => {
    try {
      const itemsJson = localStorage.getItem("selectedCartItems");
      if (itemsJson) {
        const items = JSON.parse(itemsJson);
        if (items && items.length > 0) {
          dispatch({ type: "SET_SELECTED_ITEMS", payload: items });
        } else {
          throw new Error("Không có sản phẩm được chọn.");
        }
      } else {
        throw new Error("Vui lòng chọn sản phẩm từ giỏ hàng.");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error("Lỗi", { description: errorMessage });
      router.push("/cart");
    }
  }, [router]);

  useEffect(() => {
    if (state.selectedItems.length > 0 && state.selectedDeliveryMethod) {
      updatePreview();
    }
  }, [state.selectedItems, state.selectedDeliveryMethod, state.selectedVoucher, state.pointsApplied, updatePreview]);

  const handleFieldChange = (field: string, value: string) => {
    dispatch({ type: "SET_RECIPIENT_FIELD", payload: { field: field as keyof PreviewState, value } });
  };

  const handleResetFields = (fields: ("district" | "ward")[]) => {
    dispatch({ type: "RESET_FIELDS", payload: fields });
  };

  const handleDeliveryMethodChange = (methodType: string) => {
    dispatch({ type: "SET_DELIVERY_METHOD", payload: methodType });
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    dispatch({ type: "SET_PAYMENT_METHOD", payload: method });
  };

  const handleVoucherChange = (voucherCode: string | null) => {
    dispatch({ type: "SET_VOUCHER", payload: voucherCode });
  };

  const handlePointsToggle = (apply: boolean) => {
    const maxApplicablePoints = Math.min(state.availablePoints, Math.floor((state.previewData?.subtotal || 0) * 0.5));
    const pointsToApply = apply ? maxApplicablePoints : 0;
    dispatch({ type: "SET_POINTS_APPLIED", payload: pointsToApply });
  };

  const handleCreateOrder = async () => {
    if (!state.previewData || !state.selectedPaymentMethod) {
      toast.error("Lỗi", { description: "Vui lòng chọn phương thức thanh toán" });
      return;
    }

    // Validate thông tin người nhận
    if (!state.recipientName || !state.phoneNumber || !state.street || !state.province || !state.district || !state.ward) {
      toast.error("Lỗi", { description: "Vui lòng điền đầy đủ thông tin người nhận" });
      return;
    }

    dispatch({ type: "SET_IS_CREATING_ORDER", payload: true });

    const finalPreviewData: OrderPreview = {
      ...state.previewData,
      paymentMethod: state.selectedPaymentMethod,
      shippingAddress: {
        recipientName: state.recipientName,
        phoneNumber: state.phoneNumber,
        street: state.street,
        ward: state.ward,
        district: state.district,
        province: state.province,
      },
    };

    const orderPayload: CreateOrderRequest = {
      previewOrder: finalPreviewData,
    };

    try {
      // Nếu chọn MoMo thì gọi API tạo đơn hàng MoMo
      if (state.selectedPaymentMethod === "MOMO") {
        const response = await orderService.createMomoOrder(accessToken, orderPayload);
        if (response.success && response.data.payUrl) {
          toast.success("Thành công", { description: "Đang chuyển hướng đến MoMo để thanh toán..." });
          localStorage.removeItem("selectedCartItems");
          // Chuyển hướng đến trang thanh toán MoMo
          window.location.href = response.data.payUrl;
        } else {
          throw new Error(response.message || "Không thể tạo liên kết thanh toán MoMo");
        }
      } else {
        // Các phương thức thanh toán khác (COD, BANK)
        const response = await orderService.createOrder(accessToken, orderPayload);
        if (response.success) {
          toast.success("Thành công", { description: "Đơn hàng của bạn đã được tạo." });
          localStorage.removeItem("selectedCartItems");
          router.push(`/don-hang/${response.data._id}`);
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo đơn hàng";
      toast.error("Lỗi", { description: errorMessage });
    } finally {
      dispatch({ type: "SET_IS_CREATING_ORDER", payload: false });
    }
  };

  const {
    recipientName,
    phoneNumber,
    street,
    province,
    district,
    ward,
    isLoading,
    isLoadingDelivery,
    isLoadingVouchers,
    isCreatingOrder,
    previewData,
    selectedItems,
    deliveryMethods,
    selectedDeliveryMethod,
    selectedPaymentMethod,
    vouchers,
    selectedVoucher,
  } = state;

  const totalAmount = previewData?.totalAmount ?? selectedItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  if ((isLoading || isLoadingDelivery || isLoadingVouchers) && !previewData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Xem trước đơn hàng</h1>
        <Button variant="outline" onClick={() => router.push("/cart")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại giỏ hàng
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm đã chọn</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedItems.map((item) => (
                <div key={item.productId._id} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg relative overflow-hidden">
                    <Image src={item.productId.images[0]} alt={item.productId.name} fill unoptimized sizes="80px" style={{ objectFit: "cover" }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productId.name}</h3>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="font-semibold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.productId.price * item.quantity)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <RecipientInfoForm
            formData={{ recipientName, phoneNumber, street, province, district, ward }}
            onFieldChange={handleFieldChange}
            resetFields={handleResetFields}
            accessToken={accessToken}
          />

          <DeliveryMethodSelector
            deliveryMethods={deliveryMethods}
            selectedMethod={selectedDeliveryMethod}
            onMethodChange={handleDeliveryMethodChange}
          />

          <PointsSelector
            availablePoints={state.availablePoints}
            isApplied={state.pointsApplied > 0}
            onToggle={handlePointsToggle}
            orderSubtotal={state.previewData?.subtotal || 0}
            isLoading={state.isLoading}
          />

          <VoucherSelector
            vouchers={vouchers}
            selectedVoucher={selectedVoucher}
            onVoucherChange={handleVoucherChange}
            isLoading={isLoadingVouchers}
          />

          <PaymentMethodSelector selectedMethod={selectedPaymentMethod} onMethodChange={handlePaymentMethodChange} />
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Tổng đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(previewData?.subtotal ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(previewData?.shippingFee ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="font-semibold">
                    -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(previewData?.discount ?? 0)}
                  </span>
                </div>
                {previewData?.pointsApplied && previewData.pointsApplied > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span className="text-gray-600">Điểm đã dùng:</span>
                    <span className="font-semibold">
                      -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(previewData.pointsApplied)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-bold">Tổng cộng:</span>
                  <span className="text-lg font-bold text-green-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                  </span>
                </div>
              </div>
              <Button onClick={handleCreateOrder} className="w-full bg-green-600 hover:bg-green-700" disabled={isCreatingOrder}>
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {selectedPaymentMethod === "MOMO" ? "Đang tạo liên kết MoMo..." : "Đang xử lý..."}
                  </>
                ) : selectedPaymentMethod === "MOMO" ? (
                  "Thanh toán qua MoMo"
                ) : (
                  "Xác nhận và đặt hàng"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
