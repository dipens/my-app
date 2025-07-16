import { categories, comments, posts, subcategories, users } from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';

// Database model types
export type User = InferSelectModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type Comment = InferSelectModel<typeof comments>;
export type Category = InferSelectModel<typeof categories>;
export type Subcategory = InferSelectModel<typeof subcategories>;

// Extended types for API responses
export interface PostWithRelations {
  id: number;
  title: string;
  content: string;
  excerpt?: string | null;
  dealUrl?: string;
  dealPrice?: string;
  originalPrice?: string;
  storeName?: string;
  isOnline: boolean;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  isActive: boolean;
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

export interface CommentWithAuthor {
  id: number;
  content: string;
  parentId: number | null;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    displayName: string;
    avatar: string | null;
  } | null;
  replies?: CommentWithAuthor[];
}

export interface CategoryWithSubcategories {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  createdAt: string;
  subcategories: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    createdAt: string;
  }[];
}

// Form types
export interface CreatePostFormData {
  title: string;
  content: string;
  categoryId: string;
  subcategoryId: string;
  dealUrl: string;
  dealPrice: string;
  originalPrice: string;
  storeName: string;
  isOnline: boolean;
}

export interface UpdatePostFormData {
  title: string;
  content: string;
  categoryId: string;
  subcategoryId: string;
  dealUrl: string;
  dealPrice: string;
  originalPrice: string;
  storeName: string;
  isOnline: boolean;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PostsResponse {
  posts: PostWithRelations[];
}

export interface PostResponse {
  post: PostWithRelations;
}

export interface CommentsResponse {
  comments: CommentWithAuthor[];
}

export interface CategoriesResponse {
  categories: CategoryWithSubcategories[];
}

// Session user type
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username: string;
}
