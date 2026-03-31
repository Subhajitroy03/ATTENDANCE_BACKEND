import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { attendance } from "../db/schema.js";
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

export const attendanceService = {
	createAttendance,
	getAttendance,
	getAttendanceById,
	updateAttendance,
	deleteAttendance,
	// Aliases (backward compatible)
	create: createAttendance,
	list: getAttendance,
	getById: getAttendanceById,
	update: updateAttendance,
	remove: deleteAttendance,
};
