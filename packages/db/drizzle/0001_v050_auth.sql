CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique"
  ON "users" USING btree ("email");
--> statement-breakpoint
CREATE TABLE "sessions" (
  "token_hash" text PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "sessions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "sessions_user_expires_idx"
  ON "sessions" USING btree ("user_id","expires_at");
--> statement-breakpoint
CREATE INDEX "sessions_expires_idx"
  ON "sessions" USING btree ("expires_at");
--> statement-breakpoint
CREATE TABLE "user_bookmarks" (
  "user_id" uuid NOT NULL,
  "source" text NOT NULL,
  "manga_id" text NOT NULL,
  "title" text NOT NULL,
  "cover_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_bookmarks_user_id_source_manga_id_pk"
    PRIMARY KEY("user_id","source","manga_id"),
  CONSTRAINT "user_bookmarks_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "user_bookmarks_user_created_idx"
  ON "user_bookmarks" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE TABLE "user_reading_progress" (
  "user_id" uuid NOT NULL,
  "source" text NOT NULL,
  "manga_id" text NOT NULL,
  "manga_title" text NOT NULL,
  "cover_url" text,
  "chapter_id" text NOT NULL,
  "chapter_label" text,
  "page" integer NOT NULL,
  "total_pages" integer NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_reading_progress_user_id_source_manga_id_pk"
    PRIMARY KEY("user_id","source","manga_id"),
  CONSTRAINT "user_reading_progress_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "user_reading_progress_user_updated_idx"
  ON "user_reading_progress" USING btree ("user_id","updated_at");
--> statement-breakpoint
CREATE TABLE "reader_imports" (
  "user_id" uuid NOT NULL,
  "reader_id" uuid NOT NULL,
  "imported_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "reader_imports_user_id_reader_id_pk"
    PRIMARY KEY("user_id","reader_id"),
  CONSTRAINT "reader_imports_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action
);
