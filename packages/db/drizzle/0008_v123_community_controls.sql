ALTER TABLE "users"
  ADD COLUMN "show_joined_date" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "users"
  ADD COLUMN "community_restricted" boolean DEFAULT false NOT NULL;
