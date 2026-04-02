import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { adminsService } from "../services/admins.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createAdminSchema,
	listAdminsQuerySchema,
	loginAdminSchema,
	refreshTokenSchema,
	updateAdminSchema,
	verifyStudentSchema,
	verifyTeacherSchema,
} from "../validators/admins.validator.js";

export const createAdminController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createAdminSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const admin = await adminsService.createAdmin(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Admin created successfully",
			data: admin,
		});
	} catch (error) {
		next(error);
	}
};

export const getAdminsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listAdminsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const admins = await adminsService.getAdmins(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Admins fetched successfully",
			data: admins,
		});
	} catch (error) {
		next(error);
	}
};

export const getAdminByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const admin = await adminsService.getAdminById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Admin fetched successfully",
			data: admin,
		});
	} catch (error) {
		next(error);
	}
};

export const updateAdminController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateAdminSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const admin = await adminsService.updateAdmin(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Admin updated successfully",
			data: admin,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteAdminController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const admin = await adminsService.deleteAdmin(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Admin deleted successfully",
			data: admin,
		});
	} catch (error) {
		next(error);
	}
};

export const loginAdminController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = loginAdminSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const result = await adminsService.loginAdmin(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Admin login successful",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

export const refreshAdminTokenController = async (
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

		const tokens = await adminsService.getNewAccessToken(parsed.data.refreshToken);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Access token refreshed successfully",
			data: tokens,
		});
	} catch (error) {
		next(error);
	}
};

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
	createAdminController,
	getAdminsController,
	getAdminByIdController,
	updateAdminController,
	deleteAdminController,
	loginAdminController,
	refreshAdminTokenController,
	verifyTeacherController,
	verifyStudentController,
};
