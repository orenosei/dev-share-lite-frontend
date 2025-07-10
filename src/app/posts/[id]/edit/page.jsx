'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks';
import { postsService } from '../../../../services';
import { MarkdownEditor } from '../../../../components/MarkdownEditor';
import { MarkdownContent } from '../../../../components/MarkdownContent';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { TagInput, Badge } from '../../../../components/ui/badge';
import { Save, ArrowLeft, Eye, EyeOff, FileText, Tag, X, Search } from 'lucide-react';
import Link from 'next/link';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [showTagBrowser, setShowTagBrowser] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    tags: [],
    status: 'PUBLISHED'
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (params.id) {
      fetchPost();
      fetchAvailableTags();
    }
  }, [isAuthenticated, params.id]);

  const fetchAvailableTags = async () => {
    setIsLoadingTags(true);
    try {
      const result = await postsService.getTags();
      if (result.success) {
        // Extract tag names from the API response
        const tagNames = result.data.map(tag => tag.name);
        setAvailableTags(tagNames);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const fetchPost = async () => {
    try {
      const result = await postsService.getPostById(params.id, user.id);
      
      if (result.success) {
        const data = result.data;
        
        // Check if user is the author
        if (data.userId !== user.id) {
          setError('You can only edit your own posts');
          return;
        }
        
        setPostData({
          title: data.title,
          content: data.content,
          tags: Array.isArray(data.tags) ? data.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [],
          status: data.status || 'PUBLISHED'
        });
      } else {
        setError(result.error || 'Error loading post');
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

  const handleSave = async (status = null) => {
    if (!validateForm()) {
      return;
    }

    const finalStatus = status || postData.status;
    const isPublishing = finalStatus === 'PUBLISHED';
    const setLoading = isPublishing ? setIsSaving : setIsDraftSaving;
    
    setLoading(true);
    setErrors({});

    try {
      const result = await postsService.updatePost(params.id, {
        title: postData.title,
        content: postData.content,
        status: finalStatus,
        tags: postData.tags,
      }, user.id);

      if (result.success) {
        router.push(`/posts/${params.id}`);
      } else {
        setErrors({ submit: result.error || 'Error updating post' });
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setErrors({ submit: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    handleSave('DRAFT');
  };

  const handlePublish = () => {
    handleSave('PUBLISHED');
  };

  const addTagFromBrowser = (tag) => {
    if (!postData.tags.includes(tag)) {
      setPostData({
        ...postData,
        tags: [...postData.tags, tag]
      });
    }
  };

  const removeTagFromBrowser = (tag) => {
    setPostData({
      ...postData,
      tags: postData.tags.filter(t => t !== tag)
    });
  };

  const handleTagsChange = (newTags) => {
    setPostData({
      ...postData,
      tags: newTags
    });
  };

  // Filter tags based on search term
  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
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
              onClick={handleSaveDraft} 
              disabled={isDraftSaving || isSaving}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isDraftSaving ? 'Saving...' : 
                postData.status === 'PUBLISHED' ? 'Convert to Draft' : 'Save as Draft'
              }
            </Button>
            <Button 
              onClick={handlePublish} 
              disabled={isSaving || isDraftSaving}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 
                postData.status === 'PUBLISHED' ? 'Save Changes' : 'Publish'
              }
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
            {errors.submit}
          </div>
        )}

        <div className={`${showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
          {/* Editor Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Post</h2>
              
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
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Tags</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTagBrowser(!showTagBrowser)}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      {showTagBrowser ? 'Hide' : 'Browse'} Tags
                    </Button>
                  </div>
                  
                  <TagInput
                    value={postData.tags}
                    onChange={handleTagsChange}
                    placeholder="Add tags..."
                  />
                  
                  {/* Tag Browser */}
                  {showTagBrowser && (
                    <div className="mt-3 border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">Available Tags</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTagBrowser(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Tag Search */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="text"
                            placeholder="Search tags..."
                            value={tagSearchTerm}
                            onChange={(e) => setTagSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      {isLoadingTags ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">Loading tags...</div>
                      ) : filteredTags.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {filteredTags.map((tag) => {
                              const isSelected = postData.tags.includes(tag);
                              return (
                                <Button
                                  key={tag}
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => 
                                    isSelected 
                                      ? removeTagFromBrowser(tag) 
                                      : addTagFromBrowser(tag)
                                  }
                                  className="h-8"
                                >
                                  {tag}
                                  {isSelected && <X className="h-3 w-3 mr-1" />}
                                </Button>
                              );
                            })}
                          </div>
                          

                        </div>
                      ) : tagSearchTerm ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          No tags found matching "{tagSearchTerm}". Try a different search term.
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          No tags available. Start by adding some custom tags!
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Press Enter or comma to add tags
                  </p>
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content">Content</Label>
                  <div className={`mt-1 ${errors.content ? 'border border-red-500 dark:border-red-400 rounded' : ''}`}>
                    <MarkdownEditor
                      value={postData.content}
                      onChange={(value) => setPostData({ ...postData, content: value || '' })}
                      preview="edit"
                      hideToolbar={false}
                      data-color-mode="auto"
                      height={400}
                    />
                  </div>
                  {errors.content && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.content}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Column - Only show when showPreview is true */}
          {showPreview && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Preview</h2>
                
                <div className="space-y-4">
                  {/* Title Preview */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
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
                  <div className="prose dark:prose-invert max-w-none">
                    <MarkdownContent content={postData.content || '# Your content will appear here...'} />
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
