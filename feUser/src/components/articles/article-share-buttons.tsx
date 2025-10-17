"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Facebook, Twitter, Copy, Check } from "lucide-react";
import { articleService } from "@/services/articleService";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

interface ArticleShareButtonsProps {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ArticleShareButtons({
  articleId,
  articleTitle,
  articleUrl,
  variant = "outline",
  size = "default",
}: ArticleShareButtonsProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const trackShare = async (platform: 'facebook' | 'zalo' | 'twitter' | 'copy') => {
    try {
      await articleService.trackShare(
        articleId,
        platform,
        session?.accessToken
      );
    } catch (err) {
      console.error("Failed to track share:", err);
    }
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
    trackShare("facebook");
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`;
    window.open(url, "_blank", "width=600,height=400");
    trackShare("twitter");
  };

  const handleZaloShare = () => {
    const url = `https://sp.zalo.me/share_inline?url=${encodeURIComponent(articleUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
    trackShare("zalo");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      toast({
        title: "Đã sao chép",
        description: "Đường dẫn đã được sao chép vào clipboard",
      });
      trackShare("copy");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép đường dẫn",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="w-5 h-5 mr-2" />
          Chia sẻ
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleFacebookShare}>
          <Facebook className="w-4 h-4 mr-2" />
          Chia sẻ lên Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleZaloShare}>
          <svg
            className="w-4 h-4 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z" />
          </svg>
          Chia sẻ lên Zalo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare}>
          <Twitter className="w-4 h-4 mr-2" />
          Chia sẻ lên Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Đã sao chép
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Sao chép đường dẫn
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
