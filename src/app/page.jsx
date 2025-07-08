'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import PostCard from '../components/PostCard';
import { 
  FileText, 
  Users, 
  MessageCircle, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [recentPosts, setRecentPosts] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0
  });
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent posts
      const postsResponse = await fetch('http://localhost:4000/posts?limit=5&sortBy=createdAt&sortOrder=desc');
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setRecentPosts(Array.isArray(postsData) ? postsData : postsData.posts || []);
      }

      // Fetch popular tags
      const tagsResponse = await fetch('http://localhost:4000/posts/tags');
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setPopularTags(Array.isArray(tagsData) ? tagsData.slice(0, 8) : []);
      }

      // Todo: Replace with actual API call to fetch stats
      setStats({
        totalPosts: Math.floor(Math.random() * 1000) + 500,
        totalUsers: Math.floor(Math.random() * 500) + 100,
        totalComments: Math.floor(Math.random() * 2000) + 1000
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to{' '}
              <span className="text-indigo-600">DevShare Lite</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              A community platform for developers to share knowledge, ask questions, and connect with peers.
            </p>
            
            {isAuthenticated ? (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Welcome back, {user.name || user.email}! 👋
                </h2>
                <div className="max-w-lg mx-auto">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link href="/posts">
                      <Button className="w-full">
                        Browse Posts
                      </Button>
                    </Link>
                    <Link href="/posts/new">
                      <Button variant="outline" className="w-full">
                        Create Post
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <div className="max-w-lg mx-auto">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link href="/register">
                      <Button className="w-full">
                        Get Started
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Posts Shared</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Community Members</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalComments.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Comments & Discussions</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent Posts
                </h2>
                <Link href="/posts">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No posts yet. Be the first to share!</p>
                  {isAuthenticated && (
                    <Link href="/posts/new">
                      <Button className="mt-4">Create First Post</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      className="shadow-none border-0 border-b pb-4 last:border-b-0 last:pb-0"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
              
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : popularTags.length === 0 ? (
                <p className="text-gray-500 text-sm">No tags yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <Link key={index} href={`/posts?tag=${encodeURIComponent(tag.name || tag)}`}>
                      <Badge 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-indigo-100 transition-colors"
                      >
                        {tag.name || tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Join the Community</h3>
              <p className="text-indigo-700 text-sm mb-4">
                Share your knowledge, learn from others, and connect with fellow developers.
              </p>
              {!isAuthenticated && (
                <div className="space-y-2">
                  <Link href="/register">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">Already have an account?</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
