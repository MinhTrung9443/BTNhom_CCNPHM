import { notFound } from "next/navigation";
import { Suspense } from "react";
import ImageGallery from "@/components/image-gallery";
import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    // Lấy một số sản phẩm phổ biến để generate static paths
    const response = await productService.getAllProducts({ limit: 50 });
    if (response.success && response.data?.products) {
      return response.data.products.map((product: Product) => ({
        id: product._id,
      }));
    }
  } catch (error) {
    console.error("Error generating static params:", error);
  }
  return [];
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

async function ProductDetail({ id }: { id: string }) {
  const session = await auth();

  try {
    const response = await productService.getProductDetail(id, session?.user?.accessToken);

    if (!response.success || !response.data) {
      notFound();
    }

    const product = response.data;

    // Tính toán giá sau discount
    const discountAmount = Math.round((product.price * product.discount) / 100);
    const finalPrice = product.price - discountAmount;

    const discountPercentage = product.discount;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ImageGallery images={product.images || []} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.isActive && <Badge className="bg-green-600 hover:bg-green-700">Đang bán</Badge>}
              {discountPercentage > 0 && <Badge className="bg-red-600 hover:bg-red-700">-{discountPercentage}%</Badge>}
              {product.soldCount > 100 && <Badge className="bg-orange-600 hover:bg-orange-700">Bán chạy</Badge>}
              {product.stock < 10 && product.stock > 0 && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  Sắp hết hàng
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-gray-600">
                {product.averageRating.toFixed(1)} ({product.totalReviews} đánh giá)
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{product.buyerCount} người đã mua</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(finalPrice)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-xl text-gray-500 line-through">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price)}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="text-sm text-red-600 font-medium">
                  Tiết kiệm{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(discountAmount)}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-medium">Số lượng:</span>
            <div className="flex items-center border rounded-lg">
              <Button variant="ghost" size="sm">
                <Minus className="w-4 h-4" />
              </Button>
              <span className="px-4 py-2 border-x min-w-[60px] text-center">1</span>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled={product.stock === 0}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock > 0 ? "Thêm Vào Giỏ Hàng" : "Hết Hàng"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className={`w-full ${product.isSaved ? "border-red-500 text-red-600 bg-red-50" : "border-green-600 text-green-600 hover:bg-green-50"}`}
            >
              <Heart className={`w-5 h-5 mr-2 ${product.isSaved ? "fill-current" : ""}`} />
              {product.isSaved ? "Đã Yêu Thích" : "Thêm Vào Yêu Thích"}
            </Button>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Thông Tin Sản Phẩm</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã sản phẩm:</span>
                <span className="font-medium">{product.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Danh mục:</span>
                <span className="font-medium">{product.categoryId.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kho hàng:</span>
                <span className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã bán:</span>
                <span className="font-medium">{product.soldCount} sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lượt xem:</span>
                <span className="font-medium">{product.viewCount.toLocaleString()} lượt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading product:", error);
    notFound();
  }
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetail id={params.id} />
        </Suspense>
      </div>
    </main>
  );
}
