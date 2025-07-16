import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { votes, posts, comments } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type, postId, commentId } = await request.json();
    const userId = parseInt(session.user.id);

    if (!type || (!postId && !commentId)) {
      return NextResponse.json(
        { error: 'Vote type and either postId or commentId are required' },
        { status: 400 }
      );
    }

    if (type !== 'up' && type !== 'down') {
      return NextResponse.json(
        { error: 'Vote type must be "up" or "down"' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    let existingVote;
    if (postId) {
      existingVote = await db.select().from(votes).where(
        and(eq(votes.userId, userId), eq(votes.postId, postId))
      ).limit(1);
    } else {
      existingVote = await db.select().from(votes).where(
        and(eq(votes.userId, userId), eq(votes.commentId, commentId))
      ).limit(1);
    }

    if (existingVote[0]) {
      // User has already voted
      if (existingVote[0].type === type) {
        // Remove vote if clicking same vote type
        await db.delete(votes).where(eq(votes.id, existingVote[0].id));
        
        // Update vote counts
        await updateVoteCounts(postId, commentId);
        
        return NextResponse.json({ message: 'Vote removed' });
      } else {
        // Update vote type if different
        await db.update(votes)
          .set({ type })
          .where(eq(votes.id, existingVote[0].id));
        
        // Update vote counts
        await updateVoteCounts(postId, commentId);
        
        return NextResponse.json({ message: 'Vote updated' });
      }
    } else {
      // Create new vote
      await db.insert(votes).values({
        userId,
        postId: postId || null,
        commentId: commentId || null,
        type,
      });
      
      // Update vote counts
      await updateVoteCounts(postId, commentId);
      
      return NextResponse.json(
        { message: 'Vote created' },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error handling vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateVoteCounts(postId?: number, commentId?: number) {
  if (postId) {
    // Update post vote counts
    const upvoteCount = await db.select({ count: sql<number>`count(*)` })
      .from(votes)
      .where(and(eq(votes.postId, postId), eq(votes.type, 'up')));
    
    const downvoteCount = await db.select({ count: sql<number>`count(*)` })
      .from(votes)
      .where(and(eq(votes.postId, postId), eq(votes.type, 'down')));

    await db.update(posts)
      .set({
        upvotes: upvoteCount[0].count,
        downvotes: downvoteCount[0].count,
      })
      .where(eq(posts.id, postId));
  } else if (commentId) {
    // Update comment vote counts
    const upvoteCount = await db.select({ count: sql<number>`count(*)` })
      .from(votes)
      .where(and(eq(votes.commentId, commentId), eq(votes.type, 'up')));
    
    const downvoteCount = await db.select({ count: sql<number>`count(*)` })
      .from(votes)
      .where(and(eq(votes.commentId, commentId), eq(votes.type, 'down')));

    await db.update(comments)
      .set({
        upvotes: upvoteCount[0].count,
        downvotes: downvoteCount[0].count,
      })
      .where(eq(comments.id, commentId));
  }
}