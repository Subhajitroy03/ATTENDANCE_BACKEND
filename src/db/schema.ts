import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  date,
  time,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql/sql";

/* =========================
   ENUMS
========================= */

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "GRADUATED",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "PRESENT",
  "ABSENT",
  "LATE",
]);

export const classStatusEnum = pgEnum("class_status", [
  "SCHEDULED",
  "STARTED",
  "COMPLETED",
  "CANCELLED",
]);

export const swapStatusEnum = pgEnum("swap_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);

/* =========================
   ADMIN
========================= */

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  status: userStatusEnum("status").default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   DEPARTMENT
========================= */

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   TEACHERS
========================= */

export const teachers = pgTable("teachers", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: varchar("employee_id", { length: 100 })
    .notNull()
    .unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id),
  password: text("password").notNull(),
  status: userStatusEnum("status").default("ACTIVE"),
  role: varchar("role", { length: 50 }).notNull().default("teacher"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   STUDENTS
========================= */

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),

  studentId: varchar("student_id", { length: 100 })
    .notNull()
    .unique(),

  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),

  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id),

  semester: integer("semester").notNull(),
  section: varchar("section", { length: 50 }).notNull(),

  status: userStatusEnum("status").default("ACTIVE"),
  verified: boolean("verified").default(false),
  role: varchar("role", { length: 50 }).notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   STUDENT FACES
========================= */

export const studentFaces = pgTable("student_faces", {
  id: uuid("id").primaryKey().defaultRandom(),

  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id),

  faceEmbedding: text("face_embedding"),
  faceImageUrl: text("face_image_url").notNull(),

  version: integer("version").notNull(),
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   SECTIONS
========================= */

export const sections = pgTable(
  "sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, {
        onDelete: "restrict",
      }),

    semester: integer("semester").notNull(),
    section: integer("section").notNull(),
    //Display name like "6CSE2"
    name: varchar("name", { length: 50 }).notNull(),
    capacity: integer("capacity"),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Enforce semester range
    semesterRange: check(
      "semester_range_check",
      sql`${table.semester} >= 1 AND ${table.semester} <= 10`
    ),
    // Prevent duplicate logical section
    uniqueDepartmentSemesterSection: uniqueIndex(
      "unique_department_semester_section"
    ).on(
      table.departmentId,
      table.semester,
      table.section
    ),

    // Prevent duplicate names 
    uniqueSectionName: uniqueIndex(
      "unique_section_name"
    ).on(table.name),
  })
);

/* =========================
   SUBJECTS
========================= */

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),

  subjectCode: varchar("subject_code", { length: 50 })
    .notNull()
    .unique(),

  subjectName: varchar("subject_name", { length: 255 }).notNull(),

  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id),

  semester: integer("semester").notNull(),
  credits: integer("credits"),
});

/* =========================
   SUBJECT TEACHERS
========================= */

export const subjectTeachers = pgTable(
  "subject_teachers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, {
        onDelete: "cascade",
      }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => teachers.id, {
        onDelete: "cascade",
      }),
    isActive: boolean("is_active")
      .default(true)
      .notNull(),
    assignedAt: timestamp("assigned_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueSubjectTeacher: uniqueIndex(
      "unique_subject_teacher"
    ).on(
      table.subjectId,
      table.teacherId
    ),
  })
);

/* =========================
   ROOMS
========================= */

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomNumber: varchar("room_number", { length: 50 })
    .notNull()
    .unique(),
  capacity: integer("capacity"),
  block: varchar("block", { length: 100 }),
  floor: integer("floor"),
});

/* =========================
   SECTION ROOMS
========================= */

export const sectionRooms = pgTable("section_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => sections.id),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id),
});

/* =========================
   TIMETABLE SLOTS
========================= */

export const timetableSlots = pgTable("timetable_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => sections.id),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id),
  roomId: uuid("room_id").references(() => rooms.id),
});

/* =========================
   CLASS SESSIONS
========================= */

export const classSessions = pgTable("class_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),

  timetableSlotId: uuid("timetable_slot_id")
    .notNull()
    .references(() => timetableSlots.id),

  date: date("date").notNull(),

  status: classStatusEnum("status").default("SCHEDULED"),

  teacherConfirmed: boolean("teacher_confirmed").default(false),

  startTime: time("start_time"),
  endTime: time("end_time"),
});

/* =========================
   TEACHER CONFIRMATIONS
========================= */

export const teacherConfirmations = pgTable("teacher_confirmations", {
  id: uuid("id").primaryKey().defaultRandom(),

  classSessionId: uuid("class_session_id")
    .notNull()
    .references(() => classSessions.id),

  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id),

  confirmedAt: timestamp("confirmed_at").defaultNow(),
});

/* =========================
   ATTENDANCE
========================= */

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    classSessionId: uuid("class_session_id")
      .notNull()
      .references(() => classSessions.id),

    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),

    status: attendanceStatusEnum("status").notNull(),

    markedBy: varchar("marked_by", { length: 50 }).notNull(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueAttendance: uniqueIndex("unique_attendance").on(
      table.classSessionId,
      table.studentId
    ),
  })
);

/* =========================
   CLASS SWAPS
========================= */

export const classSwaps = pgTable("class_swaps", {
  id: uuid("id").primaryKey().defaultRandom(),

  fromTeacherId: uuid("from_teacher_id")
    .notNull()
    .references(() => teachers.id),

  toTeacherId: uuid("to_teacher_id")
    .notNull()
    .references(() => teachers.id),

  classSessionId: uuid("class_session_id")
    .notNull()
    .references(() => classSessions.id),

  status: swapStatusEnum("status").default("PENDING"),

  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

/* =========================
   NOTIFICATIONS
========================= */

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id").notNull(),

  type: varchar("type", { length: 100 }).notNull(),
  message: text("message").notNull(),

  read: boolean("read").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   AUDIT LOGS
========================= */

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),

  actorId: uuid("actor_id").notNull(),

  action: varchar("action", { length: 255 }).notNull(),

  entity: varchar("entity", { length: 100 }).notNull(),

  entityId: uuid("entity_id").notNull(),

  timestamp: timestamp("timestamp").defaultNow(),
});
