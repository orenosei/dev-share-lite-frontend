'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { MarkdownEditor } from '../../../../components/MarkdownEditor';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { TagInput, Badge } from '../../../../components/ui/badge';
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    tags: []
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (params.id) {
      fetchPost();
    }
  }, [isAuthenticated, params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:4000/posts/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if user is the author
        if (data.userId !== user.id) {
          setError('You can only edit your own posts');
          return;
        }
        
        setPostData({
          title: data.title,
          content: data.content,
          tags: Array.isArray(data.tags) ? data.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : []
        });
      } else if (response.status === 404) {
        setError('Post not found');
      } else {
        setError('Error loading post');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!postData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!postData.content.trim()) {
      newErrors.content = 'Content is required';
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
      const response = await fetch(`http://localhost:4000/posts/${params.id}?userId=${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          status: "PUBLISHED",
          tags: postData.tags,
        }),
      });

      if (response.ok) {
        router.push(`/posts/${params.id}`);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Error updating post' });
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setErrors({ submit: 'Network error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagsChange = (newTags) => {
    setPostData({
      ...postData,
      tags: newTags
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/posts">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href={`/posts/${params.id}`}>
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Post
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
            <Link href={`/posts/${params.id}`}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Post
              </Button>
            </Link>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {errors.submit}
          </div>
        )}

        <div className={`${showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
          {/* Editor Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Post</h2>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={postData.title}
                    onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                    placeholder="Enter post title..."
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <TagInput
                    value={postData.tags}
                    onChange={handleTagsChange}
                    placeholder="Add tags..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Press Enter or comma to add tags
                  </p>
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content">Content</Label>
                  <div className={`mt-1 ${errors.content ? 'border border-red-500 rounded' : ''}`}>
                    <MarkdownEditor
                      value={postData.content}
                      onChange={(value) => setPostData({ ...postData, content: value || '' })}
                      preview="edit"
                      hideToolbar={false}
                      data-color-mode="light"
                      height={400}
                    />
                  </div>
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Column - Only show when showPreview is true */}
          {showPreview && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                
                <div className="space-y-4">
                  {/* Title Preview */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {postData.title || 'Post Title'}
                    </h3>
                  </div>

                  {/* Tags Preview */}
                  {postData.tags && postData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {postData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Content Preview */}
                  <div className="prose max-w-none">
                    <MarkdownEditor
                      value={postData.content || '# Your content will appear here...'}
                      preview="preview"
                      hideToolbar
                      data-color-mode="light"
                      height={400}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
