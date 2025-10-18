/**
 * Emits an event to a specific article room.
 * @param {string} articleId - The ID of the article.
 * @param {object} payload - The data to send.
 */
export const emitArticleUpdate = (articleId, payload) => {
  if (global.io) {
    global.io.to(`article_${articleId}`).emit('articleUpdate', payload);
  }
};