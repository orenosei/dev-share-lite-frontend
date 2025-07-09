import { apiRequest } from './baseService';

export const commentsService = {
  // Get all comments for a post
  getCommentsByPost: async (postId) => {
    try {
      const data = await apiRequest(`/comments/post/${postId}`);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch comments' };
    }
  },

  // Create a new comment
  createComment: async (commentData) => {
    try {
      const data = await apiRequest('/comments', {
        method: 'POST',
        body: JSON.stringify(commentData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to create comment' };
    }
  },

  // Like/unlike a comment
  likeComment: async (commentId, userId) => {
    try {
      const data = await apiRequest(`/comments/${commentId}/like`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to like comment' };
    }
  },

  // Delete a comment
  deleteComment: async (commentId, userId) => {
    try {
      await apiRequest(`/comments/${commentId}?userId=${userId}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete comment' };
    }
  },

  // Get comment by ID
  getCommentById: async (commentId) => {
    try {
      const data = await apiRequest(`/comments/${commentId}`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch comment' };
    }
  },

  // Update a comment
  updateComment: async (commentId, commentData) => {
    try {
      const data = await apiRequest(`/comments/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify(commentData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to update comment' };
    }
  }
};
