'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import Header from '@/components/Header';
import VoteButtons from '@/components/VoteButtons';
import CommentSection from '@/components/CommentSection';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Post {
  id: number;
  title: string;
  content: string;
  dealUrl?: string;
  dealPrice?: string;
  originalPrice?: string;
  storeName?: string;
  isOnline: boolean;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
  subcategory?: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function PostDetail() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Post not found');
      } else {
        setPost(data.post);
      }
    } catch (error) {
      setError('Failed to load post');
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (newUpvotes: number, newDownvotes: number) => {
    if (post) {
      setPost({
        ...post,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      });
    }
  };

  const handleCategoryClick = (
    categorySlug: string,
    subcategorySlug?: string
  ) => {
    const params = new URLSearchParams();
    params.set('category', categorySlug);
    if (subcategorySlug) params.set('subcategory', subcategorySlug);

    router.push(`/?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                suppressHydrationWarning
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Post not found'}
            </h2>
            <p className="text-gray-600">
              The post you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const netScore = post.upvotes - post.downvotes;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <button
              onClick={() => router.push('/')}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <span className="mx-2">/</span>
            <button
              onClick={() => handleCategoryClick(post.category.slug)}
              className="hover:text-blue-600 transition-colors"
            >
              {post.category.name}
            </button>
            {post.subcategory && (
              <>
                <span className="mx-2">/</span>
                <button
                  onClick={() =>
                    handleCategoryClick(
                      post.category.slug,
                      post.subcategory.slug
                    )
                  }
                  className="hover:text-blue-600 transition-colors"
                >
                  {post.subcategory.name}
                </button>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium truncate max-w-md">
              {post.title}
            </span>
          </div>
        </div>
        {/* Main Post */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {post.isPinned && (
                  <svg
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    suppressHydrationWarning
                  >
                    <path d="M4 3a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V3zM3 8a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
                  </svg>
                )}
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: post.category.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {post.category.name}
                </span>
                {post.subcategory && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      {post.subcategory.name}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    post.isOnline
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {post.isOnline ? 'Online Deal' : 'In-Store Deal'}
                </span>
                {session?.user?.email === post.author.username && (
                  <button
                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {post.title}
            </h1>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">
                      {post.author.displayName[0]}
                    </span>
                  )}
                </div>
                <span className="font-medium">{post.author.displayName}</span>
              </div>
              <span>•</span>
              <span suppressHydrationWarning>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {/* Deal Information */}
          {(post.dealPrice || post.storeName || post.dealUrl) && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Deal Information
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {post.dealPrice && (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">
                        {post.dealPrice}
                      </span>
                      {post.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          {post.originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                  {post.storeName && (
                    <div>
                      <span className="text-sm text-gray-500">Store:</span>
                      <span className="ml-1 font-medium text-gray-700">
                        {post.storeName}
                      </span>
                    </div>
                  )}
                </div>
                {post.dealUrl && (
                  <a
                    href={post.dealUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Deal →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <MarkdownRenderer
                content={post.content}
                className="text-gray-700 leading-relaxed"
              />
            </div>
          </div>

          {/* Vote and Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <VoteButtons
                postId={post.id}
                initialUpvotes={post.upvotes}
                initialDownvotes={post.downvotes}
                onVoteUpdate={handleVoteUpdate}
              />

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    suppressHydrationWarning
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>{post.commentCount} comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
