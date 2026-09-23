import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const bookmarks = pgTable(
  "bookmarks",
  {
    readerId: uuid("reader_id").notNull(),
    source: text("source").notNull(),
    mangaId: text("manga_id").notNull(),
    title: text("title").notNull(),
    coverUrl: text("cover_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    primaryKey({
      columns: [table.readerId, table.source, table.mangaId]
    }),
    index("bookmarks_reader_created_idx").on(
      table.readerId,
      table.createdAt
    )
  ]
);

export const readingProgress = pgTable(
  "reading_progress",
  {
    readerId: uuid("reader_id").notNull(),
    source: text("source").notNull(),
    mangaId: text("manga_id").notNull(),
    mangaTitle: text("manga_title").notNull(),
    coverUrl: text("cover_url"),
    chapterId: text("chapter_id").notNull(),
    chapterLabel: text("chapter_label"),
    page: integer("page").notNull(),
    totalPages: integer("total_pages").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    primaryKey({
      columns: [table.readerId, table.source, table.mangaId]
    }),
    index("reading_progress_reader_updated_idx").on(
      table.readerId,
      table.updatedAt
    )
  ]
);

export const sourceCache = pgTable("source_cache", {
  key: text("key").primaryKey(),
  payload: text("payload").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});
