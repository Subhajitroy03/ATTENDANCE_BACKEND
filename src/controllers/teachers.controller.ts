import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { teachersService } from "../services/teachers.service.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createTeacherSchema,
	loginTeacherSchema,
	listTeachersQuerySchema,
	refreshTokenSchema,
	updateTeacherSchema,
} from "../validators/teachers.validator.js";

const buildTeacherPayload = async (req: Request) => {
	const cloudinaryPhoto = req.file?.path
		? await uploadOnCloudinary(req.file.path)
		: undefined;

	return {
		...req.body,
		...(cloudinaryPhoto ? { photo: cloudinaryPhoto } : {}),
	};
};

export const registerTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const payload = await buildTeacherPayload(req);
		const parsed = createTeacherSchema.safeParse(payload);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const teacher = await teachersService.createTeacher(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Teacher registered successfully",
			data: teacher,
		});
	} catch (error) {
		next(error);
	}
};

export const loginTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = loginTeacherSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const result = await teachersService.loginTeacher(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Teacher logged in successfully",
			data: {
				teacher: result.teacher,
				accessToken: result.accessToken,
				refreshToken: result.refreshToken,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const refreshTeacherTokenController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = refreshTokenSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const tokens = await teachersService.getNewAccessToken(parsed.data.refreshToken);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Access token refreshed successfully",
			data: tokens,
		});
	} catch (error) {
		next(error);
	}
};

export const createTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const payload = await buildTeacherPayload(req);
		const parsed = createTeacherSchema.safeParse(payload);
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

		const payload = await buildTeacherPayload(req);
		const parsed = updateTeacherSchema.safeParse(payload);
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
	registerTeacherController,
	loginTeacherController,
	refreshTeacherTokenController,
	createTeacherController,
	getTeachersController,
	getTeacherByIdController,
	updateTeacherController,
	deleteTeacherController,
};
