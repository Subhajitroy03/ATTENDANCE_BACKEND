import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { teachersService } from "../services/teachers.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createTeacherSchema,
	listTeachersQuerySchema,
	updateTeacherSchema,
} from "../validators/teachers.validator.js";

export const createTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createTeacherSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const teacher = await teachersService.createTeacher(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Teacher created successfully",
			data: teacher,
		});
	} catch (error) {
		next(error);
	}
};

export const getTeachersController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listTeachersQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const teachers = await teachersService.getTeachers(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Teachers fetched successfully",
			data: teachers,
		});
	} catch (error) {
		next(error);
	}
};

export const getTeacherByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const teacher = await teachersService.getTeacherById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Teacher fetched successfully",
			data: teacher,
		});
	} catch (error) {
		next(error);
	}
};

export const updateTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateTeacherSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const teacher = await teachersService.updateTeacher(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Teacher updated successfully",
			data: teacher,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const teacher = await teachersService.deleteTeacher(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Teacher deleted successfully",
			data: teacher,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const teachersController = {
	createTeacherController,
	getTeachersController,
	getTeacherByIdController,
	updateTeacherController,
	deleteTeacherController,
};
