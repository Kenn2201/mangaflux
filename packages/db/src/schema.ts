import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
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
    primaryKey({ columns: [table.readerId, table.source, table.mangaId] }),
    index("bookmarks_reader_created_idx").on(table.readerId, table.createdAt)
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
    primaryKey({ columns: [table.readerId, table.source, table.mangaId] }),
    index("reading_progress_reader_updated_idx").on(
      table.readerId,
      table.updatedAt
    )
  ]
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name"),
    avatarDataUrl: text("avatar_data_url"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email)
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("sessions_user_expires_idx").on(table.userId, table.expiresAt),
    index("sessions_expires_idx").on(table.expiresAt)
  ]
);

export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("email_verification_user_idx").on(table.userId),
    index("email_verification_expires_idx").on(table.expiresAt)
  ]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("password_reset_user_idx").on(table.userId),
    index("password_reset_expires_idx").on(table.expiresAt)
  ]
);

export const userBookmarks = pgTable(
  "user_bookmarks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    source: text("source").notNull(),
    mangaId: text("manga_id").notNull(),
    title: text("title").notNull(),
    coverUrl: text("cover_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.source, table.mangaId] }),
    index("user_bookmarks_user_created_idx").on(
      table.userId,
      table.createdAt
    )
  ]
);

export const userReadingProgress = pgTable(
  "user_reading_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
    primaryKey({ columns: [table.userId, table.source, table.mangaId] }),
    index("user_reading_progress_user_updated_idx").on(
      table.userId,
      table.updatedAt
    )
  ]
);

export const readerImports = pgTable(
  "reader_imports",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readerId: uuid("reader_id").notNull(),
    importedAt: timestamp("imported_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.readerId] })
  ]
);

export const communityComments = pgTable(
  "community_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("community_comments_target_created_idx").on(
      table.targetType,
      table.targetId,
      table.createdAt
    ),
    index("community_comments_user_created_idx").on(
      table.userId,
      table.createdAt
    )
  ]
);

export const communityReactions = pgTable(
  "community_reactions",
  {
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reaction: text("reaction").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    primaryKey({
      columns: [
        table.targetType,
        table.targetId,
        table.userId
      ]
    }),
    index("community_reactions_target_idx").on(
      table.targetType,
      table.targetId
    )
  ]
);

export const sourceCache = pgTable("source_cache", {
  key: text("key").primaryKey(),
  payload: text("payload").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});
