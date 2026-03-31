import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildSearch,
	buildWhere,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateAuditLogInput {
	actorId: string;
	action: string;
	entity: string;
	entityId: string;
}

export interface UpdateAuditLogInput {
	actorId?: string;
	action?: string;
	entity?: string;
	entityId?: string;
}

export interface ListAuditLogsQuery extends PaginationInput {
	q?: unknown;
	actorId?: unknown;
	entity?: unknown;
	entityId?: unknown;
}

async function getAuditLogOrThrow(id: string) {
	const rows = await db.select().from(auditLogs).where(eq(auditLogs.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Audit log not found");
	return rows[0];
}

async function createAuditLog(input: CreateAuditLogInput) {
	const [created] = await db.insert(auditLogs).values(input).returning();
	return created;
}

async function getAuditLogs(query: ListAuditLogsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const actorId = parseString(query.actorId);
	const entity = parseString(query.entity);
	const entityId = parseString(query.entityId);
	const where = buildWhere(
		buildSearch(query.q, auditLogs.action, auditLogs.entity),
		actorId ? eq(auditLogs.actorId, actorId) : undefined,
		entity ? eq(auditLogs.entity, entity) : undefined,
		entityId ? eq(auditLogs.entityId, entityId) : undefined
	);

	return await db
		.select()
		.from(auditLogs)
		.where(where)
		.orderBy(order === "asc" ? asc(auditLogs.timestamp) : desc(auditLogs.timestamp))
		.limit(limit)
		.offset(offset);
}

async function getAuditLogById(id: string) {
	return await getAuditLogOrThrow(id);
}

async function updateAuditLog(id: string, input: UpdateAuditLogInput) {
	await getAuditLogOrThrow(id);
	const [updated] = await db.update(auditLogs).set(input).where(eq(auditLogs.id, id)).returning();
	return updated;
}

async function deleteAuditLog(id: string) {
	await getAuditLogOrThrow(id);
	const [deleted] = await db.delete(auditLogs).where(eq(auditLogs.id, id)).returning();
	return deleted;
}

export const auditLogsService = {
	createAuditLog,
	getAuditLogs,
	getAuditLogById,
	updateAuditLog,
	deleteAuditLog,
	// Aliases (backward compatible)
	create: createAuditLog,
	list: getAuditLogs,
	getById: getAuditLogById,
	update: updateAuditLog,
	remove: deleteAuditLog,
};
