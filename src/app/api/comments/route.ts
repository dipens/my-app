import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { comments, users, posts } from '@/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const commentsData = await db
      .select({
        id: comments.id,
        content: comments.content,
        parentId: comments.parentId,
        upvotes: comments.upvotes,
        downvotes: comments.downvotes,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(
        and(eq(comments.postId, parseInt(postId)), eq(comments.isActive, true))
      )
      .orderBy(desc(comments.createdAt));

    // Organize comments into a tree structure
    const commentTree = organizeComments(commentsData);

    return NextResponse.json({ comments: commentTree });
  } catch (error) {
    console.error('Error fetching comments:', error);
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

    const { content, postId, parentId } = await request.json();

    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Content and post ID are required' },
        { status: 400 }
      );
    }

    // Verify post exists
    const postExists = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!postExists[0]) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If parentId is provided, verify parent comment exists
    if (parentId) {
      const parentExists = await db
        .select()
        .from(comments)
        .where(eq(comments.id, parentId))
        .limit(1);
      if (!parentExists[0]) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    const newComment = await db
      .insert(comments)
      .values({
        content,
        authorId: parseInt(session.user.id),
        postId,
        parentId: parentId || null,
      })
      .returning();

    // Update post comment count
    await db
      .update(posts)
      .set({
        commentCount: db
          .select({ count: comments.id })
          .from(comments)
          .where(eq(comments.postId, postId)),
      })
      .where(eq(posts.id, postId));

    return NextResponse.json(
      { message: 'Comment created successfully', comment: newComment[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function organizeComments(comments: any[]): any[] {
  const commentMap = new Map();
  const rootComments: any[] = [];

  // First pass: create comment objects with replies array
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: organize into tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id);
    if (comment.parentId === null) {
      rootComments.push(commentWithReplies);
    } else {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(commentWithReplies);
      }
    }
  });

  return rootComments;
}
