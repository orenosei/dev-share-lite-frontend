'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Heart, 
  MessageCircle, 
  Calendar, 
  User
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
);

export default function PostContent({ post, onPostUpdate }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

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
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        onPostUpdate(); // Refresh post data
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        router.push('/posts');
      } else {
        alert('Error deleting post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Network error');
    }
  };

  const isAuthor = isAuthenticated && user && post.userId === user.id;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      {/* Post Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <Link 
              href={`/user/${post.userId}`}
              className="flex items-center hover:text-blue-600 transition-colors"
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
              <Badge variant="secondary" className="cursor-pointer hover:bg-indigo-100 transition-colors">
                {tag.name || tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Post Content */}
      <div className="prose max-w-none mb-6">
        <MarkdownPreview source={post.content} />
      </div>

      {/* Post Stats & Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600">
            <Heart className="w-5 h-5 mr-1" />
            {post._count?.likes || 0} likes
          </div>
          <div className="flex items-center text-gray-600">
            <MessageCircle className="w-5 h-5 mr-1" />
            {post._count?.comments || 0} comments
          </div>
        </div>
        
        <Button 
          onClick={handleLike}
          variant="outline"
          className="flex items-center"
        >
          <Heart className="w-4 h-4 mr-1" />
          Like
        </Button>
      </div>
    </div>
  );
}
