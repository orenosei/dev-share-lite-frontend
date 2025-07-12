import { apiRequest } from './baseService';

export const notificationService = {
  
  getNotifications: async (userId, options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `/notifications/user/${userId}?${queryString}` 
        : `/notifications/user/${userId}`;
      
      const data = await apiRequest(endpoint);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch notifications' };
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const data = await apiRequest(`/notifications/user/${userId}/unread-count`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch unread count' };
    }
  },

  markAsRead: async (notificationId, userId) => {
    try {
      const data = await apiRequest(`/notifications/${notificationId}/read/${userId}`, {
        method: 'PATCH',
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to mark notification as read' };
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const data = await apiRequest(`/notifications/user/${userId}/read-all`, {
        method: 'PATCH',
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to mark all notifications as read' };
    }
  },

  deleteNotification: async (notificationId, userId) => {
    try {
      const data = await apiRequest(`/notifications/${notificationId}/user/${userId}`, {
        method: 'DELETE',
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete notification' };
    }
  }
};
