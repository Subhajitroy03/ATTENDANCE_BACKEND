import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { subjectTeachersService } from "../services/subject-teachers.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createSubjectTeacherSchema,
	listSubjectTeachersQuerySchema,
	updateSubjectTeacherSchema,
} from "../validators/subject-teachers.validator.js";

export const createSubjectTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createSubjectTeacherSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const mapping = await subjectTeachersService.createSubjectTeacher(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Subject teacher mapping created successfully",
			data: mapping,
		});
	} catch (error) {
		next(error);
	}
};

export const getSubjectTeachersController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listSubjectTeachersQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const mappings = await subjectTeachersService.getSubjectTeachers(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Subject teacher mappings fetched successfully",
			data: mappings,
		});
	} catch (error) {
		next(error);
	}
};

export const getSubjectTeacherByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const mapping = await subjectTeachersService.getSubjectTeacherById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Subject teacher mapping fetched successfully",
			data: mapping,
		});
	} catch (error) {
		next(error);
	}
};

export const updateSubjectTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const parsed = updateSubjectTeacherSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const mapping = await subjectTeachersService.updateSubjectTeacher(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Subject teacher mapping updated successfully",
			data: mapping,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteSubjectTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const mapping = await subjectTeachersService.deleteSubjectTeacher(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Subject teacher mapping deleted successfully",
			data: mapping,
		});
	} catch (error) {
		next(error);
	}
};

export const subjectTeachersController = {
	createSubjectTeacherController,
	getSubjectTeachersController,
	getSubjectTeacherByIdController,
	updateSubjectTeacherController,
	deleteSubjectTeacherController,
};
