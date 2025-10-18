"use client";

import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { articleService } from "@/services/articleService";
import { useSession } from "next-auth/react";

interface ShareButtonProps {
  articleId: string;
  articleSlug: string;
  shareCount: number;
  onShare: (newShareCount: number) => void;
}

export function ShareButton({ articleId, articleSlug, shareCount, onShare }: ShareButtonProps) {
  const { toast } = useToast();
  const { data: session } = useSession();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!facebookAppId) {
      console.error("Facebook App ID is not configured.");
      toast({
        title: "Lỗi cấu hình",
        description: "Tính năng chia sẻ chưa được định cấu hình.",
        variant: "destructive",
      });
      return;
    }

    const urlToShare = `${window.location.origin}/bai-viet/${articleSlug}`;
    const encodedUrl = encodeURIComponent(urlToShare);
    const shareUrl = `https://www.facebook.com/dialog/share?app_id=${facebookAppId}&display=popup&href=${encodedUrl}`;
    
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");

    try {
      const response = await articleService.trackShare(articleId, 'facebook', session?.user?.accessToken);
      if (response.success) {
        onShare(response.data.shares);
      }
    } catch (error) {
      console.error("Failed to track share:", error);
    }
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
    >
      <Share2 className="w-4 h-4" />
      <span>{formatNumber(shareCount)} Chia sẻ</span>
    </button>
  );
}