'use client';

import { useEffect, useState } from 'react';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  siteId: string;
  status: 'approved' | 'pending' | 'spam';
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?filter=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (commentId: string, status: 'approved' | 'spam') => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update comment');
      
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, status } : c));
    } catch (error) {
      console.error('Error moderating comment:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Comments Moderation</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
        >
          Approved
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No comments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold">{comment.authorName}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  comment.status === 'approved' ? 'bg-green-100 text-green-800' :
                  comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {comment.status}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{comment.content}</p>
              
              {comment.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModerate(comment.id, 'approved')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleModerate(comment.id, 'spam')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Mark as Spam
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}