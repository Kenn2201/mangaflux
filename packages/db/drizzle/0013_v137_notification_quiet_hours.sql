ALTER TABLE "users"
  ADD COLUMN "notification_quiet_hours_enabled" boolean DEFAULT false NOT NULL,
  ADD COLUMN "notification_quiet_hours_start" text DEFAULT '22:00' NOT NULL,
  ADD COLUMN "notification_quiet_hours_end" text DEFAULT '07:00' NOT NULL,
  ADD COLUMN "notification_time_zone" text DEFAULT 'UTC' NOT NULL;
