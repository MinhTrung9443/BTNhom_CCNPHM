"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ArticleBodyProps {
  content: string;
  slug: string;
  isDetailView?: boolean; // To differentiate between card and full detail page
}

const MAX_HEIGHT_CARD_VIEW = 300; // Max content height in pixels for card view

export function ArticleBody({ content, slug, isDetailView = false }: ArticleBodyProps) {
  const [isTruncated, setIsTruncated] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDetailView && contentRef.current) {
      const currentHeight = contentRef.current.scrollHeight;
      if (currentHeight > MAX_HEIGHT_CARD_VIEW) {
        setShowReadMore(true);
        setIsTruncated(true);
      }
    }
  }, [content, isDetailView]);

  const handleReadMore = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    setIsTruncated(false);
    setShowReadMore(false);
  };

  const contentStyle = isTruncated
    ? {
        maxHeight: `${MAX_HEIGHT_CARD_VIEW}px`,
        overflow: 'hidden',
        position: 'relative' as const,
      }
    : {};

  return (
    <div className="prose dark:prose-invert max-w-none relative">
      <div
        ref={contentRef}
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {isTruncated && showReadMore && (
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent flex items-end justify-center">
           <Link href={`/bai-viet/${slug}`} passHref>
            <Button variant="link" className="text-primary hover:underline">
              Xem thêm
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}