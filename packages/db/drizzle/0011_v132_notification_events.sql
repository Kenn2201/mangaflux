CREATE TABLE "notification_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "type" text NOT NULL,
  "source" text NOT NULL,
  "manga_id" text NOT NULL,
  "manga_title" text NOT NULL,
  "cover_url" text,
  "chapter_id" text NOT NULL,
  "chapter_label" text,
  "chapter_title" text,
  "source_published_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "notification_events"
  ADD CONSTRAINT "notification_events_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "notification_events_user_chapter_type_unique"
  ON "notification_events" USING btree
  ("user_id","source","manga_id","chapter_id","type");
--> statement-breakpoint
CREATE INDEX "notification_events_user_created_idx"
  ON "notification_events" USING btree ("user_id","created_at");
