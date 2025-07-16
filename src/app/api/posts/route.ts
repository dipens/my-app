import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { posts, categories, subcategories, users } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = and(eq(posts.isActive, true));

    if (category) {
      const categoryData = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category))
        .limit(1);
      if (categoryData[0]) {
        whereClause = and(
          whereClause,
          eq(posts.categoryId, categoryData[0].id)
        );
      }
    }

    if (subcategory) {
      const subcategoryData = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.slug, subcategory))
        .limit(1);
      if (subcategoryData[0]) {
        whereClause = and(
          whereClause,
          eq(posts.subcategoryId, subcategoryData[0].id)
        );
      }
    }

    const postsData = await db
      .select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        dealUrl: posts.dealUrl,
        dealPrice: posts.dealPrice,
        originalPrice: posts.originalPrice,
        storeName: posts.storeName,
        isOnline: posts.isOnline,
        upvotes: posts.upvotes,
        downvotes: posts.downvotes,
        commentCount: posts.commentCount,
        isPinned: posts.isPinned,
        createdAt: posts.createdAt,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
        subcategory: {
          id: subcategories.id,
          name: subcategories.name,
          slug: subcategories.slug,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(subcategories, eq(posts.subcategoryId, subcategories.id))
      .where(whereClause)
      .orderBy(desc(posts.isPinned), desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ posts: postsData });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      content,
      categoryId,
      subcategoryId,
      dealUrl,
      dealPrice,
      originalPrice,
      storeName,
      isOnline = true,
    } = await request.json();

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const excerpt =
      content.substring(0, 200) + (content.length > 200 ? '...' : '');

    const newPost = await db
      .insert(posts)
      .values({
        title,
        content,
        excerpt,
        authorId: parseInt(session.user.id),
        categoryId,
        subcategoryId,
        dealUrl: dealUrl || null,
        dealPrice: dealPrice || null,
        originalPrice: originalPrice || null,
        storeName: storeName || null,
        isOnline,
      })
      .returning();

    return NextResponse.json(
      { message: 'Post created successfully', post: newPost[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
