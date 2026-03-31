import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { classSessionsService } from "../services/class-sessions.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createClassSessionSchema,
	listClassSessionsQuerySchema,
	updateClassSessionSchema,
} from "../validators/class-sessions.validator.js";

export const createClassSessionController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createClassSessionSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const session = await classSessionsService.createClassSession(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Class session created successfully",
			data: session,
		});
	} catch (error) {
		next(error);
	}
};

export const getClassSessionsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listClassSessionsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const sessions = await classSessionsService.getClassSessions(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Class sessions fetched successfully",
			data: sessions,
		});
	} catch (error) {
		next(error);
	}
};

export const getClassSessionByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const session = await classSessionsService.getClassSessionById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Class session fetched successfully",
			data: session,
		});
	} catch (error) {
		next(error);
	}
};

export const updateClassSessionController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const parsed = updateClassSessionSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const session = await classSessionsService.updateClassSession(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Class session updated successfully",
			data: session,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteClassSessionController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const session = await classSessionsService.deleteClassSession(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Class session deleted successfully",
			data: session,
		});
	} catch (error) {
		next(error);
	}
};

export const classSessionsController = {
	createClassSessionController,
	getClassSessionsController,
	getClassSessionByIdController,
	updateClassSessionController,
	deleteClassSessionController,
};
