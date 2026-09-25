import {
  and,
  asc,
  count,
  desc,
  eq
} from "drizzle-orm";
import type { MangaFluxDatabase } from "./client.js";
import {
  communityComments,
  communityReactions,
  users
} from "./schema.js";

export async function listCommunityComments(
  db: MangaFluxDatabase,
  targetType: string,
  targetId: string,
  limit: number,
  offset: number,
  order: "asc" | "desc" = "desc"
) {
  const [items, totalRows] = await Promise.all([
    db
      .select({
        id: communityComments.id,
        userId: communityComments.userId,
        displayName: users.displayName,
        avatarDataUrl: users.avatarDataUrl,
        body: communityComments.body,
        createdAt: communityComments.createdAt,
        updatedAt: communityComments.updatedAt
      })
      .from(communityComments)
      .innerJoin(users, eq(communityComments.userId, users.id))
      .where(
        and(
          eq(communityComments.targetType, targetType),
          eq(communityComments.targetId, targetId)
        )
      )
      .orderBy(
        order === "asc"
          ? asc(communityComments.createdAt)
          : desc(communityComments.createdAt)
      )
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(communityComments)
      .where(
        and(
          eq(communityComments.targetType, targetType),
          eq(communityComments.targetId, targetId)
        )
      )
  ]);

  return {
    items,
    total: Number(totalRows[0]?.value ?? 0)
  };
}

export async function getCommunityProfile(
  db: MangaFluxDatabase,
  userId: string
) {
  const [profile, commentCountRows, reactionCountRows, recentComments] =
    await Promise.all([
      db
        .select({
          id: users.id,
          displayName: users.displayName,
          avatarDataUrl: users.avatarDataUrl,
          bio: users.bio,
          showPublicActivity: users.showPublicActivity,
          showJoinedDate: users.showJoinedDate,
          createdAt: users.createdAt
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),
      db
        .select({ value: count() })
        .from(communityComments)
        .where(eq(communityComments.userId, userId)),
      db
        .select({ value: count() })
        .from(communityReactions)
        .where(eq(communityReactions.userId, userId)),
      db
        .select({
          id: communityComments.id,
          targetType: communityComments.targetType,
          targetId: communityComments.targetId,
          body: communityComments.body,
          createdAt: communityComments.createdAt
        })
        .from(communityComments)
        .where(eq(communityComments.userId, userId))
        .orderBy(desc(communityComments.createdAt))
        .limit(8)
    ]);

  if (!profile[0]) return null;

  const activityVisible = profile[0].showPublicActivity;

  return {
    user: {
      id: profile[0].id,
      displayName: profile[0].displayName,
      avatarDataUrl: profile[0].avatarDataUrl,
      bio: profile[0].bio,
      createdAt: profile[0].showJoinedDate
        ? profile[0].createdAt
        : null
    },
    activityVisible,
    stats: activityVisible
      ? {
          comments: Number(commentCountRows[0]?.value ?? 0),
          reactions: Number(reactionCountRows[0]?.value ?? 0)
        }
      : {
          comments: 0,
          reactions: 0
        },
    recentComments: activityVisible ? recentComments : []
  };
}

export async function listCommunityProfileActivity(
  db: MangaFluxDatabase,
  userId: string,
  limit: number,
  offset: number
) {
  const [profile] = await db
    .select({
      showPublicActivity: users.showPublicActivity
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!profile) return null;

  if (!profile.showPublicActivity) {
    return {
      activityVisible: false,
      items: [],
      total: 0,
      limit,
      offset
    };
  }

  const [items, totalRows] = await Promise.all([
    db
      .select({
        id: communityComments.id,
        targetType: communityComments.targetType,
        targetId: communityComments.targetId,
        body: communityComments.body,
        createdAt: communityComments.createdAt
      })
      .from(communityComments)
      .where(eq(communityComments.userId, userId))
      .orderBy(desc(communityComments.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(communityComments)
      .where(eq(communityComments.userId, userId))
  ]);

  return {
    activityVisible: true,
    items,
    total: Number(totalRows[0]?.value ?? 0),
    limit,
    offset
  };
}

export async function getLastUserComment(
  db: MangaFluxDatabase,
  userId: string
) {
  const [comment] = await db
    .select({
      id: communityComments.id,
      createdAt: communityComments.createdAt
    })
    .from(communityComments)
    .where(eq(communityComments.userId, userId))
    .orderBy(desc(communityComments.createdAt))
    .limit(1);

  return comment ?? null;
}

export async function createCommunityComment(
  db: MangaFluxDatabase,
  input: {
    userId: string;
    targetType: string;
    targetId: string;
    body: string;
  }
) {
  const [comment] = await db
    .insert(communityComments)
    .values(input)
    .returning();

  return comment;
}

export async function deleteOwnCommunityComment(
  db: MangaFluxDatabase,
  commentId: string,
  userId: string
) {
  const deleted = await db
    .delete(communityComments)
    .where(
      and(
        eq(communityComments.id, commentId),
        eq(communityComments.userId, userId)
      )
    )
    .returning({ id: communityComments.id });

  return deleted.length > 0;
}

export async function getCommunityReactionSummary(
  db: MangaFluxDatabase,
  targetType: string,
  targetId: string
) {
  const rows = await db
    .select({
      reaction: communityReactions.reaction,
      count: count()
    })
    .from(communityReactions)
    .where(
      and(
        eq(communityReactions.targetType, targetType),
        eq(communityReactions.targetId, targetId)
      )
    )
    .groupBy(communityReactions.reaction);

  return Object.fromEntries(
    rows.map((row) => [row.reaction, Number(row.count)])
  );
}

export async function getUserCommunityReaction(
  db: MangaFluxDatabase,
  targetType: string,
  targetId: string,
  userId: string
) {
  const [row] = await db
    .select({ reaction: communityReactions.reaction })
    .from(communityReactions)
    .where(
      and(
        eq(communityReactions.targetType, targetType),
        eq(communityReactions.targetId, targetId),
        eq(communityReactions.userId, userId)
      )
    )
    .limit(1);

  return row?.reaction ?? null;
}

export async function setCommunityReaction(
  db: MangaFluxDatabase,
  input: {
    targetType: string;
    targetId: string;
    userId: string;
    reaction: string;
  }
) {
  const current = await getUserCommunityReaction(
    db,
    input.targetType,
    input.targetId,
    input.userId
  );

  if (current === input.reaction) {
    await db
      .delete(communityReactions)
      .where(
        and(
          eq(communityReactions.targetType, input.targetType),
          eq(communityReactions.targetId, input.targetId),
          eq(communityReactions.userId, input.userId)
        )
      );

    return null;
  }

  await db
    .insert(communityReactions)
    .values(input)
    .onConflictDoUpdate({
      target: [
        communityReactions.targetType,
        communityReactions.targetId,
        communityReactions.userId
      ],
      set: {
        reaction: input.reaction,
        createdAt: new Date()
      }
    });

  return input.reaction;
}
