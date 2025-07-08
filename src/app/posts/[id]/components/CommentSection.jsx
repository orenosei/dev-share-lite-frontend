'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  Heart, 
  MessageCircle, 
  Send 
} from 'lucide-react';
import Link from 'next/link';

export default function CommentSection({ postId, initialComments = [] }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const getInitials = (user) => {
    if (!user) return '?';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    setCommentError('');
    try {
      const response = await fetch(`http://localhost:4000/comments/post/${postId}`);
      
      if (response.ok) {
        const data = await response.json();
        setComments(Array.isArray(data) ? data : []);
      } else {
        console.error('Error fetching comments');
        setCommentError('Failed to load comments');
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setCommentError('Network error while loading comments');
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Store the current page for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    setCommentError('');

    try {
      const response = await fetch('http://localhost:4000/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          content: newComment,
          postId: parseInt(postId),
          userId: user.id
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(); // Refresh comments
      } else {
        const errorData = await response.json().catch(() => ({}));
        setCommentError(errorData.message || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setCommentError('Network error while posting comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSubmitComment(e);
                }
              }}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Press Ctrl+Enter to submit
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmittingComment || !newComment.trim()}
            className="flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmittingComment ? 'Posting...' : 'Post Comment'}
          </Button>
          {commentError && (
            <p className="text-red-500 text-sm mt-2">
              {commentError}
            </p>
          )}
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            <button
              onClick={() => {
                // Store the current page for redirect after login
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                }
                router.push('/login');
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </button>{' '}
            to post a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {commentError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-center">
            {commentError}
            <button
              onClick={() => {
                setCommentError('');
                fetchComments();
              }}
              className="ml-2 text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}
        
        {isLoadingComments ? (
          <p className="text-gray-500 text-center py-8">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b pb-4 last:border-b-0">
              {/* Main Comment */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {comment.user?.avatarUrl ? (
                    <img 
                      src={comment.user.avatarUrl} 
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(comment.user)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Link 
                      href={`/user/${comment.userId}`}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      <span className="font-medium text-gray-900">
                        {comment.user?.firstName && comment.user?.lastName 
                          ? `${comment.user.firstName} ${comment.user.lastName}`
                          : comment.user?.username || comment.user?.name || comment.user?.email || 'Anonymous'
                        }
                      </span>
                    </Link>
                    <span className="text-gray-500 text-sm ml-2">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  
                  {/* Comment Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {comment._count?.likes || 0} likes
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {comment._count?.replies || 0} replies
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 mt-4 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {reply.user?.avatarUrl ? (
                          <img 
                            src={reply.user.avatarUrl} 
                            alt={reply.user.username}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium">
                            {getInitials(reply.user)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Link 
                            href={`/user/${reply.userId}`}
                            className="flex items-center hover:text-blue-600 transition-colors"
                          >
                            <span className="font-medium text-gray-900 text-sm">
                              {reply.user?.firstName && reply.user?.lastName 
                                ? `${reply.user.firstName} ${reply.user.lastName}`
                                : reply.user?.username || reply.user?.name || reply.user?.email || 'Anonymous'
                              }
                            </span>
                          </Link>
                          <span className="text-gray-500 text-xs ml-2">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-1">{reply.content}</p>
                        
                        {/* Reply Stats */}
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {reply._count?.likes || 0} likes
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
