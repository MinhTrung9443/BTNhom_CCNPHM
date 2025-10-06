"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, Heart, Search, User, LogOut, Package, Eye, MessageSquare, Gift, Calendar, Coins } from "lucide-react";
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
  { name: "Voucher", href: "/voucher" },
  { name: "Liên Hệ", href: "/lien-he" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const { cartCount, isLoading: cartLoading } = useCart();

  const isLoggedIn = status === "authenticated";
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const headerClasses = isHomePage && !isScrolled
    ? "sticky top-0 z-50 bg-emerald-700/95 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300"
    : "sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300";

  const textColorClass = isHomePage && !isScrolled ? "text-white" : "text-gray-900";
  const textHoverClass = isHomePage && !isScrolled ? "hover:text-white/80" : "hover:text-green-600";
  const logoTextClass = isHomePage && !isScrolled ? "text-white" : "text-gray-900";
  const logoAccentClass = isHomePage && !isScrolled ? "text-orange-300" : "text-green-600";
  const navHoverBgClass = isHomePage && !isScrolled ? "hover:bg-white/10" : "hover:bg-green-50";
  const iconHoverClass = isHomePage && !isScrolled ? "hover:bg-white/10 hover:text-white" : "hover:bg-green-50 hover:text-green-600";

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 ${isHomePage && !isScrolled
              ? "bg-white/20 backdrop-blur-sm"
              : "bg-gradient-to-br from-green-600 via-green-600 to-green-700"
              }`}>
              <span className="text-white font-bold text-base">ST</span>
            </div>
            <span className={`font-bold text-xl ${logoTextClass} ${textHoverClass} transition-colors duration-300`}>
              Đặc Sản <span className={logoAccentClass}>Sóc Trăng</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative ${textColorClass} ${textHoverClass} px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg ${navHoverBgClass} group`}
              >
                {item.name}
                <span className={`absolute bottom-0 left-1/2 w-0 h-0.5 group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300 rounded-full ${isHomePage && !isScrolled ? "bg-white" : "bg-green-600"
                  }`}></span>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <HeaderSearch className="w-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {isLoggedIn && (
              <Link href="/yeu-thich">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`hidden sm:flex transition-all duration-300 rounded-lg group ${isHomePage && !isScrolled
                    ? "text-white hover:bg-white/10 hover:text-white"
                    : "text-red-500 hover:bg-red-50 hover:text-red-600"
                    }`}
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 group-hover:fill-current transition-all duration-300" />
                </Button>
              </Link>
            )}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className={`relative ${iconHoverClass} transition-all duration-300 rounded-lg group ${textColorClass}`}
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                {isLoggedIn && (cartLoading || cartCount > 0) && (
                  <span className="absolute -top-1 -right-1 text-xs bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full px-2 py-0.5 min-w-[20px] text-center leading-none font-semibold shadow-md animate-in fade-in zoom-in duration-300">
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
                  <Button variant="ghost" className={`relative h-10 w-10 rounded-full hover:ring-2 hover:ring-offset-2 transition-all duration-300 ${isHomePage && !isScrolled
                    ? "hover:ring-white"
                    : "hover:ring-green-600"
                    }`}>
                    <UserAvatar size="sm" session={session} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <UserInfo variant="desktop" session={session} />
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-3 h-4 w-4 text-gray-600" />
                      <span className="font-medium">Thông tin cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/don-hang" className="flex items-center">
                      <Package className="mr-3 h-4 w-4 text-gray-600" />
                      <span className="font-medium">Đơn hàng của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/yeu-thich" className="flex items-center">
                      <Heart className="mr-3 h-4 w-4 text-gray-600" />
                      <span className="font-medium">Sản phẩm yêu thích</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/lich-su-xem" className="flex items-center">
                      <Eye className="mr-3 h-4 w-4 text-gray-600" />
                      <span className="font-medium">Lịch sử xem</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/danh-gia-cua-toi" className="flex items-center">
                      <MessageSquare className="mr-3 h-4 w-4 text-gray-600" />
                      <span className="font-medium">Đánh giá của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/voucher-cua-toi" className="flex items-center">
                      <Gift className="mr-3 h-4 w-4 text-gray-600" />
                      <span className="font-medium">Voucher của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/diem-danh" className="flex items-center">
                      <Calendar className="mr-3 h-4 w-4 text-gray-600" />
                      <span className="font-medium">Điểm danh nhận điểm</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/diem-tich-luy" className="flex items-center">
                      <Coins className="mr-3 h-4 w-4 text-gray-600" />
                      <span className="font-medium">Điểm tích lũy</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`shadow-md hover:shadow-lg transition-all duration-300 font-semibold ${isHomePage && !isScrolled
                      ? "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30"
                      : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                      }`}
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className={`font-semibold shadow-sm hover:shadow-md transition-all duration-300 ${isHomePage && !isScrolled
                      ? "bg-white text-green-700 border-2 border-white hover:bg-white/90"
                      : "bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 hover:border-green-700 hover:text-green-700"
                      }`}
                  >
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`md:hidden ${iconHoverClass} transition-all duration-300 rounded-lg ${textColorClass}`}
                >
                  <Menu className="w-5 h-5" />
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
                        <Link href="/voucher-cua-toi" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Gift className="mr-2 h-4 w-4" />
                            Voucher của tôi
                          </Button>
                        </Link>
                        <Link href="/diem-danh" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Điểm danh nhận điểm
                          </Button>
                        </Link>
                        <Link href="/diem-tich-luy" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Coins className="mr-2 h-4 w-4" />
                            Điểm tích lũy
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
