 import api from './apiService'

const articleService = {
  // Get all articles (admin)
  getAllArticles: async (params = {}) => {
    // Only include parameters if they have meaningful values
    const queryParams = { ...params };
    
    // Remove empty search parameter to get all articles
    if (queryParams.search === '') {
      delete queryParams.search;
    }
    
    // Remove empty status parameter to get all statuses
    if (queryParams.status === '') {
      delete queryParams.status;
    }

    const response = await api.get('/articles/admin', { params: queryParams })
    return response.data
  },

  // Get article by ID (admin)
  getArticleById: async (articleId) => {
    const response = await api.get(`/articles/admin/${articleId}`)
    return response.data
  },

  // Create article
 createArticle: async (articleData) => {
    const formData = new FormData();
    Object.keys(articleData).forEach(key => {
      if (typeof articleData[key] === 'object' && articleData[key] !== null) {
        formData.append(key, JSON.stringify(articleData[key]));
      } else {
        formData.append(key, articleData[key]);
      }
    });

    const response = await api.post('/articles/admin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update article
  updateArticle: async (articleId, articleData) => {
    const formData = new FormData();
    Object.keys(articleData).forEach(key => {
      if (typeof articleData[key] === 'object' && articleData[key] !== null) {
        formData.append(key, JSON.stringify(articleData[key]));
      } else {
        formData.append(key, articleData[key]);
      }
    });

    const response = await api.put(`/articles/admin/${articleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete article
  deleteArticle: async (articleId) => {
    const response = await api.delete(`/articles/admin/${articleId}`)
    return response.data
  },

  // Publish article
  publishArticle: async (articleId) => {
    const response = await api.post(`/articles/admin/${articleId}/publish`)
    return response.data
  },

  // Unpublish article
  unpublishArticle: async (articleId) => {
    const response = await api.post(`/articles/admin/${articleId}/unpublish`)
    return response.data
  },

  // Get article analytics
  getArticleAnalytics: async () => {
    const response = await api.get('/articles/admin/analytics')
    return response.data
  },

  // Get article comments (admin)
  getArticleComments: async (articleId, params = {}) => {
    const response = await api.get(`/articles/public/${articleId}/comments`, { params })
    return response.data
  },

  // Get all comments for moderation
  getAllComments: async (params = {}) => {
    const response = await api.get('/articles/admin/comments', { params })
    return response.data
  },

  // Approve comment
  approveComment: async (commentId) => {
    const response = await api.patch(`/articles/admin/comments/${commentId}/moderate`, { status: 'approved' })
    return response.data
  },

  // Reject comment
  rejectComment: async (commentId) => {
    const response = await api.patch(`/articles/admin/comments/${commentId}/moderate`, { status: 'rejected' })
    return response.data
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/articles/public/comments/${commentId}`)
    return response.data
  },

  // Reply to comment (admin)
  replyToComment: async (commentId, content) => {
    const response = await api.post(`/articles/public/${commentId}/comments`, { content, parentComment: commentId })
    return response.data
  },

  // Bulk approve comments
  bulkApproveComments: async (commentIds) => {
    const response = await api.post('/articles/admin/comments/bulk-moderate', { commentIds, status: 'approved' })
    return response.data
  },

  // Bulk reject comments
  bulkRejectComments: async (commentIds) => {
    const response = await api.post('/articles/admin/comments/bulk-moderate', { commentIds, status: 'rejected' })
    return response.data
  },

  // Bulk delete comments
  bulkDeleteComments: async (commentIds) => {
    const response = await api.post('/articles/admin/comments/bulk-moderate', { commentIds, status: 'deleted' })
    return response.data
  },
}

export default articleService
