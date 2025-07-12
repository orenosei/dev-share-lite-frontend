'use client';

import { useAuth, useNotifications } from '../../hooks';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refreshNotifications
  } = useNotifications(user?.id, isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <NotificationDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      loading={loading}
      hasMore={hasMore}
      onMarkAllAsRead={markAllAsRead}
      onMarkAsRead={markAsRead}
      onDelete={deleteNotification}
      onLoadMore={loadMore}
      onRefresh={refreshNotifications}
    />
  );
}
