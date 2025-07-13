'use client';

import { useState, useEffect } from 'react';
import { postsService } from '../../../../services';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Eye, Calendar, Tag, User } from 'lucide-react';

export default function UserLikedPosts({ userId, isOwnProfile }) {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (userId) {
      fetchLikedPosts();
    }
  }, [userId, pagination.page]);

  const fetchLikedPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await postsService.getLikedPostsByUser(userId, {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (result.success) {
        // Handle nested data structure from API response
        const actualData = result.data.data || result.data;
        const { posts, pagination: paginationData } = actualData;
        setLikedPosts(posts || []);
        setPagination(prev => ({
          ...prev,
          total: paginationData?.total || 0,
          totalPages: paginationData?.totalPages || 0
        }));
      } else {
        setError(result.error || 'Failed to fetch liked posts');
        setLikedPosts([]);
      }
    } catch (err) {
      setError('An error occurred while loading liked posts');
      setLikedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const PostCard = ({ post }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-semibold overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            <Link 
              href={`/posts/${post.id}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {post.title}
            </Link>
          </CardTitle>
        </div>

        {/* Author info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <User className="w-4 h-4" />
          <span>by</span>
          <Link 
            href={`/user/${post.user?.id}`}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {post.user?.username || 'Unknown Author'}
          </Link>
        </div>

        {/* Post metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{post.tags.length} tags</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-3">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={post.images[0].url}
                alt={post.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-200"
              />
              {post.images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  +{post.images.length - 1} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Post content preview */}
        <div className="mb-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {post.content 
              ? post.content.length > 150 
                ? post.content.substring(0, 150) + '...'
                : post.content
              : 'No content preview available'
            }
          </p>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Post statistics */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
              <span>{post._count?.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post._count?.comments || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.views || 0}</span>
            </div>
          </div>

          <Link href={`/posts/${post.id}`}>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-2">
              Read →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const Pagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              className="w-8 h-8"
            >
              1
            </Button>
            {startPage > 2 && <span className="px-1">...</span>}
          </>
        )}

        {pages.map(pageNum => (
          <Button
            key={pageNum}
            variant={pageNum === pagination.page ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePageChange(pageNum)}
            className="w-8 h-8"
          >
            {pageNum}
          </Button>
        ))}

        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="px-1">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              className="w-8 h-8"
            >
              {pagination.totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Liked Posts
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-full animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Heart className="w-12 h-12 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Liked Posts
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={fetchLikedPosts} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Liked Posts
          {pagination.total > 0 && (
            <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
              ({pagination.total})
            </span>
          )}
        </h2>
      </div>

      {likedPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Heart className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No liked posts yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {isOwnProfile 
              ? "You haven't liked any posts yet. Explore posts and like the ones that interest you!"
              : "This user hasn't liked any posts yet."
            }
          </p>
          {isOwnProfile && (
            <Link href="/posts">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Explore Posts
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          
          <Pagination />
        </>
      )}
    </div>
  );
}
