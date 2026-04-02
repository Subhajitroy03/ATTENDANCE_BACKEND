ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "photo" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "photo" text;--> statement-breakpoint
DROP TABLE IF EXISTS "student_faces";