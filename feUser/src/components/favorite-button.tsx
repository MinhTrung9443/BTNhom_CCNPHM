'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { userService } from '@/services/userService';

interface FavoriteButtonProps {
  productId: string;
  initialIsFavorited: boolean;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function FavoriteButton({
  productId,
  initialIsFavorited,
  className,
  showText = false,
  variant = 'ghost',
  size = 'icon',
}: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);


  const handleFavoriteToggle = async () => {
    if (status !== 'authenticated' || !session?.user?.accessToken) {
      toast.info('Vui lòng đăng nhập để sử dụng chức năng này.');
      router.push('/login');
      return;
    }

    const originalState = isFavorited;
    // Optimistic update
    setIsFavorited(!originalState);

    startTransition(async () => {
      try {
        const response = await userService.toggleFavorite(
          productId,
          session.user.accessToken
        );
        if (response.success) {
          toast.success(response.message);
          // Update state with actual server response
          setIsFavorited(response.data.favorited);
        } else {
          // Revert on failure
          setIsFavorited(originalState);
          toast.error(response.message || 'Đã có lỗi xảy ra.');
        }
      } catch {
        // Revert on error
        setIsFavorited(originalState);
        toast.error('Không thể cập nhật danh sách yêu thích.');
      } finally {
        // Có thể refresh lại trang yêu thích nếu đang ở đó
        if (window.location.pathname === '/yeu-thích') {
          router.refresh();
        }
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        showText ? '' : 'rounded-full',
        className
      )}
      onClick={handleFavoriteToggle}
      disabled={isPending}
      aria-label={isFavorited ? 'Bỏ thích' : 'Thêm vào yêu thích'}
    >
      <Heart
        className={cn('transition-colors', {
          'fill-red-500 text-red-500': isFavorited,
          'text-gray-500': !isFavorited,
          'h-5 w-5': !showText,
          'h-5 w-5 mr-2': showText,
        })}
      />
      {showText && (isFavorited ? 'Đã yêu thích' : 'Thêm vào yêu thích')}
    </Button>
  );
}