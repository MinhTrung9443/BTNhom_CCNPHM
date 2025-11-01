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
import { Address } from "@/types/user";
import { AddressSelector } from "./address-selector";
import { AddressFormData } from "@/app/profile/_components/address-form-modal";
import { DeliveryMethodSelector } from "./delivery-method-selector";
import { PaymentMethodSelector } from "./payment-method-selector";
import { VoucherSelector } from "./voucher-selector";
import { PointsSelector } from "./points-selector";
import { orderService } from "@/services/orderService";
import { deliveryService } from "@/services/deliveryService";
import { voucherService } from "@/services/voucherService";
import { userService } from "@/services/userService";
import { useCart } from "@/contexts/cart-context";

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
  addresses: Address[];
  selectedAddress: Address | null;
  isLoading: boolean;
  isLoadingDelivery: boolean;
  isLoadingVouchers: boolean;
  isLoadingAddresses: boolean;
  isCreatingOrder: boolean;
  error: string | null;
}

type PreviewAction =
  | { type: "SET_IS_LOADING"; payload: boolean }
  | { type: "SET_IS_LOADING_DELIVERY"; payload: boolean }
  | { type: "SET_IS_LOADING_VOUCHERS"; payload: boolean }
  | { type: "SET_IS_LOADING_ADDRESSES"; payload: boolean }
  | { type: "SET_IS_CREATING_ORDER"; payload: boolean }
  | { type: "SET_SELECTED_ITEMS"; payload: CartItem[] }
  | { type: "SET_PREVIEW_DATA"; payload: OrderPreview }
  | { type: "SET_DELIVERY_METHODS"; payload: DeliveryMethod[] }
  | { type: "SET_DELIVERY_METHOD"; payload: string | null }
  | { type: "SET_PAYMENT_METHOD"; payload: PaymentMethod }
  | { type: "SET_VOUCHERS"; payload: Voucher[] }
  | { type: "SET_VOUCHER"; payload: string | null }
  | { type: "SET_AVAILABLE_POINTS"; payload: number }
  | { type: "SET_POINTS_APPLIED"; payload: number }
  | { type: "SET_ADDRESSES"; payload: Address[] }
  | { type: "SET_SELECTED_ADDRESS"; payload: Address | null }
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
  addresses: [],
  selectedAddress: null,
  isLoading: false, // Không cần loading ban đầu, chỉ loading khi fetch preview
  isLoadingDelivery: true,
  isLoadingVouchers: false, // Sẽ được set khi có selectedItems
  isLoadingAddresses: true,
  isCreatingOrder: false,
  error: null,
};

function previewReducer(state: PreviewState, action: PreviewAction): PreviewState {
  switch (action.type) {
    case "SET_IS_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_IS_LOADING_DELIVERY":
      return { ...state, isLoadingDelivery: action.payload };
    case "SET_IS_LOADING_VOUCHERS":
      return { ...state, isLoadingVouchers: action.payload };
    case "SET_IS_LOADING_ADDRESSES":
      return { ...state, isLoadingAddresses: action.payload };
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
    case "SET_VOUCHERS":
      return { ...state, vouchers: action.payload };
    case "SET_VOUCHER":
      return { ...state, selectedVoucher: action.payload };
    case "SET_AVAILABLE_POINTS":
      return { ...state, availablePoints: action.payload };
    case "SET_POINTS_APPLIED":
      return { ...state, pointsApplied: action.payload };
    case "SET_ADDRESSES":
      return { ...state, addresses: action.payload };
    case "SET_SELECTED_ADDRESS":
      return { ...state, selectedAddress: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false, isCreatingOrder: false };
    default:
      return state;
  }
}

export default function PreviewClient({ accessToken }: PreviewClientProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(previewReducer, initialState);
  const { refreshCartCount } = useCart();

  // Fetch delivery methods, user points và addresses
  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch({ type: "SET_IS_LOADING_DELIVERY", payload: true });
      dispatch({ type: "SET_IS_LOADING_ADDRESSES", payload: true });
      try {
        const [deliveryRes, pointsRes, addressesRes] = await Promise.all([
          deliveryService.getDeliveryMethods(accessToken),
          userService.getLoyaltyPoints(accessToken),
          userService.getAddresses(accessToken),
        ]);

        if (deliveryRes.success && deliveryRes.data) {
          dispatch({ type: "SET_DELIVERY_METHODS", payload: deliveryRes.data });
          // Chỉ mặc định chọn "Giao tiêu chuẩn" (standard) nếu có và active
          // KHÔNG chọn express làm mặc định vì express yêu cầu địa chỉ Sóc Trăng
          const activeStandardMethod = deliveryRes.data.find(m => m.type === 'standard' && m.isActive);
          if (activeStandardMethod) {
            dispatch({ type: "SET_DELIVERY_METHOD", payload: 'standard' });
          }
          // Nếu không có standard active → để null, user phải chọn thủ công
        }

        if (pointsRes.success && pointsRes.data) {
          dispatch({ type: "SET_AVAILABLE_POINTS", payload: pointsRes.data.loyaltyPoints });
        }

        if (addressesRes.success && addressesRes.data) {
          console.log("Addresses loaded:", addressesRes.data);
          dispatch({ type: "SET_ADDRESSES", payload: addressesRes.data });
          
          // Tự động chọn địa chỉ mặc định
          const defaultAddr = addressesRes.data.find((a: Address) => a.isDefault);
          if (defaultAddr) {
            console.log("Default address selected:", defaultAddr);
            dispatch({ type: "SET_SELECTED_ADDRESS", payload: defaultAddr });
          } else if (addressesRes.data.length > 0) {
            // Nếu không có mặc định, chọn địa chỉ đầu tiên
            console.log("First address selected:", addressesRes.data[0]);
            dispatch({ type: "SET_SELECTED_ADDRESS", payload: addressesRes.data[0] });
          } else {
            console.log("No addresses found");
          }
        } else {
          console.error("Failed to load addresses:", addressesRes);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Không thể tải dữ liệu ban đầu";
        console.error("Error loading initial data:", error);
        toast.error("Lỗi", { description: errorMessage });
      } finally {
        console.log("Initial data loading complete");
        dispatch({ type: "SET_IS_LOADING_DELIVERY", payload: false });
        dispatch({ type: "SET_IS_LOADING_ADDRESSES", payload: false });
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
      shippingAddress: state.selectedAddress ? {
        recipientName: state.selectedAddress.recipientName,
        phoneNumber: state.selectedAddress.phoneNumber,
        street: state.selectedAddress.street,
        ward: state.selectedAddress.ward,
        district: state.selectedAddress.district,
        province: state.selectedAddress.province,
      } : undefined,
      shippingMethod: state.selectedDeliveryMethod as "express" | "standard" | undefined,
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
  }, [accessToken, state.selectedItems, state.selectedAddress, state.selectedDeliveryMethod, state.selectedVoucher, state.pointsApplied]);

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
    if (state.selectedItems.length > 0 && state.selectedDeliveryMethod && state.selectedAddress) {
      updatePreview();
    }
  }, [state.selectedItems, state.selectedAddress, state.selectedDeliveryMethod, state.selectedVoucher, state.pointsApplied, updatePreview]);

  const handleSelectAddress = (address: Address) => {
    dispatch({ type: "SET_SELECTED_ADDRESS", payload: address });

    // Kiểm tra nếu đang chọn express mà địa chỉ không phải Sóc Trăng
    if (state.selectedDeliveryMethod === 'express') {
      const normalized = address.province.trim().toLowerCase();
      const socTrangVariants = ["sóc trăng", "soc trang", "tỉnh sóc trăng", "tinh soc trang"];
      const isSocTrang = socTrangVariants.some(variant => normalized.includes(variant));

      if (!isSocTrang) {
        // Tự động chuyển sang "Giao tiêu chuẩn" nếu có và active
        const standardMethod = state.deliveryMethods.find(m => m.type === 'standard' && m.isActive);
        if (standardMethod) {
          dispatch({ type: "SET_DELIVERY_METHOD", payload: 'standard' });
          toast.info("Thông báo", {
            description: "Phương thức vận chuyển đã được chuyển sang Giao tiêu chuẩn do địa chỉ không thuộc tỉnh Sóc Trăng."
          });
        } else {
          // Nếu không có standard active, reset về null
          dispatch({ type: "SET_DELIVERY_METHOD", payload: null });
          toast.warning("Thông báo", {
            description: "Phương thức giao hỏa tốc chỉ áp dụng cho tỉnh Sóc Trăng. Vui lòng chọn phương thức vận chuyển khác."
          });
        }
      }
    }
  };

  const handleAddAddress = async (data: AddressFormData) => {
    try {
      const response = await userService.addAddress(accessToken, data);
      if (response.success) {
        // Refresh addresses
        const addressesRes = await userService.getAddresses(accessToken);
        if (addressesRes.success) {
          dispatch({ type: "SET_ADDRESSES", payload: addressesRes.data });
          // Tự động chọn địa chỉ vừa thêm
          dispatch({ type: "SET_SELECTED_ADDRESS", payload: response.data });
        }
        toast.success("Thành công", { description: "Đã thêm địa chỉ mới" });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể thêm địa chỉ";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  const handleDeliveryMethodChange = (methodType: string) => {
    // Tìm phương thức được chọn
    const selectedMethod = state.deliveryMethods.find(m => m.type === methodType);

    // Kiểm tra phương thức có active không
    if (selectedMethod && !selectedMethod.isActive) {
      toast.error("Lỗi", { description: "Phương thức vận chuyển này hiện đang tạm ngưng" });
      return;
    }

    // Kiểm tra nếu chọn express mà không phải Sóc Trăng thì không cho phép
    if (methodType === 'express' && state.selectedAddress) {
      const normalized = state.selectedAddress.province.trim().toLowerCase();
      const socTrangVariants = ["sóc trăng", "soc trang", "tỉnh sóc trăng", "tinh soc trang"];
      const isSocTrang = socTrangVariants.some(variant => normalized.includes(variant));

      if (!isSocTrang) {
        toast.error("Lỗi", { description: "Phương thức giao hỏa tốc chỉ áp dụng cho địa chỉ tại tỉnh Sóc Trăng" });
        return;
      }
    }
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
    // Validate địa chỉ giao hàng
    if (!state.selectedAddress) {
      toast.error("Lỗi", { description: "Vui lòng chọn địa chỉ giao hàng" });
      return;
    }

    // Validate phương thức vận chuyển
    if (!state.selectedDeliveryMethod) {
      toast.error("Lỗi", { description: "Vui lòng chọn phương thức vận chuyển" });
      return;
    }

    if (!state.previewData || !state.selectedPaymentMethod) {
      toast.error("Lỗi", { description: "Vui lòng chọn phương thức thanh toán" });
      return;
    }

    dispatch({ type: "SET_IS_CREATING_ORDER", payload: true });

    const finalPreviewData: OrderPreview = {
      ...state.previewData,
      paymentMethod: state.selectedPaymentMethod,
      shippingAddress: {
        recipientName: state.selectedAddress.recipientName,
        phoneNumber: state.selectedAddress.phoneNumber,
        street: state.selectedAddress.street,
        ward: state.selectedAddress.ward,
        district: state.selectedAddress.district,
        province: state.selectedAddress.province,
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
          // Refresh cart count
          await refreshCartCount();
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
          // Refresh cart count
          await refreshCartCount();
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
    addresses,
    selectedAddress,
    isLoading,
    isLoadingDelivery,
    isLoadingVouchers,
    isLoadingAddresses,
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

  // Chỉ show loading khi đang fetch initial data (delivery methods và addresses)
  // Không chờ preview data vì nó cần selectedAddress trước
  if (isLoadingDelivery || isLoadingAddresses) {
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
              {selectedItems.map((item) => {
                const finalPrice = item.productId.discount > 0
                  ? item.productId.price * (1 - item.productId.discount / 100)
                  : item.productId.price;
                const totalItemPrice = finalPrice * item.quantity;

                return (
                  <div key={item.productId._id} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg relative overflow-hidden">
                      <Image src={item.productId.images[0]} alt={item.productId.name} fill unoptimized sizes="80px" style={{ objectFit: "cover" }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productId.name}</h3>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      {item.productId.discount > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.productId.price)}
                          </span>
                          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded">
                            -{item.productId.discount}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalItemPrice)}
                      </div>
                      {item.productId.discount > 0 && (
                        <div className="text-xs text-gray-400 line-through">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.productId.price * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <AddressSelector
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelectAddress={handleSelectAddress}
            onAddAddress={handleAddAddress}
          />

          <DeliveryMethodSelector
            deliveryMethods={deliveryMethods}
            selectedMethod={selectedDeliveryMethod}
            onMethodChange={handleDeliveryMethodChange}
            province={selectedAddress?.province || ""}
          />

          {!selectedAddress && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
              ⚠️ Vui lòng chọn địa chỉ giao hàng để tiếp tục
            </div>
          )}

          {!selectedDeliveryMethod && selectedAddress && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
              ⚠️ Vui lòng chọn phương thức vận chuyển để tiếp tục đặt hàng
            </div>
          )}

          <PointsSelector
            availablePoints={state.availablePoints}
            isApplied={state.pointsApplied > 0}
            onToggle={handlePointsToggle}
            maxApplicablePoints={state.previewData?.maxApplicablePoints || 0}
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
              <Button 
                onClick={handleCreateOrder} 
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed" 
                disabled={isCreatingOrder || !selectedAddress || !selectedDeliveryMethod}
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {selectedPaymentMethod === "MOMO" ? "Đang tạo liên kết MoMo..." : "Đang xử lý..."}
                  </>
                ) : !selectedAddress ? (
                  "Vui lòng chọn địa chỉ giao hàng"
                ) : !selectedDeliveryMethod ? (
                  "Vui lòng chọn phương thức vận chuyển"
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
