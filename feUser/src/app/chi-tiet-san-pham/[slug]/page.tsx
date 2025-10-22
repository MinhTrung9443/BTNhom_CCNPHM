import { notFound } from "next/navigation";
import { Suspense } from "react";
import ImageGallery from "@/components/image-gallery";
import AddToCartButton from "@/components/add-to-cart-button";
import BuyNowButton from "@/components/buy-now-button";
import { FavoriteButton } from "@/components/favorite-button";
import { productService } from "@/services/productService";
import { Star, AlertTriangle, XCircle } from "lucide-react";
import { ProductDetailSkeleton } from "@/components/product-detail-skeleton";
import { auth } from "@/auth";
import { Product } from "@/types/product";
import { ApiResponse } from "@/types/api";
import { ReviewsSection } from "@/components/reviews-section";
import { SimilarProducts } from "@/components/similar-products"; // Import mới
import { ViewHistoryTracker } from "@/components/view-history-tracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: ProductPageProps) {
  const params = await props.params;

  // Metadata tĩnh để tránh gọi API 2 lần
  // Next.js sẽ tự động cache và revalidate theo revalidate config
  return {
    title: "Chi tiết sản phẩm - Đặc Sản Sóc Trăng",
    description: "Xem chi tiết sản phẩm đặc sản Sóc Trăng chất lượng cao",
  };
}

async function ProductDetail({ slug }: { slug: string }) {
  const session = await auth();
  const accessToken = session?.user?.accessToken;

  // Thử lấy sản phẩm theo slug trước, nếu thất bại thì thử theo ID
  let response: ApiResponse<Product> = await productService.getBySlug(slug, accessToken);

  // Nếu không tìm thấy bằng slug, thử tìm bằng ID (fallback cho trường hợp slug là _id)
  if (!response.success || !response.data) {
    response = await productService.getById(slug, accessToken);
  }

  if (!response.success || !response.data) {
    notFound();
  }

  const product = response.data;

  // Fetch sản phẩm tương tự
  const similarProductsResponse = await productService.getSimilarProducts(product._id, accessToken);
  const similarProducts = similarProductsResponse.data || [];

  // Kiểm tra trạng thái sản phẩm
  const isInactive = !product.isActive;
  const isOutOfStock = product.stock === 0;
  const isUnavailable = isInactive || isOutOfStock;

  return (
    <>
      {/* Component ẩn để track view history */}
      <ViewHistoryTracker productId={product._id} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative">
          <ImageGallery images={product.images} productName={product.name} />

          {/* Overlay cho sản phẩm không khả dụng */}
          {isUnavailable && (
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-6 py-2">
                {isInactive ? "Ngừng kinh doanh" : "Hết hàng"}
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Cảnh báo trạng thái */}
          {isInactive && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Sản phẩm này hiện không còn kinh doanh. Vui lòng chọn sản phẩm khác.
              </AlertDescription>
            </Alert>
          )}

          {!isInactive && isOutOfStock && (
            <Alert className="border-amber-500 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Sản phẩm hiện đã hết hàng. Vui lòng quay lại sau hoặc chọn sản phẩm khác.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {isUnavailable && (
                <Badge variant="destructive" className="flex-shrink-0">
                  {isInactive ? "Ngừng kinh doanh" : "Hết hàng"}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-gray-600">
                {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className={`text-3xl font-bold ${isUnavailable ? "text-gray-400" : "text-green-600"}`}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(product.price * (1 - product.discount / 100))}
              </span>
              {product.discount > 0 && (
                <span className="text-xl text-gray-500 line-through">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price)}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
          </div>

          {/* Nút thêm vào giỏ hàng - vô hiệu hóa nếu không khả dụng */}
          <AddToCartButton
            productId={product._id}
            showQuantityControls={true}
            size="lg"
            className="w-full"
            disabled={isUnavailable}
          />

          {/* Nút Mua ngay */}
          <BuyNowButton
            productId={product._id}
            size="lg"
            className="w-full"
            disabled={isUnavailable}
          />

          {/* Nút yêu thích - vẫn cho phép nếu chỉ hết hàng */}
          <div className="mt-4">
            <FavoriteButton
              key={`${product._id}-${product.isSaved}`}
              productId={product._id}
              initialIsFavorited={product.isSaved}
              showText={true}
              variant="outline"
              size="lg"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
              disabled={isInactive}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Thông tin sản phẩm</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Danh mục:</span>
                <span className="font-medium">{product.categoryId.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-medium ${isInactive ? "text-red-600" : isOutOfStock ? "text-amber-600" : "text-green-600"}`}>
                  {isInactive ? "Ngừng kinh doanh" : isOutOfStock ? "Hết hàng" : "Còn hàng"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trong kho:</span>
                <span className={`font-medium ${product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-amber-600" : ""}`}>
                  {product.stock} {product.stock < 10 && product.stock > 0 && "(Sắp hết)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã bán:</span>
                <span className="font-medium">{product.buyerCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section đánh giá sản phẩm */}
        <div className="col-span-1 lg:col-span-2 mt-12">
          <ReviewsSection productId={product._id} />
        </div>

        {/* Section sản phẩm tương tự */}
        <div className="col-span-1 lg:col-span-2">
          <SimilarProducts products={similarProducts} />
        </div>
      </div>
    </>
  );
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetail slug={params.slug} />
        </Suspense>
      </div>
    </div>
  );
}

export const revalidate = 1;
