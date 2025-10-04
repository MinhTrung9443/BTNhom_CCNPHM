"use client";

import { ProductReviews } from "@/components/product-reviews";

interface ReviewsSectionProps {
  productId: string;
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  return (
    <div className="border-t pt-12">
      <ProductReviews productId={productId} />
    </div>
  );
}
