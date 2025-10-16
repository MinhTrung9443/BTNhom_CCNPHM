import { useCart } from '@/contexts/cart-context';
import { useSession } from 'next-auth/react';
import { cartService } from '@/services/cartService';
import { toast } from 'sonner';

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
            
            toast.success(response.message || 'Đã thêm sản phẩm vào giỏ hàng');

            // Refresh cart count từ API để đảm bảo chính xác
            await refreshCartCount();

            return true;

        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
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
                toast.success(response.message || 'Đã cập nhật giỏ hàng');
                return true;
            } else {
                toast.error(response.message || 'Không thể cập nhật giỏ hàng');
                return false;
            }
        } catch (error) {
            console.error('Update cart error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật giỏ hàng');
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
                toast.success(response.message || 'Đã xóa sản phẩm khỏi giỏ hàng');

                // Refresh để đảm bảo chính xác (optional)
                // await refreshCartCount();

                return true;
            } else {
                toast.error(response.message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
                return false;
            }
        } catch (error) {
            console.error('Remove from cart error:', error);
            toast.error('Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng');
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