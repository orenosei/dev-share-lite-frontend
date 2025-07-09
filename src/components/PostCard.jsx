'use client';

import { Badge } from './ui/badge';
import { Heart, MessageCircle, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { MarkdownContent } from './MarkdownContent';

export default function PostCard({ post, onTagClick, className = '', variant = 'default' }) {
  const formatDate = (dateString) => {
    if (variant === 'compact') {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

	const truncateContent = (content, maxLength = null) => {
		if (!content) return '';
		const defaultLength = variant === 'compact' ? 100 : 200;
		const length = maxLength || defaultLength;

		return {
			truncated: content.length > length ? content.substring(0, length) + '...' : content,
			isTruncated: content.length > length
		};
	};

  if (variant === 'compact') {
    return (
      <article className={`border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0 ${className}`}>
        <Link href={`/posts/${post.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-800 -m-2 p-2 rounded transition-colors">
          <h3 className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 mb-2">
            {post.title}
          </h3>
          <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            <MarkdownContent
              content={truncateContent(post.content).truncated}
              className="prose-sm"
            />
            {truncateContent(post.content).isTruncated && (
              <Link 
                href={`/posts/${post.id}`} 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm mt-1 inline-block"
              >
                See more...
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {post.user?.firstName && post.user?.lastName 
                  ? `${post.user.firstName} ${post.user.lastName}`
                  : post.user?.username || post.user?.email || 'Anonymous'
                }
              </span>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(post.createdAt)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                {post._count?.likes || 0}
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-3 h-3 mr-1" />
                {post._count?.comments || 0}
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <Link href={`/posts/${post.id}`} className="flex-1">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer mb-2">
            {post.title}
          </h2>
        </Link>
      </div>
      
      <div className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
        <MarkdownContent
          content={truncateContent(post.content).truncated}
          className="prose-sm"
        />
        {truncateContent(post.content).isTruncated && (
          <Link 
            href={`/posts/${post.id}`} 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm mt-2 inline-block"
          >
            See more...
          </Link>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <Link 
            href={`/user/${post.authorId || post.userId}`}
            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <User className="h-4 w-4 mr-1" />
            {post.user?.firstName && post.user?.lastName 
              ? `${post.user.firstName} ${post.user.lastName}`
              : post.user?.username || post.user?.email || 'Anonymous'
            }
          </Link>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(post.createdAt)}
          </div>
          <div className="flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            {post._count?.likes || 0}
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-1" />
            {post._count?.comments || 0}
          </div>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
                onClick={() => onTagClick && onTagClick(tag.name || tag)}
              >
                {tag.name || tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
