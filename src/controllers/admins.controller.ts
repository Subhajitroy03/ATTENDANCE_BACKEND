import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { adminsService } from "../services/admins.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	verifyStudentSchema,
	verifyTeacherSchema,
} from "../validators/admins.validator.js";

export const verifyTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.admin?.id) {
			throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
		}

		const parsed = verifyTeacherSchema.safeParse({
			teacherId: String(req.params.teacherId ?? req.params.id ?? ""),
			verified: req.body?.verified,
		});

		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const teacher = await adminsService.verifyTeacher(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: `Teacher ${teacher.verified ? "verified" : "unverified"} successfully`,
			data: teacher,
		});
	} catch (error) {
		next(error);
	}
};

export const verifyStudentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.admin?.id) {
			throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
		}

		const parsed = verifyStudentSchema.safeParse({
			studentId: String(req.params.studentId ?? req.params.id ?? ""),
			verified: req.body?.verified,
		});

		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const student = await adminsService.verifyStudent(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: `Student ${student.verified ? "verified" : "unverified"} successfully`,
			data: student,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const adminsController = {
	verifyTeacherController,
	verifyStudentController,
};
