import { db } from '@/db';
import { categories, comments, posts, subcategories, users } from '@/db/schema';
import { authOptions } from '@/lib/auth';
import { SessionUser } from '@/types';
import { and, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const postData = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
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
        updatedAt: posts.updatedAt,
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
      .where(eq(posts.id, postId))
      .limit(1);

    if (!postData[0]) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post: postData[0] });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);
    const {
      title,
      content,
      categoryId,
      subcategoryId,
      dealUrl,
      dealPrice,
      originalPrice,
      storeName,
      isOnline,
    } = await request.json();

    // Get post with author information for better comparison
    const existingPost = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        subcategoryId: posts.subcategoryId,
        dealUrl: posts.dealUrl,
        dealPrice: posts.dealPrice,
        originalPrice: posts.originalPrice,
        storeName: posts.storeName,
        isOnline: posts.isOnline,
        excerpt: posts.excerpt,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, postId))
      .limit(1);

    if (!existingPost[0]) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check authorization by both ID and username for redundancy
    const sessionUserId = parseInt(session.user.id);
    const sessionUsername = (session.user as SessionUser)?.username;
    const sessionEmail = (session.user as SessionUser)?.email;

    const isAuthorizedById = existingPost[0].authorId === sessionUserId;
    const isAuthorizedByUsername =
      sessionUsername && existingPost[0].author?.username === sessionUsername;
    const isAuthorizedByEmail =
      sessionEmail && existingPost[0].author?.email === sessionEmail;

    if (!isAuthorizedById && !isAuthorizedByUsername && !isAuthorizedByEmail) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      );
    }

    const excerpt = content
      ? content.substring(0, 200) + (content.length > 200 ? '...' : '')
      : existingPost[0].excerpt;

    const updatedPost = await db
      .update(posts)
      .set({
        title: title || existingPost[0].title,
        content: content || existingPost[0].content,
        excerpt,
        categoryId: categoryId || existingPost[0].categoryId,
        subcategoryId: subcategoryId || existingPost[0].subcategoryId,
        dealUrl: dealUrl !== undefined ? dealUrl : existingPost[0].dealUrl,
        dealPrice:
          dealPrice !== undefined ? dealPrice : existingPost[0].dealPrice,
        originalPrice:
          originalPrice !== undefined
            ? originalPrice
            : existingPost[0].originalPrice,
        storeName:
          storeName !== undefined ? storeName : existingPost[0].storeName,
        isOnline: isOnline !== undefined ? isOnline : existingPost[0].isOnline,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning();

    return NextResponse.json({
      message: 'Post updated successfully',
      post: updatedPost[0],
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);

    const existingPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!existingPost[0]) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost[0].authorId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this post' },
        { status: 403 }
      );
    }

    // Check if post has comments
    const commentCount = await db
      .select({ count: comments.id })
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.isActive, true)))
      .limit(1);

    if (commentCount.length > 0 && commentCount[0].count) {
      return NextResponse.json(
        { error: 'Cannot delete post with comments' },
        { status: 400 }
      );
    }

    await db.update(posts).set({ isActive: false }).where(eq(posts.id, postId));

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
