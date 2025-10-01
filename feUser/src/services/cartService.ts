import { apiFetch } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { Cart } from '@/types/cart';

class CartService {
  async getCart(accessToken: string): Promise<Cart> {
    // This endpoint is an exception and returns the cart object directly.
    return await apiFetch('/cart', accessToken, {
      method: 'GET',
      next: { tags: ['cart'] },
    });
  }

  async getCartCount(accessToken: string): Promise<ApiResponse<{ count: number }>> {
    return await apiFetch('/cart/count', accessToken, {
      method: 'GET',
      next: { revalidate: 0 }, // Không cache
    });
  }

  async addItem(
    accessToken: string,
    item: { productId: string; quantity: number },
  ): Promise<ApiResponse<any>> {
    return await apiFetch('/cart/items', accessToken, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateItem(
    accessToken: string,
    item: { productId: string; quantity: number },
  ): Promise<ApiResponse<Cart>> {
    return await apiFetch('/cart/items', accessToken, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async removeItem(
    accessToken: string,
    productId: string,
  ): Promise<ApiResponse<Cart>> {
    return await apiFetch(`/cart/items/${productId}`, accessToken, {
      method: 'DELETE',
    });
  }
}

export const cartService = new CartService();