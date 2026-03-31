import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { rooms } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildSearch,
	buildWhere,
	parseNumber,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateRoomInput {
	roomNumber: string;
	capacity?: number;
	block?: string;
	floor?: number;
}

export interface UpdateRoomInput {
	roomNumber?: string;
	capacity?: number;
	block?: string;
	floor?: number;
}

export interface ListRoomsQuery extends PaginationInput {
	q?: unknown;
	block?: unknown;
	floor?: unknown;
}

async function getRoomOrThrow(id: string) {
	const rows = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Room not found");
	return rows[0];
}

async function createRoom(input: CreateRoomInput) {
	const [created] = await db.insert(rooms).values(input).returning();
	return created;
}

async function getRooms(query: ListRoomsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const block = parseString(query.block);
	const floor = parseNumber(query.floor);
	const where = buildWhere(
		buildSearch(query.q, rooms.roomNumber, rooms.block),
		block ? eq(rooms.block, block) : undefined,
		floor === undefined ? undefined : eq(rooms.floor, floor)
	);

	return await db
		.select()
		.from(rooms)
		.where(where)
		.orderBy(order === "asc" ? asc(rooms.roomNumber) : desc(rooms.roomNumber))
		.limit(limit)
		.offset(offset);
}

async function getRoomById(id: string) {
	return await getRoomOrThrow(id);
}

async function updateRoom(id: string, input: UpdateRoomInput) {
	await getRoomOrThrow(id);
	const [updated] = await db.update(rooms).set(input).where(eq(rooms.id, id)).returning();
	return updated;
}

async function deleteRoom(id: string) {
	await getRoomOrThrow(id);
	const [deleted] = await db.delete(rooms).where(eq(rooms.id, id)).returning();
	return deleted;
}

export const roomsService = {
	createRoom,
	getRooms,
	getRoomById,
	updateRoom,
	deleteRoom,
	// Aliases (backward compatible)
	create: createRoom,
	list: getRooms,
	getById: getRoomById,
	update: updateRoom,
	remove: deleteRoom,
};
