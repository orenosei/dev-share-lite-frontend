'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { MarkdownEditor } from '../../../components/MarkdownEditor';
import { MarkdownContent } from '../../../components/MarkdownContent';
import PhoneNumberInput from '../../../components/PhoneNumberInput';
import CountrySelect from '../../../components/CountrySelect';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import PostCard from '../../../components/PostCard';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  
  const [postFilter, setPostFilter] = useState('all'); // 'all', 'published', 'draft'
  
  // Track total counts for statistics
  const [postCounts, setPostCounts] = useState({
    total: 0,
    published: 0,
    draft: 0
  });
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    phone: '',
    avatarUrl: '',
    address: {
      city: '',
      country: ''
    }
  });
  
  const [errors, setErrors] = useState({});

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
      const response = await fetch(`http://localhost:4000/users/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          bio: data.bio || '',
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || '',
          address: {
            city: data.address?.city || '',
            country: data.address?.country || ''
          }
        });
      } else if (response.status === 404) {
        setError('User not found');
      } else {
        setError('Error loading user profile');
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
      let url = `http://localhost:4000/posts/user/${params.id}?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (!currentIsOwnProfile) {
        // For other users' profiles, only show published posts
        url += '&status=PUBLISHED';
      } else {
        // For own profile, apply the selected filter
        if (postFilter === 'published') {
          url += '&status=PUBLISHED';
        } else if (postFilter === 'draft') {
          url += '&status=DRAFT';
        }
        // For 'all', don't add status filter - show both DRAFT and PUBLISHED
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        // Check if data has pagination structure
        if (data && data.posts && data.pagination) {
          setUserPosts(data.posts);
          setPagination(prev => ({
            ...prev,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages
          }));
        } else {
          // Fallback for old format
          setUserPosts(Array.isArray(data) ? data : []);
        }
      } else {
        console.error('Error fetching user posts');
        setUserPosts([]);
      }
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setUserPosts([]);
    }
  };

  const fetchPostCounts = async () => {
    try {
      const currentIsOwnProfile = isAuthenticated && currentUser && user && user.id === currentUser.id;
      
      if (currentIsOwnProfile) {
        // For own profile, get counts for all statuses
        const [allResponse, publishedResponse, draftResponse] = await Promise.all([
          fetch(`http://localhost:4000/posts/user/${params.id}?page=1&limit=1`),
          fetch(`http://localhost:4000/posts/user/${params.id}?page=1&limit=1&status=PUBLISHED`),
          fetch(`http://localhost:4000/posts/user/${params.id}?page=1&limit=1&status=DRAFT`)
        ]);

        const [allData, publishedData, draftData] = await Promise.all([
          allResponse.json(),
          publishedResponse.json(),
          draftResponse.json()
        ]);

        setPostCounts({
          total: allData?.pagination?.total || 0,
          published: publishedData?.pagination?.total || 0,
          draft: draftData?.pagination?.total || 0
        });
      } else {
        // For other profiles, only get published count
        const response = await fetch(`http://localhost:4000/posts/user/${params.id}?page=1&limit=1&status=PUBLISHED`);
        const data = await response.json();
        
        setPostCounts({
          total: data?.pagination?.total || 0,
          published: data?.pagination?.total || 0,
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!editForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!editForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!editForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const response = await fetch(`http://localhost:4000/users/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Error updating profile' });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors({ submit: 'Network error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      bio: user.bio || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
      address: {
        city: user.address?.city || '',
        country: user.address?.country || ''
      }
    });
    setIsEditing(false);
    setErrors({});
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`http://localhost:4000/posts/${postId}?userId=${currentUser.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`,
          },
        });

        if (response.ok) {
          // Refresh posts list
          setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
          fetchUserPosts();
        } else {
          console.error('Error deleting post');
        }
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const getUserFullName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.username || user.email;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
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
  const publishedPosts = userPosts.filter(post => post.status === 'PUBLISHED');
  const draftPosts = userPosts.filter(post => post.status === 'DRAFT');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <PhoneNumberInput
                      value={editForm.phone}
                      onChange={(value) => setEditForm({ ...editForm, phone: value || '' })}
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      International format with country code
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                      id="avatarUrl"
                      type="url"
                      value={editForm.avatarUrl}
                      onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <CountrySelect
                        value={editForm.address.country}
                        onChange={(value) => setEditForm({ 
                          ...editForm, 
                          address: { ...editForm.address, country: value }
                        })}
                        placeholder="Select your country"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        value={editForm.address.city}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          address: { ...editForm.address, city: e.target.value }
                        })}
                        placeholder="Ho Chi Minh City"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <div className="mt-1">
                      <MarkdownEditor
                        value={editForm.bio}
                        onChange={(value) => setEditForm({ ...editForm, bio: value || '' })}
                        preview="live"
                        hideToolbar={false}
                        data-color-mode="auto"
                        placeholder="Tell us about yourself using Markdown..."
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      You can use Markdown formatting in your bio
                    </p>
                  </div>
                  
                  {errors.submit && (
                    <div className="text-red-500 dark:text-red-400 text-sm">{errors.submit}</div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-4">
                    {user.avatarUrl && (
                      <img 
                        src={user.avatarUrl} 
                        alt="Avatar" 
                        className="w-16 h-16 rounded-full mr-4 object-cover"
                      />
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {getUserFullName(user)}
                      </h1>
                      <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 dark:text-gray-300 mb-4">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {user.email}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {formatDate(user.createdAt)}
                    </div>
                    {user.phone && (
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2">📞</span>
                        {user.phone}
                      </div>
                    )}
                    {(user.address?.city || user.address?.country) && (
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2">📍</span>
                        {[user.address?.country, user.address?.city].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                  
                  {user.bio && (
                    <div className="prose dark:prose-invert prose-sm max-w-none mb-4">
                      <MarkdownContent content={user.bio} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {isOwnProfile ? postCounts.total : postCounts.published}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {isOwnProfile ? 'Total Posts' : 'Posts'}
              </div>
              {isOwnProfile && postCounts.draft > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {postCounts.published} published, {postCounts.draft} draft
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Likes</div>
            </div>
            <div className="text-center pb-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userPosts.reduce((sum, post) => sum + (post._count?.comments || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Comments</div>
            </div>
          </div>
          
          {/* Edit Profile Button */}
          {isOwnProfile && !isEditing && (
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button 
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>

        {/* User Posts */}
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
                          onClick={() => handleDeletePost(post.id)}
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
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>                <div className="flex items-center gap-2">
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
          {userPosts.length > 0 && (
            <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {userPosts.length} of {pagination.total} {postFilter === 'all' ? 'posts' : `${postFilter} posts`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
