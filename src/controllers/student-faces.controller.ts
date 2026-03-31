import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { studentFacesService } from "../services/student-faces.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createStudentFaceSchema,
	listStudentFacesQuerySchema,
	updateStudentFaceSchema,
} from "../validators/student-faces.validator.js";

export const createStudentFaceController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createStudentFaceSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const face = await studentFacesService.createStudentFace(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Student face created successfully",
			data: face,
		});
	} catch (error) {
		next(error);
	}
};

export const getStudentFacesController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listStudentFacesQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const faces = await studentFacesService.getStudentFaces(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Student faces fetched successfully",
			data: faces,
		});
	} catch (error) {
		next(error);
	}
};

export const getStudentFaceByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const face = await studentFacesService.getStudentFaceById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Student face fetched successfully",
			data: face,
		});
	} catch (error) {
		next(error);
	}
};

export const updateStudentFaceController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const parsed = updateStudentFaceSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const face = await studentFacesService.updateStudentFace(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Student face updated successfully",
			data: face,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteStudentFaceController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const face = await studentFacesService.deleteStudentFace(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Student face deleted successfully",
			data: face,
		});
	} catch (error) {
		next(error);
	}
};

export const studentFacesController = {
	createStudentFaceController,
	getStudentFacesController,
	getStudentFaceByIdController,
	updateStudentFaceController,
	deleteStudentFaceController,
};
