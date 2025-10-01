'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';

interface CartContextType {
  cartCount: number;
  isLoading: boolean;
  refreshCartCount: () => Promise<void>;
  updateCartCount: (newCount: number) => void;
  incrementCartCount: (amount?: number) => void;
  decrementCartCount: (amount?: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  // Fetch cart count từ API
  const fetchCartCount = async () => {
    if (!session?.user?.accessToken) {
      setCartCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch('/cart/count', session.user.accessToken, {
        method: 'GET',
        next: { revalidate: 0 } // Không cache
      });

      if (response.success) {
        setCartCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart count khi session thay đổi
  useEffect(() => {
    fetchCartCount();
  }, [session?.user?.accessToken]);

  // Refresh cart count (gọi lại API)
  const refreshCartCount = async () => {
    await fetchCartCount();
  };

  // Update cart count trực tiếp (không gọi API)
  const updateCartCount = (newCount: number) => {
    setCartCount(Math.max(0, newCount));
  };

  // Tăng cart count
  const incrementCartCount = (amount: number = 1) => {
    setCartCount(prev => prev + amount);
  };

  // Giảm cart count
  const decrementCartCount = (amount: number = 1) => {
    setCartCount(prev => Math.max(0, prev - amount));
  };

  const value: CartContextType = {
    cartCount,
    isLoading,
    refreshCartCount,
    updateCartCount,
    incrementCartCount,
    decrementCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook để sử dụng CartContext
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}