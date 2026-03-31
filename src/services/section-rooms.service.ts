import { StatusCodes } from "http-status-codes";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { sectionRooms } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { buildWhere, parsePagination, parseString, type PaginationInput } from "../utils/listQuery.js";

export interface CreateSectionRoomInput {
	sectionId: string;
	roomId: string;
}

export interface UpdateSectionRoomInput {
	sectionId?: string;
	roomId?: string;
}

export interface ListSectionRoomsQuery extends PaginationInput {
	sectionId?: unknown;
	roomId?: unknown;
}

async function getMappingOrThrow(id: string) {
	const rows = await db.select().from(sectionRooms).where(eq(sectionRooms.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Section-room mapping not found");
	return rows[0];
}

async function createSectionRoom(input: CreateSectionRoomInput) {
	const [created] = await db.insert(sectionRooms).values(input).returning();
	return created;
}

async function getSectionRooms(query: ListSectionRoomsQuery) {
	const { limit, offset } = parsePagination(query);
	const sectionId = parseString(query.sectionId);
	const roomId = parseString(query.roomId);
	const where = buildWhere(
		sectionId ? eq(sectionRooms.sectionId, sectionId) : undefined,
		roomId ? eq(sectionRooms.roomId, roomId) : undefined
	);
	return await db.select().from(sectionRooms).where(where).limit(limit).offset(offset);
}

async function getSectionRoomById(id: string) {
	return await getMappingOrThrow(id);
}

async function updateSectionRoom(id: string, input: UpdateSectionRoomInput) {
	await getMappingOrThrow(id);
	const [updated] = await db.update(sectionRooms).set(input).where(eq(sectionRooms.id, id)).returning();
	return updated;
}

async function deleteSectionRoom(id: string) {
	await getMappingOrThrow(id);
	const [deleted] = await db.delete(sectionRooms).where(eq(sectionRooms.id, id)).returning();
	return deleted;
}

export const sectionRoomsService = {
	createSectionRoom,
	getSectionRooms,
	getSectionRoomById,
	updateSectionRoom,
	deleteSectionRoom,
	// Aliases (backward compatible)
	create: createSectionRoom,
	list: getSectionRooms,
	getById: getSectionRoomById,
	update: updateSectionRoom,
	remove: deleteSectionRoom,
};
