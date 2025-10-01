import { auth } from '@/auth';
import { cartService } from '@/services/cartService';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import CartClient from './_components/cart-client';

export default async function CartPage() {
  const session = await auth();

  if (!session?.user?.accessToken) {
    redirect('/login?callbackUrl=/cart');
  }

  const cart = await cartService.getCart(session.user.accessToken);

  if (!cart) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Không thể tải giỏ hàng. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Link href="/cart">
              <Button>Thử lại</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-8">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CartClient cart={cart} />
      </div>
    </main>
  );
}
