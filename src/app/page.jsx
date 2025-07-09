'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { statsService } from '../services';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import PostCard from '../components/PostCard';
import { 
  FileText, 
  Users, 
  MessageCircle, 
  TrendingUp,
  ArrowRight,
  Heart
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalLikes: 0,
    recentPosts: 0,
    newUsers: 0,
    growthRate: {
      posts: 0,
      users: 0
    }
  });
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch trending posts (popular posts)
      const postsResponse = await fetch('http://localhost:4000/posts?limit=5&sortBy=popular&sortOrder=desc');
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setTrendingPosts(Array.isArray(postsData) ? postsData : postsData.posts || []);
      }

      // Fetch popular tags
      const tagsResponse = await fetch('http://localhost:4000/posts/tags');
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setPopularTags(Array.isArray(tagsData) ? tagsData.slice(0, 8) : []);
      }

      // Fetch real stats from API using statsService
      const statsResult = await statsService.getGlobalStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        console.error('Error fetching stats:', statsResult.error);
        setStats(statsResult.data); // Use fallback data
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to default values on error
      setStats({
        totalPosts: 0,
        totalUsers: 0,
        totalComments: 0,
        totalLikes: 0,
        recentPosts: 0,
        newUsers: 0,
        growthRate: {
          posts: 0,
          users: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Welcome to{' '}
            <span className="text-indigo-600 dark:text-indigo-400">DevShare Lite</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg">
            A community platform for developers to share knowledge, ask questions, and connect with peers.
          </p>
          
          {isAuthenticated ? (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Welcome back, {user.firstName}! 👋
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

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPosts.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Posts Shared</div>
          {stats.recentPosts > 0 && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">+{stats.recentPosts} this week</div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Users className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Community Members</div>
          {stats.newUsers > 0 && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">+{stats.newUsers} this month</div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalComments.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Comments & Discussions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.totalLikes / Math.max(stats.totalPosts, 1) * 10) / 10}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Engagement</div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">likes per post</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trending Posts */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                Trending Posts
              </h2>
              <Link href="/posts?sortBy=popular">
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
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : trendingPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to share!</p>
                {isAuthenticated && (
                  <Link href="/posts/new">
                    <Button className="mt-4">Create First Post</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {trendingPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    className="shadow-none border-0 border-b pb-4 last:border-b-0"
                    showPopularityScore={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Tags</h3>
            
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : popularTags.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag, index) => (
                  <Link key={index} href={`/posts?tag=${encodeURIComponent(tag.name || tag)}`}>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
                    >
                      {tag.name || tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700 p-6">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              Get Trending
            </h3>
            <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-4">
              Share quality content to get featured in trending posts and reach more developers.
            </p>
            {!isAuthenticated ? (
              <div className="space-y-2">
                <Link href="/register">
                  <Button className="w-full">Join the Community</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full">Already have an account?</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/posts/new">
                  <Button className="w-full">Create Trending Post</Button>
                </Link>
                <Link href="/posts?sortBy=popular">
                  <Button variant="outline" className="w-full">View All Trending</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
