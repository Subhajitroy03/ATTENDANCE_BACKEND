import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { teacherConfirmationsService } from "../services/teacher-confirmations.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createTeacherConfirmationSchema,
	listTeacherConfirmationsQuerySchema,
	updateTeacherConfirmationSchema,
} from "../validators/teacher-confirmations.validator.js";

export const createTeacherConfirmationController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createTeacherConfirmationSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const confirmation = await teacherConfirmationsService.createTeacherConfirmation(
			parsed.data
		);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Teacher confirmation created successfully",
			data: confirmation,
		});
	} catch (error) {
		next(error);
	}
};

export const getTeacherConfirmationsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listTeacherConfirmationsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const confirmations = await teacherConfirmationsService.getTeacherConfirmations(
			parsed.data
		);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Teacher confirmations fetched successfully",
			data: confirmations,
		});
	} catch (error) {
		next(error);
	}
};

export const getTeacherConfirmationByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const confirmation = await teacherConfirmationsService.getTeacherConfirmationById(
			id
		);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Teacher confirmation fetched successfully",
			data: confirmation,
		});
	} catch (error) {
		next(error);
	}
};

export const updateTeacherConfirmationController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const parsed = updateTeacherConfirmationSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const confirmation = await teacherConfirmationsService.updateTeacherConfirmation(
			id,
			parsed.data
		);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Teacher confirmation updated successfully",
			data: confirmation,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteTeacherConfirmationController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const confirmation = await teacherConfirmationsService.deleteTeacherConfirmation(
			id
		);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Teacher confirmation deleted successfully",
			data: confirmation,
		});
	} catch (error) {
		next(error);
	}
};

export const teacherConfirmationsController = {
	createTeacherConfirmationController,
	getTeacherConfirmationsController,
	getTeacherConfirmationByIdController,
	updateTeacherConfirmationController,
	deleteTeacherConfirmationController,
};
