'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartActions } from '@/hooks/use-cart-actions';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  productId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showQuantityControls?: boolean;
  initialQuantity?: number;
}

export default function AddToCartButton({
  productId,
  className,
  variant = 'default',
  size = 'default',
  showQuantityControls = false,
  initialQuantity = 1,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCartActions();

  const handleAddToCart = async () => {
    setIsLoading(true);
    await addToCart(productId, quantity);
    setIsLoading(false);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  if (showQuantityControls) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={incrementQuantity}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant={variant}
          size={size}
          onClick={handleAddToCart}
          disabled={isLoading}
          className={cn('flex-1 bg-green-600 hover:bg-green-700 text-white',
            variant === 'outline' && 'bg-transparent border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
          )}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAddToCart}
      disabled={isLoading}
      className={cn('bg-green-600 hover:bg-green-700 text-white', className)}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
    </Button>
  );
}