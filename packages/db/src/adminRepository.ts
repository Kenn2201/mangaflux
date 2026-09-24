import {
  count,
  desc,
  eq,
  gt
} from "drizzle-orm";
import type { MangaFluxDatabase } from "./client.js";
import {
  communityComments,
  communityReactions,
  sessions,
  userBookmarks,
  userReadingProgress,
  users
} from "./schema.js";

export async function getAdminOverview(
  db: MangaFluxDatabase
) {
  const now = new Date();

  const [
    userCount,
    activeSessionCount,
    commentCount,
    reactionCount,
    bookmarkCount,
    progressCount,
    recentUsers,
    recentComments
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db
      .select({ value: count() })
      .from(sessions)
      .where(gt(sessions.expiresAt, now)),
    db.select({ value: count() }).from(communityComments),
    db.select({ value: count() }).from(communityReactions),
    db.select({ value: count() }).from(userBookmarks),
    db.select({ value: count() }).from(userReadingProgress),
    db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        avatarDataUrl: users.avatarDataUrl,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(12),
    db
      .select({
        id: communityComments.id,
        userId: communityComments.userId,
        userEmail: users.email,
        displayName: users.displayName,
        avatarDataUrl: users.avatarDataUrl,
        targetType: communityComments.targetType,
        targetId: communityComments.targetId,
        body: communityComments.body,
        createdAt: communityComments.createdAt
      })
      .from(communityComments)
      .innerJoin(users, eq(communityComments.userId, users.id))
      .orderBy(desc(communityComments.createdAt))
      .limit(20)
  ]);

  return {
    counts: {
      users: Number(userCount[0]?.value ?? 0),
      activeSessions: Number(activeSessionCount[0]?.value ?? 0),
      comments: Number(commentCount[0]?.value ?? 0),
      reactions: Number(reactionCount[0]?.value ?? 0),
      bookmarks: Number(bookmarkCount[0]?.value ?? 0),
      readingProgress: Number(progressCount[0]?.value ?? 0)
    },
    recentUsers,
    recentComments
  };
}

export async function deleteCommunityCommentAsAdmin(
  db: MangaFluxDatabase,
  commentId: string
) {
  const deleted = await db
    .delete(communityComments)
    .where(eq(communityComments.id, commentId))
    .returning({ id: communityComments.id });

  return deleted.length > 0;
}
