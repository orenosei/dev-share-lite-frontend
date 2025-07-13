'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useAlertDialogContext } from '../../../hooks';
import { userService, postsService } from '../../../services';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';
import UserProfileHeader from './components/UserProfileHeader';
import UserPostsList from './components/UserPostsList';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showDeleteConfirm } = useAlertDialogContext();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  
  const [postFilter, setPostFilter] = useState('all');
  
  // Track total counts for statistics
  const [postCounts, setPostCounts] = useState({
    total: 0,
    published: 0,
    draft: 0
  });

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  useEffect(() => {
    // Fetch posts after user data is loaded to determine if it's own profile
    if (params.id && user) {
      fetchUserPosts();
      fetchPostCounts();
    }
  }, [params.id, user, currentUser, pagination.page, postFilter]);

  const fetchUser = async () => {
    try {
      const result = await userService.getUserById(params.id);
      
      if (result.success) {
        setUser(result.data);
      } else {
        if (result.error?.includes('not found') || result.error?.includes('404')) {
          setError('User not found');
        } else {
          setError(result.error || 'Error loading user profile');
        }
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const currentIsOwnProfile = isAuthenticated && currentUser && user && user.id === currentUser.id;
      const options = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (!currentIsOwnProfile) {
        // For other users' profiles, only show published posts
        options.status = 'PUBLISHED';
      } else {
        // For own profile, apply the selected filter
        if (postFilter === 'published') {
          options.status = 'PUBLISHED';
        } else if (postFilter === 'draft') {
          options.status = 'DRAFT';
        }
        // For 'all', don't add status filter - show both DRAFT and PUBLISHED
      }
      
      const result = await postsService.getPostsByUser(params.id, options);
      
      if (result.success) {
        // Handle nested data structure from API response
        const actualData = result.data.data || result.data;
        
        // Check if data has pagination structure
        if (actualData && actualData.posts && actualData.pagination) {
          setUserPosts(actualData.posts);
          setPagination(prev => ({
            ...prev,
            total: actualData.pagination.total,
            totalPages: actualData.pagination.totalPages
          }));
        } else {
          // Fallback for old format
          setUserPosts(Array.isArray(actualData) ? actualData : []);
        }
      } else {
        setUserPosts([]);
      }
    } catch (err) {
      setUserPosts([]);
    }
  };

  const fetchPostCounts = async () => {
    try {
      const currentIsOwnProfile = isAuthenticated && currentUser && user && user.id === currentUser.id;
      
      if (currentIsOwnProfile) {
        // For own profile, get counts for all statuses
        const [allResult, publishedResult, draftResult] = await Promise.all([
          postsService.getPostsByUser(params.id, { page: 1, limit: 1 }),
          postsService.getPostsByUser(params.id, { page: 1, limit: 1, status: 'PUBLISHED' }),
          postsService.getPostsByUser(params.id, { page: 1, limit: 1, status: 'DRAFT' })
        ]);

        setPostCounts({
          total: allResult.success ? (allResult.data?.data?.pagination?.total || allResult.data?.pagination?.total || 0) : 0,
          published: publishedResult.success ? (publishedResult.data?.data?.pagination?.total || publishedResult.data?.pagination?.total || 0) : 0,
          draft: draftResult.success ? (draftResult.data?.data?.pagination?.total || draftResult.data?.pagination?.total || 0) : 0
        });
      } else {
        // For other profiles, only get published count
        const result = await postsService.getPostsByUser(params.id, { page: 1, limit: 1, status: 'PUBLISHED' });
        
        setPostCounts({
          total: result.success ? (result.data?.data?.pagination?.total || result.data?.pagination?.total || 0) : 0,
          published: result.success ? (result.data?.data?.pagination?.total || result.data?.pagination?.total || 0) : 0,
          draft: 0
        });
      }
    } catch (err) {
      console.error('Error fetching post counts:', err);
      setPostCounts({ total: 0, published: 0, draft: 0 });
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDeletePost = async (postId) => {
    const confirmed = await showDeleteConfirm(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      'Delete'
    );

    if (confirmed) {
      try {
        const result = await postsService.deletePost(postId, currentUser.id);

        if (result.success) {
          // Refresh posts list
          setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
          fetchUserPosts();
          fetchPostCounts(); // Also refresh counts
        } else {
          console.error('Error deleting post:', result.error);
        }
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleProfileSave = async (editForm) => {
    try {
      const result = await userService.updateUser(params.id, editForm);

      if (result.success) {
        setUser(result.data);
        return true;
      } else {
        console.error('Error updating profile:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link href="/posts">
              <Button>Back to Posts</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isOwnProfile = isAuthenticated && currentUser && user.id === currentUser.id;
  const totalLikes = userPosts.reduce((sum, post) => sum + (post._count?.likes || 0), 0);
  const totalComments = userPosts.reduce((sum, post) => sum + (post._count?.comments || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-8xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Header */}
          <div className="lg:col-span-4">
            <UserProfileHeader
              user={user}
              isOwnProfile={isOwnProfile}
              postCounts={postCounts}
              totalLikes={totalLikes}
              totalComments={totalComments}
              onSave={handleProfileSave}
            />
          </div>

          {/* User Posts */}
          <div className="lg:col-span-8">
            <UserPostsList
              userPosts={userPosts}
              isOwnProfile={isOwnProfile}
              postCounts={postCounts}
              postFilter={postFilter}
              setPostFilter={setPostFilter}
              pagination={pagination}
              onPageChange={handlePageChange}
              onDeletePost={handleDeletePost}
              setPagination={setPagination}
              userId={params.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
