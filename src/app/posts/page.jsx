'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import PostCard from '../../components/PostCard';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PostsPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, [sortBy, selectedTag]);

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, sortBy, selectedTag]);

  const fetchPosts = async () => {
    try {
      let url = `http://localhost:4000/posts?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (sortBy === 'latest') {
        url += '&sortBy=createdAt&sortOrder=desc';
      } else if (sortBy === 'popular') {
        url += '&sortBy=likesCount&sortOrder=desc';
      }
      
      if (selectedTag) {
        url += `&tag=${selectedTag}`;
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched posts:', data);
        
        // Check if data has pagination structure
        if (data && data.posts && data.pagination) {
          setPosts(data.posts);
          setPagination(prev => ({
            ...prev,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages
          }));
        } else {
          console.warn('Unexpected data format:', data);
          setPosts([]);
        }
      } else {
        setError('Error loading posts');
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Network error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchPosts();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
        {isAuthenticated && (
          <Link href="/posts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by tag:</label>
            <Input
              type="text"
              placeholder="Enter tag..."
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-32"
            />
            {selectedTag && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTagSelect('')}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {loadingPage && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        )}
        
        {!loadingPage && (!Array.isArray(posts) || posts.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No posts found.</p>
            {isAuthenticated && (
              <Link href="/posts/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first post
                </Button>
              </Link>
            )}
          </div>
        ) : (
          !loadingPage && Array.isArray(posts) && posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onTagClick={handleTagSelect}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>              <div className="flex items-center gap-2">
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
                      onClick={() => handlePageChange(pageNum)}
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
                      onClick={() => handlePageChange(pagination.totalPages)}
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
              </div>
          
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Posts Info */}
      {posts.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Showing {posts.length} of {pagination.total} posts
        </div>
      )}
    </div>
  );
}
