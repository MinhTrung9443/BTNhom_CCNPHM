export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'user' | 'product' | 'system' | 'loyalty' | 'article';
  subType?: 'like' | 'comment' | 'reply';
  referenceId: string;
  articleId?: {
    _id: string;
    title: string;
    slug: string;
  };
  actors?: Array<{
    _id: string;
    fullName: string;
    avatar?: string;
  }>;
  recipient: 'admin' | 'user';
  recipientUserId?: string;
  userId?: string;
  isRead: boolean;
  metadata?: {
    orderAmount?: number;
    userName?: string;
    articleTitle?: string;
    commentContent?: string;
    actorCount?: number;
  };
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
