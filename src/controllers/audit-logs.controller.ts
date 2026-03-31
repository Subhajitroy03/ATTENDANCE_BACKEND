import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { auditLogsService } from "../services/audit-logs.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createAuditLogSchema,
	listAuditLogsQuerySchema,
	updateAuditLogSchema,
} from "../validators/audit-logs.validator.js";

export const createAuditLogController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createAuditLogSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const log = await auditLogsService.createAuditLog(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Audit log created successfully",
			data: log,
		});
	} catch (error) {
		next(error);
	}
};

export const getAuditLogsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listAuditLogsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const logs = await auditLogsService.getAuditLogs(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Audit logs fetched successfully",
			data: logs,
		});
	} catch (error) {
		next(error);
	}
};

export const getAuditLogByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const log = await auditLogsService.getAuditLogById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Audit log fetched successfully",
			data: log,
		});
	} catch (error) {
		next(error);
	}
};

export const updateAuditLogController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateAuditLogSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const log = await auditLogsService.updateAuditLog(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Audit log updated successfully",
			data: log,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteAuditLogController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const log = await auditLogsService.deleteAuditLog(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Audit log deleted successfully",
			data: log,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const auditLogsController = {
	createAuditLogController,
	getAuditLogsController,
	getAuditLogByIdController,
	updateAuditLogController,
	deleteAuditLogController,
};
