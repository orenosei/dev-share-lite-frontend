'use client';

import { Badge } from './ui/badge';
import { Heart, MessageCircle, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
);

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

			console.log('Truncated content:', content);
			return content.length > length
				? content.substring(0, length) + '...'
				: content;
		};

  if (variant === 'compact') {
    return (
      <article className={`border-b pb-4 last:border-b-0 last:pb-0 ${className}`}>
        <Link href={`/posts/${post.id}`} className="block hover:bg-gray-50 -m-2 p-2 rounded transition-colors">
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 mb-2">
            {post.title}
          </h3>
          <div className="text-gray-600 text-sm mb-2 prose prose-sm max-w-none">
            <MarkdownPreview
              source={truncateContent(post.content)}
              style={{ 
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
                lineHeight: '1.25rem'
              }}
              className="!text-gray-600 !text-sm"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {post.author?.name || post.author?.email || 'Anonymous'}
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
    <article className={`bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <Link href={`/posts/${post.id}`} className="flex-1">
          <h2 className="text-3xl font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer mb-2">
            {post.title}
          </h2>
        </Link>
      </div>
      
      <div className="text-gray-600 mb-4 leading-relaxed prose prose-sm max-w-none">
        <MarkdownPreview
          source={truncateContent(post.content)}
          style={{ 
            backgroundColor: 'transparent',
            fontSize: '0.9rem',
            lineHeight: '1.4rem'
          }}
          className="!text-gray-600"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <Link 
            href={`/user/${post.authorId || post.userId}`}
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <User className="h-4 w-4 mr-1" />
            {post.author?.name || post.user?.name || post.user?.username || 'Anonymous'}
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
                className="cursor-pointer hover:bg-indigo-100 transition-colors"
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
