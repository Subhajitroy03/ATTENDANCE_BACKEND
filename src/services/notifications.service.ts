import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildSearch,
	buildWhere,
	parseBoolean,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateNotificationInput {
	userId: string;
	type: string;
	message: string;
	read?: boolean;
}

export interface UpdateNotificationInput {
	type?: string;
	message?: string;
	read?: boolean;
}

export interface ListNotificationsQuery extends PaginationInput {
	q?: unknown;
	userId?: unknown;
	type?: unknown;
	read?: unknown;
}

async function getNotificationOrThrow(id: string) {
	const rows = await db
		.select()
		.from(notifications)
		.where(eq(notifications.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
	return rows[0];
}

async function createNotification(input: CreateNotificationInput) {
	const [created] = await db.insert(notifications).values(input).returning();
	return created;
}

async function getNotifications(query: ListNotificationsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const userId = parseString(query.userId);
	const type = parseString(query.type);
	const read = parseBoolean(query.read);
	const where = buildWhere(
		buildSearch(query.q, notifications.type, notifications.message),
		userId ? eq(notifications.userId, userId) : undefined,
		type ? eq(notifications.type, type) : undefined,
		read === undefined ? undefined : eq(notifications.read, read)
	);

	return await db
		.select()
		.from(notifications)
		.where(where)
		.orderBy(order === "asc" ? asc(notifications.createdAt) : desc(notifications.createdAt))
		.limit(limit)
		.offset(offset);
}

async function getNotificationById(id: string) {
	return await getNotificationOrThrow(id);
}

async function updateNotification(id: string, input: UpdateNotificationInput) {
	await getNotificationOrThrow(id);
	const [updated] = await db
		.update(notifications)
		.set(input)
		.where(eq(notifications.id, id))
		.returning();
	return updated;
}

async function deleteNotification(id: string) {
	await getNotificationOrThrow(id);
	const [deleted] = await db.delete(notifications).where(eq(notifications.id, id)).returning();
	return deleted;
}

export const notificationsService = {
	createNotification,
	getNotifications,
	getNotificationById,
	updateNotification,
	deleteNotification,
	// Aliases (backward compatible)
	create: createNotification,
	list: getNotifications,
	getById: getNotificationById,
	update: updateNotification,
	remove: deleteNotification,
};
