import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { sectionRoomsService } from "../services/section-rooms.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createSectionRoomSchema,
	listSectionRoomsQuerySchema,
	updateSectionRoomSchema,
} from "../validators/section-rooms.validator.js";

export const createSectionRoomController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createSectionRoomSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const mapping = await sectionRoomsService.createSectionRoom(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Section room mapping created successfully",
			data: mapping,
		});
	} catch (error) {
		next(error);
	}
};

export const getSectionRoomsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listSectionRoomsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const mappings = await sectionRoomsService.getSectionRooms(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Section room mappings fetched successfully",
			data: mappings,
		});
	} catch (error) {
		next(error);
	}
};

export const getSectionRoomByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const mapping = await sectionRoomsService.getSectionRoomById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Section room mapping fetched successfully",
			data: mapping,
		});
	} catch (error) {
		next(error);
	}
};

export const updateSectionRoomController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const parsed = updateSectionRoomSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const mapping = await sectionRoomsService.updateSectionRoom(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Section room mapping updated successfully",
			data: mapping,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteSectionRoomController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");

		const mapping = await sectionRoomsService.deleteSectionRoom(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Section room mapping deleted successfully",
			data: mapping,
		});
	} catch (error) {
		next(error);
	}
};

export const sectionRoomsController = {
	createSectionRoomController,
	getSectionRoomsController,
	getSectionRoomByIdController,
	updateSectionRoomController,
	deleteSectionRoomController,
};
