export interface Category {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

export interface Product {
  _id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  discount: number;
  images: string[];
  stock: number;
  categoryId: Category;
  averageRating: number;
  totalReviews: number;
  soldCount: number;
  isActive: boolean;
  viewCount: number;
  __v: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  buyerCount: number;
  reviewerCount: number;
  isSaved: boolean;
  // Helper properties
  finalPrice?: number; // Giá sau khi giảm giá
  discountAmount?: number; // Số tiền giảm
  // Giữ lại các trường cũ có thể vẫn đang được dùng ở đâu đó, đánh dấu là optional
  title?: string;
  image?: string;
  category?: any;
  rating?: {
    rate: number;
    count: number;
  };
  originalPrice?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  inStock?: boolean;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

// Search related types
export interface SearchFilters {
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "createdAt" | "averageRating" | "soldCount" | "viewCount";
  sortOrder?: "asc" | "desc";
}

export interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  mainImage: string | null;
  price: number;
  discount: number;
  finalPrice: number;
  averageRating: number;
  totalReviews: number;
  soldCount: number;
  stock: number;
  category: Category;
  createdAt: string;
}

export interface SearchMeta {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  filters: {
    keyword: string | null;
    categoryId: string | null;
    priceRange: {
      min: number | null;
      max: number | null;
    };
    minRating: number | null;
    inStock: boolean | null;
  };
  sort: {
    sortBy: string;
    sortOrder: string;
  };
}

// Response structure cho search API
export interface SearchResponse {
  success: boolean;
  message: string;
  meta: SearchMeta;
  data: SearchProduct[];
}
