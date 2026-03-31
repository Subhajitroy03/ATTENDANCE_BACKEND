import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { notificationsService } from "../services/notifications.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createNotificationSchema,
	listNotificationsQuerySchema,
	updateNotificationSchema,
} from "../validators/notifications.validator.js";

export const createNotificationController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createNotificationSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const notification = await notificationsService.createNotification(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Notification created successfully",
			data: notification,
		});
	} catch (error) {
		next(error);
	}
};

export const getNotificationsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listNotificationsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const notifications = await notificationsService.getNotifications(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Notifications fetched successfully",
			data: notifications,
		});
	} catch (error) {
		next(error);
	}
};

export const getNotificationByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const notification = await notificationsService.getNotificationById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Notification fetched successfully",
			data: notification,
		});
	} catch (error) {
		next(error);
	}
};

export const updateNotificationController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateNotificationSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const notification = await notificationsService.updateNotification(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Notification updated successfully",
			data: notification,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteNotificationController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const notification = await notificationsService.deleteNotification(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Notification deleted successfully",
			data: notification,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const notificationsController = {
	createNotificationController,
	getNotificationsController,
	getNotificationByIdController,
	updateNotificationController,
	deleteNotificationController,
};
