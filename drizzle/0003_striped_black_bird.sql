ALTER TABLE "teachers" ALTER COLUMN "abbreviation" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sections" ADD COLUMN "class_teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_class_teacher_id_teachers_id_fk" FOREIGN KEY ("class_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sections_class_teacher_id" ON "sections" USING btree ("class_teacher_id");