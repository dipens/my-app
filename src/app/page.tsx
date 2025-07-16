'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import PostCard from '@/components/PostCard';

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

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  subcategories: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export default function Home() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchCategories();
      fetchPosts();
    }
  }, [mounted, selectedCategory, selectedSubcategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = '/api/posts?page=1&limit=20';
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedSubcategory) url += `&subcategory=${selectedSubcategory}`;

      const response = await fetch(url);
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categorySlug: string | null, subcategorySlug: string | null = null) => {
    setSelectedCategory(categorySlug);
    setSelectedSubcategory(subcategorySlug);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategoryFilter}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedCategory ? 
                      categories.find(c => c.slug === selectedCategory)?.name || 'Category' :
                      'DealHub Forum'
                    }
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {selectedCategory ? 
                      `Discover the best deals in ${categories.find(c => c.slug === selectedCategory)?.name}` :
                      'Discover and share the best deals from your favorite stores'
                    }
                  </p>
                </div>
                {session && (
                  <Link
                    href="/posts/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Post
                  </Link>
                )}
              </div>
            </div>

            {/* Filter Breadcrumb */}
            {(selectedCategory || selectedSubcategory) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <button
                    onClick={() => handleCategoryFilter(null)}
                    className="hover:text-blue-600"
                  >
                    All Categories
                  </button>
                  {selectedCategory && (
                    <>
                      <span className="mx-2">/</span>
                      <button
                        onClick={() => handleCategoryFilter(selectedCategory)}
                        className="hover:text-blue-600"
                      >
                        {categories.find(c => c.slug === selectedCategory)?.name}
                      </button>
                    </>
                  )}
                  {selectedSubcategory && (
                    <>
                      <span className="mx-2">/</span>
                      <span className="text-gray-900">
                        {categories
                          .find(c => c.slug === selectedCategory)
                          ?.subcategories.find(s => s.slug === selectedSubcategory)?.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Posts List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" suppressHydrationWarning>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h6a2 2 0 002-2V8m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to share a great deal in this category!
                </p>
                {session && (
                  <Link
                    href="/posts/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create First Post
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}