import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { departmentsService } from "../services/departments.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createDepartmentSchema,
	listDepartmentsQuerySchema,
	updateDepartmentSchema,
} from "../validators/departments.validator.js";

export const createDepartmentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createDepartmentSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const department = await departmentsService.createDepartment(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Department created successfully",
			data: department,
		});
	} catch (error) {
		next(error);
	}
};

export const getDepartmentsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listDepartmentsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const departments = await departmentsService.getDepartments(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Departments fetched successfully",
			data: departments,
		});
	} catch (error) {
		next(error);
	}
};

export const getDepartmentByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const department = await departmentsService.getDepartmentById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Department fetched successfully",
			data: department,
		});
	} catch (error) {
		next(error);
	}
};

export const updateDepartmentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateDepartmentSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const department = await departmentsService.updateDepartment(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Department updated successfully",
			data: department,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteDepartmentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const department = await departmentsService.deleteDepartment(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Department deleted successfully",
			data: department,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const departmentsController = {
	createDepartmentController,
	getDepartmentsController,
	getDepartmentByIdController,
	updateDepartmentController,
	deleteDepartmentController,
};
