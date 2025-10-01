export interface Category {
  _id: string;
  name: string;
  description: string;
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
  isActive: boolean;
  viewCount: number;
  __v: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  buyerCount: number;
  reviewerCount: number;
  isSaved: boolean;
  // Giữ lại các trường cũ có thể vẫn đang được dùng ở đâu đó, đánh dấu là optional
  title?: string;
  image?: string;
  category?: any;
  rating?: {
    rate: number;
    count: number;
  };
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