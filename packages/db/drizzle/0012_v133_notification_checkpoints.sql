CREATE TABLE "notification_checkpoints" (
  "user_id" uuid NOT NULL,
  "source" text NOT NULL,
  "manga_id" text NOT NULL,
  "last_chapter_id" text NOT NULL,
  "last_published_at" timestamp with time zone,
  "checked_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "notification_checkpoints_user_id_source_manga_id_pk"
    PRIMARY KEY("user_id","source","manga_id")
);
--> statement-breakpoint
ALTER TABLE "notification_checkpoints"
  ADD CONSTRAINT "notification_checkpoints_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "notification_checkpoints_checked_idx"
  ON "notification_checkpoints" USING btree ("checked_at");
