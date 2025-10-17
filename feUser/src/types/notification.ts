export interface Notification {
  _id: string;
  user: string;
  type: 'comment_reply' | 'comment_like' | 'article_like';
  title: string;
  message: string;
  data: {
    articleId?: string;
    articleSlug?: string;
    commentId?: string;
    actorName?: string;
  };
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  unreadCount: number;
}
