import { Suspense } from "react";
import { auth } from "@/auth";
import { Heart } from "lucide-react";

import { userService } from "@/services/userService";
import ProductCard from "@/components/product-card";
import Loading from "./loading";

export const metadata = {
  title: "Sản phẩm yêu thích",
  description: "Danh sách các sản phẩm bạn đã yêu thích.",
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session || !session.user?.accessToken) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Heart className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Danh sách yêu thích của bạn</h1>
        <p className="mt-2 text-base text-gray-600">Vui lòng đăng nhập để xem các sản phẩm bạn đã lưu.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <FavoritesList accessToken={session.user.accessToken} />
    </Suspense>
  );
}

async function FavoritesList({ accessToken }: { accessToken: string }) {
  const response = await userService.getFavorites(accessToken);
  const favoriteProducts = response.success ? response.data : [];

  if (favoriteProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Heart className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Danh sách trống</h1>
        <p className="mt-2 text-base text-gray-600">Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và thêm sản phẩm nhé!</p>
      </div>
    );
  }

  // Sử dụng dữ liệu gốc, ProductCard sẽ fallback về _id nếu không có slug
  const productsForCard = favoriteProducts;
  console.log(productsForCard);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sản phẩm yêu thích</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productsForCard.map((product) => {
          // Null check cho product và các thuộc tính bắt buộc
          if (!product || !product._id || !product.name || !product.slug) {
            return null;
          }

          return (
            <ProductCard
              key={product._id}
              product={product}
              isFavorited={true} // Tất cả sản phẩm ở đây đều đã được yêu thích
            />
          );
        })}
      </div>
    </div>
  );
}
