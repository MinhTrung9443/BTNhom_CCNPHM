import { useCart } from '@/contexts/cart-context';
import { useSession } from 'next-auth/react';
import { cartService } from '@/services/cartService';
import { toast } from 'sonner';
import { HttpError } from '@/lib/api';

/**
 * Custom hook để thực hiện các thao tác với giỏ hàng
 * Tự động cập nhật cart count sau mỗi thao tác
 */
export function useCartActions() {
    const { data: session } = useSession();
    const { refreshCartCount, incrementCartCount, decrementCartCount } = useCart();

    const addToCart = async (productId: string, quantity: number = 1) => {
        if (!session?.user?.accessToken) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            return false;
        }

        try {
            const response = await cartService.addItem(session.user.accessToken, {
                productId,
                quantity,
            });
            
            if (response.success) {
                // Cập nhật cart count optimistically
                incrementCartCount(quantity);
                toast.success(response.message);

                // Refresh để đảm bảo chính xác (optional, có thể bỏ nếu muốn tối ưu)
                await refreshCartCount();

                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            if (error instanceof HttpError) {
                toast.error(error.response.data.message);
            }
            return false;
        }
    };

    const updateCartItem = async (productId: string, quantity: number) => {
        if (!session?.user?.accessToken) {
            toast.error('Vui lòng đăng nhập');
            return false;
        }

        try {
            const response = await cartService.updateItem(session.user.accessToken, {
                productId,
                quantity,
            });

            if (response.success) {
                // Refresh cart count để đảm bảo chính xác
                await refreshCartCount();
                toast.success(response.message);
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            if (error instanceof HttpError) {
                toast.error(error.response.data.message);
            }
            return false;
        }
    };

    const removeFromCart = async (productId: string, currentQuantity: number = 1) => {
        if (!session?.user?.accessToken) {
            toast.error('Vui lòng đăng nhập');
            return false;
        }

        try {
            const response = await cartService.removeItem(session.user.accessToken, productId);

            if (response.success) {
                // Cập nhật cart count optimistically
                decrementCartCount(currentQuantity);
                toast.success(response.message);

                // Refresh để đảm bảo chính xác (optional)
                // await refreshCartCount();

                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            if (error instanceof HttpError) {
                toast.error(error.response.data.message);
            }
            return false;
        }
    };

    return {
        addToCart,
        updateCartItem,
        removeFromCart,
        refreshCartCount, // Để có thể gọi manual refresh khi cần
    };
}