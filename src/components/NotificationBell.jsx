'use client';

import { useState } from 'react';
import { useAuth, useNotifications } from '../hooks';
import NotificationDropdown from './notifications/NotificationDropdown';

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
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
      onClose={() => setIsOpen(false)}
    />
  );
}
