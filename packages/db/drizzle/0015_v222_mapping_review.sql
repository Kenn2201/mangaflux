CREATE TABLE "canonical_mapping_audit" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source" text NOT NULL,
  "manga_id" text NOT NULL,
  "source_title" text NOT NULL,
  "action" text NOT NULL,
  "from_canonical_id" uuid NOT NULL,
  "to_canonical_id" uuid NOT NULL,
  "actor_user_id" uuid NOT NULL,
  "reason" text,
  "rollback_of" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "canonical_mapping_audit_edition_created_idx"
  ON "canonical_mapping_audit" USING btree ("source","manga_id","created_at");
--> statement-breakpoint
CREATE INDEX "canonical_mapping_audit_actor_created_idx"
  ON "canonical_mapping_audit" USING btree ("actor_user_id","created_at");
--> statement-breakpoint
CREATE INDEX "canonical_mapping_audit_rollback_idx"
  ON "canonical_mapping_audit" USING btree ("rollback_of");
