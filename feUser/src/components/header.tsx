"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, Heart, Search, User, LogOut, Settings, Package, Eye, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/components/user-info";
import { HeaderSearch } from "@/components/header-search";

const navigation = [
  { name: "Trang Chủ", href: "/" },
  { name: "Giới Thiệu", href: "/about" },
  { name: "Sản Phẩm", href: "/search" },
  { name: "Liên Hệ", href: "/lien-he" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession(); // ✅ Lấy cả session để truyền xuống

  const { cartCount, isLoading: cartLoading } = useCart();

  const isLoggedIn = status === "authenticated";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Đặc Sản <span className="text-green-600">Sóc Trăng</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <HeaderSearch className="w-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <Link href="/yeu-thich">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Heart className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {isLoggedIn && (cartLoading || cartCount > 0) && (
                  <span className="absolute -top-1 -right-1 text-xs bg-green-600 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                    {cartLoading ? (
                      <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    ) : cartCount > 99 ? (
                      "99+"
                    ) : (
                      cartCount
                    )}
                  </span>
                )}
              </Button>
            </Link>

            {/* Profile Section */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    {/* ✅ Truyền session để hiển thị ngay, không chờ fetch */}
                    <UserAvatar size="sm" session={session} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <UserInfo variant="desktop" session={session} />
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Thông tin cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/don-hang">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/yeu-thich">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Sản phẩm yêu thích</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/lich-su-xem">
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Lịch sử xem</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/danh-gia-cua-toi">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Đánh giá của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="bg-green-500 text-white hover:text-white hover:bg-green-500">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-white text-green-600 hover:bg-green-50 font-semibold">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white hover:text-white hover:bg-green-500">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-6">
                  <MobileSearch onSearch={() => setIsOpen(false)} />

                  {/* Mobile Profile Section */}
                  {isLoggedIn ? (
                    <div className="border-b pb-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {/* ✅ Truyền session để hiển thị ngay, không chờ fetch */}
                        <UserAvatar size="md" session={session} />
                        <UserInfo variant="mobile" session={session} />
                      </div>
                      <div className="space-y-2">
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <User className="mr-2 h-4 w-4" />
                            Thông tin cá nhân
                          </Button>
                        </Link>
                        <Link href="/don-hang" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Package className="mr-2 h-4 w-4" />
                            Đơn hàng của tôi
                          </Button>
                        </Link>
                        <Link href="/yeu-thich" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Heart className="mr-2 h-4 w-4" />
                            Yêu thích
                          </Button>
                        </Link>
                        <Link href="/lich-su-xem" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Lịch sử xem
                          </Button>
                        </Link>
                        <Link href="/danh-gia-cua-toi" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Đánh giá của tôi
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          size="sm"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Đăng xuất
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-b pb-4 space-y-2">
                      <Link href="/login" className="block">
                        <Button className="w-full" size="sm" onClick={() => setIsOpen(false)}>
                          Đăng nhập
                        </Button>
                      </Link>
                      <Link href="/register" className="block">
                        <Button variant="outline" className="w-full" size="sm" onClick={() => setIsOpen(false)}>
                          Đăng ký
                        </Button>
                      </Link>
                    </div>
                  )}

                  <nav className="flex flex-col space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 text-sm font-medium rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileSearch({ onSearch }: { onSearch: () => void }) {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push("/search");
    }
    onSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative flex">
      <Input
        type="text"
        placeholder="Tìm kiếm..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyPress={handleKeyPress}
        className="pl-10 pr-4"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Button onClick={handleSearch} size="sm" className="ml-2">
        Tìm
      </Button>
    </div>
  );
}
