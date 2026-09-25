ALTER TABLE "users"
  ADD COLUMN "bio" text;
--> statement-breakpoint
ALTER TABLE "users"
  ADD COLUMN "show_public_activity" boolean DEFAULT true NOT NULL;
