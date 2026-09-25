import {
  and,
  desc,
  eq,
  gt,
  isNull,
  lt
} from "drizzle-orm";
import type { MangaFluxDatabase } from "./client.js";
import {
  bookmarks,
  emailVerificationTokens,
  notificationCheckpoints,
  notificationEvents,
  passwordResetTokens,
  readerImports,
  readingProgress,
  sessions,
  userBookmarks,
  userFollows,
  userReadingProgress,
  userReaderPreferences,
  users
} from "./schema.js";

export async function findUserByEmail(
  db: MangaFluxDatabase,
  email: string
) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

export async function createUser(
  db: MangaFluxDatabase,
  email: string,
  passwordHash: string
) {
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarDataUrl: users.avatarDataUrl,
      bio: users.bio,
      showPublicActivity: users.showPublicActivity,
      showJoinedDate: users.showJoinedDate,
      communityRestricted: users.communityRestricted,
      notificationEmailEnabled: users.notificationEmailEnabled,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt
    });

  return user;
}

export async function markUserEmailVerified(
  db: MangaFluxDatabase,
  userId: string
) {
  const verifiedAt = new Date();

  const [user] = await db
    .update(users)
    .set({
      emailVerifiedAt: verifiedAt,
      updatedAt: verifiedAt
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt
    });

  return user ?? null;
}

export async function updateUserPassword(
  db: MangaFluxDatabase,
  userId: string,
  passwordHash: string
) {
  const now = new Date();

  await db
    .update(users)
    .set({
      passwordHash,
      emailVerifiedAt: now,
      updatedAt: now
    })
    .where(eq(users.id, userId));
}

export async function createSession(
  db: MangaFluxDatabase,
  userId: string,
  tokenHash: string,
  expiresAt: Date
) {
  await db.insert(sessions).values({ tokenHash, userId, expiresAt });
}

export async function replaceUserSession(
  db: MangaFluxDatabase,
  userId: string,
  tokenHash: string,
  expiresAt: Date
) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.insert(sessions).values({ tokenHash, userId, expiresAt });
}

export async function getSessionUser(
  db: MangaFluxDatabase,
  tokenHash: string
) {
  const [row] = await db
    .select({
      tokenHash: sessions.tokenHash,
      expiresAt: sessions.expiresAt,
      userId: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarDataUrl: users.avatarDataUrl,
      bio: users.bio,
      showPublicActivity: users.showPublicActivity,
      showJoinedDate: users.showJoinedDate,
      communityRestricted: users.communityRestricted,
      notificationEmailEnabled: users.notificationEmailEnabled,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return row ?? null;
}

export async function deleteSession(
  db: MangaFluxDatabase,
  tokenHash: string
) {
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteUserSessions(
  db: MangaFluxDatabase,
  userId: string
) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function replaceEmailVerificationToken(
  db: MangaFluxDatabase,
  userId: string,
  tokenHash: string,
  expiresAt: Date
) {
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId));

  await db.insert(emailVerificationTokens).values({
    tokenHash,
    userId,
    expiresAt
  });
}

export async function getEmailVerificationToken(
  db: MangaFluxDatabase,
  tokenHash: string
) {
  const [token] = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.tokenHash, tokenHash),
        gt(emailVerificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  return token ?? null;
}

export async function deleteEmailVerificationTokens(
  db: MangaFluxDatabase,
  userId: string
) {
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId));
}

export async function replacePasswordResetToken(
  db: MangaFluxDatabase,
  userId: string,
  tokenHash: string,
  expiresAt: Date
) {
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, userId));

  await db.insert(passwordResetTokens).values({
    tokenHash,
    userId,
    expiresAt
  });
}

export async function getPasswordResetToken(
  db: MangaFluxDatabase,
  tokenHash: string
) {
  const [token] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  return token ?? null;
}

export async function deletePasswordResetTokens(
  db: MangaFluxDatabase,
  userId: string
) {
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, userId));
}

export async function getUserBookmark(
  db: MangaFluxDatabase,
  userId: string,
  source: string,
  mangaId: string
) {
  const [item] = await db
    .select()
    .from(userBookmarks)
    .where(
      and(
        eq(userBookmarks.userId, userId),
        eq(userBookmarks.source, source),
        eq(userBookmarks.mangaId, mangaId)
      )
    )
    .limit(1);

  return item ?? null;
}

export async function upsertUserBookmark(
  db: MangaFluxDatabase,
  input: {
    userId: string;
    source: string;
    mangaId: string;
    title: string;
    coverUrl?: string;
  }
) {
  const [item] = await db
    .insert(userBookmarks)
    .values({ ...input, coverUrl: input.coverUrl ?? null })
    .onConflictDoUpdate({
      target: [
        userBookmarks.userId,
        userBookmarks.source,
        userBookmarks.mangaId
      ],
      set: {
        title: input.title,
        coverUrl: input.coverUrl ?? null
      }
    })
    .returning();

  return item;
}

export async function deleteUserBookmark(
  db: MangaFluxDatabase,
  userId: string,
  source: string,
  mangaId: string
) {
  await db
    .delete(userBookmarks)
    .where(
      and(
        eq(userBookmarks.userId, userId),
        eq(userBookmarks.source, source),
        eq(userBookmarks.mangaId, mangaId)
      )
    );
}

export async function getUserFollow(
  db: MangaFluxDatabase,
  userId: string,
  source: string,
  mangaId: string
) {
  const [item] = await db
    .select()
    .from(userFollows)
    .where(
      and(
        eq(userFollows.userId, userId),
        eq(userFollows.source, source),
        eq(userFollows.mangaId, mangaId)
      )
    )
    .limit(1);

  return item ?? null;
}

export async function upsertUserFollow(
  db: MangaFluxDatabase,
  input: {
    userId: string;
    source: string;
    mangaId: string;
    title: string;
    coverUrl?: string;
  }
) {
  const [item] = await db
    .insert(userFollows)
    .values({
      ...input,
      coverUrl: input.coverUrl ?? null
    })
    .onConflictDoUpdate({
      target: [
        userFollows.userId,
        userFollows.source,
        userFollows.mangaId
      ],
      set: {
        title: input.title,
        coverUrl: input.coverUrl ?? null
      }
    })
    .returning();

  return item;
}

export async function setUserFollowNotifications(
  db: MangaFluxDatabase,
  userId: string,
  source: string,
  mangaId: string,
  notificationsEnabled: boolean
) {
  const [item] = await db
    .update(userFollows)
    .set({ notificationsEnabled })
    .where(
      and(
        eq(userFollows.userId, userId),
        eq(userFollows.source, source),
        eq(userFollows.mangaId, mangaId)
      )
    )
    .returning();

  return item ?? null;
}

export async function deleteUserFollow(
  db: MangaFluxDatabase,
  userId: string,
  source: string,
  mangaId: string
) {
  await db
    .delete(userFollows)
    .where(
      and(
        eq(userFollows.userId, userId),
        eq(userFollows.source, source),
        eq(userFollows.mangaId, mangaId)
      )
    );
}

export async function getNotificationEligibleFollows(
  db: MangaFluxDatabase,
  userId: string
) {
  return db
    .select()
    .from(userFollows)
    .where(
      and(
        eq(userFollows.userId, userId),
        eq(userFollows.notificationsEnabled, true)
      )
    )
    .orderBy(desc(userFollows.createdAt));
}

export async function getNotificationCheckpoint(
  db: MangaFluxDatabase,
  userId: string,
  source: string,
  mangaId: string
) {
  const [checkpoint] = await db
    .select()
    .from(notificationCheckpoints)
    .where(
      and(
        eq(notificationCheckpoints.userId, userId),
        eq(notificationCheckpoints.source, source),
        eq(notificationCheckpoints.mangaId, mangaId)
      )
    )
    .limit(1);

  return checkpoint ?? null;
}

export async function upsertNotificationCheckpoint(
  db: MangaFluxDatabase,
  input: {
    userId: string;
    source: string;
    mangaId: string;
    lastChapterId: string;
    lastPublishedAt?: Date | null;
  }
) {
  const [checkpoint] = await db
    .insert(notificationCheckpoints)
    .values({
      ...input,
      lastPublishedAt: input.lastPublishedAt ?? null,
      checkedAt: new Date()
    })
    .onConflictDoUpdate({
      target: [
        notificationCheckpoints.userId,
        notificationCheckpoints.source,
        notificationCheckpoints.mangaId
      ],
      set: {
        lastChapterId: input.lastChapterId,
        lastPublishedAt: input.lastPublishedAt ?? null,
        checkedAt: new Date()
      }
    })
    .returning();

  return checkpoint;
}

export async function createNewChapterNotificationEvent(
  db: MangaFluxDatabase,
  input: {
    userId: string;
    source: string;
    mangaId: string;
    mangaTitle: string;
    coverUrl?: string | null;
    chapterId: string;
    chapterLabel?: string | null;
    chapterTitle?: string | null;
    sourcePublishedAt?: Date | null;
  }
) {
  const [event] = await db
    .insert(notificationEvents)
    .values({
      ...input,
      type: "new_chapter",
      coverUrl: input.coverUrl ?? null,
      chapterLabel: input.chapterLabel ?? null,
      chapterTitle: input.chapterTitle ?? null,
      sourcePublishedAt: input.sourcePublishedAt ?? null
    })
    .onConflictDoNothing({
      target: [
        notificationEvents.userId,
        notificationEvents.source,
        notificationEvents.mangaId,
        notificationEvents.chapterId,
        notificationEvents.type
      ]
    })
    .returning();

  return { created: Boolean(event), event: event ?? null };
}

export async function listNotificationEvents(
  db: MangaFluxDatabase,
  userId: string,
  limit = 50
) {
  return db
    .select()
    .from(notificationEvents)
    .where(eq(notificationEvents.userId, userId))
    .orderBy(desc(notificationEvents.createdAt))
    .limit(Math.max(1, Math.min(100, Math.floor(limit))));
}

export async function markNotificationEventRead(
  db: MangaFluxDatabase,
  userId: string,
  eventId: string
) {
  const [event] = await db
    .update(notificationEvents)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notificationEvents.id, eventId),
        eq(notificationEvents.userId, userId)
      )
    )
    .returning();

  return event ?? null;
}

export async function markAllNotificationEventsRead(
  db: MangaFluxDatabase,
  userId: string
) {
  const events = await db
    .update(notificationEvents)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notificationEvents.userId, userId),
        isNull(notificationEvents.readAt)
      )
    )
    .returning({ id: notificationEvents.id });

  return events.length;
}

export async function upsertUserProgress(
  db: MangaFluxDatabase,
  input: {
    userId: string;
    source: string;
    mangaId: string;
    mangaTitle: string;
    coverUrl?: string;
    chapterId: string;
    chapterLabel?: string;
    page: number;
    totalPages: number;
  }
) {
  const [item] = await db
    .insert(userReadingProgress)
    .values({
      ...input,
      coverUrl: input.coverUrl ?? null,
      chapterLabel: input.chapterLabel ?? null
    })
    .onConflictDoUpdate({
      target: [
        userReadingProgress.userId,
        userReadingProgress.source,
        userReadingProgress.mangaId
      ],
      set: {
        mangaTitle: input.mangaTitle,
        coverUrl: input.coverUrl ?? null,
        chapterId: input.chapterId,
        chapterLabel: input.chapterLabel ?? null,
        page: input.page,
        totalPages: input.totalPages,
        updatedAt: new Date()
      }
    })
    .returning();

  return item;
}

export async function deleteUserProgress(
  db: MangaFluxDatabase,
  userId: string,
  source: string,
  mangaId: string
) {
  await db
    .delete(userReadingProgress)
    .where(
      and(
        eq(userReadingProgress.userId, userId),
        eq(userReadingProgress.source, source),
        eq(userReadingProgress.mangaId, mangaId)
      )
    );
}

export async function clearUserProgress(
  db: MangaFluxDatabase,
  userId: string
) {
  await db
    .delete(userReadingProgress)
    .where(eq(userReadingProgress.userId, userId));
}

export async function clearUserProgressBefore(
  db: MangaFluxDatabase,
  userId: string,
  before: Date
) {
  const removed = await db
    .delete(userReadingProgress)
    .where(
      and(
        eq(userReadingProgress.userId, userId),
        lt(userReadingProgress.updatedAt, before)
      )
    )
    .returning({ mangaId: userReadingProgress.mangaId });

  return removed.length;
}

export async function getUserSummary(
  db: MangaFluxDatabase,
  userId: string
) {
  const [savedBookmarks, following, history] = await Promise.all([
    db
      .select()
      .from(userBookmarks)
      .where(eq(userBookmarks.userId, userId))
      .orderBy(desc(userBookmarks.createdAt))
      .limit(100),
    db
      .select()
      .from(userFollows)
      .where(eq(userFollows.userId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(100),
    db
      .select()
      .from(userReadingProgress)
      .where(eq(userReadingProgress.userId, userId))
      .orderBy(desc(userReadingProgress.updatedAt))
      .limit(100)
  ]);

  return {
    bookmarks: savedBookmarks,
    following,
    history,
    continueReading: history[0] ?? null
  };
}

export async function getUserReaderPreferences(
  db: MangaFluxDatabase,
  userId: string,
  mangaId: string
) {
  const [item] = await db
    .select()
    .from(userReaderPreferences)
    .where(
      and(
        eq(userReaderPreferences.userId, userId),
        eq(userReaderPreferences.mangaId, mangaId)
      )
    )
    .limit(1);

  return item ?? null;
}

export async function upsertUserReaderPreferences(
  db: MangaFluxDatabase,
  input: {
    userId: string;
    mangaId: string;
    language: string;
    dataSaver: boolean;
    showAlternateReleases: boolean;
    preferredScanlationGroup?: string;
    imageFit: string;
    pageGap: string;
    textSize: string;
    updatedAt: Date;
  }
) {
  await db
    .insert(userReaderPreferences)
    .values({
      ...input,
      preferredScanlationGroup: input.preferredScanlationGroup ?? null
    })
    .onConflictDoUpdate({
      target: [
        userReaderPreferences.userId,
        userReaderPreferences.mangaId
      ],
      set: {
        language: input.language,
        dataSaver: input.dataSaver,
        showAlternateReleases: input.showAlternateReleases,
        preferredScanlationGroup:
          input.preferredScanlationGroup ?? null,
        imageFit: input.imageFit,
        pageGap: input.pageGap,
        textSize: input.textSize,
        updatedAt: input.updatedAt
      },
      setWhere: lt(userReaderPreferences.updatedAt, input.updatedAt)
    });

  return getUserReaderPreferences(db, input.userId, input.mangaId);
}

export async function importReaderState(
  db: MangaFluxDatabase,
  userId: string,
  readerId: string
) {
  const [existingImport] = await db
    .select()
    .from(readerImports)
    .where(
      and(
        eq(readerImports.userId, userId),
        eq(readerImports.readerId, readerId)
      )
    )
    .limit(1);

  if (existingImport) {
    return { imported: false, bookmarks: 0, progress: 0 };
  }

  const [deviceBookmarks, deviceProgress] = await Promise.all([
    db.select().from(bookmarks).where(eq(bookmarks.readerId, readerId)),
    db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.readerId, readerId))
  ]);

  let bookmarkCount = 0;
  let progressCount = 0;

  for (const item of deviceBookmarks) {
    const inserted = await db
      .insert(userBookmarks)
      .values({
        userId,
        source: item.source,
        mangaId: item.mangaId,
        title: item.title,
        coverUrl: item.coverUrl,
        createdAt: item.createdAt
      })
      .onConflictDoNothing()
      .returning({ mangaId: userBookmarks.mangaId });

    bookmarkCount += inserted.length;
  }

  for (const item of deviceProgress) {
    const inserted = await db
      .insert(userReadingProgress)
      .values({
        userId,
        source: item.source,
        mangaId: item.mangaId,
        mangaTitle: item.mangaTitle,
        coverUrl: item.coverUrl,
        chapterId: item.chapterId,
        chapterLabel: item.chapterLabel,
        page: item.page,
        totalPages: item.totalPages,
        updatedAt: item.updatedAt
      })
      .onConflictDoNothing()
      .returning({ mangaId: userReadingProgress.mangaId });

    progressCount += inserted.length;
  }

  await db
    .insert(readerImports)
    .values({ userId, readerId })
    .onConflictDoNothing();

  return {
    imported: true,
    bookmarks: bookmarkCount,
    progress: progressCount
  };
}
