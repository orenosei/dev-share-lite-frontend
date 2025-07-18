'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useToast, useAlertDialogContext } from '../../../../hooks';
import { commentsService } from '../../../../services';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { MarkdownEditor } from '../../../../components/MarkdownEditor';
import { MarkdownContent } from '../../../../components/MarkdownContent';
import { 
  Heart, 
  MessageCircle, 
  Send,
  Reply,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function CommentSection({ postId, initialComments = [] }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const { showDeleteConfirm } = useAlertDialogContext();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [likingComments, setLikingComments] = useState(new Set());
  const [deletingComments, setDeletingComments] = useState(new Set());

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

  const isCommentLikedByUser = (comment, userId) => {
    if (!comment || !userId) return false;
    
    // Check if likes array exists and contains the user
    if (comment.likes && Array.isArray(comment.likes)) {
      return comment.likes.some(like => like.userId === userId || like.userId === String(userId));
    }
    
    return false;
  };

  const commentStats = useMemo(() => {
    if (!comments || comments.length === 0) {
      return { total: 0, parentCount: 0 };
    }
    
    const parentCount = comments.length;
    const replyCount = comments.reduce((total, comment) => {
      return total + (comment.replies ? comment.replies.length : 0);
    }, 0);
    
    return {
      total: parentCount + replyCount,
      parentCount
    };
  }, [comments]);

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
      const result = await commentsService.getCommentsByPost(postId);
      
      if (result.success) {
        setComments(result.data);
      } else {
        console.error('Error fetching comments:', result.error);
        setCommentError(result.error);
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
      const result = await commentsService.createComment({
        content: newComment,
        postId: parseInt(postId),
        userId: user.id,
        parentId: null // Top-level comment
      });

      if (result.success) {
        setNewComment('');
        fetchComments(); // Refresh comments
      } else {
        setCommentError(result.error);
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setCommentError('Network error while posting comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (e, parentCommentId) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Store the current page for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
      return;
    }

    if (!replyText.trim()) {
      return;
    }

    setIsSubmittingReply(true);
    setCommentError('');

    try {
      const result = await commentsService.createComment({
        content: replyText,
        postId: parseInt(postId),
        userId: user.id,
        parentId: parentCommentId
      });

      if (result.success) {
        setReplyText('');
        setReplyingTo(null);
        fetchComments(); // Refresh comments
      } else {
        setCommentError(result.error);
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      setCommentError('Network error while posting reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLikeComment = async (commentId, isCurrentlyLiked) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
      return;
    }

    if (likingComments.has(commentId)) return; // Prevent multiple clicks

    setLikingComments(prev => new Set(prev).add(commentId));

    try {
      const result = await commentsService.likeComment(commentId, user.id);

      if (result.success) {
        // Update comments state to reflect the like/unlike
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === commentId) {
              const userLiked = isCommentLikedByUser(comment, user.id);
              return {
                ...comment,
                _count: {
                  ...comment._count,
                  likes: userLiked ? (comment._count?.likes || 1) - 1 : (comment._count?.likes || 0) + 1
                },
                likes: userLiked 
                  ? (comment.likes || []).filter(like => like.userId !== user.id && like.userId !== String(user.id))
                  : [...(comment.likes || []), { userId: user.id }]
              };
            }
            
            // Handle replies
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply.id === commentId) {
                    const userLiked = isCommentLikedByUser(reply, user.id);
                    return {
                      ...reply,
                      _count: {
                        ...reply._count,
                        likes: userLiked ? (reply._count?.likes || 1) - 1 : (reply._count?.likes || 0) + 1
                      },
                      likes: userLiked 
                        ? (reply.likes || []).filter(like => like.userId !== user.id && like.userId !== String(user.id))
                        : [...(reply.likes || []), { userId: user.id }]
                    };
                  }
                  return reply;
                })
              };
            }
            
            return comment;
          })
        );
      } else {
        console.error('Error liking comment:', result.error);
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    } finally {
      setLikingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleDeleteComment = async (commentId, isParent = false) => {
    const title = 'Delete Comment';
    const description = `Are you sure you want to delete this comment${isParent ? ' and all its replies' : ''}? This action cannot be undone.`;
    
    showDeleteConfirm({
      title,
      description,
      onConfirm: async () => {
        if (deletingComments.has(commentId)) return;

        setDeletingComments(prev => new Set(prev).add(commentId));

        try {
          const result = await commentsService.deleteComment(commentId, user.id);

          if (result.success) {
            fetchComments(); // Refresh comments
          } else {
            console.error('Error deleting comment:', result.error);
            showError('Delete failed', 'Failed to delete comment');
          }
        } catch (err) {
          console.error('Error deleting comment:', err);
          showError('Network error', 'Network error while deleting comment');
        } finally {
          setDeletingComments(prev => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
          });
        }
      }
    });
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) {
      return;
    }

    setIsSubmittingEdit(true);
    setCommentError('');

    try {
      const result = await commentsService.updateComment(commentId, {
        content: editText
      }, user.id);

      if (result.success) {
        setEditingComment(null);
        setEditText('');
        fetchComments(); // Refresh comments
      } else {
        setCommentError(result.error);
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      setCommentError('Network error while updating comment');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const startEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
    // Close reply form if open
    setReplyingTo(null);
    setReplyText('');
  };

  const cancelEditComment = () => {
    setEditingComment(null);
    setEditText('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Comments ({commentStats.total})
        </h2>
        {commentStats.total > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {commentStats.parentCount} {commentStats.parentCount === 1 ? 'thread' : 'threads'}
          </div>
        )}
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="mb-4">
            <MarkdownEditor
              value={newComment}
              onChange={setNewComment}
              height={150}
              preview="live"
              hideToolbar={false}
              placeholder="Write a comment using Markdown..."
              data-color-mode="auto"
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports Markdown formatting
            </p>
            <Button 
              type="submit" 
              disabled={isSubmittingComment || !newComment.trim()}
              className="flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmittingComment ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
          {commentError && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-2">
              {commentError}
            </p>
          )}
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-300">
            <button
              onClick={() => {
                // Store the current page for redirect after login
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                }
                router.push('/login');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : commentError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
            {commentError}
            <button 
              onClick={fetchComments}
              className="ml-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
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
                      className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comment.user?.firstName && comment.user?.lastName 
                          ? `${comment.user.firstName} ${comment.user.lastName}`
                          : comment.user?.username || comment.user?.name || comment.user?.email || 'Anonymous'
                        }
                      </span>
                    </Link>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 mb-2">
                    {editingComment === comment.id ? (
                      <div className="space-y-3">
                        <MarkdownEditor
                          value={editText}
                          onChange={setEditText}
                          height={120}
                          preview="live"
                          hideToolbar={false}
                          placeholder="Edit your comment..."
                          data-color-mode="auto"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Supports Markdown formatting
                          </p>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={cancelEditComment}
                              disabled={isSubmittingEdit}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleEditComment(comment.id)}
                              disabled={isSubmittingEdit || !editText.trim()}
                              className="flex items-center"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              {isSubmittingEdit ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <MarkdownContent content={comment.content} />
                    )}
                  </div>
                  
                  {/* Comment Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    {isAuthenticated && user ? (
                      <button
                        onClick={() => {
                          const isLiked = isCommentLikedByUser(comment, user.id);
                          handleLikeComment(comment.id, isLiked);
                        }}
                        disabled={likingComments.has(comment.id)}
                        className={`flex items-center transition-colors ${
                          isCommentLikedByUser(comment, user.id)
                            ? 'text-red-500 hover:text-red-600'
                            : 'hover:text-red-500'
                        } ${likingComments.has(comment.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Heart 
                          className={`w-4 h-4 mr-1 transition-all ${
                            isCommentLikedByUser(comment, user.id) ? 'fill-current' : ''
                          }`} 
                        />
                        {likingComments.has(comment.id) ? 'Liking...' : `${comment._count?.likes || 0} Likes`}
                      </button>
                    ) : (
                      <div className="flex items-center text-gray-400 dark:text-gray-500">
                        <Heart className="w-4 h-4 mr-1" />
                        {comment._count?.likes || 0} Likes
                      </div>
                    )}
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {comment._count?.replies || 0} replies
                    </span>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          if (typeof window !== 'undefined') {
                            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                          }
                          router.push('/login');
                          return;
                        }
                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                        setReplyText('');
                        // Close edit form if open
                        setEditingComment(null);
                        setEditText('');
                      }}
                      className={`flex items-center transition-colors ${
                        isAuthenticated ? 'hover:text-blue-600 dark:hover:text-blue-400' : 'hover:text-blue-500 dark:hover:text-blue-400 text-gray-400 dark:text-gray-500'
                      }`}
                      title={!isAuthenticated ? 'Login to reply' : 'Reply to this comment'}
                    >
                      <Reply className="w-4 h-4 mr-1" />
                      Reply
                    </button>
                    {/* Edit button for own comments */}
                    {isAuthenticated && user && comment.userId === user.id && editingComment !== comment.id && (
                      <button
                        onClick={() => startEditComment(comment)}
                        className="flex items-center hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                        title="Edit comment"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    )}
                    {/* Delete button for own comments */}
                    {isAuthenticated && user && comment.userId === user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id, true)}
                        disabled={deletingComments.has(comment.id)}
                        className="flex items-center hover:text-red-700 dark:hover:text-red-400 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {deletingComments.has(comment.id) ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-11 mt-4">
                  <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="space-y-3">
                    <MarkdownEditor
                      value={replyText}
                      onChange={setReplyText}
                      height={120}
                      preview="live"
                      hideToolbar={false}
                      placeholder={`Reply to ${comment.user?.firstName && comment.user?.lastName 
                        ? `${comment.user.firstName} ${comment.user.lastName}`
                        : comment.user?.username || comment.user?.name || 'this comment'
                      }...`}
                      data-color-mode="auto"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supports Markdown formatting
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingReply || !replyText.trim()}
                          className="flex items-center"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          {isSubmittingReply ? 'Posting...' : 'Reply'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              
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
                          <div className="w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white text-xs font-medium">
                            {getInitials(reply.user)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Link 
                            href={`/user/${reply.userId}`}
                            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {reply.user?.firstName && reply.user?.lastName 
                                ? `${reply.user.firstName} ${reply.user.lastName}`
                                : reply.user?.username || reply.user?.name || reply.user?.email || 'Anonymous'
                              }
                            </span>
                          </Link>
                          <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 text-sm mb-1">
                          {editingComment === reply.id ? (
                            <div className="space-y-3">
                              <MarkdownEditor
                                value={editText}
                                onChange={setEditText}
                                height={100}
                                preview="live"
                                hideToolbar={false}
                                placeholder="Edit your reply..."
                                data-color-mode="auto"
                              />
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Supports Markdown formatting
                                </p>
                                <div className="flex space-x-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditComment}
                                    disabled={isSubmittingEdit}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleEditComment(reply.id)}
                                    disabled={isSubmittingEdit || !editText.trim()}
                                    className="flex items-center"
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    {isSubmittingEdit ? 'Saving...' : 'Save'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <MarkdownContent content={reply.content} />
                          )}
                        </div>
                        
                        {/* Reply Stats */}
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          {isAuthenticated && user ? (
                            <button
                              onClick={() => {
                                const isLiked = isCommentLikedByUser(reply, user.id);
                                handleLikeComment(reply.id, isLiked);
                              }}
                              disabled={likingComments.has(reply.id)}
                              className={`flex items-center transition-colors ${
                                isCommentLikedByUser(reply, user.id)
                                  ? 'text-red-500 hover:text-red-600'
                                  : 'hover:text-red-500'
                              } ${likingComments.has(reply.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <Heart 
                                className={`w-3 h-3 mr-1 transition-all ${
                                  isCommentLikedByUser(reply, user.id) ? 'fill-current' : ''
                                }`} 
                              />
                              {likingComments.has(reply.id) ? 'Liking...' : `${reply._count?.likes || 0} Likes`}
                            </button>
                          ) : (
                            <div className="flex items-center text-gray-400 dark:text-gray-500">
                              <Heart className="w-3 h-3 mr-1" />
                              {reply._count?.likes || 0} Likes
                            </div>
                          )}
                          {/* Edit button for own replies */}
                          {isAuthenticated && user && reply.userId === user.id && editingComment !== reply.id && (
                            <button
                              onClick={() => startEditComment(reply)}
                              className="flex items-center hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                              title="Edit reply"
                            >
                              <Edit3 className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                          )}
                          {/* Delete button for own replies */}
                          {isAuthenticated && user && reply.userId === user.id && (
                            <button
                              onClick={() => handleDeleteComment(reply.id, false)}
                              disabled={deletingComments.has(reply.id)}
                              className="flex items-center hover:text-red-700 dark:hover:text-red-400 transition-colors"
                              title="Delete reply"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              {deletingComments.has(reply.id) ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
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
