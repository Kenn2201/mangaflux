CREATE TABLE "user_follows" (
  "user_id" uuid NOT NULL,
  "source" text NOT NULL,
  "manga_id" text NOT NULL,
  "title" text NOT NULL,
  "cover_url" text,
  "notifications_enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_follows_user_id_source_manga_id_pk"
    PRIMARY KEY("user_id","source","manga_id")
);
--> statement-breakpoint
ALTER TABLE "user_follows"
  ADD CONSTRAINT "user_follows_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "user_follows_user_created_idx"
  ON "user_follows" USING btree ("user_id","created_at");
