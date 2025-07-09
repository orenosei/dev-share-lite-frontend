import { apiRequest } from './baseService';

// Default stats objects
const DEFAULT_GLOBAL_STATS = {
  totalPosts: 0,
  totalUsers: 0,
  totalComments: 0,
  totalLikes: 0,
  recentPosts: 0,
  newUsers: 0,
  growthRate: {
    posts: 0,
    users: 0
  }
};

const DEFAULT_USER_STATS = {
  totalPosts: 0,
  totalLikes: 0,
  totalComments: 0,
  totalViews: 0,
  postsThisMonth: 0,
  likesThisMonth: 0
};

const DEFAULT_POST_STATS = {
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0
};

export const statsService = {
  // Get global platform stats
  getGlobalStats: async () => {
    try {
      const data = await apiRequest('/stats');
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch stats',
        data: DEFAULT_GLOBAL_STATS
      };
    }
  },

  // Get user-specific stats
  getUserStats: async (userId) => {
    try {
      const data = await apiRequest(`/users/${userId}/stats`);
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch user stats',
        data: DEFAULT_USER_STATS
      };
    }
  },

  // Get post statistics
  getPostStats: async (postId) => {
    try {
      const data = await apiRequest(`/posts/${postId}/stats`);
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch post stats',
        data: DEFAULT_POST_STATS
      };
    }
  },

  // Get dashboard stats (combination of different metrics)
  getDashboardStats: async () => {
    try {
      const data = await apiRequest('/stats/dashboard');
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch dashboard stats',
        data: DEFAULT_GLOBAL_STATS
      };
    }
  }
};
