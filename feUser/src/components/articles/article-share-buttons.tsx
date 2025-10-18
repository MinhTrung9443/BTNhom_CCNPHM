'use client';

import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ArticleShareButtonsProps {
  articleUrl: string;
  articleTitle: string;
  onShare: () => void;
}

export function ArticleShareButtons({ articleUrl, articleTitle, onShare }: ArticleShareButtonsProps) {
  const { toast } = useToast();

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`,
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(articleUrl).then(() => {
      toast({ title: 'Đã sao chép liên kết!' });
      onShare();
    }, () => {
      toast({ title: 'Lỗi', description: 'Không thể sao chép liên kết.', variant: 'destructive' });
    });
  };

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {shareOptions.map((option) => (
        <a
          key={option.name}
          href={option.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onShare}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Share on ${option.name}`}
        >
          {option.icon}
        </a>
      ))}
      <Button
        variant="ghost"
        size="icon"
        onClick={copyToClipboard}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Copy link"
      >
        <LinkIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}
