import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { students } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { assertAotEduEmail, normalizeEmail } from "../utils/email.js";
import {
	buildSearch,
	buildWhere,
	parseBoolean,
	parseNumber,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateStudentInput {
	studentId: string;
	name: string;
	email: string;
	departmentId: string;
	semester: number;
	section: string;
}

export interface UpdateStudentInput {
	studentId?: string;
	name?: string;
	email?: string;
	departmentId?: string;
	semester?: number;
	section?: string;
	status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED";
	verified?: boolean;
}

export interface ListStudentsQuery extends PaginationInput {
	q?: unknown;
	departmentId?: unknown;
	semester?: unknown;
	section?: unknown;
	status?: unknown;
	verified?: unknown;
}

async function getStudentOrThrow(id: string) {
	const rows = await db.select().from(students).where(eq(students.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Student not found");
	return rows[0];
}

async function createStudent(input: CreateStudentInput) {
	assertAotEduEmail(input.email);
	const [created] = await db
		.insert(students)
		.values({
			studentId: input.studentId,
			name: input.name,
			email: normalizeEmail(input.email),
			departmentId: input.departmentId,
			semester: input.semester,
			section: input.section,
		})
		.returning();

	return created;
}

async function getStudents(query: ListStudentsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const departmentId = parseString(query.departmentId);
	const semester = parseNumber(query.semester);
	const section = parseString(query.section);
	const status = parseString(query.status);
	const verified = parseBoolean(query.verified);
	const where = buildWhere(
		buildSearch(query.q, students.name, students.email, students.studentId),
		departmentId ? eq(students.departmentId, departmentId) : undefined,
		semester === undefined ? undefined : eq(students.semester, semester),
		section ? eq(students.section, section) : undefined,
		status ? eq(students.status, status as any) : undefined,
		verified === undefined ? undefined : eq(students.verified, verified)
	);

	return await db
		.select()
		.from(students)
		.where(where)
		.orderBy(order === "asc" ? asc(students.createdAt) : desc(students.createdAt))
		.limit(limit)
		.offset(offset);
}

async function getStudentById(id: string) {
	return await getStudentOrThrow(id);
}

async function updateStudent(id: string, input: UpdateStudentInput) {
	await getStudentOrThrow(id);
	const patch: Partial<typeof students.$inferInsert> = {};

	if (input.studentId !== undefined) patch.studentId = input.studentId;
	if (input.name !== undefined) patch.name = input.name;
	if (input.email !== undefined) {
		assertAotEduEmail(input.email);
		patch.email = normalizeEmail(input.email);
	}
	if (input.departmentId !== undefined) patch.departmentId = input.departmentId;
	if (input.semester !== undefined) patch.semester = input.semester;
	if (input.section !== undefined) patch.section = input.section;
	if (input.status !== undefined) patch.status = input.status as any;
	if (input.verified !== undefined) patch.verified = input.verified;
	patch.updatedAt = new Date();

	const [updated] = await db
		.update(students)
		.set(patch)
		.where(eq(students.id, id))
		.returning();
	return updated;
}

async function deleteStudent(id: string) {
	await getStudentOrThrow(id);
	const [deleted] = await db.delete(students).where(eq(students.id, id)).returning();
	return deleted;
}

export const studentsService = {
	createStudent,
	getStudents,
	getStudentById,
	updateStudent,
	deleteStudent,
	// Aliases (backward compatible)
	create: createStudent,
	list: getStudents,
	getById: getStudentById,
	update: updateStudent,
	remove: deleteStudent,
};
