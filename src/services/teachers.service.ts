import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { teachers } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { assertAotEduEmail, normalizeEmail } from "../utils/email.js";
import { hashPassword } from "../utils/hashPass.js";
import {
	buildSearch,
	buildWhere,
	parseBoolean,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateTeacherInput {
	employeeId: string;
	name: string;
	email: string;
	abbreviation?: string;
	phone?: string;
	departmentId: string;
	password: string;
}

export interface UpdateTeacherInput {
	employeeId?: string;
	name?: string;
	email?: string;
	abbreviation?: string;
	phone?: string;
	departmentId?: string;
	password?: string;
	status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED";
	verified?: boolean;
}

export interface ListTeachersQuery extends PaginationInput {
	q?: unknown;
	departmentId?: unknown;
	status?: unknown;
	verified?: unknown;
}

const teacherPublicSelect = {
	id: teachers.id,
	employeeId: teachers.employeeId,
	name: teachers.name,
	email: teachers.email,
	abbreviation: teachers.abbreviation,
	phone: teachers.phone,
	departmentId: teachers.departmentId,
	status: teachers.status,
	role: teachers.role,
	verified: teachers.verified,
	createdAt: teachers.createdAt,
	updatedAt: teachers.updatedAt,
};

async function getTeacherOrThrow(id: string) {
	const rows = await db
		.select(teacherPublicSelect)
		.from(teachers)
		.where(eq(teachers.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Teacher not found");
	return rows[0];
}

async function createTeacher(input: CreateTeacherInput) {
	assertAotEduEmail(input.email);
	const email = normalizeEmail(input.email);
	const password = await hashPassword(input.password);

	const [created] = await db
		.insert(teachers)
		.values({
			employeeId: input.employeeId,
			name: input.name,
			email,
			abbreviation: input.abbreviation,
			phone: input.phone,
			departmentId: input.departmentId,
			password,
		})
		.returning(teacherPublicSelect);

	return created;
}

async function getTeachers(query: ListTeachersQuery) {
	const { limit, offset, order } = parsePagination(query);
	const departmentId = parseString(query.departmentId);
	const status = parseString(query.status);
	const verified = parseBoolean(query.verified);
	const where = buildWhere(
		buildSearch(query.q, teachers.name, teachers.email, teachers.employeeId, teachers.abbreviation),
		departmentId ? eq(teachers.departmentId, departmentId) : undefined,
		status ? eq(teachers.status, status as any) : undefined,
		verified === undefined ? undefined : eq(teachers.verified, verified)
	);

	return await db
		.select(teacherPublicSelect)
		.from(teachers)
		.where(where)
		.orderBy(order === "asc" ? asc(teachers.createdAt) : desc(teachers.createdAt))
		.limit(limit)
		.offset(offset);
}

async function getTeacherById(id: string) {
	return await getTeacherOrThrow(id);
}

async function updateTeacher(id: string, input: UpdateTeacherInput) {
	await getTeacherOrThrow(id);
	const patch: Partial<typeof teachers.$inferInsert> = {};

	if (input.employeeId !== undefined) patch.employeeId = input.employeeId;
	if (input.name !== undefined) patch.name = input.name;
	if (input.email !== undefined) {
		assertAotEduEmail(input.email);
		patch.email = normalizeEmail(input.email);
	}
	if (input.abbreviation !== undefined) patch.abbreviation = input.abbreviation;
	if (input.phone !== undefined) patch.phone = input.phone;
	if (input.departmentId !== undefined) patch.departmentId = input.departmentId;
	if (input.password !== undefined) patch.password = await hashPassword(input.password);
	if (input.status !== undefined) patch.status = input.status as any;
	if (input.verified !== undefined) patch.verified = input.verified;
	patch.updatedAt = new Date();

	const [updated] = await db
		.update(teachers)
		.set(patch)
		.where(eq(teachers.id, id))
		.returning(teacherPublicSelect);
	return updated;
}

async function deleteTeacher(id: string) {
	await getTeacherOrThrow(id);
	const [deleted] = await db
		.delete(teachers)
		.where(eq(teachers.id, id))
		.returning(teacherPublicSelect);
	return deleted;
}

export const teachersService = {
	createTeacher,
	getTeachers,
	getTeacherById,
	updateTeacher,
	deleteTeacher,
	// Aliases (backward compatible)
	create: createTeacher,
	list: getTeachers,
	getById: getTeacherById,
	update: updateTeacher,
	remove: deleteTeacher,
};
