'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { postsService } from '../../services';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import PostCard from '../../components/PostCard';
import AdvancedSearchModal from '../../components/AdvancedSearchModal';
import RealTimeSearch from '../../components/RealTimeSearch';
import { Search, Plus, ChevronLeft, ChevronRight, Filter, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

function PostsPageContent() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });

  // Initialize state from URL parameters
  useEffect(() => {
    const urlSortBy = searchParams.get('sortBy');
    const urlTag = searchParams.get('tag');
    const urlSearch = searchParams.get('search');
    
    if (urlSortBy) {
      setSortBy(urlSortBy);
      // Show quick filters if sorting is not default
      if (urlSortBy !== 'latest') {
        setShowQuickFilters(true);
      }
    }
    if (urlTag) {
      setSelectedTag(decodeURIComponent(urlTag));
      setShowQuickFilters(true);
    }
    if (urlSearch) {
      setSearchTerm(decodeURIComponent(urlSearch));
    }
  }, [searchParams]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, [sortBy, selectedTag, searchTerm, advancedFilters]);

  useEffect(() => {
    fetchPosts(true); // Pass true for page changes
  }, [pagination.page]);

  useEffect(() => {
    fetchPosts();
  }, [sortBy, selectedTag, searchTerm, advancedFilters]);

  const fetchPosts = async (isPageChange = false) => {
    try {
      if (isPageChange) {
        setLoadingPage(true);
      } else {
        setLoading(true);
      }
      
      const options = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (sortBy === 'latest') {
        options.sortBy = 'createdAt';
        options.sortOrder = 'desc';
      } else if (sortBy === 'popular') {
        options.sortBy = 'popular';
        options.sortOrder = 'desc';
      } else if (sortBy === 'mostCommented') {
        options.sortBy = 'comments';
        options.sortOrder = 'desc';
      } else if (sortBy === 'oldest') {
        options.sortBy = 'createdAt';
        options.sortOrder = 'asc';
      }
      
      if (selectedTag) {
        options.tag = selectedTag;
      }
      
      if (searchTerm) {
        // Handle special search syntax
        if (searchTerm.startsWith('author:')) {
          options.author = searchTerm.substring(7);
        } else {
          options.search = searchTerm;
        }
      }

      // Apply advanced filters
      if (advancedFilters.author) {
        options.author = advancedFilters.author;
      }
      
      if (advancedFilters.tags && advancedFilters.tags.length > 0) {
        options.tags = advancedFilters.tags.join(',');
      }
      
      if (advancedFilters.dateFrom) {
        options.dateFrom = advancedFilters.dateFrom.toISOString();
      }
      
      if (advancedFilters.dateTo) {
        options.dateTo = advancedFilters.dateTo.toISOString();
      }

      const result = await postsService.getPosts(options);
      
      if (result.success) {
        const data = result.data;
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
        console.error('Error fetching posts:', result.error);
        setError(result.error);
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Network error');
      setPosts([]);
    } finally {
      setLoading(false);
      setLoadingPage(false);
    }
  };

  const handleRealTimeSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAdvancedSearch = ({ searchTerm: term, filters }) => {
    setSearchTerm(term);
    setAdvancedFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 }));
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        {/* Main Search */}
        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <RealTimeSearch
                onSearch={handleRealTimeSearch}
                onTagClick={handleTagSelect}
                placeholder="Search posts, tags, or users... (try 'author:username')"
              />
            </div>
            <AdvancedSearchModal
              onSearch={handleAdvancedSearch}
              initialSearchTerm={searchTerm}
              initialFilters={advancedFilters}
            />
            <Button
              variant="outline"
              onClick={() => setShowQuickFilters(!showQuickFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedTag || searchTerm || Object.keys(advancedFilters).some(key => advancedFilters[key] && (Array.isArray(advancedFilters[key]) ? advancedFilters[key].length > 0 : true))) && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tag: {selectedTag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedTag('')} />
                </Badge>
              )}
              {advancedFilters.author && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Author: {advancedFilters.author}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setAdvancedFilters(prev => ({ ...prev, author: '' }))} />
                </Badge>
              )}
              {advancedFilters.tags && advancedFilters.tags.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tags: {advancedFilters.tags.join(', ')}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setAdvancedFilters(prev => ({ ...prev, tags: [] }))} />
                </Badge>
              )}
              {advancedFilters.dateFrom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  From: {advancedFilters.dateFrom.toLocaleDateString()}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setAdvancedFilters(prev => ({ ...prev, dateFrom: null }))} />
                </Badge>
              )}
              {advancedFilters.dateTo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  To: {advancedFilters.dateTo.toLocaleDateString()}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setAdvancedFilters(prev => ({ ...prev, dateTo: null }))} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('');
                  setAdvancedFilters({});
                }}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Quick Filters */}
        {showQuickFilters && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest Posts</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="oldest">Oldest Posts</SelectItem>
                  <SelectItem value="mostCommented">Most Commented</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by tag:</label>
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
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Search Results Summary */}
      {(searchTerm || selectedTag || Object.keys(advancedFilters).some(key => advancedFilters[key] && (Array.isArray(advancedFilters[key]) ? advancedFilters[key].length > 0 : true))) && !loading && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>
              Found <strong>{pagination.total}</strong> {pagination.total === 1 ? 'post' : 'posts'}
              {searchTerm && ` for "${searchTerm}"`}
              {selectedTag && ` with tag "${selectedTag}"`}
            </span>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {loadingPage && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading posts...</p>
          </div>
        )}
        
        {!loadingPage && (!Array.isArray(posts) || posts.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No posts found.</p>
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
              showPopularityScore={sortBy === 'popular'}
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
                    <span className="text-gray-500 dark:text-gray-400">...</span>
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
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {posts.length} of {pagination.total} posts
        </div>
      )}
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostsPageContent />
    </Suspense>
  );
}
