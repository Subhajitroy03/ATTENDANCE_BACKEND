import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { attendanceService } from "../services/attendance.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createAttendanceSchema,
	listAttendanceQuerySchema,
	updateAttendanceSchema,
} from "../validators/attendance.validator.js";

export const createAttendanceController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createAttendanceSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const record = await attendanceService.createAttendance(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Attendance created successfully",
			data: record,
		});
	} catch (error) {
		next(error);
	}
};

export const getAttendanceController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listAttendanceQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const records = await attendanceService.getAttendance(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Attendance fetched successfully",
			data: records,
		});
	} catch (error) {
		next(error);
	}
};

export const getAttendanceByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const record = await attendanceService.getAttendanceById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Attendance fetched successfully",
			data: record,
		});
	} catch (error) {
		next(error);
	}
};

export const updateAttendanceController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateAttendanceSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const record = await attendanceService.updateAttendance(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Attendance updated successfully",
			data: record,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteAttendanceController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const record = await attendanceService.deleteAttendance(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Attendance deleted successfully",
			data: record,
		});
	} catch (error) {
		next(error);
	}
};

export const getMySubjectAttendanceSummaryController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.student?.id) {
			throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
		}

		const summary = await attendanceService.getMySubjectAttendanceSummary(req.student.id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Attendance summary fetched successfully",
			data: summary,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const attendanceController = {
	createAttendanceController,
	getAttendanceController,
	getAttendanceByIdController,
	updateAttendanceController,
	deleteAttendanceController,
	getMySubjectAttendanceSummaryController,
};
