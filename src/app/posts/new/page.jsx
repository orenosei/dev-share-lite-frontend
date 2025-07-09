'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { postsService } from '../../../services';
import { MarkdownEditor } from '../../../components/MarkdownEditor';
import { MarkdownContent } from '../../../components/MarkdownContent';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { TagInput } from '../../../components/ui/badge';
import { Save, Eye, Edit3, ArrowLeft, FileText, Tag, Plus, X, Search } from 'lucide-react';
import Link from 'next/link';

function NewPostPage() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [showTagBrowser, setShowTagBrowser] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  
  const [postData, setPostData] = useState({
    title: '',
    content: '# Your Post Title Here\n\nWrite your post content here using Markdown syntax...\n\n## Formatting Examples:\n\n- **Bold text**\n- *Italic text*\n- `Inline code`\n- [Links](https://example.com)\n\n### Code Blocks:\n\n```javascript\nfunction hello() {\n    console.log("Hello, DevShare!");\n}\n```\n\n### Lists:\n\n1. First item\n2. Second item\n3. Third item\n\n> This is a quote block for important information.\n\nHappy coding! 🚀',
    tags: []
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAvailableTags();
  }, []);

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

  const handleSave = async (status = 'PUBLISHED') => {
    if (!validateForm()) {
      return;
    }

    const isPublishing = status === 'PUBLISHED';
    const setLoading = isPublishing ? setIsSaving : setIsDraftSaving;
    
    setLoading(true);
    
    try {
      const result = await postsService.createPost({
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        userId: user.id,
        status: status
      });
      console.log('Response:', result);

      if (result.success) {
        const newPost = result.data;
        const action = isPublishing ? 'published' : 'saved as draft';
        alert(`Post ${action} successfully!`);
        window.location.href = `/posts/${newPost.id}`;
      } else {
        alert(`Error ${isPublishing ? 'publishing' : 'saving'} post: ${result.error || 'An error occurred'}`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Network error. Please try again.');
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
      handleInputChange('tags', [...postData.tags, tag]);
    }
  };

  const removeTagFromBrowser = (tag) => {
    handleInputChange('tags', postData.tags.filter(t => t !== tag));
  };

  // Filter tags based on search term
  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  const handleInputChange = (field, value) => {
    setPostData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You need to login to create a post</h1>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/posts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Create New Post' : 'Preview Post'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            size="sm"
          >
            {isEditing ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleSaveDraft} 
            disabled={isDraftSaving || isSaving}
            variant="outline"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isDraftSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button 
            onClick={handlePublish} 
            disabled={isSaving || isDraftSaving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={postData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter post title..."
            className={errors.title ? 'border-red-500' : ''}
            disabled={!isEditing}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="tags">Tags</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagBrowser(!showTagBrowser)}
              disabled={!isEditing}
            >
              <Tag className="h-4 w-4 mr-2" />
              {showTagBrowser ? 'Hide' : 'Browse'} Tags
            </Button>
          </div>
          
          <TagInput
            value={postData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
            placeholder="Type tag and press Enter or comma to add..."
            disabled={!isEditing}
            maxTags={10}
          />
          
          {/* Tag Browser */}
          {showTagBrowser && isEditing && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Available Tags</h3>
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
                <div className="text-sm text-gray-500">Loading tags...</div>
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
                <div className="text-sm text-gray-500">
                  No tags found matching "{tagSearchTerm}". Try a different search term.
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No tags available. Start by adding some custom tags!
                </div>
              )}
            </div>
          )}
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Add tags to help others find your post more easily</p>
            <p>• Press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">Enter</kbd> or <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">comma</kbd> to add a tag</p>
            <p>• Click the ✕ button to remove a tag</p>
            <p>• Press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">Backspace</kbd> to remove the last tag</p>
            {postData.tags.length > 0 && (
              <p className="text-indigo-600">
                {postData.tags.length} tag{postData.tags.length > 1 ? 's' : ''} added
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          {isEditing ? (
            <MarkdownEditor
              value={postData.content}
              onChange={(value) => handleInputChange('content', value)}
              height={500}
              preview="live"
            />
          ) : (
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 min-h-[500px] bg-white dark:bg-gray-800">
              <div className="prose dark:prose-invert max-w-none">
                <MarkdownContent content={postData.content} />
              </div>
            </div>
          )}
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content}</p>
          )}
        </div>

        {/* Preview Info */}
        {!isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-900 mb-2">Post Information:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Title:</strong> {postData.title || 'No title'}</p>
              <p><strong>Word count:</strong> {postData.content.split(' ').filter(word => word.length > 0).length}</p>
              <p><strong>Tags:</strong> {postData.tags.length > 0 ? postData.tags.join(', ') : 'No tags'}</p>
              <p><strong>Author:</strong> {user?.name || user?.email || 'Unknown'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewPostPage;
