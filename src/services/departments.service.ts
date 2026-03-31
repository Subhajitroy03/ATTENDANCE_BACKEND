import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { departments } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildSearch,
	buildWhere,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateDepartmentInput {
	name: string;
	code: string;
}

export interface UpdateDepartmentInput {
	name?: string;
	code?: string;
}

export interface ListDepartmentsQuery extends PaginationInput {
	q?: unknown;
	code?: unknown;
}

async function getDepartmentOrThrow(id: string) {
	const rows = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
	return rows[0];
}

async function createDepartment(input: CreateDepartmentInput) {
	const [created] = await db.insert(departments).values(input).returning();
	return created;
}

async function getDepartments(query: ListDepartmentsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const code = parseString(query.code);
	const where = buildWhere(
		buildSearch(query.q, departments.name, departments.code),
		code ? eq(departments.code, code) : undefined
	);

	return await db
		.select()
		.from(departments)
		.where(where)
		.orderBy(order === "asc" ? asc(departments.createdAt) : desc(departments.createdAt))
		.limit(limit)
		.offset(offset);
}

async function getDepartmentById(id: string) {
	return await getDepartmentOrThrow(id);
}

async function updateDepartment(id: string, input: UpdateDepartmentInput) {
	await getDepartmentOrThrow(id);
	const [updated] = await db
		.update(departments)
		.set(input)
		.where(eq(departments.id, id))
		.returning();
	return updated;
}

async function deleteDepartment(id: string) {
	await getDepartmentOrThrow(id);
	const [deleted] = await db.delete(departments).where(eq(departments.id, id)).returning();
	return deleted;
}

export const departmentsService = {
	createDepartment,
	getDepartments,
	getDepartmentById,
	updateDepartment,
	deleteDepartment,
	// Aliases (backward compatible)
	create: createDepartment,
	list: getDepartments,
	getById: getDepartmentById,
	update: updateDepartment,
	remove: deleteDepartment,
};
