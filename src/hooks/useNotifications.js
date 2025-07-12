'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services';

export const useNotifications = (userId, isAuthenticated) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId || !isAuthenticated) return;
    
    try {
      const result = await notificationService.getUnreadCount(userId);
      if (result.success) {
        setUnreadCount(result.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [userId, isAuthenticated]);

  const fetchNotifications = useCallback(async (pageNum = 1, reset = false) => {
    if (!userId || !isAuthenticated || loading) return;
    
    setLoading(true);
    try {
      const result = await notificationService.getNotifications(userId, {
        page: pageNum,
        limit: 20
      });
      
      if (result.success) {
        const newNotifications = result.data.notifications || [];
        
        if (reset || pageNum === 1) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setHasMore(newNotifications.length === 20);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthenticated, loading]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!userId) return;
    
    try {
      const result = await notificationService.markAsRead(notificationId, userId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true } 
              : notif
          )
        );
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        
        // Auto refresh notifications sau khi mark as read
        setTimeout(() => {
          fetchNotifications(1, true);
        }, 100);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [userId, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    try {
      const result = await notificationService.markAllAsRead(userId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        
        // Auto refresh notifications sau khi mark all as read
        setTimeout(() => {
          fetchNotifications(1, true);
        }, 100);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userId, fetchNotifications]);

  const deleteNotification = useCallback(async (notificationId) => {
    if (!userId) return;
    
    try {
      const result = await notificationService.deleteNotification(notificationId, userId);
      if (result.success) {
        setNotifications(prev => {
          const notification = prev.find(n => n.id === notificationId);
          const filtered = prev.filter(notif => notif.id !== notificationId);
          
          if (notification && !notification.isRead) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          }
          
          return filtered;
        });
        
        // Auto refresh notifications sau khi delete
        setTimeout(() => {
          fetchNotifications(1, true);
        }, 100);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [userId, fetchNotifications]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, false);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  const refreshNotifications = useCallback(() => {
    setPage(1);
    fetchNotifications(1, true);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUnreadCount();
      
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount, userId, isAuthenticated]);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refreshNotifications
  };
};
