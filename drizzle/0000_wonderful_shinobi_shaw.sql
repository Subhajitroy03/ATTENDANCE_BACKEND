CREATE TYPE "public"."attendance_status" AS ENUM('PRESENT', 'ABSENT', 'LATE');--> statement-breakpoint
CREATE TYPE "public"."class_status" AS ENUM('SCHEDULED', 'STARTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."swap_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(50) NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_session_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "attendance_status" NOT NULL,
	"marked_by" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" varchar(255) NOT NULL,
	"entity" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "class_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timetable_slot_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "class_status" DEFAULT 'SCHEDULED',
	"teacher_confirmed" boolean DEFAULT false,
	"start_time" time,
	"end_time" time
);
--> statement-breakpoint
CREATE TABLE "class_swaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_teacher_id" uuid NOT NULL,
	"to_teacher_id" uuid NOT NULL,
	"class_session_id" uuid NOT NULL,
	"status" "swap_status" DEFAULT 'PENDING',
	"requested_at" timestamp DEFAULT now(),
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "departments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_number" varchar(50) NOT NULL,
	"capacity" integer,
	"building" varchar(100),
	"floor" integer,
	CONSTRAINT "rooms_room_number_unique" UNIQUE("room_number")
);
--> statement-breakpoint
CREATE TABLE "section_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"room_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"semester" integer NOT NULL,
	"section_number" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"capacity" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_faces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"face_embedding" text,
	"face_image_url" text NOT NULL,
	"version" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"department_id" uuid NOT NULL,
	"semester" integer NOT NULL,
	"section" varchar(50) NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE',
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id"),
	CONSTRAINT "students_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subject_teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_code" varchar(50) NOT NULL,
	"subject_name" varchar(255) NOT NULL,
	"department_id" uuid NOT NULL,
	"semester" integer NOT NULL,
	"credits" integer,
	CONSTRAINT "subjects_subject_code_unique" UNIQUE("subject_code")
);
--> statement-breakpoint
CREATE TABLE "teacher_confirmations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_session_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"confirmed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"department_id" uuid NOT NULL,
	"password_hash" text NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE',
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "teachers_employee_id_unique" UNIQUE("employee_id"),
	CONSTRAINT "teachers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "timetable_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"subject_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"room_id" uuid
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_class_session_id_class_sessions_id_fk" FOREIGN KEY ("class_session_id") REFERENCES "public"."class_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_timetable_slot_id_timetable_slots_id_fk" FOREIGN KEY ("timetable_slot_id") REFERENCES "public"."timetable_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_swaps" ADD CONSTRAINT "class_swaps_from_teacher_id_teachers_id_fk" FOREIGN KEY ("from_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_swaps" ADD CONSTRAINT "class_swaps_to_teacher_id_teachers_id_fk" FOREIGN KEY ("to_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_swaps" ADD CONSTRAINT "class_swaps_class_session_id_class_sessions_id_fk" FOREIGN KEY ("class_session_id") REFERENCES "public"."class_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_rooms" ADD CONSTRAINT "section_rooms_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_rooms" ADD CONSTRAINT "section_rooms_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_faces" ADD CONSTRAINT "student_faces_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_teachers" ADD CONSTRAINT "subject_teachers_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_teachers" ADD CONSTRAINT "subject_teachers_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_confirmations" ADD CONSTRAINT "teacher_confirmations_class_session_id_class_sessions_id_fk" FOREIGN KEY ("class_session_id") REFERENCES "public"."class_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_confirmations" ADD CONSTRAINT "teacher_confirmations_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_attendance" ON "attendance" USING btree ("class_session_id","student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_subject_teacher" ON "subject_teachers" USING btree ("subject_id","teacher_id");