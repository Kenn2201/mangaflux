ALTER TABLE "users"
  ADD COLUMN "display_name" text;
--> statement-breakpoint
ALTER TABLE "users"
  ADD COLUMN "avatar_data_url" text;
--> statement-breakpoint
CREATE TABLE "community_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "community_comments_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "community_comments_target_created_idx"
  ON "community_comments" USING btree (
    "target_type",
    "target_id",
    "created_at"
  );
--> statement-breakpoint
CREATE INDEX "community_comments_user_created_idx"
  ON "community_comments" USING btree (
    "user_id",
    "created_at"
  );
--> statement-breakpoint
CREATE TABLE "community_reactions" (
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "user_id" uuid NOT NULL,
  "reaction" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "community_reactions_target_type_target_id_user_id_pk"
    PRIMARY KEY ("target_type", "target_id", "user_id"),
  CONSTRAINT "community_reactions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "community_reactions_target_idx"
  ON "community_reactions" USING btree (
    "target_type",
    "target_id"
  );
