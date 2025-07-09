'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { commentsService } from '../../../services';
import PostContent from './components/PostContent';
import CommentSection from './components/CommentSection';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchPost();
      fetchComments();
    }
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:4000/posts/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setPost(data);
        //console.log('Fetched post:', data);
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

  const fetchComments = async () => {
    try {
      const result = await commentsService.getCommentsByPost(params.id);
      
      if (result.success) {
        setComments(result.data);
      } else {
        console.error('Error fetching comments:', result.error);
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    }
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

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/posts">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Button>
          </Link>
        </div>

        {/* Post Content Component */}
        <PostContent post={post} onPostUpdate={fetchPost} />

        {/* Comment Section Component */}
        <CommentSection postId={params.id} initialComments={comments} />
      </div>
    </div>
  );
}
