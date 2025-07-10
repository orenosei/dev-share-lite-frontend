'use client';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import PostCard from '../../../../components/PostCard';
import { 
  Edit, 
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function UserPostsList({ 
  userPosts, 
  isOwnProfile, 
  postCounts, 
  postFilter, 
  setPostFilter,
  pagination,
  onPageChange,
  onDeletePost,
  setPagination
}) {
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <FileText className="w-5 h-5 mr-2" />
        Posts ({isOwnProfile ? postCounts.total : postCounts.published})
        {isOwnProfile && postCounts.draft > 0 && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({postCounts.published} published, {postCounts.draft} draft)
          </span>
        )}
      </h2>

      {/* Post Filter */}
      {isOwnProfile && (
        <div className="mb-4 flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <Label htmlFor="postFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter Posts:
          </Label>
          <Select
            value={postFilter}
            onValueChange={(value) => {
              setPostFilter(value);
              setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="published">Published Only</SelectItem>
              <SelectItem value="draft">Draft Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {userPosts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isOwnProfile ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
          </p>
          {isOwnProfile && (
            <Link href="/posts/new">
              <Button>Create your first post</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {userPosts.map((post) => (
            <div key={post.id} className="border rounded-lg">
              {/* Status and Actions Header for own posts */}
              {isOwnProfile && (
                <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                  <Badge 
                    variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}
                    className={post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}
                  >
                    {post.status}
                  </Badge>
                  <div className="flex space-x-2">
                    <Link href={`/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Post Content */}
              <div className={isOwnProfile ? '' : 'border rounded-lg'}>
                <PostCard 
                  post={post} 
                  className="shadow-none border-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else {
                // Show pages around current page
                const start = Math.max(1, pagination.page - 2);
                const end = Math.min(pagination.totalPages, start + 4);
                pageNum = start + i;
                if (pageNum > end) return null;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            }).filter(Boolean)}
            
            {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
              <>
                <span className="text-gray-500">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.totalPages)}
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}
          </div>
        
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Posts Info */}
      {userPosts.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {userPosts.length} of {pagination.total} {postFilter === 'all' ? 'posts' : `${postFilter} posts`}
        </div>
      )}
    </div>
  );
}
