'use client';

import { Badge } from './ui/badge';
import { Heart, MessageCircle, Calendar, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { MarkdownContent } from './MarkdownContent';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

export default function PostCard({ post, onTagClick, className = '', variant = 'default', showPopularityScore = false }) {
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

	const calculatePopularityScore = (post) => {
		const likesCount = post._count?.likes || 0;
		const commentsCount = post._count?.comments || 0;
		
		// Same formula as backend
		const daysSinceCreation = Math.floor(
			(Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24)
		);
		const recencyBonus = Math.max(0, 30 - daysSinceCreation) * 0.5;
		return (likesCount * 3) + (commentsCount * 2) + recencyBonus;
	};

	const isPopular = (post) => {
		const score = calculatePopularityScore(post);
		return score >= 10; // Consider popular if score >= 10
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
      <article className={`bg-gradient-to-r from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 ${className}`}>
        <Link href={`/posts/${post.id}`} className="block">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex-1">
              {post.title}
            </h3>
            {(showPopularityScore && isPopular(post)) && (
              <Badge variant="default" className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 flex items-center gap-1 text-xs shrink-0">
                <TrendingUp className="h-2 w-2" />
                Popular
              </Badge>
            )}
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm mb-3 bg-gray-50/30 dark:bg-gray-800/30 rounded p-2 border-l-2 border-indigo-500/20">
            <MarkdownContent
              content={truncateContent(post.content).truncated}
              className="prose-sm"
            />
            {truncateContent(post.content).isTruncated && (
              <span className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm mt-1 inline-block">
                Read more →
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span className="flex items-center bg-gray-100/70 dark:bg-gray-700/50 px-2 py-1 rounded-full truncate">
                <User className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {post.user?.firstName && post.user?.lastName 
                    ? `${post.user.firstName} ${post.user.lastName}`
                    : post.user?.username || post.user?.email || 'Anonymous'
                  }
                </span>
              </span>
              <span className="flex items-center whitespace-nowrap">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(post.createdAt)}
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="flex items-center bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full text-red-600 dark:text-red-400">
                <Heart className="w-3 h-3 mr-1" />
                {post._count?.likes || 0}
              </span>
              <span className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full text-blue-600 dark:text-blue-400">
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
    <article className={`bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-900 dark:to-black p-6 rounded-xl shadow-xl border-2 border-gray-300 dark:border-gray-600 hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-500 hover:scale-[1.01] transition-all duration-300 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap justify-end mb-3">
            {(showPopularityScore && isPopular(post)) && (
              <Badge variant="default" className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 flex items-center gap-1 text-xs shadow-md">
                <TrendingUp className="h-3 w-3" />
                Popular
              </Badge>
            )}
            {showPopularityScore && (
              <Badge variant="outline" className="text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300">
                Score: {Math.round(calculatePopularityScore(post))}
              </Badge>
            )}
          </div>
          <Link href={`/posts/${post.id}`}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer mb-3 leading-tight">
              {post.title}
            </h2>
          </Link>
        </div>
      </div>
      
      <div className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
        <div className="bg-gray-100/80 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-indigo-500/50 shadow-sm">
          <MarkdownContent
            content={truncateContent(post.content).truncated}
            className="prose-sm"
          />
          {truncateContent(post.content).isTruncated && (
            <Link 
              href={`/posts/${post.id}`} 
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm mt-3 inline-flex items-center gap-1 group"
            >
              Read more
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pt-4 border-t-2 border-gray-300/60 dark:border-gray-600/60">
        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 flex-1 min-w-0">
          <Link 
            href={`/user/${post.authorId || post.userId}`}
            className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gray-200/80 dark:bg-gray-700/70 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <User className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate max-w-[100px]">
              {post.user?.firstName && post.user?.lastName 
                ? `${post.user.firstName} ${post.user.lastName}`
                : post.user?.username || post.user?.email || 'Anonymous'
              }
            </span>
          </Link>
          <div className="flex items-center bg-gray-200/80 dark:bg-gray-700/70 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(post.createdAt)}
          </div>
          <div className="flex items-center bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full text-red-600 dark:text-red-400 shadow-sm whitespace-nowrap">
            <Heart className="h-4 w-4 mr-2" />
            {post._count?.likes || 0}
          </div>
          <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-blue-600 dark:text-blue-400 shadow-sm whitespace-nowrap">
            <MessageCircle className="h-4 w-4 mr-2" />
            {post._count?.comments || 0}
          </div>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
            {post.tags.slice(0, 2).map((tag, index) => {
              const tagName = typeof tag === 'string' ? tag : (tag?.name || tag?.id || 'Unknown');
              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-xs whitespace-nowrap truncate max-w-[80px]"
                  onClick={() => onTagClick && onTagClick(tagName)}
                  title={'#' + tagName}
                >
                  #{tagName.length > 10 ? `${tagName.substring(0, 10)}...` : tagName}
                </Badge>
              );
            })}
            {post.tags.length > 2 && (
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-xs whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    +{post.tags.length - 2}
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto max-w-sm">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(2).map((tag, index) => {
                      const tagName = typeof tag === 'string' ? tag : (tag?.name || tag?.id || 'Unknown');
                      return (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-xs"
                          onClick={() => onTagClick && onTagClick(tagName)}
                        >
                          #{tagName}
                        </Badge>
                      );
                    })}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
