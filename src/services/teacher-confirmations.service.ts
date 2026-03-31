import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { teacherConfirmations } from "../db/schema.js";
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

async function getConfirmationOrThrow(id: string) {
	const rows = await db
		.select()
		.from(teacherConfirmations)
		.where(eq(teacherConfirmations.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Teacher confirmation not found");
	return rows[0];
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
		.select()
		.from(teacherConfirmations)
		.where(where)
		.orderBy(order === "asc" ? asc(teacherConfirmations.confirmedAt) : desc(teacherConfirmations.confirmedAt))
		.limit(limit)
		.offset(offset);
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
