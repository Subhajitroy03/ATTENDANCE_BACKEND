ALTER TABLE "teachers" ADD COLUMN "abbreviation" varchar(10);--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_abbreviation_unique" UNIQUE("abbreviation");