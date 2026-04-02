import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "../db/index.js";
import { classSessions, classSwaps, teachers, timetableSlots } from "../db/schema.js";
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

const swapSelect = {
	id: classSwaps.id,
	fromTeacherId: classSwaps.fromTeacherId,
	toTeacherId: classSwaps.toTeacherId,
	classSessionId: classSwaps.classSessionId,
	status: classSwaps.status,
	requestedAt: classSwaps.requestedAt,
	respondedAt: classSwaps.respondedAt,
};

const teacherSelect = {
	id: teachers.id,
	employeeId: teachers.employeeId,
	name: teachers.name,
	email: teachers.email,
	abbreviation: teachers.abbreviation,
	phone: teachers.phone,
	photo: teachers.photo,
	departmentId: teachers.departmentId,
	status: teachers.status,
	role: teachers.role,
	verified: teachers.verified,
	createdAt: teachers.createdAt,
	updatedAt: teachers.updatedAt,
};

const classSessionSelect = {
	id: classSessions.id,
	timetableSlotId: classSessions.timetableSlotId,
	date: classSessions.date,
	status: classSessions.status,
	teacherConfirmed: classSessions.teacherConfirmed,
	startTime: classSessions.startTime,
	endTime: classSessions.endTime,
};

const timetableSlotSelect = {
	id: timetableSlots.id,
	sectionId: timetableSlots.sectionId,
	dayOfWeek: timetableSlots.dayOfWeek,
	startTime: timetableSlots.startTime,
	endTime: timetableSlots.endTime,
	subjectId: timetableSlots.subjectId,
	teacherId: timetableSlots.teacherId,
	roomId: timetableSlots.roomId,
};

async function getSwapOrThrow(id: string) {
	const fromTeachers = alias(teachers, "from_teachers");
	const toTeachers = alias(teachers, "to_teachers");

	const rows = await db
		.select({
			swap: swapSelect,
			fromTeacher: {
				id: fromTeachers.id,
				employeeId: fromTeachers.employeeId,
				name: fromTeachers.name,
				email: fromTeachers.email,
				abbreviation: fromTeachers.abbreviation,
				phone: fromTeachers.phone,
				photo: fromTeachers.photo,
				departmentId: fromTeachers.departmentId,
				status: fromTeachers.status,
				role: fromTeachers.role,
				verified: fromTeachers.verified,
				createdAt: fromTeachers.createdAt,
				updatedAt: fromTeachers.updatedAt,
			},
			toTeacher: {
				id: toTeachers.id,
				employeeId: toTeachers.employeeId,
				name: toTeachers.name,
				email: toTeachers.email,
				abbreviation: toTeachers.abbreviation,
				phone: toTeachers.phone,
				photo: toTeachers.photo,
				departmentId: toTeachers.departmentId,
				status: toTeachers.status,
				role: toTeachers.role,
				verified: toTeachers.verified,
				createdAt: toTeachers.createdAt,
				updatedAt: toTeachers.updatedAt,
			},
			classSession: classSessionSelect,
			timetableSlot: timetableSlotSelect,
		})
		.from(classSwaps)
		.innerJoin(fromTeachers, eq(classSwaps.fromTeacherId, fromTeachers.id))
		.innerJoin(toTeachers, eq(classSwaps.toTeacherId, toTeachers.id))
		.innerJoin(classSessions, eq(classSwaps.classSessionId, classSessions.id))
		.innerJoin(timetableSlots, eq(classSessions.timetableSlotId, timetableSlots.id))
		.where(eq(classSwaps.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Swap not found");
	const row = rows[0];
	return {
		...row.swap,
		fromTeacher: row.fromTeacher,
		toTeacher: row.toTeacher,
		classSession: {
			...row.classSession,
			timetableSlot: row.timetableSlot,
		},
	};
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
	const fromTeachers = alias(teachers, "from_teachers");
	const toTeachers = alias(teachers, "to_teachers");
	const where = buildWhere(
		fromTeacherId ? eq(classSwaps.fromTeacherId, fromTeacherId) : undefined,
		toTeacherId ? eq(classSwaps.toTeacherId, toTeacherId) : undefined,
		classSessionId ? eq(classSwaps.classSessionId, classSessionId) : undefined,
		status ? eq(classSwaps.status, status as any) : undefined
	);

	return await db
		.select({
			swap: swapSelect,
			fromTeacher: {
				id: fromTeachers.id,
				employeeId: fromTeachers.employeeId,
				name: fromTeachers.name,
				email: fromTeachers.email,
				abbreviation: fromTeachers.abbreviation,
				phone: fromTeachers.phone,
				photo: fromTeachers.photo,
				departmentId: fromTeachers.departmentId,
				status: fromTeachers.status,
				role: fromTeachers.role,
				verified: fromTeachers.verified,
				createdAt: fromTeachers.createdAt,
				updatedAt: fromTeachers.updatedAt,
			},
			toTeacher: {
				id: toTeachers.id,
				employeeId: toTeachers.employeeId,
				name: toTeachers.name,
				email: toTeachers.email,
				abbreviation: toTeachers.abbreviation,
				phone: toTeachers.phone,
				photo: toTeachers.photo,
				departmentId: toTeachers.departmentId,
				status: toTeachers.status,
				role: toTeachers.role,
				verified: toTeachers.verified,
				createdAt: toTeachers.createdAt,
				updatedAt: toTeachers.updatedAt,
			},
			classSession: classSessionSelect,
			timetableSlot: timetableSlotSelect,
		})
		.from(classSwaps)
		.innerJoin(fromTeachers, eq(classSwaps.fromTeacherId, fromTeachers.id))
		.innerJoin(toTeachers, eq(classSwaps.toTeacherId, toTeachers.id))
		.innerJoin(classSessions, eq(classSwaps.classSessionId, classSessions.id))
		.innerJoin(timetableSlots, eq(classSessions.timetableSlotId, timetableSlots.id))
		.where(where)
		.orderBy(order === "asc" ? asc(classSwaps.requestedAt) : desc(classSwaps.requestedAt))
		.limit(limit)
		.offset(offset)
		.then((rows) =>
			rows.map((row) => ({
				...row.swap,
				fromTeacher: row.fromTeacher,
				toTeacher: row.toTeacher,
				classSession: {
					...row.classSession,
					timetableSlot: row.timetableSlot,
				},
			}))
		);
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
