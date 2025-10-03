import { notFound } from "next/navigation";
import { Suspense } from "react";
import ImageGallery from "@/components/image-gallery";
import AddToCartButton from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { productService } from "@/services/productService";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/auth";
import { Product } from "@/types/product";
import { ApiResponse } from "@/types/api";
import { ReviewsSection } from "@/components/reviews-section";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: ProductPageProps) {
  const params = await props.params;

  // Thử lấy sản phẩm theo slug trước, nếu thất bại thì thử theo ID
  let response = await productService.getBySlug(params.slug);

  // Nếu không tìm thấy bằng slug, thử tìm bằng ID (fallback cho trường hợp slug là _id)
  if (!response.success || !response.data) {
    response = await productService.getById(params.slug);
  }

  if (!response.success || !response.data) {
    return {
      title: "Sản phẩm không tồn tại",
    };
  }
  const product = response.data;
  return {
    title: product.name,
    description: product.description,
  };
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
  console.log(product);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <ImageGallery images={product.images} productName={product.name} />
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

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
            <span className="text-3xl font-bold text-green-600">
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

        <AddToCartButton productId={product._id} showQuantityControls={true} size="lg" className="w-full" />

        <div className="mt-4">
          <FavoriteButton
            key={`${product._id}-${product.isSaved}`}
            productId={product._id}
            initialIsFavorited={product.isSaved}
            showText={true}
            variant="outline"
            size="lg"
            className="w-full border-green-600 text-green-600 hover:bg-green-50"
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
              <span className="text-gray-600">Trong kho:</span>
              <span className="font-medium">{product.stock}</span>
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
    </div>
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
