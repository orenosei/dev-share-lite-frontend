'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks';
import { postsService } from '../../services';

export default function NotificationTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [postId, setPostId] = useState('');
  const [commentId, setCommentId] = useState('');
  const [message, setMessage] = useState('');

  const createTestPost = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const result = await postsService.createPost({
        title: 'Test Post for Notifications',
        content: 'This is a test post to generate notifications when liked or commented.',
        tags: ['test', 'notifications']
      });
      
      if (result.success) {
        setPostId(result.data.id);
        setMessage(`Created test post with ID: ${result.data.id}`);
      } else {
        setMessage('Failed to create test post');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const result = await postsService.likePost(postId);
      setMessage(result.success ? 'Post liked!' : 'Failed to like post');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-2xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to test notifications.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification System Test</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use this page to test the notification system by creating posts and interactions.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current User: {user?.firstName} {user?.lastName}</Label>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={createTestPost} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Test Post'}
            </Button>
          </div>

          {postId && (
            <div className="space-y-2">
              <Label>Test Post ID: {postId}</Label>
              <Button 
                onClick={likePost} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Liking...' : 'Like Test Post'}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="postId">Post ID for testing:</Label>
            <Input
              id="postId"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              placeholder="Enter post ID to test with"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commentId">Comment ID for testing:</Label>
            <Input
              id="commentId"
              value={commentId}
              onChange={(e) => setCommentId(e.target.value)}
              placeholder="Enter comment ID to test with"
            />
          </div>

          {message && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-sm text-blue-800 dark:text-blue-200">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>Create a test post using the button above</li>
            <li>Note the post ID that gets created</li>
            <li>Log in with a different user account</li>
            <li>Like or comment on the post</li>
            <li>Switch back to the original user to see notifications in the bell icon</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Notifications are only created when a different user interacts with your content.
              Self-interactions (liking your own post) won't generate notifications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
