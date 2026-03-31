import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { sectionsService } from "../services/sections.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createSectionSchema,
	listSectionsQuerySchema,
	updateSectionSchema,
} from "../validators/sections.validator.js";

export const createSectionController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createSectionSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const section = await sectionsService.createSection(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Section created successfully",
			data: section,
		});
	} catch (error) {
		next(error);
	}
};

export const getSectionsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listSectionsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const sections = await sectionsService.getSections(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Sections fetched successfully",
			data: sections,
		});
	} catch (error) {
		next(error);
	}
};

export const getSectionByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const section = await sectionsService.getSectionById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Section fetched successfully",
			data: section,
		});
	} catch (error) {
		next(error);
	}
};

export const updateSectionController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateSectionSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const section = await sectionsService.updateSection(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Section updated successfully",
			data: section,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteSectionController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const section = await sectionsService.deleteSection(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Section deleted successfully",
			data: section,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const sectionsController = {
	createSectionController,
	getSectionsController,
	getSectionByIdController,
	updateSectionController,
	deleteSectionController,
};
