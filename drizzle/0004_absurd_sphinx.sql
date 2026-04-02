ALTER TABLE "admins" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "refresh_token" text;