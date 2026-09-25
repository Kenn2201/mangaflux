CREATE TABLE "user_reader_preferences" (
  "user_id" uuid NOT NULL,
  "manga_id" text NOT NULL,
  "language" text NOT NULL,
  "data_saver" boolean DEFAULT false NOT NULL,
  "show_alternate_releases" boolean DEFAULT false NOT NULL,
  "preferred_scanlation_group" text,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "user_reader_preferences_user_id_manga_id_pk"
    PRIMARY KEY ("user_id", "manga_id"),
  CONSTRAINT "user_reader_preferences_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "user_reader_preferences_user_updated_idx"
  ON "user_reader_preferences" USING btree ("user_id", "updated_at");
