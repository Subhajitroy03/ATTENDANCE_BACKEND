import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { classSwaps } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildWhere,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateSwapInput {
	fromTeacherId: string;
	toTeacherId: string;
	classSessionId: string;
	status?: "PENDING" | "APPROVED" | "REJECTED";
}

export interface UpdateSwapInput {
	fromTeacherId?: string;
	toTeacherId?: string;
	classSessionId?: string;
	status?: "PENDING" | "APPROVED" | "REJECTED";
	respondedAt?: Date;
}

export interface ListSwapsQuery extends PaginationInput {
	fromTeacherId?: unknown;
	toTeacherId?: unknown;
	classSessionId?: unknown;
	status?: unknown;
}

async function getSwapOrThrow(id: string) {
	const rows = await db.select().from(classSwaps).where(eq(classSwaps.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Swap not found");
	return rows[0];
}

async function createSwap(input: CreateSwapInput) {
	const [created] = await db.insert(classSwaps).values(input as any).returning();
	return created;
}

async function getSwaps(query: ListSwapsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const fromTeacherId = parseString(query.fromTeacherId);
	const toTeacherId = parseString(query.toTeacherId);
	const classSessionId = parseString(query.classSessionId);
	const status = parseString(query.status);
	const where = buildWhere(
		fromTeacherId ? eq(classSwaps.fromTeacherId, fromTeacherId) : undefined,
		toTeacherId ? eq(classSwaps.toTeacherId, toTeacherId) : undefined,
		classSessionId ? eq(classSwaps.classSessionId, classSessionId) : undefined,
		status ? eq(classSwaps.status, status as any) : undefined
	);

	return await db
		.select()
		.from(classSwaps)
		.where(where)
		.orderBy(order === "asc" ? asc(classSwaps.requestedAt) : desc(classSwaps.requestedAt))
		.limit(limit)
		.offset(offset);
}

async function getSwapById(id: string) {
	return await getSwapOrThrow(id);
}

async function updateSwap(id: string, input: UpdateSwapInput) {
	await getSwapOrThrow(id);
	const [updated] = await db
		.update(classSwaps)
		.set(input as any)
		.where(eq(classSwaps.id, id))
		.returning();
	return updated;
}

async function deleteSwap(id: string) {
	await getSwapOrThrow(id);
	const [deleted] = await db.delete(classSwaps).where(eq(classSwaps.id, id)).returning();
	return deleted;
}

export const swapsService = {
	createSwap,
	getSwaps,
	getSwapById,
	updateSwap,
	deleteSwap,
	// Aliases (backward compatible)
	create: createSwap,
	list: getSwaps,
	getById: getSwapById,
	update: updateSwap,
	remove: deleteSwap,
};
