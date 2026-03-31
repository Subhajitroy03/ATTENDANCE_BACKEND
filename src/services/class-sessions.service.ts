import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { classSessions } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildWhere,
	parseBoolean,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateClassSessionInput {
	timetableSlotId: string;
	date: string;
	status?: "SCHEDULED" | "STARTED" | "COMPLETED" | "CANCELLED";
	teacherConfirmed?: boolean;
	startTime?: string;
	endTime?: string;
}

export interface UpdateClassSessionInput {
	status?: "SCHEDULED" | "STARTED" | "COMPLETED" | "CANCELLED";
	teacherConfirmed?: boolean;
	startTime?: string;
	endTime?: string;
}

export interface ListClassSessionsQuery extends PaginationInput {
	timetableSlotId?: unknown;
	status?: unknown;
	teacherConfirmed?: unknown;
	date?: unknown;
}

async function getSessionOrThrow(id: string) {
	const rows = await db.select().from(classSessions).where(eq(classSessions.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Class session not found");
	return rows[0];
}

async function createClassSession(input: CreateClassSessionInput) {
	const [created] = await db.insert(classSessions).values(input as any).returning();
	return created;
}

async function getClassSessions(query: ListClassSessionsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const timetableSlotId = parseString(query.timetableSlotId);
	const status = parseString(query.status);
	const teacherConfirmed = parseBoolean(query.teacherConfirmed);
	const date = parseString(query.date);

	const where = buildWhere(
		timetableSlotId ? eq(classSessions.timetableSlotId, timetableSlotId) : undefined,
		status ? eq(classSessions.status, status as any) : undefined,
		teacherConfirmed === undefined ? undefined : eq(classSessions.teacherConfirmed, teacherConfirmed),
		date ? eq(classSessions.date, date as any) : undefined
	);

	return await db
		.select()
		.from(classSessions)
		.where(where)
		.orderBy(order === "asc" ? asc(classSessions.date) : desc(classSessions.date))
		.limit(limit)
		.offset(offset);
}

async function getClassSessionById(id: string) {
	return await getSessionOrThrow(id);
}

async function updateClassSession(id: string, input: UpdateClassSessionInput) {
	await getSessionOrThrow(id);
	const [updated] = await db
		.update(classSessions)
		.set(input as any)
		.where(eq(classSessions.id, id))
		.returning();
	return updated;
}

async function deleteClassSession(id: string) {
	await getSessionOrThrow(id);
	const [deleted] = await db.delete(classSessions).where(eq(classSessions.id, id)).returning();
	return deleted;
}

export const classSessionsService = {
	createClassSession,
	getClassSessions,
	getClassSessionById,
	updateClassSession,
	deleteClassSession,
	// Aliases (backward compatible)
	create: createClassSession,
	list: getClassSessions,
	getById: getClassSessionById,
	update: updateClassSession,
	remove: deleteClassSession,
};
