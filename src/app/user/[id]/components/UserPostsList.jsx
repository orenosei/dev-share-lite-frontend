'use client';

import { useState } from 'react';
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
import UserLikedPosts from './UserLikedPosts';
import { 
  Edit, 
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart
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
  setPagination,
  userId
}) {
  const [activeTab, setActiveTab] = useState('posts');
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant={activeTab === 'posts' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('posts')}
          className="rounded-b-none"
        >
          <FileText className="w-4 h-4 mr-2" />
          Posts ({isOwnProfile ? postCounts.total : postCounts.published})
        </Button>
        <Button
          variant={activeTab === 'liked' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('liked')}
          className="rounded-b-none"
        >
          <Heart className="w-4 h-4 mr-2" />
          Liked Posts
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              Posts
              {isOwnProfile && postCounts.draft > 0 && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({postCounts.published} published, {postCounts.draft} draft)
                </span>
              )}
            </h2>
            {isOwnProfile && (
              <Link href="/posts/new">
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </Link>
            )}
          </div>

          {/* Post Filter */}
          {isOwnProfile && (
            <div className="mb-4 flex items-center gap-3">
              <Label htmlFor="post-filter" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Filter className="w-4 h-4" />
                Filter:
              </Label>
              <Select value={postFilter} onValueChange={setPostFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter posts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts ({postCounts.total})</SelectItem>
                  <SelectItem value="published">Published ({postCounts.published})</SelectItem>
                  <SelectItem value="draft">Drafts ({postCounts.draft})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Posts List */}
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <FileText className="w-12 h-12 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {isOwnProfile 
                  ? "You haven't created any posts yet. Start sharing your knowledge!"
                  : "This user hasn't posted anything yet."
                }
              </p>
              {isOwnProfile && (
                <Link href="/posts/new">
                  <Button>Create Your First Post</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <div key={post.id} className="group">
                  {/* Own posts actions */}
                  {isOwnProfile && (
                    <div className="flex justify-end gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
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
        </>
      ) : (
        <UserLikedPosts userId={userId} isOwnProfile={isOwnProfile} />
      )}
    </div>
  );
}
