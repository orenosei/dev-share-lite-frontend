'use client';

import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Reply, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'POST_LIKE':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'COMMENT_LIKE':
      return <Heart className="h-4 w-4 text-red-400" />;
    case 'NEW_COMMENT':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'COMMENT_REPLY':
      return <Reply className="h-4 w-4 text-green-500" />;
    default:
      return <MessageSquare className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationMessage = (notification) => {
  const actorName = notification.actor ? 
    `${notification.actor.firstName} ${notification.actor.lastName}` : 
    'Someone';
  
  switch (notification.type) {
    case 'POST_LIKE':
      return `${actorName} liked your post`;
    case 'COMMENT_LIKE':
      return `${actorName} liked your comment`;
    case 'NEW_COMMENT':
      return `${actorName} commented on your post`;
    case 'COMMENT_REPLY':
      return `${actorName} replied to your comment`;
    default:
      return `${actorName} interacted with your content`;
  }
};

const getNotificationLink = (notification) => {
  if (notification.post) {
    return `/posts/${notification.post.id}`;
  }
  if (notification.comment?.postId) {
    return `/posts/${notification.comment.postId}`;
  }
  return '#';
};

export default function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) {
  const message = getNotificationMessage(notification);
  const link = getNotificationLink(notification);
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  const handleMarkAsRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div className={`relative border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
    }`}>
      <Link href={link} className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex items-start space-x-3">
          {/* Actor Avatar */}
          <div className="flex-shrink-0">
            <img
              className="h-8 w-8 rounded-full"
              src={
                notification.actor?.avatarUrl || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  notification.actor ? 
                    `${notification.actor.firstName} ${notification.actor.lastName}` : 
                    'User'
                )}&background=6366f1&color=fff`
              }
              alt={notification.actor ? 
                `${notification.actor.firstName} ${notification.actor.lastName}` : 
                'User'
              }
            />
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {getNotificationIcon(notification.type)}
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {message}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-1 ml-2">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAsRead}
                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                    title="Mark as read"
                  >
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                  title="Delete notification"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Post/Comment Preview */}
            {notification.post && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                "{notification.post.title || notification.post.content}"
              </p>
            )}

            {/* Timestamp */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {timeAgo}
            </p>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
        )}
      </Link>
    </div>
  );
}
