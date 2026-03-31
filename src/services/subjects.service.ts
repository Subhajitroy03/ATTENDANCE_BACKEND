import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { subjects } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildSearch,
	buildWhere,
	parseNumber,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateSubjectInput {
	subjectCode: string;
	subjectName: string;
	departmentId: string;
	semester: number;
	credits?: number;
}

export interface UpdateSubjectInput {
	subjectCode?: string;
	subjectName?: string;
	departmentId?: string;
	semester?: number;
	credits?: number;
}

export interface ListSubjectsQuery extends PaginationInput {
	q?: unknown;
	departmentId?: unknown;
	semester?: unknown;
}

async function getSubjectOrThrow(id: string) {
	const rows = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Subject not found");
	return rows[0];
}

async function createSubject(input: CreateSubjectInput) {
	const [created] = await db.insert(subjects).values(input).returning();
	return created;
}

async function getSubjects(query: ListSubjectsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const departmentId = parseString(query.departmentId);
	const semester = parseNumber(query.semester);
	const where = buildWhere(
		buildSearch(query.q, subjects.subjectName, subjects.subjectCode),
		departmentId ? eq(subjects.departmentId, departmentId) : undefined,
		semester === undefined ? undefined : eq(subjects.semester, semester)
	);

	return await db
		.select()
		.from(subjects)
		.where(where)
		.orderBy(order === "asc" ? asc(subjects.subjectCode) : desc(subjects.subjectCode))
		.limit(limit)
		.offset(offset);
}

async function getSubjectById(id: string) {
	return await getSubjectOrThrow(id);
}

async function updateSubject(id: string, input: UpdateSubjectInput) {
	await getSubjectOrThrow(id);
	const [updated] = await db.update(subjects).set(input).where(eq(subjects.id, id)).returning();
	return updated;
}

async function deleteSubject(id: string) {
	await getSubjectOrThrow(id);
	const [deleted] = await db.delete(subjects).where(eq(subjects.id, id)).returning();
	return deleted;
}

export const subjectsService = {
	createSubject,
	getSubjects,
	getSubjectById,
	updateSubject,
	deleteSubject,
	// Aliases (backward compatible)
	create: createSubject,
	list: getSubjects,
	getById: getSubjectById,
	update: updateSubject,
	remove: deleteSubject,
};
