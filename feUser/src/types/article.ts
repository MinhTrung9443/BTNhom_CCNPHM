export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: {
    url: string;
    publicId: string;
    alt: string;
  };
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  publishedAt: string;
  scheduledAt?: string;
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ArticlePreview {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: {
    url: string;
    alt: string;
  };
  tags: string[];
  publishedAt: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface ArticleListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  tags?: string[];
  sortBy?: 'publishedAt' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface Comment {
  _id: string;
  article: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    isAdmin?: boolean;
  };
  content: string;
  parentComment?: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected';
  isEdited: boolean;
  editedAt?: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  userInteraction?: {
    hasLiked: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  replies?: Comment[];
}

export interface CommentListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ArticleDetailResponse extends Article {
  userInteraction?: {
    hasLiked: boolean;
    hasShared: boolean;
  };
}
