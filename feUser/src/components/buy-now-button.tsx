'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCartActions } from '@/hooks/use-cart-actions';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuyNowButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
}

export default function BuyNowButton({
  productId,
  className,
  size = 'default',
  disabled = false,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCartActions();
  const router = useRouter();

  const handleBuyNow = async () => {
    setIsLoading(true);
    
    // Thêm sản phẩm vào giỏ hàng với số lượng 1
    const success = await addToCart(productId, 1);
    
    if (success) {
      // Lưu productId vào localStorage để tự động chọn khi vào trang giỏ hàng
      localStorage.setItem('buyNowProductId', productId);
      
      // Chuyển đến trang giỏ hàng
      router.push('/cart');
    }
    
    setIsLoading(false);
  };

  return (
    <Button
      size={size}
      onClick={handleBuyNow}
      disabled={isLoading || disabled}
      className={cn(
        'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Zap className="w-4 h-4 mr-2" />
      {disabled ? 'Không khả dụng' : isLoading ? 'Đang xử lý...' : 'Mua ngay'}
    </Button>
  );
}
