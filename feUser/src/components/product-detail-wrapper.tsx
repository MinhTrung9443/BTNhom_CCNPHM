"use client";

import { ProductReviews } from "@/components/product-reviews";
import { Product } from "@/types/product";

interface ProductDetailWrapperProps {
  product: Product;
}

export function ProductDetailWrapper({ product }: ProductDetailWrapperProps) {
  return (
    <div className="space-y-12">
      {/* Product Reviews Section */}
      <div className="border-t pt-12">
        <ProductReviews productId={product._id} />
      </div>
    </div>
  );
}
