import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { admins } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { assertAotEduEmail, normalizeEmail } from "../utils/email.js";
import { hashPassword } from "../utils/hashPass.js";
import {
	buildSearch,
	buildWhere,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateAdminInput {
	email: string;
	password: string;
}

export interface UpdateAdminInput {
	email?: string;
	password?: string;
	status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED";
}

export interface ListAdminsQuery extends PaginationInput {
	q?: unknown;
	status?: unknown;
}

const adminPublicSelect = {
	id: admins.id,
	email: admins.email,
	role: admins.role,
	status: admins.status,
	createdAt: admins.createdAt,
	updatedAt: admins.updatedAt,
};

async function getAdminOrThrow(id: string) {
	const rows = await db
		.select(adminPublicSelect)
		.from(admins)
		.where(eq(admins.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
	return rows[0];
}

async function createAdmin(input: CreateAdminInput) {
	assertAotEduEmail(input.email);
	const email = normalizeEmail(input.email);
	const password = await hashPassword(input.password);

	const [created] = await db
		.insert(admins)
		.values({ email, password })
		.returning(adminPublicSelect);

	return created;
}

async function getAdmins(query: ListAdminsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const status = parseString(query.status);
	const where = buildWhere(
		buildSearch(query.q, admins.email),
		status ? eq(admins.status, status as any) : undefined
	);

	return await db
		.select(adminPublicSelect)
		.from(admins)
		.where(where)
		.orderBy(order === "asc" ? asc(admins.createdAt) : desc(admins.createdAt))
		.limit(limit)
		.offset(offset);
}

async function getAdminById(id: string) {
	return await getAdminOrThrow(id);
}

async function updateAdmin(id: string, input: UpdateAdminInput) {
	await getAdminOrThrow(id);
	const patch: Partial<typeof admins.$inferInsert> = {};

	if (input.email !== undefined) {
		assertAotEduEmail(input.email);
		patch.email = normalizeEmail(input.email);
	}
	if (input.password !== undefined) {
		patch.password = await hashPassword(input.password);
	}
	if (input.status !== undefined) {
		patch.status = input.status as any;
	}
	patch.updatedAt = new Date();

	const [updated] = await db
		.update(admins)
		.set(patch)
		.where(eq(admins.id, id))
		.returning(adminPublicSelect);
	return updated;
}

async function deleteAdmin(id: string) {
	await getAdminOrThrow(id);
	const [deleted] = await db
		.delete(admins)
		.where(eq(admins.id, id))
		.returning(adminPublicSelect);
	return deleted;
}

export const adminsService = {
	createAdmin,
	getAdmins,
	getAdminById,
	updateAdmin,
	deleteAdmin,
	// Aliases (backward compatible)
	create: createAdmin,
	list: getAdmins,
	getById: getAdminById,
	update: updateAdmin,
	remove: deleteAdmin,
};

