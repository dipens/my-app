'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface VoteButtonsProps {
  postId?: number;
  commentId?: number;
  initialUpvotes: number;
  initialDownvotes: number;
  onVoteUpdate: (upvotes: number, downvotes: number) => void;
}

export default function VoteButtons({
  postId,
  commentId,
  initialUpvotes,
  initialDownvotes,
  onVoteUpdate,
}: VoteButtonsProps) {
  const { data: session } = useSession();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const netScore = upvotes - downvotes;

  const handleVote = async (type: 'up' | 'down') => {
    if (!session) {
      // Redirect to login or show message
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          postId,
          commentId,
        }),
      });

      if (response.ok) {
        // Optimistically update the UI
        let newUpvotes = upvotes;
        let newDownvotes = downvotes;

        if (userVote === type) {
          // Removing vote
          if (type === 'up') {
            newUpvotes = Math.max(0, upvotes - 1);
          } else {
            newDownvotes = Math.max(0, downvotes - 1);
          }
          setUserVote(null);
        } else if (userVote === null) {
          // Adding new vote
          if (type === 'up') {
            newUpvotes = upvotes + 1;
          } else {
            newDownvotes = downvotes + 1;
          }
          setUserVote(type);
        } else {
          // Changing vote
          if (type === 'up') {
            newUpvotes = upvotes + 1;
            newDownvotes = Math.max(0, downvotes - 1);
          } else {
            newDownvotes = downvotes + 1;
            newUpvotes = Math.max(0, upvotes - 1);
          }
          setUserVote(type);
        }

        setUpvotes(newUpvotes);
        setDownvotes(newDownvotes);
        onVoteUpdate(newUpvotes, newDownvotes);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        disabled={loading || !session}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
          userVote === 'up'
            ? 'bg-green-100 text-green-700'
            : 'text-gray-600 hover:bg-gray-100'
        } ${!session ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          suppressHydrationWarning
        >
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium">{upvotes}</span>
      </button>

      {/* Net Score */}
      <span
        className={`text-sm font-bold ${
          netScore > 0
            ? 'text-green-600'
            : netScore < 0
              ? 'text-red-600'
              : 'text-gray-600'
        }`}
      >
        {netScore > 0 ? `+${netScore}` : netScore}
      </span>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        disabled={loading || !session}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
          userVote === 'down'
            ? 'bg-red-100 text-red-700'
            : 'text-gray-600 hover:bg-gray-100'
        } ${!session ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          suppressHydrationWarning
        >
          <path
            fillRule="evenodd"
            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium">{downvotes}</span>
      </button>

      {!session && (
        <span className="text-xs text-gray-500 ml-2">Sign in to vote</span>
      )}
    </div>
  );
}
