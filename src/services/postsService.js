import { apiRequest } from './baseService';

export const postsService = {
  // Get all posts with filters
  getPosts: async (options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/posts?${queryString}` : '/posts';
      
      const data = await apiRequest(endpoint);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch posts' };
    }
  },

  // Get post by ID
  getPostById: async (id, userId = null) => {
    try {
      const endpoint = userId ? `/posts/${id}?userId=${userId}` : `/posts/${id}`;
      const data = await apiRequest(endpoint);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch post' };
    }
  },

  // Create new post
  createPost: async (postData) => {
    try {
      const data = await apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to create post' };
    }
  },

  // Update post
  updatePost: async (id, postData, userId) => {
    try {
      const data = await apiRequest(`/posts/${id}?userId=${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(postData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to update post' };
    }
  },

  // Delete post
  deletePost: async (id, userId) => {
    try {
      await apiRequest(`/posts/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete post' };
    }
  },

  // Like/unlike post
  likePost: async (id, userId) => {
    try {
      const data = await apiRequest(`/posts/${id}/like`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to like post' };
    }
  },

  // Get posts by user
  getPostsByUser: async (userId, options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/posts/user/${userId}?${queryString}` : `/posts/user/${userId}`;
      
      const data = await apiRequest(endpoint);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch user posts' };
    }
  },

  // Get liked posts by user
  getLikedPostsByUser: async (userId, options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/posts/user/${userId}/liked?${queryString}` : `/posts/user/${userId}/liked`;
      
      const data = await apiRequest(endpoint);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch liked posts' };
    }
  },

  // Get post tags
  getTags: async () => {
    try {
      const data = await apiRequest('/posts/tags');
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch tags' };
    }
  },

  // Search posts
  searchPosts: async (query, options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', query);
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const data = await apiRequest(`/posts?${queryParams.toString()}`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to search posts' };
    }
  }
};
