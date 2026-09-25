ALTER TABLE "user_reader_preferences"
  ADD COLUMN "image_fit" text DEFAULT 'width' NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_reader_preferences"
  ADD COLUMN "page_gap" text DEFAULT 'none' NOT NULL;
