import axios from 'axios';

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/0eaa9160-7c64-481f-81d9-089106477512';

/**
 * Submit comment to n8n for AI moderation (synchronous with longer timeout)
 * Client sẽ gọi API này sau khi tạo comment
 * @param {String} commentId - Comment ID
 * @param {String} content - Comment content
 * @returns {Promise<Object>} N8n response with status and moderationNote
 */
export const submitCommentModeration = async (commentId, content) => {
  try {
    const response = await axios.post(N8N_WEBHOOK_URL, {
      commentId,
      content
    }, {
      timeout: 30000, // 30 seconds - enough time for AI processing
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`[N8N] Comment ${commentId} submitted to n8n for AI moderation`);
    
    // N8n sẽ trả về { status: 'approved/rejected/pending', moderationNote: '...' }
    return response.data;
  } catch (error) {
    console.error(`[N8N] Failed to submit comment to n8n: ${error.message}`);
    throw error;
  }
};

export default {
  submitCommentModeration
};
