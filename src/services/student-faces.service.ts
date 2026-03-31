import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { studentFaces } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildWhere,
	parseBoolean,
	parseNumber,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateStudentFaceInput {
	studentId: string;
	faceEmbedding?: string;
	faceImageUrl: string;
	version: number;
	isActive?: boolean;
}

export interface UpdateStudentFaceInput {
	faceEmbedding?: string;
	faceImageUrl?: string;
	version?: number;
	isActive?: boolean;
}

export interface ListStudentFacesQuery extends PaginationInput {
	studentId?: unknown;
	version?: unknown;
	isActive?: unknown;
}

async function getFaceOrThrow(id: string) {
	const rows = await db.select().from(studentFaces).where(eq(studentFaces.id, id)).limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Student face not found");
	return rows[0];
}

async function createStudentFace(input: CreateStudentFaceInput) {
	const [created] = await db.insert(studentFaces).values(input as any).returning();
	return created;
}

async function getStudentFaces(query: ListStudentFacesQuery) {
	const { limit, offset, order } = parsePagination(query);
	const studentId = parseString(query.studentId);
	const version = parseNumber(query.version);
	const isActive = parseBoolean(query.isActive);

	const where = buildWhere(
		studentId ? eq(studentFaces.studentId, studentId) : undefined,
		version === undefined ? undefined : eq(studentFaces.version, version),
		isActive === undefined ? undefined : eq(studentFaces.isActive, isActive)
	);

	return await db
		.select()
		.from(studentFaces)
		.where(where)
		.orderBy(order === "asc" ? asc(studentFaces.createdAt) : desc(studentFaces.createdAt))
		.limit(limit)
		.offset(offset);
}

async function getStudentFaceById(id: string) {
	return await getFaceOrThrow(id);
}

async function updateStudentFace(id: string, input: UpdateStudentFaceInput) {
	await getFaceOrThrow(id);
	const [updated] = await db
		.update(studentFaces)
		.set(input as any)
		.where(eq(studentFaces.id, id))
		.returning();
	return updated;
}

async function deleteStudentFace(id: string) {
	await getFaceOrThrow(id);
	const [deleted] = await db.delete(studentFaces).where(eq(studentFaces.id, id)).returning();
	return deleted;
}

export const studentFacesService = {
	createStudentFace,
	getStudentFaces,
	getStudentFaceById,
	updateStudentFace,
	deleteStudentFace,
	// Aliases (backward compatible)
	create: createStudentFace,
	list: getStudentFaces,
	getById: getStudentFaceById,
	update: updateStudentFace,
	remove: deleteStudentFace,
};
