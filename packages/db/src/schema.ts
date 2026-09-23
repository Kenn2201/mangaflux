import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const bookmarks = pgTable("bookmarks", {
  userId: text("user_id").notNull(),
  source: text("source").notNull(),
  mangaId: text("manga_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  primaryKey({ columns: [table.userId, table.source, table.mangaId] })
]);

export const readingProgress = pgTable("reading_progress", {
  userId: text("user_id").notNull(),
  source: text("source").notNull(),
  mangaId: text("manga_id").notNull(),
  chapterId: text("chapter_id").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  primaryKey({ columns: [table.userId, table.source, table.mangaId] })
]);

export const sourceCache = pgTable("source_cache", {
  key: text("key").primaryKey(),
  payload: text("payload").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});
