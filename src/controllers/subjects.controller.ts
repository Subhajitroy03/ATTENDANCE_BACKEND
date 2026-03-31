import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { subjectsService } from "../services/subjects.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createSubjectSchema,
	listSubjectsQuerySchema,
	updateSubjectSchema,
} from "../validators/subjects.validator.js";

export const createSubjectController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createSubjectSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const subject = await subjectsService.createSubject(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Subject created successfully",
			data: subject,
		});
	} catch (error) {
		next(error);
	}
};

export const getSubjectsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listSubjectsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const subjects = await subjectsService.getSubjects(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Subjects fetched successfully",
			data: subjects,
		});
	} catch (error) {
		next(error);
	}
};

export const getSubjectByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const subject = await subjectsService.getSubjectById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Subject fetched successfully",
			data: subject,
		});
	} catch (error) {
		next(error);
	}
};

export const updateSubjectController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateSubjectSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const subject = await subjectsService.updateSubject(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Subject updated successfully",
			data: subject,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteSubjectController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const subject = await subjectsService.deleteSubject(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Subject deleted successfully",
			data: subject,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const subjectsController = {
	createSubjectController,
	getSubjectsController,
	getSubjectByIdController,
	updateSubjectController,
	deleteSubjectController,
};
