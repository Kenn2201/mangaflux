ALTER TABLE "users"
  ADD COLUMN "email_verified_at" timestamp with time zone;
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
  "token_hash" text PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "email_verification_tokens_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "email_verification_user_idx"
  ON "email_verification_tokens" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "email_verification_expires_idx"
  ON "email_verification_tokens" USING btree ("expires_at");
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
  "token_hash" text PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "password_reset_tokens_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "password_reset_user_idx"
  ON "password_reset_tokens" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "password_reset_expires_idx"
  ON "password_reset_tokens" USING btree ("expires_at");
