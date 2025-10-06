"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchFilters, Category } from "@/types/product";
import { categoryService } from "@/services/categoryService";

interface ProductSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export function ProductSearch({ onSearch, initialFilters = {} }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: initialFilters.keyword || searchParams.get("keyword") || "",
    categoryId: initialFilters.categoryId || searchParams.get("categoryId") || "",
    minPrice: initialFilters.minPrice || (searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined),
    maxPrice: initialFilters.maxPrice || (searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined),
    minRating: initialFilters.minRating || (searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined),
    inStock: initialFilters.inStock ?? (searchParams.get("inStock") ? searchParams.get("inStock") === "true" : undefined),
    sortBy: (initialFilters.sortBy || searchParams.get("sortBy") || "createdAt") as SearchFilters["sortBy"],
    sortOrder: (initialFilters.sortOrder || searchParams.get("sortOrder") || "desc") as SearchFilters["sortOrder"],
    page: 1,
    limit: 12,
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice || 0, filters.maxPrice || 1000000]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAll(session?.user?.accessToken);
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, [session?.user?.accessToken]);

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1000000 ? priceRange[1] : undefined,
      page: 1, // Reset về trang đầu khi search mới
    };

    onSearch(searchFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, value.toString());
      }
    });

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      categoryId: "",
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStock: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 12,
    });
    setPriceRange([0, 1000000]);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar - Always visible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={filters.keyword}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
              suppressHydrationWarning
            />
          </div>
          <Button onClick={handleSearch} className="h-10 px-6 bg-green-600 hover:bg-green-700 text-white font-medium" suppressHydrationWarning>
            <Search className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Tìm</span>
          </Button>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full h-10 border-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc tìm kiếm
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-96">
            <SheetHeader>
              <SheetTitle className="text-left">Bộ lọc tìm kiếm</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent
                filters={filters}
                setFilters={setFilters}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                onSearch={handleSearch}
                onClear={clearFilters}
                categories={categories}
                isMobile={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters - Sidebar */}
      <div className="hidden lg:block">
        <FilterContent
          filters={filters}
          setFilters={setFilters}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          onSearch={handleSearch}
          onClear={clearFilters}
          categories={categories}
          isMobile={false}
        />
      </div>
    </div>
  );
}

interface FilterContentProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  onSearch: () => void;
  onClear: () => void;
  categories: Category[];
  isMobile: boolean;
}

function FilterContent({ filters, setFilters, priceRange, setPriceRange, onSearch, onClear, categories, isMobile }: FilterContentProps) {
  return (
    <div className={`space-y-6 ${!isMobile ? "bg-white border border-gray-200 rounded-xl p-6 shadow-sm" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc tìm kiếm</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4 mr-1" />
          Xóa tất cả
        </Button>
      </div>

      {/* Filter Sections */}
      <div className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <span className="mr-2">📁</span> Danh mục sản phẩm
          </Label>
          <Select
            value={filters.categoryId || "all"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                categoryId: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center">
                  <span>Tất cả danh mục</span>
                </div>
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{category.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({category.productCount})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Sắp xếp kết quả</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Sort By */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Theo</Label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value as SearchFilters["sortBy"] }))}>
                <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">📅 Mới nhất</SelectItem>
                  <SelectItem value="name">🔤 Tên</SelectItem>
                  <SelectItem value="price">💰 Giá</SelectItem>
                  <SelectItem value="averageRating">⭐ Đánh giá</SelectItem>
                  <SelectItem value="soldCount">🔥 Bán chạy</SelectItem>
                  <SelectItem value="viewCount">👁️ Lượt xem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Thứ tự</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, sortOrder: value as SearchFilters["sortOrder"] }))}
              >
                <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">⬇️ Giảm dần</SelectItem>
                  <SelectItem value="asc">⬆️ Tăng dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="border-t border-gray-200 pt-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center">
              <span className="mr-2">💰</span> Khoảng giá
            </Label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="text-center">
                <span className="text-lg font-semibold text-green-600">{priceRange[0].toLocaleString("vi-VN")}đ</span>
                <span className="mx-2 text-gray-400">-</span>
                <span className="text-lg font-semibold text-green-600">{priceRange[1].toLocaleString("vi-VN")}đ</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                max={1000000}
                min={0}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0đ</span>
                <span>1,000,000đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="border-t border-gray-200 pt-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center">
              <span className="mr-2">⭐</span> Đánh giá tối thiểu
            </Label>
            <Select
              value={filters.minRating?.toString() || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  minRating: value === "all" ? undefined : Number(value),
                }))
              }
            >
              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                <SelectValue placeholder="Chọn đánh giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đánh giá</SelectItem>
                <SelectItem value="1">⭐ 1 sao trở lên</SelectItem>
                <SelectItem value="2">⭐⭐ 2 sao trở lên</SelectItem>
                <SelectItem value="3">⭐⭐⭐ 3 sao trở lên</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ 4 sao trở lên</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ 5 sao</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Switch
              id="inStock"
              checked={filters.inStock === true}
              onCheckedChange={(checked) =>
                setFilters((prev) => ({
                  ...prev,
                  inStock: checked ? true : undefined,
                }))
              }
              className="data-[state=checked]:bg-green-600"
            />
            <Label htmlFor="inStock" className="text-sm font-medium text-gray-700 cursor-pointer">
              📦 Chỉ hiển thị sản phẩm còn hàng
            </Label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button onClick={onSearch} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium h-11">
          <Search className="h-4 w-4 mr-2" />
          Áp dụng bộ lọc
        </Button>
        {!isMobile && (
          <Button variant="outline" onClick={onClear} className="px-6 h-11 border-gray-300 hover:bg-gray-50">
            <X className="h-4 w-4 mr-2" />
            Đặt lại
          </Button>
        )}
      </div>
    </div>
  );
}
