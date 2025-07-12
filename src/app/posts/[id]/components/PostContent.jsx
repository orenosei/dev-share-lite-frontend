'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useToast, useAlertDialogContext } from '../../../../hooks';
import { postsService } from '../../../../services';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { MarkdownContent } from '../../../../components/MarkdownContent';
import ImageUpload from '../../../../components/ImageUpload';
import PostImages from '../../../../components/PostImages';
import { 
  Edit, 
  Trash2, 
  Heart, 
  MessageCircle, 
  Calendar, 
  User,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function PostContent({ post, onPostUpdate }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const { showDeleteConfirm } = useAlertDialogContext();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [postImages, setPostImages] = useState(post.images || []);

  // Check if the current user has liked this post
  useEffect(() => {
    if (isAuthenticated && user && post.likes) {
      const userLike = post.likes.find(like => like.userId === user.id);
      setIsLiked(!!userLike);
    }
    setLikeCount(post._count?.likes || 0);
    setPostImages(post.images || []);
  }, [isAuthenticated, user, post.likes, post._count?.likes, post.images]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Store the current page for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
      return;
    }

    if (isLiking) return; // Prevent multiple clicks
    setIsLiking(true);

    try {
      const result = await postsService.likePost(post.id, user.id);

      if (result.success) {
        // Toggle like state and update count
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        
        // Refresh post data from parent
        if (onPostUpdate) {
          onPostUpdate();
        }
      } else {
        console.error('Error toggling like:', result.error);
      }
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeletePost = async () => {
    showDeleteConfirm({
      title: 'Delete Post',
      description: 'Are you sure you want to delete this post? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const result = await postsService.deletePost(post.id, user.id);

          if (result.success) {
            router.push('/posts');
          } else {
            console.error('Error deleting post:', result.error);
            showError('Delete failed', 'Error deleting post');
          }
        } catch (err) {
          console.error('Error deleting post:', err);
          showError('Network error', 'Failed to delete post due to network error');
        }
      }
    });
  };

  const handleImagesUploaded = (uploadResult) => {
    console.log('handleImagesUploaded called with:', uploadResult);
    
    if (uploadResult && uploadResult.data && uploadResult.data.images) {
      const newImages = uploadResult.data.images;
      console.log('Adding new images:', newImages);
      setPostImages(prev => [...prev, ...newImages]);
      setShowImageUpload(false);
      
      // Refresh post data from parent to get updated data
      if (onPostUpdate) {
        onPostUpdate();
      }
    } else if (uploadResult && uploadResult.images) {
      // Direct response format
      const newImages = uploadResult.images;
      console.log('Adding new images (direct):', newImages);
      setPostImages(prev => [...prev, ...newImages]);
      setShowImageUpload(false);
      
      if (onPostUpdate) {
        onPostUpdate();
      }
    }
  };

  const handleImageDeleted = (imageId) => {
    setPostImages(prev => prev.filter(img => img.id !== imageId));
    
    // Refresh post data from parent to get updated data
    if (onPostUpdate) {
      onPostUpdate();
    }
  };

  const isAuthor = isAuthenticated && user && post.userId === user.id;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Post Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h1>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
            <Link 
              href={`/user/${post.userId}`}
              className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <User className="w-4 h-4 mr-1" />
              {post.user?.firstName && post.user?.lastName 
                ? `${post.user.firstName} ${post.user.lastName}`
                : post.user?.username || post.user?.name || post.user?.email || 'Anonymous'
              }
            </Link>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
        
        {isAuthor && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowImageUpload(!showImageUpload)}
              className="flex items-center"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              {showImageUpload ? 'Cancel Upload' : 'Add Images'}
            </Button>
            <Link href={`/posts/${post.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeletePost}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <Link key={index} href={`/posts?tag=${encodeURIComponent(tag.name || tag)}`}>
              <Badge variant="secondary" className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors">
                {tag.name || tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Image Upload Section (for authors) */}
      {isAuthor && showImageUpload && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Images</h3>
          <ImageUpload
            postId={post.id}
            onImagesUploaded={handleImagesUploaded}
            onImageDeleted={handleImageDeleted}
          />
        </div>
      )}

      {/* Post Images */}
      {postImages && postImages.length > 0 && (
        <div className="mb-6">
          <PostImages
            images={postImages}
            isAuthor={isAuthor}
            postId={post.id}
            onImageDeleted={handleImageDeleted}
          />
        </div>
      )}

      {/* Post Content */}
      <div className="mb-6">
        <MarkdownContent 
          content={post.content}
        />
      </div>

      {/* Post Stats & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Heart className="w-5 h-5 mr-1" />
            {likeCount} likes
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MessageCircle className="w-5 h-5 mr-1" />
            {post._count?.comments || 0} comments
          </div>
        </div>
        
        <Button 
          onClick={handleLike}
          variant={isLiked ? "outline" : "default"}
          className={`flex items-center ${isLiked ? '' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          disabled={isLiking}
        >
          <Heart className={`w-4 h-4 mr-1 ${isLiked ? '' : 'fill-white'}`} />
          {isLiking ? 'Loading...' : (isLiked ? 'Unlike' : 'Like')}
        </Button>
      </div>
    </div>
  );
}
