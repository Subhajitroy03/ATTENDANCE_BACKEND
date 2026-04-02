import { StatusCodes } from "http-status-codes";
import { asc, desc, eq, sql, and, or } from "drizzle-orm";

import { db } from "../db/index.js";
import {
	attendance,
	classSessions,
	subjects,
	students,
	timetableSlots,
	sections,
	teachers,
} from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildWhere,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateAttendanceInput {
	classSessionId: string;
	studentId: string;
	status: "PRESENT" | "ABSENT" | "LATE";
	markedBy: string;
}

export interface UpdateAttendanceInput {
	status?: "PRESENT" | "ABSENT" | "LATE";
	markedBy?: string;
}

export interface ListAttendanceQuery extends PaginationInput {
	classSessionId?: unknown;
	studentId?: unknown;
	status?: unknown;
	markedBy?: unknown;
}

export interface StudentSubjectAttendanceSummaryItem {
	subjectId: string;
	subjectCode: string;
	subjectName: string;
	totalPresent: number;
	totalClasses: number;
	percentage: number;
}

export interface StudentSubjectAttendanceSummary {
	studentId: string;
	departmentId: string;
	semester: number;
	subjects: StudentSubjectAttendanceSummaryItem[];
	overallPercentage: number;
}

async function getAttendanceOrThrow(id: string) {
	const rows = await db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Attendance record not found");
	return rows[0];
}

async function createAttendance(input: CreateAttendanceInput) {
	const [created] = await db.insert(attendance).values(input as any).returning();
	return created;
}

async function getAttendance(query: ListAttendanceQuery) {
	const { limit, offset, order } = parsePagination(query);
	const classSessionId = parseString(query.classSessionId);
	const studentId = parseString(query.studentId);
	const status = parseString(query.status);
	const markedBy = parseString(query.markedBy);
	const where = buildWhere(
		classSessionId ? eq(attendance.classSessionId, classSessionId) : undefined,
		studentId ? eq(attendance.studentId, studentId) : undefined,
		status ? eq(attendance.status, status as any) : undefined,
		markedBy ? eq(attendance.markedBy, markedBy) : undefined
	);

	return await db
		.select()
		.from(attendance)
		.where(where)
		.orderBy(order === "asc" ? asc(attendance.createdAt) : desc(attendance.createdAt))
		.limit(limit)
		.offset(offset);
}

async function getAttendanceById(id: string) {
	return await getAttendanceOrThrow(id);
}

async function updateAttendance(id: string, input: UpdateAttendanceInput) {
	await getAttendanceOrThrow(id);
	const [updated] = await db
		.update(attendance)
		.set(input as any)
		.where(eq(attendance.id, id))
		.returning();
	return updated;
}

async function deleteAttendance(id: string) {
	await getAttendanceOrThrow(id);
	const [deleted] = await db.delete(attendance).where(eq(attendance.id, id)).returning();
	return deleted;
}

async function getMySubjectAttendanceSummary(studentId: string): Promise<StudentSubjectAttendanceSummary> {
	const studentRows = await db
		.select({
			id: students.id,
			departmentId: students.departmentId,
			semester: students.semester,
		})
		.from(students)
		.where(eq(students.id, studentId))
		.limit(1);

	const student = studentRows[0];
	if (!student) {
		throw new ApiError(StatusCodes.NOT_FOUND, "Student not found");
	}

	const rows = await db
		.select({
			subjectId: subjects.id,
			subjectCode: subjects.subjectCode,
			subjectName: subjects.subjectName,
			totalClasses: sql<number>`COALESCE(COUNT(${attendance.id}), 0)`,
			totalPresent: sql<number>`COALESCE(SUM(CASE WHEN ${attendance.status} IN ('PRESENT','LATE') THEN 1 ELSE 0 END), 0)`,
		})
		.from(subjects)
		.leftJoin(
			timetableSlots,
			eq(timetableSlots.subjectId, subjects.id)
		)
		.leftJoin(
			classSessions,
			eq(classSessions.timetableSlotId, timetableSlots.id)
		)
		.leftJoin(
			attendance,
			and(
				eq(attendance.classSessionId, classSessions.id),
				eq(attendance.studentId, studentId)
			)
		)
		.where(
			and(
				eq(subjects.departmentId, student.departmentId),
				eq(subjects.semester, student.semester)
			)
		)
		.groupBy(subjects.id, subjects.subjectCode, subjects.subjectName)
		.orderBy(asc(subjects.subjectCode));

	const subjectSummaries: StudentSubjectAttendanceSummaryItem[] = rows.map((r) => {
		const totalClasses = Number(r.totalClasses ?? 0);
		const totalPresent = Number(r.totalPresent ?? 0);
		const percentage = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;
		return {
			subjectId: r.subjectId,
			subjectCode: r.subjectCode,
			subjectName: r.subjectName,
			totalClasses,
			totalPresent,
			percentage: Number(percentage.toFixed(2)),
		};
	});

	const withClasses = subjectSummaries.filter((s) => s.totalClasses > 0);
	const overallPercentage = withClasses.length
		? Number(
			(
				withClasses.reduce((acc, s) => acc + s.percentage, 0) /
				withClasses.length
			).toFixed(2)
		)
		: 0;

	return {
		studentId: student.id,
		departmentId: student.departmentId,
		semester: student.semester,
		subjects: subjectSummaries,
		overallPercentage,
	};
}

interface TeacherClassAttendanceRecord {
	attendanceId: string;
	classSessionId: string;
	classSessionDate: Date | null;
	subjectId: string;
	subjectCode: string;
	subjectName: string;
	studentId: string;
	studentName: string;
	studentStudentId: string;
	attendanceStatus: "PRESENT" | "ABSENT" | "LATE";
	markedBy: string;
	createdAt: Date | null;
}

async function getMyTaughtClassesAttendance(teacherId: string, query?: ListAttendanceQuery) {
	const { limit = 100, offset = 0 } = query ? parsePagination(query) : { limit: 100, offset: 0 };

	// Get all attendance records for classes where this teacher teaches the subject
	const records = await db
		.select({
			attendanceId: attendance.id,
			classSessionId: classSessions.id,
			classSessionDate: classSessions.date,
			subjectId: subjects.id,
			subjectCode: subjects.subjectCode,
			subjectName: subjects.subjectName,
			studentId: students.id,
			studentName: students.name,
			studentStudentId: students.studentId,
			attendanceStatus: attendance.status,
			markedBy: attendance.markedBy,
			createdAt: attendance.createdAt,
		})
		.from(attendance)
		.innerJoin(classSessions, eq(attendance.classSessionId, classSessions.id))
		.innerJoin(timetableSlots, eq(classSessions.timetableSlotId, timetableSlots.id))
		.innerJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
		.innerJoin(students, eq(attendance.studentId, students.id))
		.where(eq(timetableSlots.teacherId, teacherId))
		.orderBy(desc(classSessions.date))
		.limit(limit)
		.offset(offset);

	return records;
}

async function getMyClassTeacherClassesAttendance(teacherId: string, query?: ListAttendanceQuery) {
	const { limit = 100, offset = 0 } = query ? parsePagination(query) : { limit: 100, offset: 0 };

	// Get all attendance records for classes in sections where this teacher is the class teacher
	const records = await db
		.select({
			attendanceId: attendance.id,
			classSessionId: classSessions.id,
			classSessionDate: classSessions.date,
			subjectId: subjects.id,
			subjectCode: subjects.subjectCode,
			subjectName: subjects.subjectName,
			studentId: students.id,
			studentName: students.name,
			studentStudentId: students.studentId,
			attendanceStatus: attendance.status,
			markedBy: attendance.markedBy,
			createdAt: attendance.createdAt,
		})
		.from(attendance)
		.innerJoin(classSessions, eq(attendance.classSessionId, classSessions.id))
		.innerJoin(timetableSlots, eq(classSessions.timetableSlotId, timetableSlots.id))
		.innerJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
		.innerJoin(students, eq(attendance.studentId, students.id))
		.innerJoin(sections, eq(timetableSlots.sectionId, sections.id))
		.where(eq(sections.classTeacherId, teacherId))
		.orderBy(desc(classSessions.date))
		.limit(limit)
		.offset(offset);

	return records;
}

// Verify if a teacher can edit an attendance record
async function canTeacherEditAttendance(attendanceId: string, teacherId: string): Promise<boolean> {
	const record = await db
		.select({
			classSessionId: classSessions.id,
		})
		.from(attendance)
		.innerJoin(classSessions, eq(attendance.classSessionId, classSessions.id))
		.innerJoin(timetableSlots, eq(classSessions.timetableSlotId, timetableSlots.id))
		.where(eq(attendance.id, attendanceId))
		.limit(1);

	if (!record.length) {
		return false;
	}

	// Check if teacher teaches this class or is class teacher
	const timetableRecord = await db
		.select()
		.from(timetableSlots)
		.innerJoin(classSessions, eq(classSessions.timetableSlotId, timetableSlots.id))
		.innerJoin(sections, eq(timetableSlots.sectionId, sections.id))
		.where(
			and(
				eq(classSessions.id, record[0].classSessionId),
				or(
					eq(timetableSlots.teacherId, teacherId),
					eq(sections.classTeacherId, teacherId)
				)
			)
		)
		.limit(1);

	return timetableRecord.length > 0;
}

export const attendanceService = {
	createAttendance,
	getAttendance,
	getAttendanceById,
	updateAttendance,
	deleteAttendance,
	getMySubjectAttendanceSummary,
	getMyTaughtClassesAttendance,
	getMyClassTeacherClassesAttendance,
	canTeacherEditAttendance,
	// Aliases (backward compatible)
	create: createAttendance,
	list: getAttendance,
	getById: getAttendanceById,
	update: updateAttendance,
	remove: deleteAttendance,
};
