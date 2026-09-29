CREATE TABLE "canonical_manga" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "display_title" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "canonical_manga_updated_idx"
  ON "canonical_manga" USING btree ("updated_at");
--> statement-breakpoint
CREATE TABLE "manga_source_mappings" (
  "canonical_id" uuid NOT NULL,
  "source" text NOT NULL,
  "manga_id" text NOT NULL,
  "source_title" text NOT NULL,
  "mapping_method" text DEFAULT 'observed' NOT NULL,
  "provenance" text DEFAULT 'source-details' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "manga_source_mappings_source_manga_id_pk"
    PRIMARY KEY("source","manga_id")
);
--> statement-breakpoint
ALTER TABLE "manga_source_mappings"
  ADD CONSTRAINT "manga_source_mappings_canonical_id_canonical_manga_id_fk"
  FOREIGN KEY ("canonical_id")
  REFERENCES "public"."canonical_manga"("id")
  ON DELETE cascade
  ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "manga_source_mappings_canonical_idx"
  ON "manga_source_mappings" USING btree ("canonical_id");
--> statement-breakpoint
CREATE INDEX "manga_source_mappings_updated_idx"
  ON "manga_source_mappings" USING btree ("updated_at");
