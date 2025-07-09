import { apiRequest } from './baseService';

export const userService = {
  // Get all users with optional search and pagination
  getUsers: async (options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/users?${queryString}` : '/users';
      
      const data = await apiRequest(endpoint);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch users' };
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const data = await apiRequest(`/users/${id}`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch user' };
    }
  },

  // Get user by username
  getUserByUsername: async (username) => {
    try {
      const data = await apiRequest(`/users/username/${username}`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch user' };
    }
  },

  // Get user statistics
  getUserStats: async (id) => {
    try {
      const data = await apiRequest(`/users/${id}/stats`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch user stats' };
    }
  },

  // Update user profile
  updateUser: async (id, userData) => {
    try {
      const data = await apiRequest(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to update user' };
    }
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      await apiRequest(`/users/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete user' };
    }
  }
};
