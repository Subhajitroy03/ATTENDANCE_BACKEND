CREATE TYPE "public"."day_of_week" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');--> statement-breakpoint
ALTER TABLE "admins" RENAME COLUMN "password_hash" TO "password";--> statement-breakpoint
ALTER TABLE "rooms" RENAME COLUMN "building" TO "block";--> statement-breakpoint
ALTER TABLE "sections" RENAME COLUMN "section_number" TO "section";--> statement-breakpoint
ALTER TABLE "teachers" RENAME COLUMN "password_hash" TO "password";--> statement-breakpoint
ALTER TABLE "sections" DROP CONSTRAINT "sections_department_id_departments_id_fk";
--> statement-breakpoint
ALTER TABLE "subject_teachers" DROP CONSTRAINT "subject_teachers_subject_id_subjects_id_fk";
--> statement-breakpoint
ALTER TABLE "subject_teachers" DROP CONSTRAINT "subject_teachers_teacher_id_teachers_id_fk";
--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE "sections" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "timetable_slots" ALTER COLUMN "day_of_week" DROP NOT NULL;--> statement-breakpoint
DO $$
DECLARE
	is_zero_based boolean;
BEGIN
	SELECT EXISTS (
		SELECT 1 FROM "timetable_slots" WHERE "day_of_week" = 0
	) INTO is_zero_based;

	IF is_zero_based THEN
		ALTER TABLE "timetable_slots"
			ALTER COLUMN "day_of_week" SET DATA TYPE "public"."day_of_week"
			USING (
				CASE "day_of_week"
					WHEN 0 THEN 'MONDAY'
					WHEN 1 THEN 'TUESDAY'
					WHEN 2 THEN 'WEDNESDAY'
					WHEN 3 THEN 'THURSDAY'
					WHEN 4 THEN 'FRIDAY'
					WHEN 5 THEN 'SATURDAY'
					ELSE NULL
				END
			)::"public"."day_of_week";
	ELSE
		ALTER TABLE "timetable_slots"
			ALTER COLUMN "day_of_week" SET DATA TYPE "public"."day_of_week"
			USING (
				CASE "day_of_week"
					WHEN 1 THEN 'MONDAY'
					WHEN 2 THEN 'TUESDAY'
					WHEN 3 THEN 'WEDNESDAY'
					WHEN 4 THEN 'THURSDAY'
					WHEN 5 THEN 'FRIDAY'
					WHEN 6 THEN 'SATURDAY'
					ELSE NULL
				END
			)::"public"."day_of_week";
	END IF;
END $$;--> statement-breakpoint
ALTER TABLE "timetable_slots" ALTER COLUMN "day_of_week" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "role" varchar(50) DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE "subject_teachers" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "subject_teachers" ADD COLUMN "assigned_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "role" varchar(50) DEFAULT 'teacher' NOT NULL;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_teachers" ADD CONSTRAINT "subject_teachers_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_teachers" ADD CONSTRAINT "subject_teachers_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_department_semester_section" ON "sections" USING btree ("department_id","semester","section");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_section_name" ON "sections" USING btree ("name");--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "semester_range_check" CHECK ("sections"."semester" >= 1 AND "sections"."semester" <= 10);