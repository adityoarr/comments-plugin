'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import type { WidgetMessage } from '@/types/widget';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  isAnonymous: boolean;
  authorId: string;
}

// Komponen utama yang menggunakan useSearchParams
function EmbedWidgetContent() {
  const searchParams = useSearchParams();
  const threadId = searchParams.get('threadId');
  const host = searchParams.get('host');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<{ cursorTime: number; cursorId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Helper untuk mendapatkan token
  const getToken = async () => {
    let currentUser = auth.currentUser;
    if (!currentUser) {
      const userCredential = await signInAnonymously(auth);
      currentUser = userCredential.user;
    }
    return await currentUser.getIdToken(true);
  };

  // Fetch Comments
  const fetchComments = async (isLoadMore = false) => {
    if (!threadId) return;
    
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const params = new URLSearchParams({ threadId, limit: '10' });
      
      const response = await fetch(`/comments-plugin/api/comments?${params.toString()}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (isLoadMore) {
        setComments(prev => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load comments. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [threadId]);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && window.parent) {
        const height = containerRef.current.scrollHeight;
        const message: WidgetMessage = { type: 'RESIZE', payload: { height } };
        window.parent.postMessage(message, '*');
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [comments, loading, error]);

  // Post Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !threadId) return;

    try {
      setIsPosting(true);
      setError(null);

      const token = await getToken();
      
      const payloadBase64 = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));
      setCurrentUserId(decoded.uid);

      const response = await fetch('/comments-plugin/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          content: newComment,
          firebaseIdToken: token,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server error - check console');
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to post comment');
      }

      const createdComment = await response.json();
      setComments(prev => [createdComment, ...prev]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsPosting(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/comments-plugin/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseIdToken: token }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete comment');
      }

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  return (
    <div ref={containerRef} className="min-h-[200px] bg-white p-4 font-sans text-gray-900">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Comments <span className="text-gray-500 text-base font-normal">({comments.length})</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">Thread: {threadId} | Host: {host}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handlePostComment} className="mb-8 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">
          Y
        </div>
        <div className="flex-grow">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Join the discussion..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
            rows={3}
            disabled={isPosting}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!newComment.trim() || isPosting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isPosting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        {loading && comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No comments yet. Be the first!</div>
        ) : (
          comments.map((comment) => {
            const isOwner = currentUserId === comment.authorId;
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 font-bold">
                  {comment.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none relative group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.authorName} {comment.isAnonymous && <span className="text-xs text-gray-500 font-normal">(Anonymous)</span>}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-opacity"
                        title="Delete comment"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-2 flex gap-4">
                    <button className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors">Reply</button>
                    <button className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors">Like</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {nextCursor && (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchComments(true)}
            disabled={loadingMore}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load more comments'}
          </button>
        </div>
      )}
    </div>
  );
}

// Loading fallback component
function EmbedWidgetLoading() {
  return (
    <div className="min-h-[200px] bg-white p-4 font-sans">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Main page component dengan Suspense wrapper
export default function EmbedWidget() {
  return (
    <Suspense fallback={<EmbedWidgetLoading />}>
      <EmbedWidgetContent />
    </Suspense>
  );
}