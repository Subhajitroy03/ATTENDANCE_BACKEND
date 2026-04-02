import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { classSessions, teacherConfirmations, teachers, timetableSlots } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { buildWhere, parsePagination, parseString, type PaginationInput } from "../utils/listQuery.js";

export interface CreateTeacherConfirmationInput {
	classSessionId: string;
	teacherId: string;
}

export interface UpdateTeacherConfirmationInput {
	classSessionId?: string;
	teacherId?: string;
	confirmedAt?: Date;
}

export interface ListTeacherConfirmationsQuery extends PaginationInput {
	classSessionId?: unknown;
	teacherId?: unknown;
}

const confirmationSelect = {
	id: teacherConfirmations.id,
	classSessionId: teacherConfirmations.classSessionId,
	teacherId: teacherConfirmations.teacherId,
	confirmedAt: teacherConfirmations.confirmedAt,
};

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

async function getConfirmationOrThrow(id: string) {
	const rows = await db
		.select({
			confirmation: confirmationSelect,
			classSession: classSessionSelect,
			timetableSlot: timetableSlotSelect,
			teacher: teacherSelect,
		})
		.from(teacherConfirmations)
		.innerJoin(classSessions, eq(teacherConfirmations.classSessionId, classSessions.id))
		.innerJoin(timetableSlots, eq(classSessions.timetableSlotId, timetableSlots.id))
		.innerJoin(teachers, eq(teacherConfirmations.teacherId, teachers.id))
		.where(eq(teacherConfirmations.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Teacher confirmation not found");
	const row = rows[0];
	return {
		...row.confirmation,
		classSession: {
			...row.classSession,
			timetableSlot: row.timetableSlot,
		},
		teacher: row.teacher,
	};
}

async function createTeacherConfirmation(input: CreateTeacherConfirmationInput) {
	const [created] = await db.insert(teacherConfirmations).values(input).returning();
	return created;
}

async function getTeacherConfirmations(query: ListTeacherConfirmationsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const classSessionId = parseString(query.classSessionId);
	const teacherId = parseString(query.teacherId);
	const where = buildWhere(
		classSessionId ? eq(teacherConfirmations.classSessionId, classSessionId) : undefined,
		teacherId ? eq(teacherConfirmations.teacherId, teacherId) : undefined
	);

	return await db
		.select({
			confirmation: confirmationSelect,
			classSession: classSessionSelect,
			timetableSlot: timetableSlotSelect,
			teacher: teacherSelect,
		})
		.from(teacherConfirmations)
		.innerJoin(classSessions, eq(teacherConfirmations.classSessionId, classSessions.id))
		.innerJoin(timetableSlots, eq(classSessions.timetableSlotId, timetableSlots.id))
		.innerJoin(teachers, eq(teacherConfirmations.teacherId, teachers.id))
		.where(where)
		.orderBy(order === "asc" ? asc(teacherConfirmations.confirmedAt) : desc(teacherConfirmations.confirmedAt))
		.limit(limit)
		.offset(offset)
		.then((rows) =>
			rows.map((row) => ({
				...row.confirmation,
				classSession: {
					...row.classSession,
					timetableSlot: row.timetableSlot,
				},
				teacher: row.teacher,
			}))
		);
}

async function getTeacherConfirmationById(id: string) {
	return await getConfirmationOrThrow(id);
}

async function updateTeacherConfirmation(id: string, input: UpdateTeacherConfirmationInput) {
	await getConfirmationOrThrow(id);
	const [updated] = await db
		.update(teacherConfirmations)
		.set(input)
		.where(eq(teacherConfirmations.id, id))
		.returning();
	return updated;
}

async function deleteTeacherConfirmation(id: string) {
	await getConfirmationOrThrow(id);
	const [deleted] = await db
		.delete(teacherConfirmations)
		.where(eq(teacherConfirmations.id, id))
		.returning();
	return deleted;
}

export const teacherConfirmationsService = {
	createTeacherConfirmation,
	getTeacherConfirmations,
	getTeacherConfirmationById,
	updateTeacherConfirmation,
	deleteTeacherConfirmation,
	// Aliases (backward compatible)
	create: createTeacherConfirmation,
	list: getTeacherConfirmations,
	getById: getTeacherConfirmationById,
	update: updateTeacherConfirmation,
	remove: deleteTeacherConfirmation,
};
