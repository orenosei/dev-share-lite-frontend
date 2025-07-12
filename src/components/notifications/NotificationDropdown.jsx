'use client';

import { useEffect } from 'react';
import { Bell, X, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  hasMore,
  onMarkAllAsRead,
  onMarkAsRead,
  onDelete,
  onLoadMore,
  onRefresh,
  onClose
}) {
  return (
    <DropdownMenu onOpenChange={(open) => {
      if (open) {
        // Auto refresh khi mở dropdown
        onRefresh();
      }
    }}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 max-w-[90vw] p-0 max-h-96 flex flex-col"
        align="end"
        side="bottom"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs p-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                'No notifications yet'
              )}
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  onClose={onClose}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadMore}
                disabled={loading}
                className="w-full text-sm"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
