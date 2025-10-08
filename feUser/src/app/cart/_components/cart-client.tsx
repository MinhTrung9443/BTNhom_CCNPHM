"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { cartService } from "@/services/cartService";
import { Cart, CartItem } from "@/types/cart";
import { Checkbox } from "@/components/ui/checkbox";
import { HttpError } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";

interface CartClientProps {
  cart: Cart;
}

export default function CartClient({ cart: initialCart }: CartClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { refreshCartCount } = useCart();

  const [cart, setCart] = useState<Cart>(initialCart);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    // Update isAllSelected state when selectedItems or cart.items change
    if (cart.items.length > 0 && selectedItems.length === cart.items.length) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedItems, cart.items]);

  const handleSelectItem = (item: CartItem) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((selected) => selected.productId._id === item.productId._id);
      if (isSelected) {
        return prev.filter((selected) => selected.productId._id !== item.productId._id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items);
    }
    setIsAllSelected(!isAllSelected);
  };

  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  const handleRemoveItem = async (productId: string) => {
    if (!session?.user?.accessToken) return;
    try {
      const response = await cartService.removeItem(session.user.accessToken, productId);

      // Cập nhật state local ngay lập tức
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter((item) => item.productId._id !== productId),
      }));

      // Cập nhật selectedItems để loại bỏ item đã xóa
      setSelectedItems((prev) => prev.filter((item) => item.productId._id !== productId));

      // Cập nhật cart count trên header
      await refreshCartCount();

      toast.success("Sản phẩm đã được xóa khỏi giỏ hàng");
    } catch (error) {
      console.log(error, error instanceof HttpError);
      toast.error(error instanceof HttpError ? error.response.data.message : "Lỗi khi xóa sản phẩm");
    }
  };

  const handleRemoveSelectedItems = async () => {
    if (!session?.user?.accessToken || selectedItems.length === 0) return;

    try {
      // Lấy danh sách productId cần xóa
      const productIdsToRemove = selectedItems.map((item) => item.productId._id);

      // Xóa tất cả item song song
      await Promise.all(productIdsToRemove.map((productId) => cartService.removeItem(session.user.accessToken!, productId)));

      // Cập nhật state local ngay lập tức
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter((item) => !productIdsToRemove.includes(item.productId._id)),
      }));

      // Clear selectedItems
      setSelectedItems([]);

      // Cập nhật cart count trên header
      await refreshCartCount();

      toast.success(`Đã xóa ${selectedItems.length} sản phẩm khỏi giỏ hàng`);
    } catch (error) {
      console.log(error, error instanceof HttpError);
      toast.error(error instanceof HttpError ? error.response.data.message : "Lỗi khi xóa sản phẩm");
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1 || !session?.user?.accessToken) return;

    try {
      const response = await cartService.updateItem(session.user.accessToken, { productId, quantity: newQuantity });
      if (response.success) {
        // Cập nhật state local ngay lập tức
        setCart((prevCart) => ({
          ...prevCart,
          items: prevCart.items.map((item) => (item.productId._id === productId ? { ...item, quantity: newQuantity } : item)),
        }));

        // Cập nhật selectedItems nếu item đang được chọn
        setSelectedItems((prev) => prev.map((item) => (item.productId._id === productId ? { ...item, quantity: newQuantity } : item)));

        // Cập nhật cart count trên header
        await refreshCartCount();

        toast.success("Số lượng sản phẩm đã được cập nhật");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
    router.push("/don-hang/preview");
  };

  // Thêm null check trước khi render
  if (!cart || !cart.items) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">Đang tải giỏ hàng...</h2>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn ({cart.items.length} sản phẩm)</h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2-2v4m16 0H4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">Tiếp tục mua sắm</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={handleSelectAll} />
                  <label htmlFor="select-all" className="font-medium cursor-pointer">
                    Chọn tất cả ({cart.items.length} sản phẩm)
                  </label>
                </div>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleRemoveSelectedItems}
                  disabled={selectedItems.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa mục đã chọn
                </Button>
              </CardContent>
            </Card>

            {cart.items.map((item: CartItem, index: number) => {
              // Thêm null check cho từng item
              if (!item) {
                return null;
              }

              if (!item.productId) {
                return null;
              }

              if (!item.productId._id) {
                return null;
              }

              return (
                <Card key={item.productId._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        id={`select-${item.productId._id}`}
                        checked={selectedItems.some((selected) => selected.productId._id === item.productId._id)}
                        onCheckedChange={() => handleSelectItem(item)}
                        className="w-5 h-5"
                      />
                      <Link
                        href={`/chi-tiet-san-pham/${item.productId.slug}`}
                        className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <Image
                          src={item.productId.images[0]}
                          alt={item.productId.name}
                          fill
                          unoptimized
                          sizes="96px"
                          style={{ objectFit: "cover" }}
                        />
                      </Link>

                      <div className="flex-1">
                        <Link href={`/chi-tiet-san-pham/${item.productId.slug}`} className="hover:text-green-600 transition-colors cursor-pointer">
                          <h3 className="font-semibold mb-2">{item.productId.name}</h3>
                        </Link>
                        <p className="text-green-600 font-bold mb-2">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.productId.price)}
                        </p>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-4 py-1 border rounded">{item.quantity}</span>
                          <Button variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.productId._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính ({totalQuantity} sản phẩm):</span>
                    <span className="font-semibold">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-semibold">Miễn phí</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-lg font-bold">Tổng cộng:</span>
                    <span className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
                    </span>
                  </div>
                </div>

                <Button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 mb-3" disabled={selectedItems.length === 0}>
                  Thanh toán
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
