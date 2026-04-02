ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "section_id" uuid;--> statement-breakpoint
UPDATE "students" AS s
SET "section_id" = sec."id"
FROM "sections" AS sec
WHERE s."department_id" = sec."department_id"
  AND s."semester" = sec."semester"
  AND s."section" = sec."section";--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "section_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "department_id";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "semester";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "section";--> statement-breakpoint