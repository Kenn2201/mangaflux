CREATE TABLE "bookmarks" (
  "reader_id" uuid NOT NULL,
  "source" text NOT NULL,
  "manga_id" text NOT NULL,
  "title" text NOT NULL,
  "cover_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "bookmarks_reader_id_source_manga_id_pk"
    PRIMARY KEY("reader_id","source","manga_id")
);
--> statement-breakpoint
CREATE INDEX "bookmarks_reader_created_idx"
  ON "bookmarks" USING btree ("reader_id","created_at");
--> statement-breakpoint
CREATE TABLE "reading_progress" (
  "reader_id" uuid NOT NULL,
  "source" text NOT NULL,
  "manga_id" text NOT NULL,
  "manga_title" text NOT NULL,
  "cover_url" text,
  "chapter_id" text NOT NULL,
  "chapter_label" text,
  "page" integer NOT NULL,
  "total_pages" integer NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "reading_progress_reader_id_source_manga_id_pk"
    PRIMARY KEY("reader_id","source","manga_id")
);
--> statement-breakpoint
CREATE INDEX "reading_progress_reader_updated_idx"
  ON "reading_progress" USING btree ("reader_id","updated_at");
--> statement-breakpoint
CREATE TABLE "source_cache" (
  "key" text PRIMARY KEY NOT NULL,
  "payload" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL
);
