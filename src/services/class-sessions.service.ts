import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { classSessions, rooms, sections, subjects, teachers, timetableSlots } from "../db/schema.js";
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

const classSessionSelect = {
	id: classSessions.id,
	timetableSlotId: classSessions.timetableSlotId,
	date: classSessions.date,
	status: classSessions.status,
	teacherConfirmed: classSessions.teacherConfirmed,
	startTime: classSessions.startTime,
	endTime: classSessions.endTime,
};

const timetableSlotSelect = {
	id: timetableSlots.id,
	sectionId: timetableSlots.sectionId,
	dayOfWeek: timetableSlots.dayOfWeek,
	startTime: timetableSlots.startTime,
	endTime: timetableSlots.endTime,
	subjectId: timetableSlots.subjectId,
	teacherId: timetableSlots.teacherId,
	roomId: timetableSlots.roomId,
};

const sectionSelect = {
	id: sections.id,
	departmentId: sections.departmentId,
	semester: sections.semester,
	section: sections.section,
	classTeacherId: sections.classTeacherId,
	name: sections.name,
	capacity: sections.capacity,
	createdAt: sections.createdAt,
};

const subjectSelect = {
	id: subjects.id,
	subjectCode: subjects.subjectCode,
	subjectName: subjects.subjectName,
	departmentId: subjects.departmentId,
	semester: subjects.semester,
	credits: subjects.credits,
};

const teacherSelect = {
	id: teachers.id,
	employeeId: teachers.employeeId,
	name: teachers.name,
	email: teachers.email,
	abbreviation: teachers.abbreviation,
	phone: teachers.phone,
	photo: teachers.photo,
	departmentId: teachers.departmentId,
	status: teachers.status,
	role: teachers.role,
	verified: teachers.verified,
	createdAt: teachers.createdAt,
	updatedAt: teachers.updatedAt,
};

const roomSelect = {
	id: rooms.id,
	roomNumber: rooms.roomNumber,
	capacity: rooms.capacity,
	block: rooms.block,
	floor: rooms.floor,
};

async function getSessionOrThrow(id: string) {
	const rows = await db
		.select({
			session: classSessionSelect,
			timetableSlot: timetableSlotSelect,
			section: sectionSelect,
			subject: subjectSelect,
			teacher: teacherSelect,
			room: roomSelect,
		})
		.from(classSessions)
		.innerJoin(timetableSlots, eq(classSessions.timetableSlotId, timetableSlots.id))
		.innerJoin(sections, eq(timetableSlots.sectionId, sections.id))
		.innerJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
		.innerJoin(teachers, eq(timetableSlots.teacherId, teachers.id))
		.leftJoin(rooms, eq(timetableSlots.roomId, rooms.id))
		.where(eq(classSessions.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Class session not found");
	const row = rows[0];
	return {
		...row.session,
		timetableSlot: {
			...row.timetableSlot,
			section: row.section,
			subject: row.subject,
			teacher: row.teacher,
			room: row.room,
		},
	};
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
		.select({
			session: classSessionSelect,
			timetableSlot: timetableSlotSelect,
			section: sectionSelect,
			subject: subjectSelect,
			teacher: teacherSelect,
			room: roomSelect,
		})
		.from(classSessions)
		.innerJoin(timetableSlots, eq(classSessions.timetableSlotId, timetableSlots.id))
		.innerJoin(sections, eq(timetableSlots.sectionId, sections.id))
		.innerJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
		.innerJoin(teachers, eq(timetableSlots.teacherId, teachers.id))
		.leftJoin(rooms, eq(timetableSlots.roomId, rooms.id))
		.where(where)
		.orderBy(order === "asc" ? asc(classSessions.date) : desc(classSessions.date))
		.limit(limit)
		.offset(offset)
		.then((rows) =>
			rows.map((row) => ({
				...row.session,
				timetableSlot: {
					...row.timetableSlot,
					section: row.section,
					subject: row.subject,
					teacher: row.teacher,
					room: row.room,
				},
			}))
		);
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
