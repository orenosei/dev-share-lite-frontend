'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Plus, Heart, MessageCircle, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export default function PostsPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    fetchPosts();
  }, [sortBy, selectedTag]);

  const fetchPosts = async () => {
    try {
      let url = 'http://localhost:4000/posts?';
      
      if (sortBy === 'latest') {
        url += 'sortBy=createdAt&sortOrder=desc';
      } else if (sortBy === 'popular') {
        url += 'sortBy=likesCount&sortOrder=desc';
      }
      
      if (selectedTag) {
        url += `&tags=${selectedTag}`;
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched posts:', data);
        
        // Ensure posts is always an array
        let postsArray = [];
        if (Array.isArray(data)) {
          postsArray = data;
        } else if (data && Array.isArray(data.posts)) {
          postsArray = data.posts;
        } else if (data && Array.isArray(data.data)) {
          postsArray = data.data;
        } else {
          console.warn('Unexpected data format:', data);
          postsArray = [];
        }
        
        setPosts(postsArray);
      } else {
        setError('Error loading posts');
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Network error');
      setPosts([]); // Ensure posts is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content, maxLength = 200) => {
    if (!content) return '';
    // Remove markdown syntax for preview
    const plainText = content.replace(/[#*`>\[\]()]/g, '').replace(/\n/g, ' ');
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
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
                onClick={() => setSelectedTag('')}
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
        {!Array.isArray(posts) || posts.length === 0 ? (
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
          Array.isArray(posts) && posts.map((post) => (
            <article key={post.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <Link href={`/posts/${post.id}`} className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer mb-2">
                    {post.title}
                  </h2>
                </Link>
              </div>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {truncateContent(post.content)}
              </p>
              
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
                        className="cursor-pointer hover:bg-indigo-100"
                        onClick={() => setSelectedTag(tag.name || tag)}
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
          ))
        )}
      </div>

      {/* Load More Button (if needed) */}
      {posts.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" onClick={fetchPosts}>
            Load more posts
          </Button>
        </div>
      )}
    </div>
  );
}
