'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: number;
  title: string;
  excerpt: string;
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

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const netScore = post.upvotes - post.downvotes;

  const handleCategoryClick = (categorySlug: string, subcategorySlug?: string) => {
    const params = new URLSearchParams();
    params.set('category', categorySlug);
    if (subcategorySlug) params.set('subcategory', subcategorySlug);
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
      post.isPinned ? 'border-yellow-300 bg-yellow-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {post.isPinned && (
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" suppressHydrationWarning>
              <path d="M4 3a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V3zM3 8a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
            </svg>
          )}
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: post.category.color }}
          />
          <button
            onClick={() => handleCategoryClick(post.category.slug)}
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors"
          >
            {post.category.name}
          </button>
          {post.subcategory && (
            <>
              <span className="text-gray-400">•</span>
              <button
                onClick={() => handleCategoryClick(post.category.slug, post.subcategory.slug)}
                className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors"
              >
                {post.subcategory.name}
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span className={`px-2 py-1 rounded-full text-xs ${
            post.isOnline ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {post.isOnline ? 'Online' : 'In-Store'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <Link href={`/posts/${post.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer mb-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
      </div>

      {/* Deal Info */}
      {(post.dealPrice || post.storeName) && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {post.dealPrice && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">{post.dealPrice}</span>
                  {post.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">{post.originalPrice}</span>
                  )}
                </div>
              )}
              {post.storeName && (
                <span className="text-sm font-medium text-gray-700">{post.storeName}</span>
              )}
            </div>
            {post.dealUrl && (
              <Link
                href={post.dealUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Deal →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Vote Score */}
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" suppressHydrationWarning>
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className={`text-sm font-medium ${
              netScore > 0 ? 'text-green-600' : netScore < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {netScore > 0 ? `+${netScore}` : netScore}
            </span>
          </div>

          {/* Comments */}
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" suppressHydrationWarning>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm text-gray-600">{post.commentCount}</span>
          </div>

          {/* Author */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.displayName}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <span className="text-xs text-gray-600">
                  {post.author.displayName[0]}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">{post.author.displayName}</span>
          </div>
        </div>

        <span className="text-sm text-gray-500" suppressHydrationWarning>
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}