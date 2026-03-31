import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { subjectTeachers } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildWhere,
	parseBoolean,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateSubjectTeacherInput {
	subjectId: string;
	teacherId: string;
	isActive?: boolean;
}

export interface UpdateSubjectTeacherInput {
	isActive?: boolean;
}

export interface ListSubjectTeachersQuery extends PaginationInput {
	subjectId?: unknown;
	teacherId?: unknown;
	isActive?: unknown;
}

async function getMappingOrThrow(id: string) {
	const rows = await db
		.select()
		.from(subjectTeachers)
		.where(eq(subjectTeachers.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Subject-teacher mapping not found");
	return rows[0];
}

async function createSubjectTeacher(input: CreateSubjectTeacherInput) {
	const [created] = await db.insert(subjectTeachers).values(input as any).returning();
	return created;
}

async function getSubjectTeachers(query: ListSubjectTeachersQuery) {
	const { limit, offset, order } = parsePagination(query);
	const subjectId = parseString(query.subjectId);
	const teacherId = parseString(query.teacherId);
	const isActive = parseBoolean(query.isActive);

	const where = buildWhere(
		subjectId ? eq(subjectTeachers.subjectId, subjectId) : undefined,
		teacherId ? eq(subjectTeachers.teacherId, teacherId) : undefined,
		isActive === undefined ? undefined : eq(subjectTeachers.isActive, isActive)
	);

	return await db
		.select()
		.from(subjectTeachers)
		.where(where)
		.orderBy(order === "asc" ? asc(subjectTeachers.assignedAt) : desc(subjectTeachers.assignedAt))
		.limit(limit)
		.offset(offset);
}

async function getSubjectTeacherById(id: string) {
	return await getMappingOrThrow(id);
}

async function updateSubjectTeacher(id: string, input: UpdateSubjectTeacherInput) {
	await getMappingOrThrow(id);
	const [updated] = await db
		.update(subjectTeachers)
		.set(input)
		.where(eq(subjectTeachers.id, id))
		.returning();
	return updated;
}

async function deleteSubjectTeacher(id: string) {
	await getMappingOrThrow(id);
	const [deleted] = await db.delete(subjectTeachers).where(eq(subjectTeachers.id, id)).returning();
	return deleted;
}

export const subjectTeachersService = {
	createSubjectTeacher,
	getSubjectTeachers,
	getSubjectTeacherById,
	updateSubjectTeacher,
	deleteSubjectTeacher,
	// Aliases (backward compatible)
	create: createSubjectTeacher,
	list: getSubjectTeachers,
	getById: getSubjectTeacherById,
	update: updateSubjectTeacher,
	remove: deleteSubjectTeacher,
};
