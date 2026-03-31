import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { studentsService } from "../services/students.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createStudentSchema,
	loginStudentSchema,
	listStudentsQuerySchema,
	updateStudentSchema,
} from "../validators/students.validator.js";

export const registerStudentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createStudentSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const student = await studentsService.createStudent(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Student registered successfully",
			data: student,
		});
	} catch (error) {
		next(error);
	}
};

export const loginStudentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = loginStudentSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const result = await studentsService.loginStudent(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Student logged in successfully",
			data: {
				student: result.student,
				accessToken: result.accessToken,
				refreshToken: result.refreshToken,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const createStudentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createStudentSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const student = await studentsService.createStudent(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Student created successfully",
			data: student,
		});
	} catch (error) {
		next(error);
	}
};

export const getStudentsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listStudentsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const students = await studentsService.getStudents(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Students fetched successfully",
			data: students,
		});
	} catch (error) {
		next(error);
	}
};

export const getStudentByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const student = await studentsService.getStudentById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Student fetched successfully",
			data: student,
		});
	} catch (error) {
		next(error);
	}
};

export const updateStudentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateStudentSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const student = await studentsService.updateStudent(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Student updated successfully",
			data: student,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteStudentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const student = await studentsService.deleteStudent(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Student deleted successfully",
			data: student,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const studentsController = {
	registerStudentController,
	loginStudentController,
	createStudentController,
	getStudentsController,
	getStudentByIdController,
	updateStudentController,
	deleteStudentController,
};
