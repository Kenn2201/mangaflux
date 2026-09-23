import { and, desc, eq } from "drizzle-orm";
import type { MangaFluxDatabase } from "./client.js";
import { bookmarks, readingProgress } from "./schema.js";

export type BookmarkInput = {
  readerId: string;
  source: string;
  mangaId: string;
  title: string;
  coverUrl?: string;
};

export type ProgressInput = {
  readerId: string;
  source: string;
  mangaId: string;
  mangaTitle: string;
  coverUrl?: string;
  chapterId: string;
  chapterLabel?: string;
  page: number;
  totalPages: number;
};

export async function getBookmark(
  db: MangaFluxDatabase,
  readerId: string,
  source: string,
  mangaId: string
) {
  const [item] = await db
    .select()
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.readerId, readerId),
        eq(bookmarks.source, source),
        eq(bookmarks.mangaId, mangaId)
      )
    )
    .limit(1);

  return item ?? null;
}

export async function upsertBookmark(
  db: MangaFluxDatabase,
  input: BookmarkInput
) {
  const [item] = await db
    .insert(bookmarks)
    .values({
      ...input,
      coverUrl: input.coverUrl ?? null
    })
    .onConflictDoUpdate({
      target: [
        bookmarks.readerId,
        bookmarks.source,
        bookmarks.mangaId
      ],
      set: {
        title: input.title,
        coverUrl: input.coverUrl ?? null
      }
    })
    .returning();

  return item;
}

export async function deleteBookmark(
  db: MangaFluxDatabase,
  readerId: string,
  source: string,
  mangaId: string
) {
  await db
    .delete(bookmarks)
    .where(
      and(
        eq(bookmarks.readerId, readerId),
        eq(bookmarks.source, source),
        eq(bookmarks.mangaId, mangaId)
      )
    );
}

export async function upsertProgress(
  db: MangaFluxDatabase,
  input: ProgressInput
) {
  const [item] = await db
    .insert(readingProgress)
    .values({
      ...input,
      coverUrl: input.coverUrl ?? null,
      chapterLabel: input.chapterLabel ?? null
    })
    .onConflictDoUpdate({
      target: [
        readingProgress.readerId,
        readingProgress.source,
        readingProgress.mangaId
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

export async function getReaderSummary(
  db: MangaFluxDatabase,
  readerId: string
) {
  const [savedBookmarks, history] = await Promise.all([
    db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.readerId, readerId))
      .orderBy(desc(bookmarks.createdAt))
      .limit(12),
    db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.readerId, readerId))
      .orderBy(desc(readingProgress.updatedAt))
      .limit(12)
  ]);

  return {
    bookmarks: savedBookmarks,
    history,
    continueReading: history[0] ?? null
  };
}
