import { auth } from '@/auth';
import { Heart } from 'lucide-react';
import FavoritesClient from './_components/favorites-client';

export const metadata = {
  title: 'Sản phẩm yêu thích',
  description: 'Danh sách các sản phẩm bạn đã yêu thích.',
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session || !session.user?.accessToken) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Danh sách yêu thích của bạn
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Vui lòng đăng nhập để xem các sản phẩm bạn đã lưu.
        </p>
      </div>
    );
  }

  return <FavoritesClient accessToken={session.user.accessToken} />;
}