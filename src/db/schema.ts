import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  displayName: text('display_name').notNull(),
  avatar: text('avatar'),
  provider: text('provider').default('credentials'),
  providerId: text('provider_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color').default('#3B82F6'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subcategories = pgTable(
  'subcategories',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    categoryId: integer('category_id').references(() => categories.id),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => ({
    uniqueSlugPerCategory: unique().on(table.slug, table.categoryId),
  })
);

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  authorId: integer('author_id').references(() => users.id),
  categoryId: integer('category_id').references(() => categories.id),
  subcategoryId: integer('subcategory_id').references(() => subcategories.id),
  dealUrl: text('deal_url'),
  dealPrice: text('deal_price'),
  originalPrice: text('original_price'),
  storeName: text('store_name'),
  isOnline: boolean('is_online').default(true),
  upvotes: integer('upvotes').default(0),
  downvotes: integer('downvotes').default(0),
  commentCount: integer('comment_count').default(0),
  isActive: boolean('is_active').default(true),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id),
  postId: integer('post_id').references(() => posts.id),
  parentId: integer('parent_id').references(() => comments.id),
  upvotes: integer('upvotes').default(0),
  downvotes: integer('downvotes').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const votes = pgTable(
  'votes',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    postId: integer('post_id').references(() => posts.id),
    commentId: integer('comment_id').references(() => comments.id),
    type: text('type', { enum: ['up', 'down'] }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => ({
    uniqueUserPost: unique().on(table.userId, table.postId),
    uniqueUserComment: unique().on(table.userId, table.commentId),
  })
);

export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  posts: many(posts),
}));

export const subcategoryRelations = relations(
  subcategories,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [subcategories.categoryId],
      references: [categories.id],
    }),
    posts: many(posts),
  })
);

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [posts.subcategoryId],
    references: [subcategories.id],
  }),
  comments: many(comments),
  votes: many(votes),
}));

export const commentRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
  votes: many(votes),
}));

export const voteRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}));
