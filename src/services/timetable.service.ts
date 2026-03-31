import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { timetableSlots } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { buildWhere, parsePagination, parseString, type PaginationInput } from "../utils/listQuery.js";

export interface CreateTimetableSlotInput {
	sectionId: string;
	dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
	startTime: string;
	endTime: string;
	subjectId: string;
	teacherId: string;
	roomId?: string;
}

export interface UpdateTimetableSlotInput {
	sectionId?: string;
	dayOfWeek?: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
	startTime?: string;
	endTime?: string;
	subjectId?: string;
	teacherId?: string;
	roomId?: string;
}

export interface ListTimetableSlotsQuery extends PaginationInput {
	sectionId?: unknown;
	dayOfWeek?: unknown;
	subjectId?: unknown;
	teacherId?: unknown;
	roomId?: unknown;
}

async function getSlotOrThrow(id: string) {
	const rows = await db.select().from(timetableSlots).where(eq(timetableSlots.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Timetable slot not found");
	return rows[0];
}

async function createTimetableSlot(input: CreateTimetableSlotInput) {
	const [created] = await db.insert(timetableSlots).values(input as any).returning();
	return created;
}

async function getTimetableSlots(query: ListTimetableSlotsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const sectionId = parseString(query.sectionId);
	const dayOfWeek = parseString(query.dayOfWeek);
	const subjectId = parseString(query.subjectId);
	const teacherId = parseString(query.teacherId);
	const roomId = parseString(query.roomId);
	const where = buildWhere(
		sectionId ? eq(timetableSlots.sectionId, sectionId) : undefined,
		dayOfWeek ? eq(timetableSlots.dayOfWeek, dayOfWeek as any) : undefined,
		subjectId ? eq(timetableSlots.subjectId, subjectId) : undefined,
		teacherId ? eq(timetableSlots.teacherId, teacherId) : undefined,
		roomId ? eq(timetableSlots.roomId, roomId) : undefined
	);

	return await db
		.select()
		.from(timetableSlots)
		.where(where)
		.orderBy(order === "asc" ? asc(timetableSlots.startTime) : desc(timetableSlots.startTime))
		.limit(limit)
		.offset(offset);
}

async function getTimetableSlotById(id: string) {
	return await getSlotOrThrow(id);
}

async function updateTimetableSlot(id: string, input: UpdateTimetableSlotInput) {
	await getSlotOrThrow(id);
	const [updated] = await db
		.update(timetableSlots)
		.set(input as any)
		.where(eq(timetableSlots.id, id))
		.returning();
	return updated;
}

async function deleteTimetableSlot(id: string) {
	await getSlotOrThrow(id);
	const [deleted] = await db.delete(timetableSlots).where(eq(timetableSlots.id, id)).returning();
	return deleted;
}

export const timetableService = {
	createTimetableSlot,
	getTimetableSlots,
	getTimetableSlotById,
	updateTimetableSlot,
	deleteTimetableSlot,
	// Aliases (backward compatible)
	create: createTimetableSlot,
	list: getTimetableSlots,
	getById: getTimetableSlotById,
	update: updateTimetableSlot,
	remove: deleteTimetableSlot,
};
